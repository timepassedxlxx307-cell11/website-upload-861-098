(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(
        slider.querySelectorAll(".hero-slide"),
      );
      var dots = Array.prototype.slice.call(
        slider.querySelectorAll(".hero-dot"),
      );
      var next = slider.querySelector("[data-hero-next]");
      var prev = slider.querySelector("[data-hero-prev]");
      var active = slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
      });
      if (active < 0) active = 0;

      function show(index) {
        if (!slides.length) return;
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("is-active", itemIndex === active);
        });
        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("is-active", itemIndex === active);
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
        });
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    var inputs = Array.prototype.slice.call(
      document.querySelectorAll("[data-site-search]"),
    );
    var yearFilters = Array.prototype.slice.call(
      document.querySelectorAll("[data-year-filter]"),
    );
    var typeFilters = Array.prototype.slice.call(
      document.querySelectorAll("[data-type-filter]"),
    );
    var items = Array.prototype.slice.call(
      document.querySelectorAll("[data-search-item]"),
    );

    function currentValue(nodes) {
      for (var index = 0; index < nodes.length; index += 1) {
        if (nodes[index].value) return nodes[index].value;
      }
      return "";
    }

    function applyFilters() {
      var query = currentValue(inputs).trim().toLowerCase();
      var year = currentValue(yearFilters);
      var type = currentValue(typeFilters);
      items.forEach(function (item) {
        var haystack = (item.getAttribute("data-title") || "").toLowerCase();
        var itemYear = item.getAttribute("data-year") || "";
        var itemType = item.getAttribute("data-type") || "";
        var visible = true;
        if (query && haystack.indexOf(query) === -1) visible = false;
        if (year && itemYear !== year) visible = false;
        if (type && itemType !== type) visible = false;
        item.classList.toggle("is-filtered-out", !visible);
      });
    }

    inputs
      .concat(yearFilters)
      .concat(typeFilters)
      .forEach(function (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      });
  });
})();
