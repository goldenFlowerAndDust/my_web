(() => {
  "use strict";

  const LOCAL_API = "http://127.0.0.1:8769";
  const IS_LOCAL_PAGE = location.protocol === "file:" ||
    ((location.hostname === "127.0.0.1" || location.hostname === "localhost") && location.port === "8769");
  const ROUTE_KEY = "programmingTutor.route";
  const REMEMBER_KEY = "programmingTutor.rememberSettings";
  const PRIMARY_URL_KEY = "programmingTutor.primaryUrl";
  const PRIMARY_TOKEN_KEY = "programmingTutor.primaryToken";
  const BACKUP_URL_KEY = "programmingTutor.backupUrl";
  const BACKUP_TOKEN_KEY = "programmingTutor.backupToken";
  const LEGACY_URL_KEY = "programmingTutor.cloudUrl";
  const LEGACY_TOKEN_KEY = "programmingTutor.cloudToken";
  const cleanUrl = (value) => String(value || "").trim().replace(/\/+$/, "");
  const SENSITIVE_KEYS = [
    PRIMARY_URL_KEY, PRIMARY_TOKEN_KEY, BACKUP_URL_KEY, BACKUP_TOKEN_KEY,
    LEGACY_URL_KEY, LEGACY_TOKEN_KEY
  ];
  let remember = localStorage.getItem(REMEMBER_KEY) === "true";
  if (!remember) {
    // 默认不落盘：清掉旧版本可能保存过的地址和令牌。
    SENSITIVE_KEYS.forEach((key) => localStorage.removeItem(key));
  }
  const storage = remember ? localStorage : sessionStorage;
  let primaryUrl = cleanUrl(storage.getItem(PRIMARY_URL_KEY) || (remember ? localStorage.getItem(LEGACY_URL_KEY) : ""));
  let primaryToken = storage.getItem(PRIMARY_TOKEN_KEY) || (remember ? localStorage.getItem(LEGACY_TOKEN_KEY) : "") || "";
  let backupUrl = cleanUrl(storage.getItem(BACKUP_URL_KEY));
  let backupToken = storage.getItem(BACKUP_TOKEN_KEY) || "";
  let route = localStorage.getItem(ROUTE_KEY) || (IS_LOCAL_PAGE ? "local" : (primaryUrl ? "primary" : (backupUrl ? "backup" : "local")));
  if (!["local", "primary", "backup"].includes(route)) route = "local";
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
  const routeSelect = $("routeSelect");
  const primaryUrlInput = $("primaryUrl");
  const primaryTokenInput = $("primaryToken");
  const backupUrlInput = $("backupUrl");
  const backupTokenInput = $("backupToken");
  const primaryFields = $("primaryFields");
  const backupFields = $("backupFields");
  const cloudStatus = $("cloudStatus");
  const rememberSettings = $("rememberSettings");
  const rememberHint = $("rememberHint");
  let meta = null;
  let historyRecords = [];
  let busy = false;

  function routeConfig() {
    if (route === "primary") {
      return { id: "primary", label: "主线路", base: primaryUrl, token: primaryToken, local: false };
    }
    if (route === "backup") {
      return { id: "backup", label: "备用线路", base: backupUrl, token: backupToken, local: false };
    }
    return { id: "local", label: "本地 8769", base: LOCAL_API, token: "", local: true };
  }

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
    const config = routeConfig();
    if (!config.base) {
      throw new Error("当前线路未配置地址，请展开左侧“连接设置”。");
    }
    const headers = Object.assign({}, (options && options.headers) || {});
    if (!config.local && config.token) headers["X-Tutor-Token"] = config.token;
    const response = await fetch(config.base + url, Object.assign({}, options, { headers }));
    let data = null;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error(config.local
        ? "服务返回的不是 JSON，请确认 8769 服务已启动。"
        : "云端返回的不是 JSON，请检查线路地址和令牌。");
    }
    if (!response.ok || !data.ok) {
      throw new Error((data && data.error) || ("HTTP " + response.status));
    }
    return data;
  }

  function apiPath(localPath, cloudPath) {
    return routeConfig().local ? localPath : cloudPath;
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
      const data = routeConfig().local
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
      healthEl.textContent = routeConfig().local ? "本地服务未连接（8769）" : "线路未连接";
      healthEl.className = "health bad";
      setStatus(error.message, "error");
    }
  }

  async function checkHealth() {
    if (!routeConfig().local) {
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
    const config = routeConfig();
    if (config.local) {
      healthEl.textContent = "本地模式 8769";
      healthEl.className = "health ok";
      if (cloudStatus) {
        cloudStatus.textContent = "当前走本地服务。";
        cloudStatus.className = "cloud-status ok";
      }
      return;
    }
    if (config.base && config.token) {
      healthEl.textContent = config.label + " · 已配置";
      healthEl.className = "health ok";
      if (cloudStatus) {
        cloudStatus.textContent = "当前走" + config.label + "。保存后如不生效，刷新页面。";
        cloudStatus.className = "cloud-status ok";
      }
    } else {
      healthEl.textContent = config.label + " 未配置";
      healthEl.className = "health bad";
      if (cloudStatus) {
        cloudStatus.textContent = "请填写" + config.label + "的地址和令牌。";
        cloudStatus.className = "cloud-status bad";
      }
    }
  }

  async function loadStaticHistory(language) {
    try {
      const response = await fetch("history/index.json?t=" + Date.now(), { cache: "no-store" });
      if (!response.ok) return [];
      const data = await response.json();
      const records = Array.isArray(data.records) ? data.records : [];
      return records.filter((item) => item && item.language === language);
    } catch (error) {
      return [];
    }
  }

  async function loadHistory() {
    historyList.innerHTML = '<p class="history-empty">加载历史…</p>';
    try {
      const language = currentLanguage();
      let records = [];
      if (routeConfig().local) {
        const data = await fetchJson(
          "/api/history?language=" + encodeURIComponent(language) + "&limit=30"
        );
        records = data.records || [];
      } else {
        records = await loadStaticHistory(language);
        if (routeConfig().base && routeConfig().token) {
          try {
            const data = await fetchJson(
              "/api/code-log?language=" + encodeURIComponent(language)
            );
            records = records.concat(data.entries || []);
          } catch (error) {
            setStatus("云端历史读取失败，显示 GitHub 静态历史：" + error.message, "error");
          }
        }
      }
      const seen = new Set();
      historyRecords = records.filter((item) => {
        if (!item) return false;
        const key = [item.language || "", item.time || "", item.question || ""].join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));
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

  if (routeSelect) routeSelect.value = route;
  if (primaryUrlInput) primaryUrlInput.value = primaryUrl;
  if (primaryTokenInput) primaryTokenInput.value = primaryToken;
  if (backupUrlInput) backupUrlInput.value = backupUrl;
  if (backupTokenInput) backupTokenInput.value = backupToken;
  if (rememberSettings) rememberSettings.checked = remember;
  updateRememberHint();
  updateCloudStatus();

  function updateRememberHint() {
    if (!rememberHint) return;
    rememberHint.textContent = remember
      ? "已开启：地址和令牌会保存在这台浏览器，下次打开自动填入。共用电脑请勿开启。"
      : "默认关闭：地址和令牌只保留在当前标签页，关闭页面后失效。";
  }

  function persistSensitiveSettings() {
    const target = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    SENSITIVE_KEYS.forEach((key) => other.removeItem(key));
    target.setItem(PRIMARY_URL_KEY, primaryUrl);
    target.setItem(PRIMARY_TOKEN_KEY, primaryToken);
    target.setItem(BACKUP_URL_KEY, backupUrl);
    target.setItem(BACKUP_TOKEN_KEY, backupToken);
    localStorage.setItem(ROUTE_KEY, route);
  }

  function saveSettings() {
    const nextRoute = routeSelect ? routeSelect.value : route;
    route = ["local", "primary", "backup"].includes(nextRoute) ? nextRoute : "local";
    primaryUrl = cleanUrl(primaryUrlInput ? primaryUrlInput.value : primaryUrl);
    primaryToken = primaryTokenInput ? primaryTokenInput.value.trim() : primaryToken;
    backupUrl = cleanUrl(backupUrlInput ? backupUrlInput.value : backupUrl);
    backupToken = backupTokenInput ? backupTokenInput.value.trim() : backupToken;
    try {
      persistSensitiveSettings();
    } catch (error) { /* ignore */ }
    if (routeSelect) routeSelect.value = route;
    if (primaryUrlInput) primaryUrlInput.value = primaryUrl;
    if (backupUrlInput) backupUrlInput.value = backupUrl;
    updateCloudStatus();
    setStatus("已切换到 " + routeConfig().label + "，正在重新加载…", "ok");
    loadMeta();
  }

  const saveCloudBtn = $("saveCloud");
  const clearCloudBtn = $("clearCloud");
  if (saveCloudBtn) saveCloudBtn.addEventListener("click", saveSettings);
  if (rememberSettings) {
    rememberSettings.addEventListener("change", () => {
      remember = rememberSettings.checked;
      try {
        localStorage.setItem(REMEMBER_KEY, String(remember));
      } catch (error) { /* ignore */ }
      saveSettings();
      updateRememberHint();
    });
  }
  if (routeSelect) {
    routeSelect.addEventListener("change", () => {
      route = routeSelect.value;
      localStorage.setItem(ROUTE_KEY, route);
      updateCloudStatus();
      setStatus("已切换到 " + routeConfig().label + "。", "ok");
      loadMeta();
    });
  }
  if (clearCloudBtn) {
    clearCloudBtn.addEventListener("click", () => {
      primaryUrl = "";
      primaryToken = "";
      backupUrl = "";
      backupToken = "";
      try {
        SENSITIVE_KEYS.forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
      } catch (error) { /* ignore */ }
      if (primaryUrlInput) primaryUrlInput.value = "";
      if (primaryTokenInput) primaryTokenInput.value = "";
      if (backupUrlInput) backupUrlInput.value = "";
      if (backupTokenInput) backupTokenInput.value = "";
      updateCloudStatus();
      setStatus("线路配置已清除。", "");
      loadMeta();
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
