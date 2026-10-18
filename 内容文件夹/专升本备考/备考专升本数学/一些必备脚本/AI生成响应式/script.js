(() => {
  if (window.__derivativeResponsiveLoaded) return;
  window.__derivativeResponsiveLoaded = true;

  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const progressBar = document.getElementById("progress-bar");
  const sidebar = document.querySelector(".sidebar");

  const savedTheme = (() => {
    try {
      return localStorage.getItem("derivative-theme");
    } catch (error) {
      return null;
    }
  })();

  if (savedTheme) {
    root.dataset.theme = savedTheme;
  } else if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    root.dataset.theme = "dark";
  }

  const updateThemeButton = () => {
    if (!themeToggle) return;
    const dark = root.dataset.theme === "dark";
    themeToggle.textContent = dark ? "浅色模式" : "深色模式";
    themeToggle.setAttribute("aria-pressed", String(dark));
  };

  const toggleTheme = () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("derivative-theme", next);
    } catch (error) {
      // localStorage may be unavailable in file:// contexts.
    }
    updateThemeButton();
  };

  updateThemeButton();

  // Capture phase prevents a duplicate inline theme-handler from toggling twice.
  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest("#theme-toggle");
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleTheme();
    },
    true,
  );

  const updateProgress = () => {
    if (!progressBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight - window.innerHeight;
    const ratio = height > 0 ? scrollTop / height : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  let backToTop = document.getElementById("back-to-top");
  if (!backToTop) {
    backToTop = document.createElement("button");
    backToTop.id = "back-to-top";
    backToTop.type = "button";
    backToTop.setAttribute("aria-label", "返回顶部");
    backToTop.textContent = "↑";
    document.body.appendChild(backToTop);
  }

  const updateBackToTop = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    backToTop.classList.toggle("show", scrollTop > 300);
  };

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  let overlay = document.getElementById("overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.id = "overlay";
    document.body.appendChild(overlay);
  }

  let menuToggle = document.getElementById("menu-toggle");
  if (!menuToggle) {
    menuToggle = document.createElement("button");
    menuToggle.className = "menu-toggle";
    menuToggle.id = "menu-toggle";
    menuToggle.type = "button";
    menuToggle.setAttribute("aria-label", "打开目录");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
    document.body.appendChild(menuToggle);
  }

  const openDrawer = () => {
    if (!sidebar) return;
    sidebar.classList.add("open");
    overlay.classList.add("open");
    document.body.classList.add("drawer-open");
    menuToggle.setAttribute("aria-expanded", "true");
  };

  const closeDrawer = () => {
    if (!sidebar) return;
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
    document.body.classList.remove("drawer-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    if (sidebar && sidebar.classList.contains("open")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  overlay.addEventListener("click", closeDrawer);

  if (sidebar) {
    sidebar.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", closeDrawer);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });
})();
