document.addEventListener("DOMContentLoaded", () => {
  window.dataLayer = window.dataLayer || [];

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
