/* ==========================================================================
   DSH-woker · 阅读页脚本
   索引（data.js，只有元数据）先加载；点到哪一篇，才去取哪一篇的正文（content/*.js）
   ========================================================================== */
(() => {
  "use strict";

  const INDEX = window.DSH_INDEX || window.DSH_DOCS;
  const root = document.documentElement;

  const docEl = document.getElementById("doc");
  const titleEl = document.getElementById("doc-title");
  const catEl = document.getElementById("doc-cat");
  const metaEl = document.getElementById("doc-meta");
  const tocEl = document.getElementById("toc");
  const tocPanel = document.getElementById("toc-panel");
  const tocToggle = document.getElementById("toc-toggle");
  const pagerEl = document.getElementById("pager");
  const barTitle = document.getElementById("bar-title");
  const progressBar = document.querySelector(".progress span");
  const backTop = document.querySelector(".back-top");

  const fail = (message) => {
    if (docEl) docEl.innerHTML = `<blockquote><p>${message}</p></blockquote>`;
    if (barTitle) barTitle.textContent = "笔记未找到";
  };

  if (!INDEX || !Array.isArray(INDEX.docs)) {
    fail("索引没加载成功：请确认本目录下的 data.js 存在，并重新运行一次构建脚本。");
    return;
  }
  if (!INDEX.docs.length) {
    fail("这个科目还没有笔记。把 .md 放进对应分类目录，运行一次构建脚本即可。");
    return;
  }

  /* ---------- 存储 ---------- */
  const store = {
    get(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    },
  };

  /* ---------- 主题 ---------- */
  const themeBtn = document.getElementById("theme");
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

  /* ---------- 字号 ---------- */
  const SIZES = ["s", "m", "l"];
  const fontBtn = document.getElementById("font");
  let sizeIndex = Math.max(0, SIZES.indexOf(store.get("dsh-notes-size") || "m"));
  const applySize = () => {
    root.dataset.size = SIZES[sizeIndex];
    if (fontBtn) {
      fontBtn.textContent = "A" + SIZES[sizeIndex].toUpperCase();
      fontBtn.setAttribute("aria-label", "切换正文字号，当前 " + ["小", "中", "大"][sizeIndex]);
    }
  };
  applySize();
  if (fontBtn) {
    fontBtn.addEventListener("click", () => {
      sizeIndex = (sizeIndex + 1) % SIZES.length;
      applySize();
      store.set("dsh-notes-size", SIZES[sizeIndex]);
    });
  }

  if (document.getElementById("print")) {
    document.getElementById("print").addEventListener("click", () => window.print());
  }

  /* ---------- 路由 ----------
     #doc=<slug> 表示“看哪一篇”；其余 hash 交给浏览器滚动，不重新渲染
  ---------------------------- */
  const DOC_PREFIX = "#doc=";
  const contentCache = new Map();
  let requestToken = 0;

  const slugFromHash = () => {
    const hash = window.location.hash;
    if (!hash.startsWith(DOC_PREFIX)) return "";
    const raw = hash.slice(DOC_PREFIX.length);
    if (!raw) return "";
    try { return decodeURIComponent(raw); } catch (e) { return raw; }
  };

  /* 按需取正文：动态插入 <script>，file:// 与 http 都可用 */
  const loadContent = (doc) => {
    if (contentCache.has(doc.slug)) return Promise.resolve(contentCache.get(doc.slug));

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = doc.file;
      script.async = true;
      script.onload = () => {
        const payload = window.__DSH_DOC;
        if (!payload || payload.slug !== doc.slug) {
          reject(new Error("正文与索引不匹配，请重新运行构建脚本。"));
          return;
        }
        contentCache.set(doc.slug, payload);
        try { delete window.__DSH_DOC; } catch (e) { window.__DSH_DOC = undefined; }
        resolve(payload);
      };
      script.onerror = () => reject(new Error("正文文件加载失败：" + doc.file));
      document.head.appendChild(script);
    });
  };

  /* ---------- 目录 ---------- */
  let observer = null;

  const buildToc = (toc) => {
    if (!tocEl) return;
    tocEl.innerHTML = "";
    const list = Array.isArray(toc) ? toc : [];

    if (list.length < 2) {
      if (tocPanel) tocPanel.hidden = true;
      if (tocToggle) tocToggle.hidden = true;
      return;
    }

    if (tocPanel) tocPanel.hidden = false;
    if (tocToggle) tocToggle.hidden = false;

    list.forEach((item) => {
      const link = document.createElement("a");
      link.href = "#" + item.id;
      link.textContent = item.text;
      link.dataset.target = item.id;
      if (item.level === 3) link.className = "lv3";
      tocEl.appendChild(link);
    });

    /* 标题里如果写了 $...$，目录里也渲染成公式，避免露出原始 LaTeX */
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(tocEl, {
          delimiters: [
            { left: "$$", right: "$$", display: false },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
        });
      } catch (error) {
        /* 忽略 */
      }
    }
  };

  const setupScrollSpy = () => {
    if (observer) observer.disconnect();
    if (!tocEl || !docEl) return;

    const links = Array.from(tocEl.querySelectorAll("a"));
    if (!links.length) return;
    if (!("IntersectionObserver" in window)) return;

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible.length) return;
        const id = visible[0].target.id;
        links.forEach((link) => link.classList.toggle("is-active", link.dataset.target === id));
      },
      { rootMargin: "-12% 0px -72% 0px", threshold: [0, 1] }
    );

    docEl.querySelectorAll("h2[id], h3[id]").forEach((heading) => observer.observe(heading));
  };

  /* ---------- 正文增强：公式与复制按钮 ---------- */
  const enhance = () => {
    if (!docEl) return;

    if (window.renderMathInElement && /\$/.test(docEl.innerHTML)) {
      try {
        window.renderMathInElement(docEl, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
          ],
          throwOnError: false,
        });
      } catch (error) {
        /* 公式出错不影响正文 */
      }
    }

    docEl.querySelectorAll("pre").forEach((pre) => {
      if (pre.querySelector(".copy-btn")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "icon-btn copy-btn";
      button.textContent = "复制";
      pre.style.position = "relative";
      pre.appendChild(button);
      button.addEventListener("click", () => {
        const text = pre.querySelector("code")?.textContent || pre.textContent;
        navigator.clipboard?.writeText(text).then(() => {
          button.textContent = "已复制";
          setTimeout(() => { button.textContent = "复制"; }, 1500);
        }).catch(() => {});
      });
    });
  };

  /* ---------- 翻页 ---------- */
  const buildPager = (index) => {
    if (!pagerEl) return;
    pagerEl.innerHTML = "";

    const prev = INDEX.docs[index - 1];
    const next = INDEX.docs[index + 1];

    if (prev) {
      const link = document.createElement("a");
      link.href = "view.html#doc=" + encodeURIComponent(prev.slug);
      link.innerHTML = `<small>← 上一篇</small><strong>${prev.title}</strong>`;
      pagerEl.appendChild(link);
    } else {
      pagerEl.insertAdjacentHTML("beforeend", '<span class="placeholder"></span>');
    }

    if (next) {
      const link = document.createElement("a");
      link.className = "next";
      link.href = "view.html#doc=" + encodeURIComponent(next.slug);
      link.innerHTML = `<small>下一篇 →</small><strong>${next.title}</strong>`;
      pagerEl.appendChild(link);
    } else {
      pagerEl.insertAdjacentHTML("beforeend", '<span class="placeholder"></span>');
    }
  };

  /* ---------- 渲染 ---------- */
  const render = (force = false) => {
    const hash = window.location.hash;
    if (!force && hash && !hash.startsWith(DOC_PREFIX)) return;

    const slug = slugFromHash();
    const index = INDEX.docs.findIndex((doc) => doc.slug === slug);
    const doc = index >= 0 ? INDEX.docs[index] : INDEX.docs[0];
    if (!doc) {
      fail("没有可显示的笔记。");
      return;
    }

    const token = ++requestToken;

    /* 头部立刻显示（元数据来自索引，不必等正文） */
    if (barTitle) barTitle.textContent = doc.title;
    if (titleEl) titleEl.textContent = doc.title;
    if (catEl) catEl.textContent = doc.category || "未分类";
    if (metaEl) {
      metaEl.innerHTML = [
        doc.updated ? `<span>更新 ${doc.updated}</span>` : "",
        doc.chars ? `<span>约 ${doc.chars} 字</span>` : "",
        `<span>${INDEX.subjectName || ""}</span>`,
      ]
        .filter(Boolean)
        .join("");
    }
    document.title = `${doc.title} · ${INDEX.subjectName || "笔记"}`;

    buildPager(index);

    if (!window.location.hash) {
      try {
        history.replaceState(null, "", DOC_PREFIX + encodeURIComponent(doc.slug));
      } catch (error) { /* file:// 下个别浏览器禁止改地址 */ }
    }

    /* 先给占位，避免白屏 */
    if (docEl) docEl.innerHTML = '<p class="doc-loading">正在加载正文…</p>';

    loadContent(doc)
      .then((payload) => {
        if (token !== requestToken) return;
        docEl.innerHTML = payload.html;
        buildToc(payload.toc);
        enhance();
        setupScrollSpy();
        if (tocPanel) tocPanel.classList.remove("is-open");
        window.scrollTo({ top: 0, behavior: "auto" });
      })
      .catch((error) => {
        if (token !== requestToken) return;
        docEl.innerHTML = `<blockquote><p>${error.message}</p></blockquote>`;
      });
  };

  /* ---------- 目录开关与页内跳转 ---------- */
  if (tocToggle && tocPanel) {
    tocToggle.addEventListener("click", () => {
      tocPanel.classList.toggle("is-open");
    });
  }

  if (tocEl) {
    tocEl.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;
      const id = (link.getAttribute("href") || "").replace(/^#/, "");
      const target = id ? document.getElementById(id) : null;
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        tocEl.querySelectorAll("a").forEach((item) => {
          item.classList.toggle("is-active", item === link);
        });
      }
      if (tocPanel && window.innerWidth <= 980) tocPanel.classList.remove("is-open");
    });
  }

  /* ---------- 进度与置顶 ---------- */
  const onScroll = () => {
    const top = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = Math.min(100, Math.max(0, height > 0 ? (top / height) * 100 : 0)) + "%";
    if (backTop) backTop.classList.toggle("show", top > 420);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  if (backTop) backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- 键盘 ---------- */
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      (target && target.isContentEditable);
    if (typing) return;

    if (event.key === "Escape") {
      if (tocPanel && tocPanel.classList.contains("is-open")) {
        tocPanel.classList.remove("is-open");
      } else {
        window.location.href = "index.html";
      }
    }
    if (event.key === "ArrowLeft") {
      const link = pagerEl?.querySelector("a:not(.next)");
      if (link && link.hash) {
        event.preventDefault();
        window.location.hash = link.hash;
      }
    }
    if (event.key === "ArrowRight") {
      const link = pagerEl?.querySelector("a.next");
      if (link && link.hash) {
        event.preventDefault();
        window.location.hash = link.hash;
      }
    }
  });

  /* ---------- 启动 ---------- */
  render(true);

  window.addEventListener("hashchange", () => {
    if (window.location.hash.startsWith(DOC_PREFIX)) render();
  });

  onScroll();
})();
