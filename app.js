(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var progress = document.querySelector(".progress");
  var toggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelectorAll(".nav-links a");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      document.body.classList.remove("nav-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
  });

  var navObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var key = entry.target.getAttribute("data-nav");
        document.querySelectorAll(".nav-links a[data-nav]").forEach(function (link) {
          link.classList.toggle("is-current", link.getAttribute("data-nav") === key);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );
  document.querySelectorAll("[data-nav]").forEach(function (section) {
    navObserver.observe(section);
  });

  if (!reduce) {
    var reveal = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("in");
        });
      },
      { threshold: 0.18 }
    );
    document.querySelectorAll(".rise").forEach(function (el) {
      reveal.observe(el);
    });
  } else {
    document.querySelectorAll(".rise").forEach(function (el) {
      el.classList.add("in");
    });
  }

  function bindScrub(section, slides, onIndex) {
    if (!section || !slides.length || reduce) {
      slides.forEach(function (slide) { slide.classList.add("is-on"); });
      return;
    }
    var rails = section.querySelectorAll(".rail a");
    function indexFromScroll() {
      var start = section.offsetTop;
      var total = section.offsetHeight - window.innerHeight;
      if (total <= 0) return 0;
      var y = window.scrollY - start;
      var p = Math.min(1, Math.max(0, y / total));
      return Math.min(slides.length - 1, Math.floor(p * slides.length));
    }
    function render() {
      var i = indexFromScroll();
      slides.forEach(function (slide, n) {
        var on = n === i;
        slide.classList.toggle("is-on", on);
        slide.setAttribute("aria-hidden", on ? "false" : "true");
      });
      rails.forEach(function (rail, n) {
        rail.classList.toggle("is-on", n === i);
        rail.setAttribute("aria-current", n === i ? "true" : "false");
      });
      if (onIndex) onIndex(i);
    }
    rails.forEach(function (rail, n) {
      rail.addEventListener("click", function (event) {
        event.preventDefault();
        var total = section.offsetHeight - window.innerHeight;
        var y = section.offsetTop + ((n + 0.08) / slides.length) * total;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });
    render();
    return render;
  }

  var fleetSlides = Array.prototype.slice.call(document.querySelectorAll("#fleet .v-slide"));
  var fleetCount = document.getElementById("fleetCount");
  var renderFleet = bindScrub(document.getElementById("fleet"), fleetSlides, function (i) {
    if (!fleetCount) return;
    var n = String(i + 1).padStart(2, "0");
    fleetCount.textContent = n + "  /  0" + fleetSlides.length;
  });

  var howSlides = Array.prototype.slice.call(document.querySelectorAll("#how .h-slide"));
  var howNum = document.getElementById("howNum");
  var renderHow = bindScrub(document.getElementById("how"), howSlides, function (i) {
    if (howNum) howNum.textContent = String(i + 1).padStart(2, "0");
  });

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var height = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.transform = "scaleX(" + (height ? window.scrollY / height : 0) + ")";
      if (renderFleet) renderFleet();
      if (renderHow) renderHow();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();


  document.querySelectorAll("form[data-mailto]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;
      var data = new FormData(form);
      var lines = [];
      data.forEach(function (value, key) {
        if (key === "consent") return;
        lines.push(key + ": " + value);
      });
      lines.push("");
      lines.push("Sent from the Trident cinematic prototype. Not a live form submission.");
      var subject = form.getAttribute("data-subject") || "Quote request";
      var href = "mailto:sales@tridentc.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      var status = form.querySelector(".form-status");
      if (status) {
        status.hidden = false;
        status.textContent = "Opening your email to sales@tridentc.com. Nothing was saved on a server. If mail does not open, call or text 516-820-0277.";
      }
      window.location.href = href;
    });
  });
})();
