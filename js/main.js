const CONFIG = {
  phone: "8801601******",
  whatsapp: "01601******",
  endpoint: ""
};

(function () {
  "use strict";

  var form = document.getElementById("lead-form");
  var statusEl = document.getElementById("lf-status");
  var btn = form ? form.querySelector(".lf-submit") : null;

  document.querySelectorAll("[data-call]").forEach(function (a) {
    if (CONFIG.phone) {
      a.href = "tel:+" + CONFIG.phone;
      a.textContent = "কল করুন · +" + CONFIG.phone;
    } else {
      a.setAttribute("hidden", "");
    }
  });
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    if (CONFIG.whatsapp) {
      a.href = "https://wa.me/" + CONFIG.whatsapp +
        "?text=" + encodeURIComponent("আসসালামু আলাইকুম, Wave 3 সম্পর্কে জানতে চাই।");
    } else {
      a.setAttribute("hidden", "");
    }
  });

  if (!form) return;

  function bnToEn(str) {
    return str.replace(/[০-৯]/g, function (d) { return "০১২৩৪৫৬৭৮৯".indexOf(d); });
  }
  function setError(id, msg) {
    var err = document.getElementById("e-" + id);
    var field = document.getElementById("f-" + id).closest(".field");
    if (err) err.textContent = msg || "";
    field.classList.toggle("bad", !!msg);
  }
  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "lf-status" + (kind ? " " + kind : "");
  }

  function validate() {
    var name = form.elements.name.value.trim();
    var phone = bnToEn(form.elements.phone.value).replace(/[\s-]/g, "");
    var ok = true;

    if (name.length < 2) { setError("name", "আপনার নাম লিখুন।"); ok = false; }
    else setError("name", "");

    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone)) {
      setError("phone", "সঠিক মোবাইল নম্বর দিন, যেমন 01712345678।");
      ok = false;
    } else setError("phone", "");

    return ok ? { name: name, phone: phone.replace(/^\+?88/, "") } : null;
  }

  form.addEventListener("input", function (e) {
    if (e.target.id === "f-name" || e.target.id === "f-phone") {
      setError(e.target.id.slice(2), "");
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("", "");

    if (form.elements.website.value) return;

    var checked = validate();
    if (!checked) {
      var firstBad = form.querySelector(".field.bad input");
      if (firstBad) firstBad.focus();
      return;
    }

    var data = {
      time: new Date().toISOString(),
      name: checked.name,
      phone: checked.phone,
      district: form.elements.district.value.trim(),
      package: form.elements.package.value,
      address: form.elements.address.value.trim(),
      note: form.elements.note.value.trim(),
      page: location.href
    };

    if (CONFIG.endpoint) {
      send(data);
    } else if (CONFIG.whatsapp) {
      openWhatsApp(data);
    } else {
      setStatus("ফর্মটি এখনো সংযুক্ত হয়নি। js/main.js ফাইলে endpoint বা whatsapp নম্বর বসান।", "bad");
    }
  });

  function send(data) {
    btn.disabled = true;
    setStatus("পাঠানো হচ্ছে...", "");
    fetch(CONFIG.endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    }).then(function () {
      form.reset();
      setStatus("ধন্যবাদ " + data.name + "! আপনার অনুরোধ পেয়েছি। শীঘ্রই আমরা " + data.phone + " নম্বরে কল করব।", "ok");
    }).catch(function () {
      setStatus("পাঠানো যায়নি। ইন্টারনেট দেখে আবার চেষ্টা করুন, অথবা সরাসরি কল করুন।", "bad");
    }).then(function () { btn.disabled = false; });
  }

  function openWhatsApp(data) {
    var lines = [
      "নতুন অর্ডারের অনুরোধ (Wave 3)",
      "নাম: " + data.name,
      "মোবাইল: " + data.phone,
      "প্যাকেজ: " + data.package
    ];
    if (data.district) lines.push("জেলা: " + data.district);
    if (data.address) lines.push("ঠিকানা: " + data.address);
    if (data.note) lines.push("মন্তব্য: " + data.note);
    window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(lines.join("\n")), "_blank", "noopener");
    setStatus("WhatsApp খুলেছে। মেসেজটি পাঠালেই আপনার অনুরোধ আমাদের কাছে পৌঁছাবে।", "ok");
  }
})();
