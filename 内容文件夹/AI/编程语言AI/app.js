(() => {
  "use strict";

  const LOCAL_API = "http://127.0.0.1:8769";
  const IS_LOCAL_PAGE = location.protocol === "file:" ||
    ((location.hostname === "127.0.0.1" || location.hostname === "localhost") && location.port === "8769");
  const CLOUD_URL_KEY = "programmingTutor.cloudUrl";
  const CLOUD_TOKEN_KEY = "programmingTutor.cloudToken";
  let cloudUrl = (localStorage.getItem(CLOUD_URL_KEY) || "").replace(/\/+$/, "");
  let cloudToken = localStorage.getItem(CLOUD_TOKEN_KEY) || "";
  const $ = (id) => document.getElementById(id);
  const languageSelect = $("languageSelect");
  const questionInput = $("question");
  const askBtn = $("askBtn");
  const statusEl = $("status");
  const answerEl = $("answer");
  const answerTime = $("answerTime");
  const historyList = $("historyList");
  const healthEl = $("health");
  const heroBadge = $("heroBadge");
  const languageMeta = $("languageMeta");
  const blogLinks = $("blogLinks");
  const themeToggle = $("themeToggle");
  const cloudUrlInput = $("cloudUrl");
  const cloudTokenInput = $("cloudToken");
  const cloudStatus = $("cloudStatus");
  let meta = null;
  let historyRecords = [];
  let busy = false;

  const FALLBACK_LANGUAGES = [
    { id: "python", name: "Python", blog: [["Python 博客", "../../自建本地网站/导航栏内容/博客/python博客.html"]] },
    { id: "javascript", name: "JavaScript", blog: [["JavaScript 博客", "../../自建本地网站/导航栏内容/博客/JavaScript博客.html"]] },
    { id: "web", name: "HTML + CSS", blog: [["HTML 博客", "../../自建本地网站/导航栏内容/博客/HTML博客.html"], ["CSS 博客", "../../自建本地网站/导航栏内容/博客/CSS博客.html"]] },
    { id: "mysql", name: "MySQL", blog: [["MySQL 博客", "../../自建本地网站/导航栏内容/博客/MySQL博客.html"]] },
    { id: "node", name: "Node.js", blog: [["Node.js 博客", "../../自建本地网站/导航栏内容/博客/Node.js博客.html"]] }
  ];

  const DESC = {
    python: "基础语法、数据结构、函数、面向对象、异常、文件和调试。",
    javascript: "作用域、DOM、事件、异步、Promise、浏览器与调试。",
    web: "HTML 语义化、CSS 选择器、Flex、Grid、响应式和可访问性。",
    mysql: "查询、连接、聚合、索引、事务和 MySQL 实践。",
    node: "模块、文件、HTTP、npm、Express 和异步。"
  };

  const PLACEHOLDER = {
    python: "例如：Python 的列表和元组有什么区别？\n也可以粘贴报错信息和相关代码。",
    javascript: "例如：let 和 var 的核心区别是什么？\n也可以粘贴浏览器报错和代码。",
    web: "例如：怎么用 Flex 实现水平垂直居中？\n也可以描述想要的布局。",
    mysql: "例如：LEFT JOIN 后为什么数据变少了？\n请把表结构和 SQL 一起贴上来。",
    node: "例如：Node.js 的 require 和 import 有什么区别？\n也可以粘贴服务端报错。"
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function codeBlockHtml(lang, code) {
    const label = lang ? escapeHtml(lang) : "code";
    return '<div class="code-block"><div class="code-head"><span>' + label +
      '</span><button type="button" class="copy-code">复制</button></div><pre><code>' +
      escapeHtml(code) + "</code></pre></div>";
  }

  function renderMarkdown(markdown) {
    const blocks = [];
    let text = String(markdown || "");
    text = text.replace(/```([A-Za-z0-9_+-]*)\n([\s\S]*?)```/g, (m, lang, code) => {
      const token = "@@CODEBLOCK_" + blocks.length + "@@";
      blocks.push(codeBlockHtml(lang, code.replace(/\n$/, "")));
      return "\n\n" + token + "\n\n";
    });
    text = escapeHtml(text);
    text = text.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
    const lines = text.split("\n");
    const out = [];
    let listType = "";
    let paragraph = [];

    function flushParagraph() {
      if (paragraph.length) {
        out.push("<p>" + paragraph.join("<br>") + "</p>");
        paragraph = [];
      }
    }
    function closeList() {
      if (listType) {
        out.push("</" + listType + ">");
        listType = "";
      }
    }

    for (const raw of lines) {
      const line = raw.trimEnd();
      const heading = line.match(/^(#{1,3})\s+(.*)$/);
      const unordered = line.match(/^\s*[-*]\s+(.*)$/);
      const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
      const codeToken = line.match(/^@@CODEBLOCK_\d+@@$/);
      if (codeToken) {
        flushParagraph(); closeList();
        out.push(line);
      } else if (heading) {
        flushParagraph(); closeList();
        const level = heading[1].length;
        out.push("<h" + level + ">" + heading[2] + "</h" + level + ">");
      } else if (unordered) {
        flushParagraph();
        if (listType !== "ul") { closeList(); out.push("<ul>"); listType = "ul"; }
        out.push("<li>" + unordered[1] + "</li>");
      } else if (ordered) {
        flushParagraph();
        if (listType !== "ol") { closeList(); out.push("<ol>"); listType = "ol"; }
        out.push("<li>" + ordered[1] + "</li>");
      } else if (!line.trim()) {
        flushParagraph(); closeList();
      } else {
        closeList();
        paragraph.push(line);
      }
    }
    flushParagraph(); closeList();
    let html = out.join("\n");
    blocks.forEach((block, index) => {
      html = html.replace("@@CODEBLOCK_" + index + "@@", block);
    });
    return html;
  }

  function setStatus(message, kind) {
    statusEl.textContent = message || "";
    statusEl.className = "status" + (kind ? " " + kind : "");
  }

  function applyTheme(theme) {
    const next = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("programmingTutor.theme", next);
    if (themeToggle) {
      themeToggle.textContent = next === "dark" ? "☀️ 亮色" : "🌙 暗色";
      themeToggle.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
    }
  }

  async function fetchJson(url, options) {
    const base = IS_LOCAL_PAGE ? LOCAL_API : cloudUrl;
    if (!base) {
      throw new Error("还没有配置云端地址，请展开左侧“云端连接设置”。");
    }
    const headers = Object.assign({}, (options && options.headers) || {});
    if (!IS_LOCAL_PAGE && cloudToken) headers["X-Tutor-Token"] = cloudToken;
    const response = await fetch(base + url, Object.assign({}, options, { headers }));
    let data = null;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error(IS_LOCAL_PAGE
        ? "服务返回的不是 JSON，请确认 8769 服务已启动。"
        : "云端返回的不是 JSON，请检查 Worker 地址和令牌。");
    }
    if (!response.ok || !data.ok) {
      throw new Error((data && data.error) || ("HTTP " + response.status));
    }
    return data;
  }

  function apiPath(localPath, cloudPath) {
    return IS_LOCAL_PAGE ? localPath : cloudPath;
  }

  function currentLanguage() {
    return languageSelect.value || "python";
  }

  function updateLanguageUi() {
    const language = currentLanguage();
    if (!meta) return;
    const item = meta.languages.find((row) => row.id === language);
    if (!item) return;
    heroBadge.textContent = item.name;
    questionInput.placeholder = PLACEHOLDER[language] || "输入你的编程问题…";
    const links = (item.blog || []).map(([label, href]) =>
      '<a href="' + escapeHtml(href) + '">' + escapeHtml(label) + "</a>"
    ).join(" · ");
    languageMeta.innerHTML = '<p><strong>' + escapeHtml(item.name) + "</strong></p>" +
      "<p>" + escapeHtml(DESC[language] || "") + "</p>" +
      (links ? "<p>" + links + "</p>" : "");
    if (blogLinks) {
      blogLinks.innerHTML = '<a href="../../自建本地网站/导航栏内容/博客/HTML博客.html">← 返回博客</a>' +
        (item.blog || []).map(([label, href]) =>
          '<a href="' + escapeHtml(href) + '">' + escapeHtml(label) + "</a>"
        ).join("");
    }
    localStorage.setItem("programmingTutor.language", language);
    loadHistory();
  }

  async function loadMeta() {
    try {
      const data = IS_LOCAL_PAGE
        ? await fetchJson("/api/meta")
        : { languages: FALLBACK_LANGUAGES };
      meta = data;
      languageSelect.innerHTML = data.languages.map((item) =>
        '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + "</option>"
      ).join("");
      const queryLang = new URLSearchParams(location.search).get("lang");
      const saved = localStorage.getItem("programmingTutor.language");
      const available = data.languages.map((row) => row.id);
      const initial = [queryLang, saved, "python"].find((id) => available.includes(id)) || available[0];
      languageSelect.value = initial;
      updateLanguageUi();
      await checkHealth();
    } catch (error) {
      meta = { languages: FALLBACK_LANGUAGES };
      languageSelect.innerHTML = FALLBACK_LANGUAGES.map((item) =>
        '<option value="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + "</option>"
      ).join("");
      languageSelect.value = new URLSearchParams(location.search).get("lang") || "python";
      updateLanguageUi();
      healthEl.textContent = IS_LOCAL_PAGE ? "本地服务未连接（8769）" : "云端未连接";
      healthEl.className = "health bad";
      setStatus(error.message, "error");
    }
  }

  async function checkHealth() {
    if (!IS_LOCAL_PAGE) {
      updateCloudStatus();
      return;
    }
    try {
      const data = await fetchJson("/api/health");
      healthEl.textContent = "本地服务 8769 · " + (data.api_key ? "API 已配置" : "缺少 API Key");
      healthEl.className = "health " + (data.api_key ? "ok" : "bad");
    } catch (error) {
      healthEl.textContent = "本地服务未连接（8769）";
      healthEl.className = "health bad";
    }
  }

  function updateCloudStatus() {
    if (IS_LOCAL_PAGE) {
      healthEl.textContent = "本地模式 8769";
      healthEl.className = "health ok";
      if (cloudStatus) cloudStatus.textContent = "当前页面走本地服务，云端设置仅用于 GitHub Pages。";
      return;
    }
    if (cloudUrl && cloudToken) {
      healthEl.textContent = "云端模式 · 已配置";
      healthEl.className = "health ok";
      if (cloudStatus) {
        cloudStatus.textContent = "已配置云端。保存后如不生效，刷新页面。";
        cloudStatus.className = "cloud-status ok";
      }
    } else {
      healthEl.textContent = "云端未配置";
      healthEl.className = "health bad";
      if (cloudStatus) {
        cloudStatus.textContent = "请填写 Worker 地址和访问令牌。";
        cloudStatus.className = "cloud-status bad";
      }
    }
  }

  async function loadHistory() {
    historyList.innerHTML = '<p class="history-empty">加载历史…</p>';
    try {
      const path = apiPath(
        "/api/history?language=" + encodeURIComponent(currentLanguage()) + "&limit=30",
        "/api/code-log?language=" + encodeURIComponent(currentLanguage())
      );
      const data = await fetchJson(path);
      historyRecords = data.records || data.entries || [];
      if (!historyRecords.length) {
        historyList.innerHTML = '<p class="history-empty">这个语言还没有历史记录。</p>';
        return;
      }
      const groups = new Map();
      historyRecords.forEach((item, index) => {
        const day = item.date || String(item.time || "").slice(0, 10) || "未知日期";
        if (!groups.has(day)) groups.set(day, []);
        groups.get(day).push({ item, index });
      });
      historyList.innerHTML = Array.from(groups.entries()).map(([day, rows]) =>
        '<section class="history-day"><h3>' + escapeHtml(day) + "</h3>" +
        rows.map(({ item, index }) =>
          '<article class="history-item"><p class="history-question">' + escapeHtml(item.question) + "</p>" +
          '<div class="history-meta">' + escapeHtml(item.time || "") + " · " + escapeHtml(item.language_name || "") +
          ' <button type="button" class="copy-code view-history" data-index="' + index + '">查看</button></div></article>'
        ).join("") + "</section>"
      ).join("");
    } catch (error) {
      historyList.innerHTML = '<p class="history-empty">历史加载失败：' + escapeHtml(error.message) + "</p>";
    }
  }

  async function ask() {
    if (busy) return;
    const question = questionInput.value.trim();
    if (!question) {
      setStatus("请先输入问题。", "error");
      questionInput.focus();
      return;
    }
    busy = true;
    askBtn.disabled = true;
    setStatus("正在请求 AI…", "");
    answerEl.innerHTML = '<div class="empty-state"><strong>生成中</strong><p>请稍等，代码题可能需要更久。</p></div>';
    answerTime.textContent = "";
    try {
      const path = apiPath("/api/ask", "/api/code");
      const data = await fetchJson(path, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ language: currentLanguage(), question: question })
      });
      answerEl.innerHTML = renderMarkdown(data.answer || "");
      answerTime.textContent = (data.language_name || "") + " · " + (data.time || "");
      setStatus("回答完成。", "ok");
      await loadHistory();
      answerEl.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      answerEl.innerHTML = '<div class="empty-state"><strong>请求失败</strong><p>' +
        escapeHtml(error.message) + "</p></div>";
      setStatus(error.message, "error");
    } finally {
      busy = false;
      askBtn.disabled = false;
    }
  }

  languageSelect.addEventListener("change", () => {
    updateLanguageUi();
    answerEl.innerHTML = '<div class="empty-state"><strong>等待提问</strong><p>已切换到新的语言，可以继续提问。</p></div>';
    answerTime.textContent = "";
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
  }
  applyTheme(document.documentElement.dataset.theme || localStorage.getItem("programmingTutor.theme") || "dark");

  if (cloudUrlInput) cloudUrlInput.value = cloudUrl;
  if (cloudTokenInput) cloudTokenInput.value = cloudToken;
  updateCloudStatus();

  const saveCloudBtn = $("saveCloud");
  const clearCloudBtn = $("clearCloud");
  if (saveCloudBtn) {
    saveCloudBtn.addEventListener("click", () => {
      cloudUrl = (cloudUrlInput ? cloudUrlInput.value.trim() : "").replace(/\/+$/, "");
      cloudToken = cloudTokenInput ? cloudTokenInput.value.trim() : "";
      try {
        localStorage.setItem(CLOUD_URL_KEY, cloudUrl);
        localStorage.setItem(CLOUD_TOKEN_KEY, cloudToken);
      } catch (error) { /* ignore */ }
      updateCloudStatus();
      if (IS_LOCAL_PAGE) {
        setStatus("本地模式不使用云端设置；GitHub Pages 打开时才会启用。", "ok");
      } else {
        setStatus("云端配置已保存，正在重新加载…", "ok");
        loadMeta();
      }
    });
  }
  if (clearCloudBtn) {
    clearCloudBtn.addEventListener("click", () => {
      cloudUrl = "";
      cloudToken = "";
      try {
        localStorage.removeItem(CLOUD_URL_KEY);
        localStorage.removeItem(CLOUD_TOKEN_KEY);
      } catch (error) { /* ignore */ }
      if (cloudUrlInput) cloudUrlInput.value = "";
      if (cloudTokenInput) cloudTokenInput.value = "";
      updateCloudStatus();
      if (!IS_LOCAL_PAGE) {
        meta = { languages: FALLBACK_LANGUAGES };
        setStatus("云端配置已清除。", "");
        loadHistory();
      }
    });
  }

  askBtn.addEventListener("click", ask);
  questionInput.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      ask();
    }
  });

  $("refreshHistory").addEventListener("click", loadHistory);
  historyList.addEventListener("click", (event) => {
    const button = event.target.closest(".view-history");
    if (!button) return;
    const record = historyRecords[Number(button.dataset.index)];
    if (!record) return;
    answerEl.innerHTML = renderMarkdown(record.answer || "");
    answerTime.textContent = (record.language_name || "") + " · " + (record.time || "");
    answerEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest(".copy-code:not(.view-history)");
    if (!button) return;
    const code = button.closest("pre")?.querySelector("code")?.textContent || "";
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "已复制";
      setTimeout(() => { button.textContent = "复制"; }, 1200);
    } catch (error) {
      setStatus("复制失败，请手动选择代码。", "error");
    }
  });

  loadMeta();
})();
