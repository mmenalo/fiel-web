(function () {
  "use strict";
  var t = window.FIEL_I18N || {};

  // Mobile menu
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Tablet scene demo
  var tablet = document.querySelector(".tablet");
  if (tablet && t.scenes) {
    var buttons = tablet.querySelectorAll(".scene");
    var apply = function (name) {
      var s = t.scenes[name];
      if (!s) return;
      tablet.setAttribute("data-scene", name);
      buttons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.scene === name));
      });
      Object.keys(s.tiles).forEach(function (key) {
        var tile = tablet.querySelector('[data-tile="' + key + '"]');
        if (!tile) return;
        var v = s.tiles[key];
        tile.querySelector(".tile__value").textContent = v[0];
        tile.classList.toggle("is-on", v[1] === "on");
        tile.classList.toggle("is-secure", v[1] === "secure");
      });
      var time = tablet.querySelector(".tablet__time");
      var meta = tablet.querySelector(".tablet__meta");
      if (time) time.textContent = s.time;
      if (meta) meta.innerHTML = s.meta;
    };
    buttons.forEach(function (b) {
      b.addEventListener("click", function () { apply(b.dataset.scene); });
    });
    apply("morning");
  }

  // Contact form opens the visitor's e-mail client with the message prefilled
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var lines = [
        (t.form && t.form.name || "Name") + ": " + d.get("name"),
        (t.form && t.form.contact || "Contact") + ": " + d.get("contact"),
        (t.form && t.form.type || "Property") + ": " + d.get("type"),
        "",
        d.get("message") || ""
      ];
      var subject = (t.form && t.form.subject || "Upit") + " – " + d.get("name");
      window.location.href = "mailto:" + form.dataset.to +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
    });
  }

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -60px 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Year
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
