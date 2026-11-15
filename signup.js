// Missly signup: 4 steps, sends to the Missly server, keeps a draft in this browser.
(function () {
  var API = "https://missed-call-agent-production-f23175d2.up.railway.app/api/signup";
  var DRAFT_KEY = "missly-signup-draft";
  var form = document.getElementById("signup");
  if (!form) return;
  var steps = form.querySelectorAll(".step"), progress = document.querySelectorAll("#progress li"),
      back = document.getElementById("back"), next = document.getElementById("next"),
      err = document.getElementById("form-error"), review = document.getElementById("review");
  var step = 1, total = steps.length, sending = false;

  var LABELS = {
    business_name: "Business name", industry: "Type of business", website: "Website",
    business_phone: "Business phone", owner_name: "Your name", cell_phone: "Your cell", email: "Email",
    alert_phones: "Other alert contacts", services: "Services", service_area: "Service area",
    hours: "Hours", booking_link: "Booking link", notes: "Always or never say"
  };

  // ---- draft (best effort; storage can be unavailable)
  try {
    var saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
    Object.keys(saved).forEach(function (k) {
      var el = form.elements[k];
      if (el && el.type !== "checkbox") el.value = saved[k];
    });
  } catch (e) {}
  form.addEventListener("change", function (ev) {
    if (ev.target.type === "checkbox" && ev.target.checked) { ev.target.removeAttribute("aria-invalid"); showError(""); }
  });
  form.addEventListener("input", function (ev) {
    if (ev.target.getAttribute("aria-invalid")) { ev.target.removeAttribute("aria-invalid"); showError(""); }
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(values())); } catch (e) {}
  });

  function values() {
    var out = {};
    Object.keys(LABELS).concat(["how_heard", "company_url"]).forEach(function (k) {
      var el = form.elements[k];
      if (el) out[k] = el.value.trim();
    });
    return out;
  }

  function digits(s) { return (s || "").replace(/\D/g, ""); }

  function validate(n) {
    var bad = null;
    steps[n - 1].querySelectorAll("input, select, textarea").forEach(function (el) {
      el.removeAttribute("aria-invalid");
      if (bad || el.name === "company_url") return;
      var v = el.type === "checkbox" ? el.checked : el.value.trim();
      var msg = "";
      if (el.required && !v) msg = el.type === "checkbox" ? "Please check the box to agree." : "Please fill in “" + (LABELS[el.name] || "this field") + "”.";
      else if (v && el.type === "tel" && digits(v).length < 10) msg = "Please enter a full 10-digit phone number.";
      else if (v && el.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) msg = "Please enter a valid email address.";
      else if (v && el.type === "url" && !/^https?:\/\/\S+\.\S+/.test(v)) msg = "Links should start with https://";
      if (msg) { bad = el; el.setAttribute("aria-invalid", "true"); showError(msg); }
    });
    if (bad) bad.focus();
    return !bad;
  }

  function showError(msg) { err.textContent = msg; err.hidden = !msg; }

  function go(n, initial) {
    step = n;
    steps.forEach(function (s, i) { s.hidden = i !== n - 1; });
    progress.forEach(function (li, i) {
      li.classList.toggle("done", i < n - 1);
      li.classList.toggle("current", i === n - 1);
      if (i === n - 1) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    back.hidden = n === 1;
    next.textContent = n === total ? "Sign up for Missly" : "Continue";
    showError("");
    if (n === total) buildReview();
    var first = steps[n - 1].querySelector("input:not(.hp), select, textarea");
    if (first && n > 1) first.focus({ preventScroll: true });
    if (!initial) form.scrollIntoView({ block: "start", behavior: "auto" });
  }

  function buildReview() {
    var v = values();
    review.innerHTML = "";
    Object.keys(LABELS).forEach(function (k) {
      if (!v[k]) return;
      var dt = document.createElement("dt"), dd = document.createElement("dd");
      dt.textContent = LABELS[k]; dd.textContent = v[k];
      review.appendChild(dt); review.appendChild(dd);
    });
    var edit = document.createElement("button");
    edit.type = "button"; edit.className = "back"; edit.textContent = "Edit my answers";
    edit.addEventListener("click", function () { go(1); });
    review.appendChild(edit);
  }

  back.addEventListener("click", function () { if (step > 1) go(step - 1); });

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!validate(step)) return;
    if (step < total) return go(step + 1);
    submit();
  });

  function submit() {
    if (sending) return;
    sending = true; next.disabled = true; next.textContent = "Sending…";
    var data = values(); data.agreed = true;
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "The signup didn't go through.");
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
        form.hidden = true;
        var done = document.getElementById("done");
        document.getElementById("done-msg").textContent = "Thanks, " + (data.owner_name.split(" ")[0] || "there") +
          "! We got the info for " + data.business_name + ". Check your inbox for a welcome email. Our onboarding team will set up your line, usually within one business day, and email you a 2-minute setup guide.";
        done.hidden = false; done.focus();
      })
      .catch(function (e) {
        var body = Object.keys(LABELS).filter(function (k) { return data[k]; })
          .map(function (k) { return LABELS[k] + ": " + data[k]; }).join("\n");
        showError("");
        err.hidden = false;
        err.textContent = (e && e.message && !/fetch|network|load/i.test(e.message) ? e.message + " " : "We couldn't send your signup just now. ") +
          "Your answers are saved here. Try again, or ";
        var a = document.createElement("a");
        a.href = "mailto:zach@missly.io?subject=" + encodeURIComponent("Missly signup: " + data.business_name) +
          "&body=" + encodeURIComponent(body);
        a.textContent = "email them to our team instead";
        err.appendChild(a); err.appendChild(document.createTextNode(" (email: zach@missly.io)."));
      })
      .finally(function () { sending = false; next.disabled = false; next.textContent = "Sign up for Missly"; });
  }

  go(1, true);
})();
