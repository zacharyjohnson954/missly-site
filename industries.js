// Missly industry picker: swaps page copy and the demo script to match the visitor's trade.
// Pick with the buttons, or link straight to one: missly.io/?for=water | hardscape | roofing | any
(function () {
  var P = {
    roofing: {
      label: "Roofing",
      name: "Desert Ridge Roofing",
      lede: "That's the whole product. When you can't answer, Missly texts the caller in seconds, finds out what they need, and sends you the details. The job doesn't go to the next roofer on Google. You stay on the roof.",
      busy: "On a roof, driving, eating lunch. Your phone rings like normal first.",
      hero: ["Got a leak over the garage after last night's storm",
             "Sorry to hear that. What's the full address, and is water coming in right now?",
             "6412 E Cactus Rd, Scottsdale. Dripping a little, yes"],
      alertTitle: "Urgent: active leak",
      alertBody: "Maria G., 6412 E Cactus Rd, Scottsdale. Storm leak over the garage, water dripping now. Wants someone out today or tomorrow morning. Call (602) 555-0148.",
      urgentLine: "Urgent stuff flagged first. Leaks don't wait.",
      q1: "Hi, just checking in. Still need help with your roof? Reply anytime.",
      q2: "Hi again! We'd still love to help. Is it a repair, a leak, or a new roof?",
      price: "One saved roofing job pays for Missly for a long time.",
      urgent: /\b(leak|leaking|leaks|water|dripping|drip|emergency|asap|urgent|storm|flood|hole|tarp)\b/i,
      quote: /quote|new roof|replace|replacement/i,
      start: ["I have a roof leak", "Need a quote on a new roof", "Just want an inspection"],
      askUrgent: "Sorry to hear that! Is water coming in right now? And what's the full address of the home?",
      askQuote: "Happy to help with that. What's the full address of the home, and about how old is the roof?",
      askOther: "We can help with that. What's the full address of the home?",
      chipsUrgent: ["Yes, it's dripping. 6412 E Cactus Rd, Scottsdale", "Not right now. 2218 N 75th Pl, Scottsdale"],
      chipsAddr: ["2218 N 75th Pl, Scottsdale. About 15 years old", "6412 E Cactus Rd, Scottsdale"],
      confirmUrgent: /\b(yes|yeah|yep|it is|dripping)\b/i,
      askWhen: "Got it, thanks. What's your name, and when's a good time for someone to come take a look?",
      fu0: ["Still need help with your roof? Reply anytime.", "We'd still love to help. Is it a repair, a leak, or a new roof?"],
      fuUrgent: "Is the leak still coming in? Send the address and we'll get someone out fast."
    },
    water: {
      label: "Water treatment",
      name: "Clearwater Water Treatment",
      lede: "That's the whole product. When you can't answer, Missly texts the caller in seconds, finds out what they need, and sends you the details. The customer doesn't go to the next water company on Google. You stay on the install.",
      busy: "Under a sink, driving, eating lunch. Your phone rings like normal first.",
      hero: ["My water softener is leaking all over the garage floor",
             "Sorry about that! What's the full address, and is it still leaking right now?",
             "6412 E Cactus Rd, Scottsdale. Shut the valve but it's pooling"],
      alertTitle: "Urgent: softener leaking",
      alertBody: "Maria G., 6412 E Cactus Rd, Scottsdale. Water softener leaking in the garage, valve shut off. Wants someone out today or tomorrow morning. Call (602) 555-0148.",
      urgentLine: "Urgent stuff flagged first. Leaks and no-water calls don't wait.",
      q1: "Hi, just checking in. Still need help with your water? Reply anytime.",
      q2: "Hi again! We'd still love to help. Is it a softener issue, a new system, or a water test?",
      price: "One saved install pays for Missly for a long time.",
      urgent: /\b(leak|leaking|leaks|flood|flooding|pooling|no water|smell|smells|sick|emergency|asap|urgent)\b/i,
      quote: /quote|price|system|softener|install|\bro\b|reverse osmosis|filter|filtration|whole[- ]house/i,
      start: ["My water softener is leaking", "Want a quote on an RO system", "Can you test my water?"],
      askUrgent: "Sorry about that! Is it still leaking right now? And what's the full address of the home?",
      askQuote: "Happy to help with that. What's the full address, and is the home on city water or a well?",
      askOther: "We can help with that. What's the full address of the home?",
      chipsUrgent: ["Yes, still leaking. 6412 E Cactus Rd, Scottsdale", "Turned it off. 2218 N 75th Pl, Scottsdale"],
      chipsAddr: ["2218 N 75th Pl, Scottsdale. City water", "6412 E Cactus Rd, Scottsdale"],
      confirmUrgent: /\b(yes|yeah|yep|still)\b/i,
      askWhen: "Got it, thanks. What's your name, and when's a good time for someone to come by?",
      fu0: ["Still need help with your water? Reply anytime.", "We'd still love to help. Is it a softener issue, a new system, or a water test?"],
      fuUrgent: "Is it still leaking? Send the address and we'll get someone out fast."
    },
    hardscape: {
      label: "Hardscaping",
      name: "Sonoran Stone Hardscapes",
      lede: "That's the whole product. When you can't answer, Missly texts the caller in seconds, finds out what they need, and sends you the details. The project doesn't go to the next hardscaper on Google. You stay on the job site.",
      busy: "On a job site, driving, eating lunch. Your phone rings like normal first.",
      hero: ["Looking to redo our backyard with pavers and a fire pit",
             "Love that. What's the full address, and roughly how big is the space?",
             "2218 N 75th Pl, Scottsdale. About 20x30 ft"],
      alertTitle: "New project lead",
      alertBody: "Maria G., 2218 N 75th Pl, Scottsdale. Wants pavers and a fire pit for a 20x30 ft backyard. Free for a site visit Saturday morning. Call (602) 555-0148.",
      urgentLine: "Big projects and safety issues flagged first.",
      q1: "Hi, just checking in. Still thinking about that backyard project? Reply anytime.",
      q2: "Hi again! We'd still love to help. Is it pavers, a wall, turf, or something else?",
      price: "One saved project pays for Missly for a long time.",
      urgent: /\b(collapse|collapsed|collapsing|falling|sinking|lifting|unsafe|safety|tripping|emergency|asap|urgent)\b/i,
      quote: /quote|price|paver|pavers|patio|wall|turf|fire ?pit|pool deck|deck|design|backyard|kitchen/i,
      start: ["Want pavers for my patio", "Quote on a retaining wall", "My pool deck pavers are lifting"],
      askUrgent: "That's no fun. Is it a safety issue right now? And what's the full address of the home?",
      askQuote: "Sounds like a great project. What's the full address, and roughly how big is the area?",
      askOther: "We can help with that. What's the full address of the home?",
      chipsUrgent: ["Yes, someone tripped. 6412 E Cactus Rd, Scottsdale", "Not urgent. 2218 N 75th Pl, Scottsdale"],
      chipsAddr: ["2218 N 75th Pl, Scottsdale. About 20x30 ft", "6412 E Cactus Rd, Scottsdale"],
      confirmUrgent: /\b(yes|yeah|yep|tripped|unsafe)\b/i,
      askWhen: "Got it, thanks. What's your name, and when's a good time for someone to come measure and talk options?",
      fu0: ["Still thinking about that project? Reply anytime.", "We'd still love to help. Is it pavers, a wall, turf, or something else?"],
      fuUrgent: "Is that still a safety issue? Send the address and we'll get someone out fast."
    },
    any: {
      label: "Something else",
      name: "Valley Home Services",
      lede: "That's the whole product. When you can't answer, Missly texts the caller in seconds, finds out what they need, and sends you the details. The job doesn't go to the next company on Google. You stay on the job.",
      busy: "On a job, driving, eating lunch. Your phone rings like normal first.",
      hero: ["Need someone out this week for a repair at my house",
             "We can help. What's the full address, and what's going on?",
             "2218 N 75th Pl, Scottsdale. Easier to show you in person"],
      alertTitle: "New lead: ready for a callback",
      alertBody: "Maria G., 2218 N 75th Pl, Scottsdale. Needs a repair estimate this week. Free after 3pm most days. Call (602) 555-0148.",
      urgentLine: "Urgent stuff flagged first. Emergencies don't wait.",
      q1: "Hi, just checking in. Still need a hand? Reply anytime.",
      q2: "Hi again! We'd still love to help. Is it a repair, a new install, or just a quote?",
      price: "One saved job pays for Missly for a long time.",
      urgent: /\b(leak|leaking|flood|flooding|broken|no power|no heat|no ac|no a\/c|emergency|asap|urgent|today)\b/i,
      quote: /quote|estimate|price|new|install|replace/i,
      start: ["I need a repair", "Want a quote", "Something's broken, need help today"],
      askUrgent: "Sorry to hear that! Is it an emergency right now? And what's the full address?",
      askQuote: "Happy to help with that. What's the full address, and what are you looking to get done?",
      askOther: "We can help with that. What's the full address?",
      chipsUrgent: ["Yes, need someone today. 6412 E Cactus Rd, Scottsdale", "It can wait a day. 2218 N 75th Pl, Scottsdale"],
      chipsAddr: ["2218 N 75th Pl, Scottsdale", "6412 E Cactus Rd, Scottsdale"],
      confirmUrgent: /\b(yes|yeah|yep|today|now)\b/i,
      askWhen: "Got it, thanks. What's your name, and when's a good time for someone to come by?",
      fu0: ["Still need a hand? Reply anytime.", "We'd still love to help. Is it a repair, a new install, or just a quote?"],
      fuUrgent: "Is that still an emergency? Send the address and we'll get someone out fast."
    }
  };
  var ORDER = ["roofing", "water", "hardscape", "any"];
  var DEFAULT_NAMES = ORDER.map(function (k) { return P[k].name; });
  var listeners = [];

  function initial() {
    var q = (location.search.match(/[?&]for=([a-z]+)/i) || [])[1];
    if (q && P[q.toLowerCase()]) return q.toLowerCase();
    try { var s = localStorage.getItem("missly-ind"); if (s && P[s]) return s; } catch (e) {}
    return "roofing";
  }

  var M = window.MisslyIndustry = {
    profiles: P,
    key: initial(),
    get: function () { return P[M.key]; },
    isDefaultName: function (n) { return DEFAULT_NAMES.indexOf(n) !== -1; },
    onChange: function (fn) { listeners.push(fn); },
    set: function (k) {
      if (!P[k] || k === M.key) return;
      M.key = k;
      try { localStorage.setItem("missly-ind", k); } catch (e) {}
      apply();
      listeners.forEach(function (fn) { fn(P[k]); });
    }
  };

  function apply() {
    var p = M.get();
    document.querySelectorAll("[data-t]").forEach(function (el) {
      var key = el.getAttribute("data-t"), m = key.match(/^hero(\d)$/);
      var val = m ? p.hero[+m[1]] : p[key];
      if (typeof val === "string") el.textContent = val;
    });
    document.querySelectorAll("[data-t-name]").forEach(function (el) { el.textContent = p.name; });
    var heroBot = document.querySelector("[data-t-hello]");
    if (heroBot) heroBot.textContent = "Hi, this is " + p.name + ". Sorry we missed your call! What can we help with?";
    document.querySelectorAll(".ind-pick button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-ind") === M.key ? "true" : "false");
    });
  }

  function build() {
    document.querySelectorAll(".ind-pick").forEach(function (box) {
      ORDER.forEach(function (k) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = P[k].label; b.setAttribute("data-ind", k);
        b.addEventListener("click", function () { M.set(k); });
        box.appendChild(b);
      });
    });
    apply();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
