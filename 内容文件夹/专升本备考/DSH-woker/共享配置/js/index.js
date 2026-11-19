/* ==========================================================================
   DSH-woker · 目录页脚本
   读取 window.DSH_DOCS，渲染分组卡片、分类筛选、全文搜索
   ========================================================================== */
(() => {
  "use strict";

  const DATA = window.DSH_INDEX || window.DSH_DOCS;
  if (!DATA || !Array.isArray(DATA.docs)) {
    const empty = document.getElementById("empty");
    if (empty) {
      empty.classList.add("is-visible");
      empty.querySelector("strong").textContent = "清单还没生成";
      empty.querySelector("span").textContent =
        "在 DSH-woker/共享配置/tools 下双击「构建笔记.bat」，或运行 node build.mjs。";
    }
    return;
  }

  const root = document.documentElement;
  const groupsEl = document.getElementById("groups");
  const chipsEl = document.getElementById("chips");
  const searchEl = document.getElementById("q");
  const emptyEl = document.getElementById("empty");
  const themeBtn = document.getElementById("theme");
  const backTop = document.querySelector(".back-top");

  /* ---------- 主题 ---------- */
  const store = {
    get(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* file:// 下可能被禁用 */ }
    },
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeBtn) {
      themeBtn.textContent = theme === "dark" ? "☀" : "☾";
      themeBtn.setAttribute("aria-label", theme === "dark" ? "切换到浅色模式" : "切换到深色模式");
      themeBtn.setAttribute("aria-pressed", String(theme === "dark"));
    }
  };

  const savedTheme = store.get("dsh-notes-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      store.set("dsh-notes-theme", next);
    });
  }

  /* ---------- 统计 ---------- */
  const chars = DATA.docs.reduce((sum, doc) => sum + (doc.chars || 0), 0);
  const categories = [];
  DATA.docs.forEach((doc) => {
    const name = doc.category || "未分类";
    if (!categories.includes(name)) categories.push(name);
  });

  const statsEl = document.getElementById("hero-stats");
  if (statsEl) {
    const items = [
      [String(DATA.docs.length), "篇笔记"],
      [String(categories.length), "个分类"],
      [chars >= 10000 ? (chars / 10000).toFixed(1) + " 万" : String(chars), "总字数"],
      [DATA.generatedAt || "—", "最近构建"],
    ];
    statsEl.innerHTML = items
      .map(([value, label]) => `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`)
      .join("");
  }

  const heroTitle = document.getElementById("hero-title");
  if (heroTitle && DATA.subjectName) heroTitle.textContent = DATA.subjectName;
  const heroDesc = document.getElementById("hero-desc");
  if (heroDesc && DATA.description) heroDesc.textContent = DATA.description;

  /* ---------- 分组渲染 ---------- */
  const makeCard = (doc) => {
    const card = document.createElement("a");
    card.className = "card";
    card.href = "view.html#doc=" + encodeURIComponent(doc.slug);
    card.dataset.search = [doc.title, doc.category, doc.summary, doc.slug]
      .join(" ")
      .toLocaleLowerCase("zh-CN");

    const words = doc.chars ? doc.chars + " 字" : "";
    // doc.append：可选的“追加记录”行（答疑归档跨天追问时由构建脚本写入）
    const appendLine = doc.append
      ? `<span class="card-append">↳ ${doc.append}</span>`
      : "";
    card.innerHTML = `
      <span class="card-tag">${doc.category || "未分类"}</span>
      <h3>${doc.title}</h3>
      <p>${doc.summary || "（暂无摘要）"}</p>
      ${appendLine}
      <span class="card-meta">
        <span>${words}</span>
        <span>${doc.updated || ""}</span>
      </span>`;
    return card;
  };

  const groupMap = new Map();
  DATA.docs.forEach((doc) => {
    const name = doc.category || "未分类";
    if (!groupMap.has(name)) groupMap.set(name, []);
    groupMap.get(name).push(doc);
  });

  const groupNodes = [];
  groupMap.forEach((docs, name) => {
    const section = document.createElement("section");
    section.className = "group";
    section.dataset.category = name;

    const head = document.createElement("div");
    head.className = "group-head";
    head.innerHTML = `<h2>${name}</h2><span class="group-count">${docs.length} 篇</span><span class="group-line"></span>`;

    const grid = document.createElement("div");
    grid.className = "grid";
    docs.forEach((doc) => grid.appendChild(makeCard(doc)));

    section.append(head, grid);
    groupsEl.appendChild(section);
    groupNodes.push(section);
  });

  /* ---------- 分类筛选 ---------- */
  let activeCategory = "全部";

  const applyFilter = () => {
    const query = (searchEl ? searchEl.value : "").trim().toLocaleLowerCase("zh-CN");
    let visible = 0;

    groupNodes.forEach((section) => {
      const inCategory = activeCategory === "全部" || section.dataset.category === activeCategory;
      let sectionVisible = 0;

      section.querySelectorAll(".card").forEach((card) => {
        const match = inCategory && (!query || card.dataset.search.includes(query));
        card.classList.toggle("is-hidden", !match);
        if (match) sectionVisible += 1;
      });

      section.classList.toggle("is-hidden", sectionVisible === 0);
      visible += sectionVisible;
    });

    if (emptyEl) emptyEl.classList.toggle("is-visible", visible === 0);
  };

  if (chipsEl) {
    const names = ["全部", ...categories];
    names.forEach((name, index) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = name;
      chip.setAttribute("aria-pressed", String(index === 0));
      chip.addEventListener("click", () => {
        activeCategory = name;
        chipsEl.querySelectorAll(".chip").forEach((node) => {
          node.setAttribute("aria-pressed", String(node === chip));
        });
        applyFilter();
      });
      chipsEl.appendChild(chip);
    });
  }

  if (searchEl) {
    searchEl.addEventListener("input", applyFilter);
    searchEl.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        searchEl.value = "";
        applyFilter();
        searchEl.blur();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      (target && target.isContentEditable);
    if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
      if (searchEl) {
        searchEl.focus();
        searchEl.select();
      }
    }
  });

  applyFilter();

  /* ---------- 回到顶部 ---------- */
  if (backTop) {
    const onScroll = () => backTop.classList.toggle("show", window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    onScroll();
  }
})();
