(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const searchInput = document.getElementById("english-search");
  const themeButton = document.querySelector(".theme-toggle");
  const themeIcon = document.querySelector(".theme-icon");
  const themeLabel = document.querySelector(".theme-label");
  const cards = Array.from(document.querySelectorAll(".resource-card"));
  const sections = Array.from(document.querySelectorAll(".hub-section"));
  const emptyState = document.querySelector(".empty-state");
  const progressBar = document.querySelector(".scroll-progress span");
  const backTop = document.querySelector(".back-to-top");
  const statResources = document.getElementById("stat-resources");
  const statSections = document.getElementById("stat-sections");

  if (!searchInput || !themeButton || !emptyState) return;

  const storageGet = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const storageSet = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // file:// 下部分浏览器会禁用本地存储。
    }
  };

  const savedTheme = storageGet("english-index-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    root.dataset.theme = savedTheme;
  } else if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    root.dataset.theme = "dark";
  }

  const updateTheme = () => {
    const dark = root.dataset.theme === "dark";
    themeIcon.textContent = dark ? "☀" : "☾";
    themeLabel.textContent = dark ? "浅色模式" : "深色模式";
    themeButton.setAttribute("aria-pressed", String(dark));
    themeButton.setAttribute(
      "aria-label",
      dark ? "切换到浅色模式" : "切换到深色模式",
    );
  };
  updateTheme();

  themeButton.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    storageSet("english-index-theme", next);
    updateTheme();
  });

  const updateStats = () => {
    if (statResources) statResources.textContent = String(cards.length);
    if (statSections) statSections.textContent = String(sections.length);
  };

  const updateSectionCounts = () => {
    sections.forEach((section) => {
      const count = section.querySelectorAll(".resource-card:not(.is-hidden)").length;
      const countEl = section.querySelector(".section-count");
      if (countEl) countEl.textContent = count + " 个入口";
    });
  };

  const filterCards = (rawQuery) => {
    const query = rawQuery.trim().toLocaleLowerCase("zh-CN");
    let visible = 0;

    sections.forEach((section) => {
      let sectionVisible = 0;
      Array.from(section.querySelectorAll(".resource-card")).forEach((card) => {
        const match =
          !query ||
          card.textContent.toLocaleLowerCase("zh-CN").includes(query);
        card.classList.toggle("is-hidden", !match);
        if (match) {
          sectionVisible += 1;
          visible += 1;
        }
      });
      section.classList.toggle("is-hidden", sectionVisible === 0);
    });

    emptyState.classList.toggle("is-visible", visible === 0);
    updateSectionCounts();
  };

  searchInput.addEventListener("input", () => {
    filterCards(searchInput.value);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      searchInput.value = "";
      filterCards("");
      searchInput.blur();
    }
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable;

    if (
      event.key === "/" &&
      !typing &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  const updateScroll = () => {
    const top = window.scrollY || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight - window.innerHeight;
    const ratio = height > 0 ? top / height : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
    backTop.classList.toggle("show", top > 360);
  };

  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", updateScroll);

  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  updateStats();
  updateSectionCounts();
  updateScroll();
})();
