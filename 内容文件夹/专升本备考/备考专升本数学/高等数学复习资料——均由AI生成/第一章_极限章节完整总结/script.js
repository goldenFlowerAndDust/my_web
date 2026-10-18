(() => {
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const progressBar = document.getElementById("progress-bar");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuToggle = document.getElementById("menu-toggle");

  const savedTheme = (() => {
    try {
      return localStorage.getItem("math-theme");
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

  updateThemeButton();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem("math-theme", next);
      } catch (error) {
        // localStorage may be unavailable in some file:// environments.
      }
      updateThemeButton();
    });
  }

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

  const backToTop = document.createElement("button");
  backToTop.id = "back-to-top";
  backToTop.type = "button";
  backToTop.setAttribute("aria-label", "返回顶部");
  backToTop.textContent = "↑";
  document.body.appendChild(backToTop);

  const updateBackToTop = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    backToTop.classList.toggle("show", scrollTop > 300);
  };

  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const openDrawer = () => {
    if (!sidebar || !overlay || !menuToggle) return;
    sidebar.classList.add("open");
    overlay.classList.add("open");
    document.body.classList.add("drawer-open");
    menuToggle.setAttribute("aria-expanded", "true");
  };

  const closeDrawer = () => {
    if (!sidebar || !overlay || !menuToggle) return;
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
    document.body.classList.remove("drawer-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.addEventListener("click", () => {
      if (sidebar && sidebar.classList.contains("open")) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener("click", closeDrawer);
  }

  if (sidebar) {
    sidebar.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", closeDrawer);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer();
    }
  });
})();
