// Missly "be the customer" demo. Runs entirely in the browser; nothing is sent anywhere.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var bizInput = $("demo-biz"), callBtn = $("demo-call"), thread = $("demo-thread"),
      chips = $("demo-chips"), form = $("demo-form"), input = $("demo-input"),
      alertBox = $("demo-alert"), alertMsg = $("demo-alert-msg"), restart = $("demo-restart");
  if (!callBtn) return;

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var IND = function () { return window.MisslyIndustry.get(); };
  var timers = [], stage = 0, answers = {}, busy = false, ghosts = 0, currentChips = [];

  function later(fn, ms) { timers.push(setTimeout(fn, reduce ? Math.min(ms, 300) : ms)); }
  function biz() { return (bizInput.value || "").trim() || IND().name; }
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
    currentChips = list;
    chips.innerHTML = "";
    list.forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button"; b.textContent = c;
      b.addEventListener("click", function () { answer(c); });
      chips.appendChild(b);
    });
    if (stage < 3 && ghosts < 4) {
      var g = document.createElement("button");
      g.type = "button"; g.className = "ghost";
      g.textContent = "Ignore it (like a real customer)";
      g.setAttribute("aria-label", "Don't reply, and see how Missly follows up");
      g.addEventListener("click", ghost);
      chips.appendChild(g);
    }
  }

  // ---- going quiet: follow-ups at +2h, next day, +3 days, then a "worth a call" alert
  function sysNote(text, cls) {
    var n = document.createElement("div");
    n.className = "stamp " + (cls || ""); n.textContent = text;
    thread.appendChild(n); thread.scrollTop = thread.scrollHeight;
  }
  var GAPS = ["No reply… 2 hours later, 4:14 PM", "Still quiet… next day, 4:16 PM", "Still quiet… 3 days later, 4:18 PM"];
  function followupText(n) {
    var b = biz();
    if (n === 3) return "Last check-in from " + b + ". No pressure at all. If you still need help, just text or call this number anytime.";
    if (stage === 0) return n === 1
      ? "Hi, just checking in from " + b + ". " + IND().fu0[0]
      : "Hi again from " + b + "! " + IND().fu0[1];
    if (stage === 1) return n === 1
      ? (answers.urgent ? "Checking in from " + b + ". " + IND().fuUrgent
                        : "Hi again from " + b + "! Still happy to help with that. What's the address of the home?")
      : "Hi! " + b + " here. We have openings this week. What's the address so we can get someone out?";
    return n === 1
      ? "Quick follow-up from " + b + ": what's your name, and when's a good time for us to come by?"
      : "Hi! " + b + " here. We can usually come out within a day or two. What time works for you?";
  }
  function ghost() {
    if (busy || stage > 2) return;
    chips.innerHTML = ""; setInput(false);
    ghosts++;
    if (ghosts <= 3) {
      busy = true;
      later(function () {
        sysNote(GAPS[ghosts - 1], "gap");
        if (ghosts === 2) sysNote("Missly only texts during business hours. Never late at night.", "why");
        busy = false;
        botSay(followupText(ghosts), function () {
          sysNote("Follow-up " + ghosts + " of 3", "why");
          setChips(currentChips); setInput(true);
        });
      }, 500);
    } else {
      stage = 4;
      later(function () {
        sysNote("No reply after 3 follow-ups", "gap");
        sysNote("Missly stops here so it never feels like spam, and hands it to you.", "why");
        coldAlert();
      }, 500);
    }
  }
  function coldAlert() {
    var lines = [
      "Cold lead for " + biz() + ": worth a phone call",
      "Caller (602) 555-0148",
      "Need: " + (answers.need || "not given yet"),
      answers.where ? "Address: " + cleanWhere(answers.where) : "Address: not given yet",
      "No reply after 3 follow-up texts over 5 days.",
      "Reply DONE 12 once you've reached them."
    ];
    $("demo-alert").querySelector(".from").textContent = "Missly tried 3 times, then sent you this";
    alertMsg.textContent = lines.join("\n");
    later(function () {
      alertBox.hidden = false;
      if (window.innerWidth < 860) alertBox.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }, 900);
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
      setChips(IND().start);
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
    if (ghosts && !answers.recovered) answers.recovered = ghosts;
    bubble(text, "in");
    input.value = ""; chips.innerHTML = ""; setInput(false);

    if (stage === 0) {
      answers.need = text;
      answers.urgent = IND().urgent.test(text);
      stage = 1;
      var ask = answers.urgent ? IND().askUrgent : IND().quote.test(text) ? IND().askQuote : IND().askOther;
      botSay(ask, function () {
        setChips(answers.urgent ? IND().chipsUrgent : IND().chipsAddr);
        setInput(true);
      });
    } else if (stage === 1) {
      answers.where = text;
      if (answers.urgent && /\b(not urgent|can wait|no rush|turned it off)\b/i.test(text)) answers.urgent = false;
      if (!answers.urgent && IND().urgent.test(text) && IND().confirmUrgent.test(text)) answers.urgent = true;
      stage = 2;
      botSay(IND().askWhen, function () {
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
    ].concat(answers.recovered ? ["Recovered: went quiet, replied after follow-up #" + answers.recovered] : []).concat([
      (answers.name || "Unknown name") + " (602) 555-0148",
      "Need: " + answers.need,
      "Urgency: " + (urgent ? "HIGH" : "NORMAL"),
      "Address: " + cleanWhere(answers.where),
      "Best time: " + (answers.name ? cleanWhen(answers.when) : answers.when),
      "Reply DONE 12 once you’ve reached them."
    ]);
    $("demo-alert").querySelector(".from").textContent = answers.recovered
      ? "Missly brought this lead back. This text goes to you" : "Meanwhile, this text goes to you";
    alertMsg.textContent = lines.join("\n");
    later(function () {
      alertBox.hidden = false;
      if (window.innerWidth < 860) alertBox.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }, 900);
  }

  restart.addEventListener("click", function () {
    timers.forEach(clearTimeout); timers = [];
    stage = 0; answers = {}; busy = false; ghosts = 0; currentChips = [];
    thread.innerHTML = ""; chips.innerHTML = ""; input.value = "";
    alertBox.hidden = true; restart.hidden = true; bizInput.disabled = false;
    setInput(false); show("view-dial");
  });

  // switching industry: rename the demo business if it's still a sample name, and restart a demo in progress
  window.MisslyIndustry.onChange(function (p) {
    if (window.MisslyIndustry.isDefaultName(bizInput.value.trim()) || !bizInput.value.trim()) {
      bizInput.value = p.name; $("dial-name").textContent = p.name;
    }
    if (!restart.hidden) restart.click();
  });
  if (window.MisslyIndustry.isDefaultName(bizInput.value.trim())) {
    bizInput.value = IND().name; $("dial-name").textContent = IND().name;
  }

  setInput(false);
})();
