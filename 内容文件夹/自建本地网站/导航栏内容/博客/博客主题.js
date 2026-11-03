(() => {
  "use strict";
  const root = document.documentElement;
  const KEY = "programmingTutor.theme";
  const buttons = () => document.querySelectorAll("[data-theme-toggle]");

  function apply(theme) {
    const next = theme === "light" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch (error) { /* ignore */ }
    buttons().forEach((button) => {
      button.textContent = next === "dark" ? "☀️ 亮色" : "🌙 暗色";
      button.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
      button.setAttribute("aria-label", next === "dark" ? "切换到亮色主题" : "切换到暗色主题");
    });
  }

  function init() {
    let theme = root.dataset.theme;
    if (!theme) {
      try { theme = localStorage.getItem(KEY); } catch (error) { theme = ""; }
    }
    apply(theme || "dark");
    buttons().forEach((button) => {
      button.addEventListener("click", () => {
        apply(root.dataset.theme === "dark" ? "light" : "dark");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
