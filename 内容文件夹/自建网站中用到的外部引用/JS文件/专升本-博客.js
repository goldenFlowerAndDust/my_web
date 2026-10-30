(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector("body > header");
  const rootList = document.querySelector("body > ol");
  const sourceItem = rootList
    ? rootList.querySelector(":scope > li")
    : null;

  function initAiTutor() {
    const slot = document.querySelector("[data-ai-tutor]");
    if (!slot || document.querySelector(".ai-tutor-launch")) {
      return;
    }

    const source = slot.getAttribute("data-ai-src");
    if (!source) {
      return;
    }

    const title = slot.getAttribute("data-ai-title") || "AI 答疑";
    const kicker = slot.getAttribute("data-ai-kicker") || "AI TUTOR";
    const icon = slot.getAttribute("data-ai-icon") || "∑";
    const newTabLabel = slot.getAttribute("data-ai-newtab") || "新窗口打开";

    slot.hidden = true;

    const launch = document.createElement("button");
    launch.type = "button";
    launch.className = "ai-tutor-launch";
    launch.setAttribute("aria-haspopup", "dialog");
    launch.setAttribute("aria-controls", "ai-tutor-window");

    const launchIcon = document.createElement("span");
    launchIcon.className = "ai-tutor-launch-icon";
    launchIcon.setAttribute("aria-hidden", "true");
    launchIcon.textContent = icon;

    const launchLabel = document.createElement("strong");
    launchLabel.textContent = title;
    launch.append(launchIcon, launchLabel);

    const windowEl = document.createElement("div");
    windowEl.className = "ai-tutor-window";
    windowEl.id = "ai-tutor-window";
    windowEl.hidden = true;
    windowEl.innerHTML = `
      <div class="ai-tutor-backdrop" data-ai-tutor-close></div>
      <section class="ai-tutor-panel" role="dialog" aria-modal="true" aria-labelledby="ai-tutor-title">
        <div class="ai-tutor-head">
          <div class="ai-tutor-head-copy">
            <span class="ai-tutor-kicker"></span>
            <h2 id="ai-tutor-title"></h2>
          </div>
          <div class="ai-tutor-head-actions">
            <a class="ai-tutor-newtab" target="_blank" rel="noopener"></a>
            <button type="button" class="ai-tutor-close" aria-label="关闭 AI 答疑">×</button>
          </div>
        </div>
        <iframe class="ai-tutor-frame" title="" loading="lazy"></iframe>
      </section>
    `;

    windowEl.querySelector(".ai-tutor-kicker").textContent = kicker;
    windowEl.querySelector("#ai-tutor-title").textContent = title;
    const newTab = windowEl.querySelector(".ai-tutor-newtab");
    newTab.href = source;
    newTab.textContent = newTabLabel;
    const closeBtn = windowEl.querySelector(".ai-tutor-close");
    const frame = windowEl.querySelector(".ai-tutor-frame");
    frame.title = title;

    document.body.append(launch, windowEl);

    let loaded = false;
    let lastFocus = null;

    const openWindow = () => {
      if (!loaded) {
        frame.src = source;
        loaded = true;
      }
      lastFocus = document.activeElement;
      windowEl.hidden = false;
      document.body.classList.add("ai-tutor-open");
      closeBtn.focus();
    };

    const closeWindow = () => {
      windowEl.hidden = true;
      document.body.classList.remove("ai-tutor-open");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    };

    launch.addEventListener("click", openWindow);
    closeBtn.addEventListener("click", closeWindow);
    windowEl.querySelectorAll("[data-ai-tutor-close]").forEach((node) => {
      node.addEventListener("click", closeWindow);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !windowEl.hidden) {
        closeWindow();
      }
    });
  }

  initAiTutor();

  if (!header || !rootList || !sourceItem) {
    return;
  }

  body.classList.add("math-hub");

  const resourceLinks = Array.from(sourceItem.querySelectorAll("a"));
  const headingNodes = Array.from(
    sourceItem.querySelectorAll(":scope > h2"),
  );
  const typeItems = Array.from(
    sourceItem.querySelectorAll(".question-type-item"),
  );
  const typeCount = typeItems.length;
  const typeGroupCount = sourceItem.querySelectorAll(
    ".question-type-group",
  ).length;
  const moduleCount = Math.max(
    0,
    sourceItem.querySelectorAll("h3").length -
      typeCount -
      typeGroupCount,
  );

  const ambient = document.createElement("div");
  ambient.className = "ambient-bg";
  ambient.setAttribute("aria-hidden", "true");
  ambient.innerHTML = `
    <span class="ambient-orb one"></span>
    <span class="ambient-orb two"></span>
    <span class="ambient-orb three"></span>
    <span class="math-float" style="top:9%;left:5%">∫</span>
    <span class="math-float" style="top:18%;right:8%;animation-delay:-4s">∂</span>
    <span class="math-float" style="top:52%;left:2%;animation-delay:-8s">Σ</span>
    <span class="math-float" style="top:68%;right:4%;animation-delay:-11s">π</span>
    <span class="math-float" style="top:82%;left:10%;animation-delay:-6s">∞</span>
  `;
  body.prepend(ambient);

  const shell = document.createElement("div");
  shell.className = "page-shell";
  body.insertBefore(shell, header);
  shell.appendChild(header);
  shell.appendChild(rootList);

  const titleText = header.textContent.trim() || "数学目录";
  header.textContent = "";
  header.className = "site-hero";
  header.setAttribute("aria-labelledby", "page-title");

  const heroContent = document.createElement("div");
  heroContent.className = "hero-content";

  const heroCopy = document.createElement("div");
  heroCopy.className = "hero-copy";

  const eyebrow = document.createElement("span");
  eyebrow.className = "hero-eyebrow";
  eyebrow.textContent = "MATH · STUDY HUB";

  const title = document.createElement("h1");
  title.id = "page-title";
  title.textContent = titleText;

  const description = document.createElement("p");
  description.textContent =
    "从基础知识到高等数学，把章节、题型、笔记与复习资料整理成一张清晰的学习地图。";

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

  const stats = [
    makeStat(headingNodes.length, "内容分区"),
    makeStat(moduleCount, "知识模块"),
  ];
  if (typeCount) {
    stats.push(makeStat(typeCount, "题型数量"));
  }
  stats.push(
    makeStat(
      resourceLinks.length +
        (typeCount ? typeCount * 3 + typeGroupCount * 3 : 0),
      "资料入口",
    ),
  );
  heroStats.append(...stats);

  const signature = document.createElement("span");
  signature.className = "hero-signature";
  signature.textContent = "LOCAL STUDY ARCHIVE";

  heroFooter.append(heroStats, signature);
  heroContent.append(heroCopy, heroFooter);
  header.appendChild(heroContent);

  const tools = document.createElement("section");
  tools.className = "sticky-tools";
  tools.setAttribute("aria-label", "搜索与快速导航");

  const toolbarMain = document.createElement("div");
  toolbarMain.className = "toolbar-main";

  const searchBox = document.createElement("label");
  searchBox.className = "search-box";

  const searchIcon = document.createElement("span");
  searchIcon.className = "search-icon";
  searchIcon.setAttribute("aria-hidden", "true");
  searchIcon.textContent = "⌕";

  const searchInput = document.createElement("input");
  searchInput.id = "resource-search";
  searchInput.type = "search";
  searchInput.autocomplete = "off";
  searchInput.placeholder = "搜索章节、题型、资料或关键词…";
  searchInput.setAttribute("aria-label", "搜索章节和资料");

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
  toolbarMain.append(searchBox, themeButton);

  const sectionNav = document.createElement("nav");
  sectionNav.className = "section-nav";
  sectionNav.setAttribute("aria-label", "学习分区快速导航");

  tools.append(toolbarMain, sectionNav);
  shell.appendChild(tools);

  const categories = document.createElement("div");
  categories.className = "categories";
  shell.appendChild(categories);

  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";
  const emptyTitle = document.createElement("strong");
  emptyTitle.textContent = "没有找到匹配内容";
  const emptyHint = document.createElement("span");
  emptyHint.textContent = "试试更短的关键词，或按 Esc 清空搜索。";
  emptyState.append(emptyTitle, emptyHint);
  shell.appendChild(emptyState);

  const configFor = (text) => {
    if (/题型/.test(text)) {
      return { icon: "◎", accent: "rose", wide: true };
    }
    if (/初高中/.test(text)) {
      return { icon: "∿", accent: "violet", wide: true };
    }
    if (/高等数学复习资料/.test(text)) {
      return { icon: "∂", accent: "amber", wide: true };
    }
    if (/基础知识/.test(text)) {
      return { icon: "∑", accent: "mint", wide: false };
    }
    if (/高数知识/.test(text)) {
      return { icon: "∫", accent: "blue", wide: false };
    }
    return { icon: "◇", accent: "rose", wide: false };
  };

  const makeTypeLink = (label, href, kind) => {
    const link = document.createElement("a");
    link.className = "type-link";
    link.dataset.kind = kind;
    link.href = href;
    if (kind === "pdf") {
      link.target = "_blank";
      link.rel = "noopener";
    }
    const text = document.createElement("span");
    text.textContent = label;
    const arrow = document.createElement("span");
    arrow.className = "type-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    link.append(text, arrow);
    return link;
  };

  // 题型模板：一个 [data-question-types] 标题下可以放多个
  // .question-type-group（极限、连续、导数……），每组一个 data-bank + ul。
  // 组内 li 使用 data-range|data-count|data-level|data-q|data-a，
  // 这里会统一生成题型卡片、深链、组统计和底部完整入口。
  const enhanceQuestionGroup = (group) => {
    const bank = (group.dataset.bank || "").replace(/\/+$/, "");
    const list = group.querySelector(".question-type-list");
    if (!list) {
      return 0;
    }
    const items = Array.from(
      list.querySelectorAll(":scope > li"),
    ).filter((item) => item.querySelector("h3"));
    const groupTitle = (
      group.querySelector(".type-group-title")?.textContent || ""
    ).trim();

    list.classList.add("module-list");
    items.forEach((item, index) => {
      item.classList.add("module-item", "question-type-item");
      item.dataset.index = String(index + 1).padStart(2, "0");

      const title = item.querySelector("h3");
      const desc = item.querySelector("p");
      const range = item.dataset.range || "";
      const count = item.dataset.count || "";
      const level = item.dataset.level || "";
      const qAnchor = item.dataset.q || "";
      const aAnchor = item.dataset.a || "";

      const meta = document.createElement("div");
      meta.className = "type-meta";

      const number = document.createElement("span");
      number.className = "type-index";
      number.textContent = String(index + 1).padStart(2, "0");

      const rangeEl = document.createElement("span");
      rangeEl.className = "type-range";
      rangeEl.textContent = range;

      const levelEl = document.createElement("span");
      levelEl.className = "type-level";
      levelEl.dataset.level = level;
      levelEl.textContent = level;

      const countEl = document.createElement("span");
      countEl.className = "type-count";
      countEl.textContent = count ? count + " 题" : "";

      meta.append(number, rangeEl, levelEl, countEl);
      item.insertBefore(meta, title);

      if (desc) {
        desc.classList.add("type-desc");
      }

      item.dataset.search = [
        "题型",
        "题库",
        groupTitle,
        title.textContent,
        desc ? desc.textContent : "",
        range,
        level,
        count,
      ]
        .join(" ")
        .toLocaleLowerCase("zh-CN");

      const links = document.createElement("div");
      links.className = "type-links";
      const questionHref =
        bank + "/极限题库-纯题目版.html" + (qAnchor ? "#" + qAnchor : "");
      const solutionHref =
        bank + "/极限题库-详细解析版.html" + (aAnchor ? "#" + aAnchor : "");
      const pdfHref = bank + "/极限题库-纯题目版-每题一页.pdf";

      links.append(
        makeTypeLink("题目版", questionHref, "question"),
        makeTypeLink("解析版", solutionHref, "solution"),
        makeTypeLink("PDF", pdfHref, "pdf"),
      );
      item.appendChild(links);
    });

    const total = items.reduce(
      (sum, item) => sum + Number(item.dataset.count || 0),
      0,
    );
    const metaEl = group.querySelector(".type-group-meta");
    if (metaEl) {
      metaEl.textContent = items.length + " 类 · " + total + " 题";
    }

    const footer = document.createElement("div");
    footer.className = "type-board-footer";

    const summary = document.createElement("span");
    summary.className = "type-summary";
    summary.textContent = "完整题库入口";

    const actions = document.createElement("div");
    actions.className = "type-actions";
    actions.append(
      makeTypeLink("全部题目", bank + "/极限题库-纯题目版.html", "ghost"),
      makeTypeLink("全部解析", bank + "/极限题库-详细解析版.html", "ghost"),
      makeTypeLink(
        "打印版 PDF",
        bank + "/极限题库-纯题目版-每题一页.pdf",
        "pdf",
      ),
    );
    footer.append(summary, actions);
    group.appendChild(footer);

    return items.length;
  };

  const sectionLinks = [];
  const sections = [];
  const children = Array.from(sourceItem.children);
  let activeHeading = null;
  let activeNodes = [];
  let sectionIndex = 0;

  const flushGroup = () => {
    if (!activeHeading) {
      return;
    }

    sectionIndex += 1;
    const headingText = activeHeading.textContent.trim();
    const config = configFor(headingText);
    const isQuestionTypes =
      activeHeading.hasAttribute("data-question-types");
    const section = document.createElement("section");
    const sectionId = `math-section-${sectionIndex}`;
    section.id = sectionId;
    section.className = `category-card${config.wide ? " is-wide" : ""}${
      isQuestionTypes ? " is-question-types" : ""
    }`;
    section.dataset.accent = config.accent;
    section.dataset.search = "";

    activeHeading.dataset.icon = config.icon;

    let typeGroups = [];

    if (isQuestionTypes) {
      const groupWrap = activeNodes.find(
        (node) =>
          node.classList &&
          node.classList.contains("question-type-groups"),
      );
      typeGroups = groupWrap
        ? Array.from(
            groupWrap.querySelectorAll(
              ":scope > .question-type-group",
            ),
          )
        : [];
    } else {
      const nestedList = activeNodes.find(
        (node) => node.tagName === "UL",
      );

      if (nestedList) {
        const moduleItems = Array.from(
          nestedList.querySelectorAll(":scope > li"),
        ).filter((item) => item.querySelector("h3"));

        if (moduleItems.length) {
          nestedList.classList.add("module-list");
          moduleItems.forEach((item, index) => {
            item.classList.add("module-item");
            item.dataset.index = String(index + 1).padStart(2, "0");
          });
          activeHeading.dataset.count = String(moduleItems.length);
        } else {
          nestedList.classList.add("link-list");
          activeHeading.dataset.count = String(
            nestedList.querySelectorAll("a").length,
          );
        }
      } else {
        activeHeading.dataset.count = "0";
      }
    }

    section.append(activeHeading);
    activeNodes.forEach((node) => section.appendChild(node));

    if (isQuestionTypes) {
      typeGroups.forEach((group, index) => {
        group.dataset.index = String(index + 1).padStart(2, "0");
        enhanceQuestionGroup(group);
      });
      activeHeading.dataset.count = String(typeGroups.length);
    }

    section.dataset.search = section.textContent.toLocaleLowerCase("zh-CN");

    categories.appendChild(section);
    sections.push(section);

    const navLink = document.createElement("a");
    navLink.href = `#${sectionId}`;
    navLink.textContent = headingText.replace(/——.*$/, "");
    navLink.dataset.section = sectionId;
    sectionNav.appendChild(navLink);
    sectionLinks.push(navLink);

    activeHeading = null;
    activeNodes = [];
  };

  children.forEach((node) => {
    if (node.tagName === "H2") {
      flushGroup();
      activeHeading = node;
    } else if (activeHeading) {
      activeNodes.push(node);
    }
  });
  flushGroup();

  rootList.remove();

  const footer = document.createElement("footer");
  footer.className = "page-footer";
  const footerLeft = document.createElement("span");
  footerLeft.textContent = "专升本 · 数学 / LOCAL STUDY INDEX";
  const footerRight = document.createElement("span");
  footerRight.textContent = "KNOWLEDGE MAP · 2026";
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

  const savedTheme = storageGet("math-index-theme");
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
    storageSet("math-index-theme", next);
    updateTheme();
  });

  const filterResources = (rawQuery) => {
    const query = rawQuery.trim().toLocaleLowerCase("zh-CN");
    let visibleSections = 0;

    sections.forEach((section) => {
      const moduleItems = Array.from(
        section.querySelectorAll(".module-item"),
      );
      const simpleItems = Array.from(
        section.querySelectorAll(".link-list > li"),
      );
      const filterable = moduleItems.length ? moduleItems : simpleItems;
      let visible = 0;

      filterable.forEach((item) => {
        const match =
          !query ||
          (item.dataset.search || item.textContent)
            .toLocaleLowerCase("zh-CN")
            .includes(query);
        item.classList.toggle("is-hidden", !match);
        if (match) {
          visible += 1;
        }
      });

      section.querySelectorAll(".question-type-group").forEach((group) => {
        const items = Array.from(
          group.querySelectorAll(".question-type-item"),
        );
        const groupVisible = items.some(
          (item) => !item.classList.contains("is-hidden"),
        );
        group.classList.toggle("is-hidden", !groupVisible);
      });

      const show = !query || visible > 0;
      section.classList.toggle("is-hidden", !show);
      if (show) {
        visibleSections += 1;
      }
    });

    emptyState.classList.toggle("is-visible", visibleSections === 0);
  };

  searchInput.addEventListener("input", () => {
    filterResources(searchInput.value);
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      searchInput.value = "";
      filterResources("");
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
    backTop.classList.toggle("show", top > 420);
  };

  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", updateScroll);
  updateScroll();

  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    sections.forEach((section) => revealObserver.observe(section));

    const navObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );

        if (!visible.length) {
          return;
        }

        const id = visible[0].target.id;
        sectionLinks.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.dataset.section === id,
          );
        });
      },
      { rootMargin: "-18% 0px -70% 0px", threshold: [0, 1] },
    );
    sections.forEach((section) => navObserver.observe(section));
  } else {
    sections.forEach((section) => section.classList.add("is-visible"));
  }
})();
