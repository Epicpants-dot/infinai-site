const DEMO_URL = "#"; // Replace with your Telegram demo bot URL

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll(".js-demo-link").forEach((link) => {
    link.setAttribute("href", DEMO_URL);

    link.addEventListener("click", (event) => {
      if (!DEMO_URL || DEMO_URL === "#") {
        event.preventDefault();
        alert("Add your Telegram demo bot URL in script.js to enable this button.");
      }
    });
  });
});
