document.addEventListener("DOMContentLoaded", () => {
  window.dataLayer = window.dataLayer || [];

  const themes = [
    { id: "warm", label: "Warm renovatie", meta: "Aards en ambachtelijk" },
    { id: "light", label: "Licht minimal", meta: "Fris en rustig" },
    { id: "industrial", label: "Stoer industrieel", meta: "Robuust en modern" }
  ];
  const defaultTheme = "light";
  const visibleThemeIds = new Set(["light"]);
  const themeStorageKey = "peter_ponnet_theme";
  const isValidTheme = theme => themes.some(item => item.id === theme);
  const isVisibleTheme = theme => visibleThemeIds.has(theme);
  const isSelectableTheme = theme => isValidTheme(theme) && isVisibleTheme(theme);

  const applyTheme = theme => {
    const selected = isSelectableTheme(theme) ? theme : defaultTheme;
    document.documentElement.setAttribute("data-theme", selected);

    try {
      localStorage.setItem(themeStorageKey, selected);
    } catch (_error) {
      // Ignore storage errors (private mode, disabled storage, ...).
    }

    document.querySelectorAll("[data-theme-option]").forEach(option => {
      const isActive = option.getAttribute("data-theme-option") === selected;
      option.classList.toggle("is-active", isActive);
      option.setAttribute("aria-pressed", String(isActive));
    });

    const activeTheme = themes.find(item => item.id === selected) || themes[0];
    const currentLabel = document.querySelector("[data-theme-current]");
    if (currentLabel) {
      currentLabel.textContent = activeTheme.label;
    }
  };

  const createThemePicker = () => {
    const picker = document.createElement("div");
    picker.className = "theme-picker";
    picker.innerHTML = `
      <button class="theme-picker-toggle" type="button" aria-expanded="false" aria-controls="theme-picker-panel">
        Thema
        <span class="theme-current" data-theme-current></span>
      </button>
      <div id="theme-picker-panel" class="theme-picker-panel" hidden>
        ${themes
          .map(
            theme => `
          <button class="theme-option" type="button" data-theme-option="${theme.id}" aria-pressed="false"${isVisibleTheme(theme.id) ? "" : ' hidden aria-hidden="true" tabindex="-1"'}>
            <span class="theme-swatch" aria-hidden="true"></span>
            <span>
              ${theme.label}
              <span class="theme-meta">${theme.meta}</span>
            </span>
          </button>
        `
          )
          .join("")}
      </div>
    `;
    document.body.appendChild(picker);

    const toggleButton = picker.querySelector(".theme-picker-toggle");
    const panel = picker.querySelector(".theme-picker-panel");

    const setOpen = open => {
      picker.classList.toggle("is-open", open);
      if (panel) {
        panel.hidden = !open;
      }
      if (toggleButton) {
        toggleButton.setAttribute("aria-expanded", String(open));
      }
    };

    toggleButton?.addEventListener("click", () => {
      setOpen(!picker.classList.contains("is-open"));
    });

    panel?.addEventListener("click", event => {
      if (!(event.target instanceof Element)) return;
      const option = event.target.closest("[data-theme-option]");
      if (!option) return;
      applyTheme(option.getAttribute("data-theme-option"));
      setOpen(false);
    });

    document.addEventListener("click", event => {
      if (!(event.target instanceof Node)) return;
      if (!picker.contains(event.target)) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });
  };

  let initialTheme = defaultTheme;
  try {
    const storedTheme = localStorage.getItem(themeStorageKey);
    if (isSelectableTheme(storedTheme)) {
      initialTheme = storedTheme;
    }
  } catch (_error) {
    // Ignore storage errors.
  }

  document.documentElement.setAttribute("data-theme", initialTheme);
  createThemePicker();
  applyTheme(initialTheme);

  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => nav?.classList.toggle("is-open"));
  }

  // Scroll reveal animations
  const animated = document.querySelectorAll("[data-animate]");
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );
  animated.forEach(el => observer.observe(el));

  // Subtle parallax on hero cards
  const heroCards = document.querySelectorAll(".hero-card");
  window.addEventListener("scroll", () => {
    const offset = window.scrollY * 0.03;
    heroCards.forEach(card => {
      card.style.transform = `translateY(${offset}px)`;
    });
  });

  // Contact form status from query string
  const statusBox = document.getElementById("form-status");
  if (statusBox) {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "ok") {
      statusBox.textContent = "Bericht verstuurd. Peter neemt contact op.";
      statusBox.style.display = "inline-flex";
      statusBox.style.background = "rgba(34,197,94,0.15)";
      statusBox.style.borderColor = "rgba(34,197,94,0.4)";
      window.dataLayer.push({ event: "form_submit", form: "contact", status: "ok" });
    } else if (status === "fail") {
      statusBox.textContent = "Versturen mislukt. Probeer opnieuw of bel 0493 06 35 39.";
      statusBox.style.display = "inline-flex";
      statusBox.style.background = "rgba(239,68,68,0.15)";
      statusBox.style.borderColor = "rgba(239,68,68,0.4)";
    }
  }

  // Track tel/mail clicks for optional analytics
  const trackClicks = selector => {
    document.querySelectorAll(selector).forEach(link => {
      link.addEventListener("click", () => {
        const href = link.getAttribute("href") || "";
        const label = link.textContent.trim();
        window.dataLayer.push({ event: "contact_click", type: selector.startsWith("a[href^='tel']") ? "tel" : "email", href, label });
      });
    });
  };
  trackClicks("a[href^='tel:']");
  trackClicks("a[href^='mailto:']");
});

