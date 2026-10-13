/* SolveCraft — Home section behaviour */
(function () {
  "use strict";

  var header = document.getElementById("site-header");
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (!header || !toggle || !menu) return;

  var mobileQuery = window.matchMedia("(max-width: 960px)");

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close the menu after choosing a link
  menu.addEventListener("click", function (event) {
    if (event.target.closest("a")) setMenu(false);
  });

  // Close with Escape and return focus to the toggle
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  // Close when tapping outside the header
  document.addEventListener("click", function (event) {
    if (menu.classList.contains("is-open") && !header.contains(event.target)) {
      setMenu(false);
    }
  });

  // Reset the menu when moving back to the desktop layout
  var onBreakpointChange = function (event) { if (!event.matches) setMenu(false); };
  if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", onBreakpointChange);
  else mobileQuery.addListener(onBreakpointChange);

  // Subtle border under the header once the page scrolls
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mark the nav link of the section currently in view.
  // Only sections that exist on the page are tracked, so links to
  // sections that have not been built yet are simply ignored.
  var tracked = [].slice.call(document.querySelectorAll(".nav-link"))
    .map(function (link) {
      return { link: link, section: document.getElementById(link.getAttribute("href").slice(1)) };
    })
    .filter(function (item) { return item.section; });

  if ("IntersectionObserver" in window && tracked.length > 1) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tracked.forEach(function (item) {
          item.link.classList.toggle("is-active", item.section === entry.target);
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    tracked.forEach(function (item) { observer.observe(item.section); });
  }
})();

/* SolveCraft — Portfolio: full-size concept viewer */
(function () {
  "use strict";

  var dialog = document.getElementById("concept-dialog");
  var openButtons = document.querySelectorAll("[data-concept-open]");
  if (!dialog || !openButtons.length) return;

  // Browsers without <dialog> support: hide the buttons rather than leave them dead.
  if (typeof dialog.showModal !== "function") {
    [].forEach.call(openButtons, function (button) { button.hidden = true; });
    return;
  }

  var title = dialog.querySelector("#concept-dialog-title");
  var body = dialog.querySelector(".concept-dialog-body");
  var closeButton = dialog.querySelector(".concept-close");

  [].forEach.call(openButtons, function (button) {
    button.addEventListener("click", function () {
      var card = button.closest(".concept-card");
      var preview = card && card.querySelector(".m-viewport");
      if (!preview) return;

      var copy = preview.cloneNode(true);
      [].forEach.call(copy.querySelectorAll("img"), function (img) { img.loading = "eager"; });

      title.textContent = card.getAttribute("data-concept-title") || "";
      body.textContent = "";
      body.appendChild(copy);
      body.scrollTop = 0;

      document.body.classList.add("dialog-open");
      dialog.showModal();
    });
  });

  closeButton.addEventListener("click", function () { dialog.close(); });

  // Clicking the dimmed backdrop closes the viewer
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", function () {
    document.body.classList.remove("dialog-open");
    body.textContent = "";
  });
})();

/* SolveCraft — Contact section and footer */
(function () {
  "use strict";

  /* =====================================================================
     CONTACT CONFIGURATION — REPLACE THE EMPTY VALUES BELOW
     Nothing is invented: an empty value means that contact option is NOT
     shown anywhere on the page.

     whatsapp     WhatsApp Business number with country code, digits only
                  (a leading + or spaces are fine). Example format:
                  "<country code><number>"
     instagram    Instagram username, with or without the @.
     email        Business email address.
     formEndpoint HTTPS URL of a form service that accepts a JSON POST
                  (for example a Formspree, Getform or Basin form URL).
                  While this is empty the form validates input but does
                  NOT send anything, and says so to the visitor.
     ===================================================================== */
  var CONTACT_CONFIG = {
    whatsapp: "923254385708",
    instagram: "solvecraft.pk",
    email: "solvecraft.business@gmail.com",
    formEndpoint: "https://formspree.io/f/moejnogy"
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---------- Contact methods (only the ones configured above) ---------- */
  var methods = [];

  var whatsapp = String(CONTACT_CONFIG.whatsapp || "").replace(/[^\d]/g, "");
  if (whatsapp.length >= 8 && whatsapp.length <= 15) {
    methods.push({ label: "WhatsApp Business", text: "Message us on WhatsApp", href: "https://wa.me/" + whatsapp, external: true });
  }

  var instagram = String(CONTACT_CONFIG.instagram || "").trim().replace(/^@/, "");
  if (/^[A-Za-z0-9._]{1,30}$/.test(instagram)) {
    methods.push({ label: "Instagram", text: "@" + instagram, href: "https://www.instagram.com/" + instagram + "/", external: true });
  }

  var email = String(CONTACT_CONFIG.email || "").trim();
  if (EMAIL_RE.test(email)) {
    methods.push({ label: "Email", text: email, href: "mailto:" + email, external: false });
  }

  function makeLink(method, className) {
    var link = document.createElement("a");
    link.href = method.href;
    if (method.external) { link.target = "_blank"; link.rel = "noopener"; }
    if (className === "card") {
      var key = document.createElement("span");
      key.className = "contact-key";
      key.textContent = method.label;
      var value = document.createElement("span");
      value.className = "contact-val";
      value.textContent = method.text;
      link.appendChild(key);
      link.appendChild(value);
    } else {
      link.textContent = method.label === "Email" || method.label === "Instagram" ? method.text : method.label;
    }
    return link;
  }

  if (methods.length) {
    var contactBox = document.getElementById("contact-methods");
    var contactList = document.getElementById("contact-list");
    var footerBox = document.getElementById("footer-contact");
    var footerList = document.getElementById("footer-contact-list");

    methods.forEach(function (method) {
      if (contactList) {
        var item = document.createElement("li");
        item.appendChild(makeLink(method, "card"));
        contactList.appendChild(item);
      }
      if (footerList) {
        var footerItem = document.createElement("li");
        footerItem.appendChild(makeLink(method, "text"));
        footerList.appendChild(footerItem);
      }
    });
    if (contactBox) contactBox.hidden = false;
    if (footerBox) footerBox.hidden = false;
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("cf-status");
  var submitButton = document.getElementById("cf-submit");
  var hasDirectContact = methods.length > 0;

  var rules = [
    { id: "cf-name", check: function (v) { return v.trim() ? "" : "Please enter your full name."; } },
    { id: "cf-email", check: function (v) {
        if (!v.trim()) return "Please enter your email address.";
        return EMAIL_RE.test(v.trim()) ? "" : "Please enter a valid email address, like name@example.com.";
      } },
    { id: "cf-type", check: function (v) { return v ? "" : "Please choose the type of project."; } },
    { id: "cf-details", check: function (v) {
        if (!v.trim()) return "Please tell us a little about your project.";
        return v.trim().length >= 10 ? "" : "Please add a little more detail (at least 10 characters).";
      } }
  ];

  function fieldParts(rule) {
    return { input: document.getElementById(rule.id), error: document.getElementById(rule.id + "-error") };
  }

  function validateField(rule) {
    var parts = fieldParts(rule);
    var message = rule.check(parts.input.value);
    if (message) {
      parts.error.textContent = message;
      parts.error.hidden = false;
      parts.input.setAttribute("aria-invalid", "true");
    } else {
      parts.error.textContent = "";
      parts.error.hidden = true;
      parts.input.removeAttribute("aria-invalid");
    }
    return !message;
  }

  function setStatus(kind, message) {
    status.className = "form-status is-" + kind;
    status.textContent = message;
    status.hidden = false;
  }

  function clearStatus() {
    status.textContent = "";
    status.className = "form-status";
    status.hidden = true;
  }

  // Validate a field when the visitor leaves it, and keep it up to date while fixing it
  rules.forEach(function (rule) {
    var input = document.getElementById(rule.id);
    input.addEventListener("blur", function () {
      if (input.value !== "" || input.getAttribute("aria-invalid") === "true") validateField(rule);
    });
    var update = function () {
      if (input.getAttribute("aria-invalid") === "true") validateField(rule);
      // Once every problem is fixed, remove the old "please fix" banner
      if (status.classList.contains("is-error") && !form.querySelector('[aria-invalid="true"]')) clearStatus();
    };
    input.addEventListener("input", update);
    input.addEventListener("change", update);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearStatus();

    var firstInvalid = null;
    var invalidCount = 0;
    rules.forEach(function (rule) {
      if (!validateField(rule)) {
        invalidCount += 1;
        if (!firstInvalid) firstInvalid = fieldParts(rule).input;
      }
    });

    if (firstInvalid) {
      setStatus("error", invalidCount === 1
        ? "Please fix the highlighted field and try again."
        : "Please fix the " + invalidCount + " highlighted fields and try again.");
      firstInvalid.focus();
      return;
    }

    var endpoint = String(CONTACT_CONFIG.formEndpoint || "").trim();
    if (!/^https:\/\//i.test(endpoint)) {
      // No delivery service is connected: never pretend the inquiry was sent.
      setStatus("info", "Your details look complete, but this form is not connected to a delivery service yet, so your inquiry has not been sent and nothing has been saved."
        + (hasDirectContact ? " Please use one of the contact options instead." : ""));
      return;
    }

    var payload = {
      name: document.getElementById("cf-name").value.trim(),
      email: document.getElementById("cf-email").value.trim(),
      projectType: document.getElementById("cf-type").value,
      details: document.getElementById("cf-details").value.trim()
    };

    submitButton.disabled = true;
    submitButton.textContent = "Sending…";
    setStatus("info", "Sending your inquiry…");

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (response) {
      if (!response.ok) throw new Error("Request failed with status " + response.status);
      setStatus("success", "Thank you. Your inquiry has been sent.");
      form.reset();
    }).catch(function () {
      setStatus("error", "Your inquiry could not be sent. Please try again in a moment"
        + (hasDirectContact ? ", or use one of the contact options." : "."));
    }).then(function () {
      submitButton.disabled = false;
      submitButton.textContent = "Send Inquiry";
    });
  });
})();
