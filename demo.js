// Missly "be the customer" demo. Runs entirely in the browser; nothing is sent anywhere.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var bizInput = $("demo-biz"), callBtn = $("demo-call"), thread = $("demo-thread"),
      chips = $("demo-chips"), form = $("demo-form"), input = $("demo-input"),
      alertBox = $("demo-alert"), alertMsg = $("demo-alert-msg"), restart = $("demo-restart");
  if (!callBtn) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var URGENT = /\b(leak|leaking|leaks|water|dripping|drip|emergency|asap|urgent|storm|flood|hole|tarp)\b/i;
  var timers = [], stage = 0, answers = {}, busy = false;

  function later(fn, ms) { timers.push(setTimeout(fn, reduce ? Math.min(ms, 300) : ms)); }
  function biz() { return (bizInput.value || "").trim() || "Desert Ridge Roofing"; }
  function show(id) {
    ["view-dial", "view-calling", "view-text"].forEach(function (v) { $(v).hidden = v !== id; });
  }

  bizInput.addEventListener("input", function () { $("dial-name").textContent = biz(); });

  function bubble(text, who) {
    var b = document.createElement("div");
    b.className = "bubble " + who;
    b.textContent = text;
    thread.appendChild(b);
    thread.scrollTop = thread.scrollHeight;
  }

  function botSay(text, then) {
    busy = true; setInput(false);
    var t = document.createElement("div");
    t.className = "typing"; t.setAttribute("aria-label", "Typing");
    t.innerHTML = "<i></i><i></i><i></i>";
    later(function () { thread.appendChild(t); thread.scrollTop = thread.scrollHeight; }, 500);
    later(function () {
      t.remove(); bubble(text, "out"); busy = false;
      if (then) then();
    }, 1700);
  }

  function setInput(on) { input.disabled = !on; form.querySelector("button").disabled = !on; }

  function setChips(list) {
    chips.innerHTML = "";
    list.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = c;
      b.addEventListener("click", function () { answer(c); });
      chips.appendChild(b);
    });
  }

  // ---- the call
  callBtn.addEventListener("click", function () {
    var name = biz();
    $("calling-name").textContent = name;
    $("text-name").textContent = name;
    $("call-status").textContent = "Calling…";
    $("call-voice").hidden = true;
    $("view-calling").querySelector(".ring").classList.remove("off");
    show("view-calling");
    bizInput.disabled = true;
    restart.hidden = false;
    later(function () { $("call-status").textContent = "Ringing…"; }, 1200);
    later(function () {
      $("call-status").textContent = "No answer";
      $("view-calling").querySelector(".ring").classList.add("off");
      var v = $("call-voice");
      v.textContent = "“Sorry we missed your call at " + name +
        ". We’re sending you a text right now so we can help.”";
      v.hidden = false;
    }, 5200);
    later(function () { $("call-status").textContent = "Call ended"; }, 9200);
    later(startText, 10200);
  });

  function startText() {
    show("view-text");
    var s = document.createElement("div");
    s.className = "stamp"; s.textContent = "Today, just now";
    thread.appendChild(s);
    botSay("Hi, this is " + biz() + ". Sorry we missed your call! How can we help? Reply STOP to opt out.", function () {
      setChips(["I have a roof leak", "Need a quote on a new roof", "Just want an inspection"]);
      setInput(true); input.focus({ preventScroll: true });
    });
  }

  // ---- the conversation
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var v = input.value.trim();
    if (v) answer(v);
  });

  function answer(text) {
    if (busy || stage > 2) return;
    bubble(text, "in");
    input.value = ""; chips.innerHTML = ""; setInput(false);

    if (stage === 0) {
      answers.need = text;
      answers.urgent = URGENT.test(text);
      stage = 1;
      var ask = answers.urgent
        ? "Sorry to hear that! Is water coming in right now? And what’s the full address of the home?"
        : /quote|new roof|replace|replacement/i.test(text)
          ? "Happy to help with that. What’s the full address of the home, and about how old is the roof?"
          : "We can help with that. What’s the full address of the home?";
      botSay(ask, function () {
        setChips(answers.urgent
          ? ["Yes, it’s dripping. 6412 E Cactus Rd, Scottsdale", "Not right now. 2218 N 75th Pl, Scottsdale"]
          : ["2218 N 75th Pl, Scottsdale. About 15 years old", "6412 E Cactus Rd, Scottsdale"]);
        setInput(true);
      });
    } else if (stage === 1) {
      answers.where = text;
      if (URGENT.test(text) && /\b(yes|yeah|yep|it is|dripping)\b/i.test(text)) answers.urgent = true;
      stage = 2;
      botSay("Got it, thanks. What’s your name, and when’s a good time for someone to come take a look?", function () {
        setChips(["Maria. Tomorrow morning works", "Dave, anytime after 3pm today"]);
        setInput(true);
      });
    } else {
      answers.when = text;
      answers.name = guessName(text);
      stage = 3;
      botSay("Thanks" + (answers.name ? ", " + answers.name : "") + "! I’ve passed this to the team" +
        (answers.urgent ? " and flagged it as urgent" : "") +
        ". Someone will call you shortly. Text here anytime if anything changes.", ownerAlert);
    }
  }

  function guessName(t) {
    var m = t.match(/\b(?:i'?m|i am|this is|my name is|name'?s)\s+([A-Za-z][a-z'-]+)/i) || t.match(/^\s*([A-Za-z][a-z'-]+)\s*[,.!-]/);
    if (!m) { var w = t.trim().split(/\s+/); if (w.length === 1 && /^[A-Za-z'-]{2,}$/.test(w[0])) m = [0, w[0]]; }
    if (!m) return "";
    var n = m[1];
    if (/^(yes|no|sure|ok|okay|tomorrow|today|anytime|morning|afternoon|evening)$/i.test(n)) return "";
    return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
  }

  function cleanWhere(t) {
    return t.replace(/^\s*(yes|yeah|yep|no|nope|not (right )?now)\b[^,.]*[,.]\s*/i, "")
            .replace(/^\s*(it'?s |we'?re |i'?m )?(near|at|by|off of|off)\s+/i, "")
            .replace(/^./, function (c) { return c.toUpperCase(); }) || t;
  }
  function cleanWhen(t) {
    return t.replace(/^\s*(?:i'?m|i am|this is|my name is|name'?s)?\s*[A-Za-z][a-z'-]+\s*[,.!-]\s*/i, "")
            .replace(/^./, function (c) { return c.toUpperCase(); }) || t;
  }

  function ownerAlert() {
    var urgent = answers.urgent;
    var lines = [
      (urgent ? "URGENT - " : "") + "New lead for " + biz() + ": " + (urgent ? "Urgent" : "Ready for a callback"),
      (answers.name || "Unknown name") + " (602) 555-0148",
      "Need: " + answers.need,
      "Urgency: " + (urgent ? "HIGH" : "NORMAL"),
      "Address: " + cleanWhere(answers.where),
      "Best time: " + (answers.name ? cleanWhen(answers.when) : answers.when),
      "Reply DONE 12 once you’ve reached them."
    ];
    alertMsg.textContent = lines.join("\n");
    later(function () {
      alertBox.hidden = false;
      if (window.innerWidth < 860) alertBox.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }, 900);
  }

  restart.addEventListener("click", function () {
    timers.forEach(clearTimeout); timers = [];
    stage = 0; answers = {}; busy = false;
    thread.innerHTML = ""; chips.innerHTML = ""; input.value = "";
    alertBox.hidden = true; restart.hidden = true; bizInput.disabled = false;
    setInput(false); show("view-dial");
  });

  setInput(false);
})();
