// Missly setup guide: shows the exact forwarding code for the client's carrier.
(function () {
  var API = "https://missed-call-agent-production-f23175d2.up.railway.app/api/setup-done";
  var params = new URLSearchParams(location.search);
  var num = (params.get("n") || "").replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  var biz = (params.get("b") || "").slice(0, 80);
  var carrier = "";

  var CARRIERS = {
    verizon: { on: "*71" + num, off: "*73", note: "Verizon forwards after your phone rings about 3 to 6 times." },
    visible: { on: "*71" + num, off: "*73", note: "Visible runs on Verizon's network, so it uses Verizon's code." },
    att:     { on: "**004*1" + num + "#", off: "##004#", note: "" },
    tmobile: { on: "**004*1" + num + "#", off: "##004#", note: "" },
    cricket: { on: "**004*1" + num + "#", off: "##004#", note: "Cricket runs on AT&T's network, so it uses the same code." },
    metro:   { on: "**004*1" + num + "#", off: "##004#", note: "Metro runs on T-Mobile's network, so it uses the same code." },
    mint:    { on: "**004*1" + num + "#", off: "##004#", note: "Mint runs on T-Mobile's network, so it uses the same code." }
  };

  function $(id) { return document.getElementById(id); }
  function pretty(d) { return d.length === 10 ? "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6) : d; }

  if (biz) $("for-biz").textContent = " for " + biz;
  if (num.length === 10) {
    $("missly-num").textContent = pretty(num);
  } else {
    $("number-card").hidden = true;
    $("no-number").hidden = false;
  }

  function unlock(id) { $(id).classList.remove("locked"); }

  document.querySelectorAll(".carriers button").forEach(function (b) {
    b.addEventListener("click", function () {
      carrier = b.dataset.c;
      document.querySelectorAll(".carriers button").forEach(function (x) {
        x.setAttribute("aria-checked", x === b ? "true" : "false");
      });
      var c = CARRIERS[carrier];
      $("dial-cell").hidden = !c;
      $("dial-office").hidden = carrier !== "office";
      $("dial-unsure").hidden = carrier !== "unsure";
      if (c) {
        $("code-on").textContent = num.length === 10 ? c.on : "Missing number";
        $("dial-note").textContent = c.note;
        $("turn-off").textContent = "Need to turn Missly off later? Dial " + c.off + " from your business phone and press Call.";
      } else {
        $("turn-off").textContent = "";
      }
      unlock("step-dial");
      if (carrier !== "unsure") { unlock("step-test"); unlock("step-done"); }
      $("step-dial").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  $("copy-on").addEventListener("click", function () {
    var t = $("code-on").textContent, btn = this;
    function ok() { btn.textContent = "Copied"; setTimeout(function () { btn.textContent = "Copy"; }, 1800); }
    try {
      navigator.clipboard.writeText(t).then(ok, function () { select(); });
    } catch (e) { select(); }
    function select() {
      var r = document.createRange(); r.selectNodeContents($("code-on"));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = "Selected";
    }
  });

  $("done-btn").addEventListener("click", function () {
    var btn = this, msg = $("done-msg");
    btn.disabled = true; btn.textContent = "Sending…";
    function finish(sent) {
      btn.hidden = true; msg.hidden = false;
      msg.textContent = sent
        ? "Thanks! We've been notified and will run a final check. You'll hear from us when you're officially live."
        : "Thanks! Please reply to your setup email with “done” so we know to run the final check.";
    }
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({ n: num, b: biz, carrier: carrier }) })
      .then(function (r) { finish(r.ok); }, function () { finish(false); });
  });
})();
