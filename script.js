document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const siteNav = document.getElementById("siteNav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.querySelectorAll(".js-open-buddy").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const launcher = document.getElementById("infinai-launcher");
      if (launcher) launcher.click();
    });
  });
});
