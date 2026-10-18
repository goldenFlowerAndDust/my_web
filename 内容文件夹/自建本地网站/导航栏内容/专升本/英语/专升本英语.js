(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector("body > header");
  const rootList = document.querySelector("body > ol");

  if (!header || !rootList) {
    return;
  }

  const items = Array.from(rootList.querySelectorAll(":scope > li"));
  const links = Array.from(rootList.querySelectorAll("a"));

  const ambient = document.createElement("div");
  ambient.className = "ambient";
  ambient.setAttribute("aria-hidden", "true");
  ambient.innerHTML = `
    <span class="ambient-orb one"></span>
    <span class="ambient-orb two"></span>
    <span class="ambient-orb three"></span>
    <span class="float-letter" style="top:10%;left:4%">A</span>
    <span class="float-letter" style="top:22%;right:7%;animation-delay:-5s">a</span>
    <span class="float-letter" style="top:58%;left:2%;animation-delay:-9s">W</span>
    <span class="float-letter" style="top:78%;right:5%;animation-delay:-13s">E</span>
  `;
  body.prepend(ambient);

  const shell = document.createElement("div");
  shell.className = "page-shell";
  body.insertBefore(shell, header);
  shell.appendChild(header);
  shell.appendChild(rootList);

  const titleText = header.textContent.trim() || "英语目录";
  header.textContent = "";
  header.className = "site-hero";
  header.setAttribute("aria-labelledby", "page-title");

  const heroContent = document.createElement("div");
  heroContent.className = "hero-content";

  const heroCopy = document.createElement("div");
  heroCopy.className = "hero-copy";

  const eyebrow = document.createElement("span");
  eyebrow.className = "hero-eyebrow";
  eyebrow.textContent = "ENGLISH · STUDY HUB";

  const title = document.createElement("h1");
  title.id = "page-title";
  title.textContent = titleText;

  const description = document.createElement("p");
  description.textContent =
    "从词汇与构词到语法体系和每日复习，把英语学习内容整理成清晰、可执行的入口。";

  heroCopy.append(eyebrow, title, description);

  const heroFooter = document.createElement("div");
  heroFooter.className = "hero-footer";

  const heroStats = document.createElement("div");
  heroStats.className = "hero-stats";
  heroStats.setAttribute("aria-label", "内容统计");

  const makeStat = (value, label) => {
    const item = document.createElement("div");
    item.className = "hero-stat";
    const strong = document.createElement("strong");
    strong.textContent = String(value);
    const span = document.createElement("span");
    span.textContent = label;
    item.append(strong, span);
    return item;
  };

  heroStats.append(
    makeStat(links.length, "学习入口"),
    makeStat(4, "知识专题"),
    makeStat(1, "复习清单"),
  );

  const signature = document.createElement("span");
  signature.className = "hero-signature";
  signature.textContent = "VOCABULARY · GRAMMAR · REVIEW";

  heroFooter.append(heroStats, signature);
  heroContent.append(heroCopy, heroFooter);
  header.appendChild(heroContent);

  const tools = document.createElement("section");
  tools.className = "sticky-tools";
  tools.setAttribute("aria-label", "搜索学习资料");

  const searchBox = document.createElement("label");
  searchBox.className = "search-box";

  const searchIcon = document.createElement("span");
  searchIcon.className = "search-icon";
  searchIcon.setAttribute("aria-hidden", "true");
  searchIcon.textContent = "⌕";

  const searchInput = document.createElement("input");
  searchInput.id = "english-search";
  searchInput.type = "search";
  searchInput.autocomplete = "off";
  searchInput.placeholder = "搜索单词、构词、语法或复习资料…";
  searchInput.setAttribute("aria-label", "搜索英语学习资料");

  const shortcut = document.createElement("kbd");
  shortcut.textContent = "/";

  searchBox.append(searchIcon, searchInput, shortcut);

  const themeButton = document.createElement("button");
  themeButton.className = "theme-toggle";
  themeButton.type = "button";
  themeButton.setAttribute("aria-label", "切换深色模式");

  const themeIcon = document.createElement("span");
  themeIcon.className = "theme-icon";
  themeIcon.setAttribute("aria-hidden", "true");

  const themeLabel = document.createElement("span");
  themeLabel.className = "theme-label";

  themeButton.append(themeIcon, themeLabel);
  tools.append(searchBox, themeButton);
  shell.appendChild(tools);

  const grid = document.createElement("div");
  grid.className = "resource-grid";
  shell.appendChild(grid);

  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";
  const emptyTitle = document.createElement("strong");
  emptyTitle.textContent = "没有找到匹配内容";
  const emptyHint = document.createElement("span");
  emptyHint.textContent = "试试更短的关键词，或按 Esc 清空搜索。";
  emptyState.append(emptyTitle, emptyHint);
  shell.appendChild(emptyState);

  const iconFor = (text) => {
    if (/单词/.test(text)) return "Aa";
    if (/构词/.test(text)) return "✦";
    if (/汇总/.test(text)) return "◷";
    if (/语法/.test(text)) return "§";
    if (/复习/.test(text)) return "✓";
    return "→";
  };

  const cards = [];

  items.forEach((item, index) => {
    const link = item.querySelector("a");
    if (!link) {
      return;
    }

    const card = document.createElement("article");
    card.className = "resource-card";
    card.dataset.index = String(index + 1).padStart(2, "0");

    link.classList.add("resource-link");
    const linkText = link.textContent.trim();
    link.textContent = "";

    const icon = document.createElement("span");
    icon.className = "resource-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = iconFor(linkText);

    const title = document.createElement("span");
    title.className = "resource-title";
    title.textContent = linkText;

    link.append(icon, title);
    card.appendChild(link);
    grid.appendChild(card);
    cards.push(card);
  });

  rootList.remove();

  const footer = document.createElement("footer");
  footer.className = "page-footer";
  const footerLeft = document.createElement("span");
  footerLeft.textContent = "专升本 · 英语 / LOCAL STUDY INDEX";
  const footerRight = document.createElement("span");
  footerRight.textContent = "VOCABULARY · GRAMMAR · REVIEW";
  footer.append(footerLeft, footerRight);
  shell.appendChild(footer);

  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  const progressBar = document.createElement("span");
  progress.appendChild(progressBar);
  body.appendChild(progress);

  const backTop = document.createElement("button");
  backTop.className = "back-to-top";
  backTop.type = "button";
  backTop.setAttribute("aria-label", "返回顶部");
  backTop.textContent = "↑";
  body.appendChild(backTop);

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

  const filterCards = (rawQuery) => {
    const query = rawQuery.trim().toLocaleLowerCase("zh-CN");
    let visible = 0;

    cards.forEach((card) => {
      const match =
        !query ||
        card.textContent
          .toLocaleLowerCase("zh-CN")
          .includes(query);
      card.classList.toggle("is-hidden", !match);
      if (match) {
        visible += 1;
      }
    });

    emptyState.classList.toggle("is-visible", visible === 0);
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
  updateScroll();

  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
