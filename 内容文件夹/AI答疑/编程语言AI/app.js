(() => {
  "use strict";

  const LOCAL_API = "http://127.0.0.1:8769";
  const IS_LOCAL_PAGE = location.protocol === "file:" ||
    ((location.hostname === "127.0.0.1" || location.hostname === "localhost") && location.port === "8769");
  const CONNECTION_KEY = "programmingTutor.connection-v2";
  const REMEMBER_KEY = "programmingTutor.rememberSettings";
  const LEGACY_ROUTE_KEY = "programmingTutor.route";
  const LEGACY_PRIMARY_URL_KEY = "programmingTutor.primaryUrl";
  const LEGACY_PRIMARY_TOKEN_KEY = "programmingTutor.primaryToken";
  const LEGACY_BACKUP_URL_KEY = "programmingTutor.backupUrl";
  const LEGACY_BACKUP_TOKEN_KEY = "programmingTutor.backupToken";
  const LEGACY_URL_KEY = "programmingTutor.cloudUrl";
  const LEGACY_TOKEN_KEY = "programmingTutor.cloudToken";
  const cleanUrl = (value) => String(value || "").trim().replace(/\/+$/, "");
  const SENSITIVE_KEYS = [
    CONNECTION_KEY, LEGACY_PRIMARY_URL_KEY, LEGACY_PRIMARY_TOKEN_KEY,
    LEGACY_BACKUP_URL_KEY, LEGACY_BACKUP_TOKEN_KEY, LEGACY_URL_KEY, LEGACY_TOKEN_KEY
  ];
  let remember = localStorage.getItem(REMEMBER_KEY) === "true";
  if (!remember) {
    SENSITIVE_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  function normalizeProfile(value) {
    return {
      url: cleanUrl(value && value.url),
      token: String((value && value.token) || "").trim()
    };
  }

  function defaultConnection() {
    return {
      mode: IS_LOCAL_PAGE ? "local" : "cloud",
      provider: "cloudflare",
      profiles: { cloudflare: { url: "", token: "" }, domestic: { url: "", token: "" } }
    };
  }

  function loadConnection() {
    const store = remember ? localStorage : sessionStorage;
    const result = defaultConnection();
    try {
      const raw = store.getItem(CONNECTION_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          result.mode = data.mode === "cloud" ? "cloud" : "local";
          result.provider = data.provider === "domestic" ? "domestic" : "cloudflare";
          result.profiles.cloudflare = normalizeProfile(data.profiles && data.profiles.cloudflare);
          result.profiles.domestic = normalizeProfile(data.profiles && data.profiles.domestic);
        }
      }
    } catch (error) { /* ignore */ }

    // 兼容旧版主/备线路和单线路配置。
    const legacyCloudflare = normalizeProfile({
      url: store.getItem(LEGACY_BACKUP_URL_KEY) || store.getItem(LEGACY_URL_KEY),
      token: store.getItem(LEGACY_BACKUP_TOKEN_KEY) || store.getItem(LEGACY_TOKEN_KEY)
    });
    const legacyDomestic = normalizeProfile({
      url: store.getItem(LEGACY_PRIMARY_URL_KEY),
      token: store.getItem(LEGACY_PRIMARY_TOKEN_KEY)
    });
    if (!result.profiles.cloudflare.url && legacyCloudflare.url) {
      result.profiles.cloudflare = legacyCloudflare;
    }
    if (!result.profiles.domestic.url && legacyDomestic.url) {
      result.profiles.domestic = legacyDomestic;
    }
    const legacyRoute = store.getItem(LEGACY_ROUTE_KEY);
    if (legacyRoute === "primary") {
      result.mode = "cloud";
      if (!result.profiles.domestic.url) result.provider = "domestic";
    } else if (legacyRoute === "backup") {
      result.mode = "cloud";
    } else if (legacyRoute === "local") {
      result.mode = "local";
    }
    if (result.mode === "cloud" && !result.profiles[result.provider].url) {
      result.provider = result.profiles.domestic.url ? "domestic" : "cloudflare";
    }
    return result;
  }

  let connection = loadConnection();
  const $ = (id) => document.getElementById(id);
  const languageSelect = $("languageSelect");
  const questionInput = $("question");
  const askBtn = $("askBtn");
  const statusEl = $("status");
  const answerEl = $("answer");
  const answerTime = $("answerTime");
  const roundSelect = $("roundSelect");
  const roundCount = $("roundCount");
  const answerToken = $("answerToken");
  const answerRoundDelete = $("answerRoundDelete");
  const historyList = $("historyList");
  const historyTabs = $("historyTabs");
  const historySearch = $("historySearch");
  const historyDate = $("historyDate");
  const historyCount = $("historyCount");
  const exportHistoryBtn = $("exportHistory");
  const sessionTabs = $("sessionTabs");
  const addSessionBtn = $("addSession");
  const healthEl = $("health");
  const heroBadge = $("heroBadge");
  const languageMeta = $("languageMeta");
  const blogLinks = $("blogLinks");
  const themeToggle = $("themeToggle");
  const connectionMode = $("connectionMode");
  const cloudProvider = $("cloudProvider");
  const cloudUrlInput = $("cloudUrl");
  const cloudTokenInput = $("cloudToken");
  const cloudFields = $("cloudFields");
  const cloudStatus = $("cloudStatus");
  const rememberSettings = $("rememberSettings");
  const rememberHint = $("rememberHint");
  let meta = null;
  let historyRecords = [];
  let historyFilterLanguage = "all";
  let sessions = [];
  let activeSessionId = "";
  const SESSION_KEY = "programmingTutor.sessions-v1";
  const MAX_SESSIONS = 8;
  const MAX_ROUNDS = 20;

  function emptyAnswerHtml() {
    return '<div class="empty-state"><strong>等待提问</strong><p>输入问题后开始。每个标签会保留自己的问题和回答。</p></div>';
  }

  function sessionTitle(question) {
    const text = String(question || "").replace(/\s+/g, " ").trim();
    return text ? (text.length > 16 ? text.slice(0, 16) + "…" : text) : "新问题";
  }

  function newSession(language) {
    return {
      id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: "新问题",
      language: language || "python",
      question: "",
      answerHtml: emptyAnswerHtml(),
      answerTime: "",
      busy: false,
      error: false,
      messages: []
    };
  }

  function currentSession() {
    return sessions.find((item) => item.id === activeSessionId) || sessions[0] || null;
  }

  function captureSession() {
    const session = currentSession();
    if (!session) return;
    session.question = questionInput.value;
    session.answerHtml = answerEl.innerHTML;
    session.answerTime = answerTime.textContent;
    session.language = languageSelect.value || session.language;
    if (session.title === "新问题" && session.question.trim()) {
      session.title = sessionTitle(session.question);
    }
  }

  function syncConversationStore() {
    if (!window.ConversationStore) return;
    sessions.forEach((session) => {
      if (session && Array.isArray(session.messages) && session.messages.length) {
        window.ConversationStore.upsert(session, "code");
      }
    });
  }

  function saveSessions() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
    } catch (error) { /* ignore */ }
  }

  function loadSessions() {
    let stored = null;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch (error) { /* ignore */ }
    if (Array.isArray(stored)) {
      sessions = stored.filter((item) => item && typeof item === "object" && item.id)
        .slice(0, MAX_SESSIONS)
        .map((item) => {
          const session = Object.assign(newSession(item.language), item);
          session.messages = Array.isArray(session.messages) ? session.messages.filter((m) =>
            m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
          ).slice(-MAX_ROUNDS * 2) : [];
          return session;
        });
      // 刷新后没有正在进行的请求，清掉上次遗留的忙碌状态。
      sessions.forEach((item) => { item.busy = false; });
      activeSessionId = localStorage.getItem("programmingTutor.activeSession") || "";
      if (!sessions.some((item) => item.id === activeSessionId)) activeSessionId = sessions[0].id;
    }
    if (!sessions.length) {
      const savedLanguage = localStorage.getItem("programmingTutor.language") || "python";
      sessions = [newSession(savedLanguage)];
      activeSessionId = sessions[0].id;
    }
  }

  function renderSessionTabs() {
    if (!sessionTabs) return;
    sessionTabs.innerHTML = sessions.map((session) => {
      const active = session.id === activeSessionId ? " is-active" : "";
      const busy = session.busy ? " is-busy" : "";
      const error = session.error ? " is-error" : "";
      const state = session.busy ? '<span class="session-state">●</span>' :
        (session.error ? '<span class="session-state">●</span>' :
          (session.answerTime ? '<span class="session-state">●</span>' : ""));
      return '<div class="session-tab' + active + busy + error + '" data-session="' +
        escapeHtml(session.id) + '" role="tab" tabindex="0">' +
        '<span class="session-title">' + escapeHtml(session.title) + "</span>" +
        state +
        '<button type="button" class="session-close" data-close="' + escapeHtml(session.id) +
        '" title="关闭标签" aria-label="关闭标签">×</button></div>';
    }).join("");
  }

  function conversationTurns() {
    const session = currentSession();
    const turns = [];
    if (!session || !Array.isArray(session.messages)) return turns;
    for (let i = 0; i + 1 < session.messages.length; i += 2) {
      const user = session.messages[i];
      const assistant = session.messages[i + 1];
      if (!user || !assistant || user.role !== "user" || assistant.role !== "assistant") continue;
      turns.push({
        index: turns.length + 1,
        question: user.content || "",
        answer: assistant.content || "",
        html: assistant.html || "",
        time: assistant.time || "",
        usage: assistant.usage || null
      });
    }
    return turns;
  }

  function renderRoundSelect(forceLatest) {
    if (!roundSelect) return;
    const turns = conversationTurns();
    roundSelect.innerHTML = turns.map((turn) => {
      const text = String(turn.question || "").replace(/\s+/g, " ").trim();
      const label = text.length > 24 ? text.slice(0, 24) + "…" : (text || "（无问题）");
      return '<option value="' + (turn.index - 1) + '">第' + turn.index + '轮 · ' + escapeHtml(label) + "</option>";
    }).join("");
    roundSelect.hidden = turns.length === 0;
    roundSelect.disabled = turns.length === 0;
    if (roundCount) roundCount.textContent = turns.length ? "共 " + turns.length + " 轮" : "";
    if (answerRoundDelete) answerRoundDelete.hidden = turns.length === 0;
    if (!turns.length && answerToken) answerToken.textContent = "";
    if (turns.length && forceLatest) roundSelect.value = String(turns.length - 1);
    if (!turns.length) return;
    if (!roundSelect.value) roundSelect.value = String(turns.length - 1);
    showRound(Number(roundSelect.value) || 0);
  }

  function showRound(index) {
    const turns = conversationTurns();
    const turn = turns[index];
    if (!turn) return;
    const html = turn.html || renderMarkdown(turn.answer || "");
    answerEl.innerHTML = html;
    answerTime.textContent = turn.time || "";
    if (window.renderTokenCost) window.renderTokenCost(document.getElementById("answerToken"), turn.usage);
    const session = currentSession();
    if (session) {
      session.answerHtml = html;
      session.answerTime = turn.time || "";
      saveSessions();
    }
  }

  function loadSessionView() {
    const session = currentSession();
    if (!session) return;
    languageSelect.value = session.language || "python";
    questionInput.value = session.question || "";
    answerEl.innerHTML = session.answerHtml || emptyAnswerHtml();
    answerTime.textContent = session.answerTime || "";
    askBtn.disabled = Boolean(session.busy) || (Array.isArray(session.messages) && session.messages.length >= MAX_ROUNDS * 2);
    if (session.busy) {
      setStatus("正在请求 AI…", "");
    } else if (session.error) {
      setStatus("上一次请求失败，请查看回答区。", "error");
    } else {
      setStatus("", "");
    }
    localStoragesetLanguage(session.language);
    renderRoundSelect(true);
  }

  function localStoragesetLanguage(language) {
    try { localStorage.setItem("programmingTutor.language", language || "python"); } catch (error) { /* ignore */ }
  }

  function switchSession(id) {
    if (!id || id === activeSessionId) return;
    captureSession();
    activeSessionId = id;
    try { localStorage.setItem("programmingTutor.activeSession", id); } catch (error) { /* ignore */ }
    renderSessionTabs();
    loadSessionView();
    updateLanguageUi(true);
  }

  function addSession() {
    captureSession();
    if (sessions.length >= MAX_SESSIONS) {
      setStatus("最多同时保留 " + MAX_SESSIONS + " 个问题标签，请先关闭旧标签。", "error");
      return;
    }
    const session = newSession(languageSelect.value || "python");
    sessions.push(session);
    activeSessionId = session.id;
    renderSessionTabs();
    loadSessionView();
    updateLanguageUi(true);
    saveSessions();
    questionInput.focus();
  }

  function removeRound(id, roundIndex) {
    const session = sessions.find((item) => item.id === id);
    if (!session || !Array.isArray(session.messages)) return false;
    const start = Math.max(0, Number(roundIndex) || 0) * 2;
    if (start + 1 >= session.messages.length) return false;
    session.messages.splice(start, 2);
    if (!session.messages.length) {
      closeSession(id);
      if (window.ConversationStore) window.ConversationStore.clearConversation(id);
      return true;
    }
    const firstUser = session.messages.find((message) => message.role === "user");
    session.title = firstUser ? sessionTitle(firstUser.content) : "新问题";
    session.answerHtml = "";
    session.answerState = "empty";
    session.answerTime = "";
    saveSessions();
    syncConversationStore();
    if (id === activeSessionId) {
      loadSessionView();
    } else {
      renderSessionTabs();
    }
    return true;
  }

  function closeSession(id) {
    captureSession();
    const index = sessions.findIndex((item) => item.id === id);
    if (index < 0) return;
    sessions.splice(index, 1);
    if (!sessions.length) {
      sessions = [newSession(languageSelect.value || "python")];
      activeSessionId = sessions[0].id;
    } else if (id === activeSessionId) {
      activeSessionId = sessions[Math.max(0, index - 1)].id;
    }
    renderSessionTabs();
    loadSessionView();
    updateLanguageUi(true);
    saveSessions();
  }

  function initSessions() {
    loadSessions();
    renderSessionTabs();
    loadSessionView();
  }

  initSessions();
  window.ProgrammingCloseConversation = function (id) {
    closeSession(id);
    if (window.ConversationStore) window.ConversationStore.clearConversation(id);
  };
  window.ProgrammingRemoveRound = function (id, roundIndex) {
    return removeRound(id, roundIndex);
  };

  function currentProfile() {
    return connection.profiles[connection.provider] || { url: "", token: "" };
  }

  function routeConfig() {
    if (connection.mode === "local") {
      return { id: "local", label: "本地 8769", base: LOCAL_API, token: "", local: true };
    }
    const profile = currentProfile();
    return {
      id: connection.provider,
      label: connection.provider === "domestic" ? "国内 SCF" : "Cloudflare",
      base: profile.url,
      token: profile.token,
      local: false
    };
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

  function updateLanguageUi(skipHistory) {
    const language = currentLanguage();
    const session = currentSession();
    if (session) session.language = language;
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
    if (!skipHistory) loadHistory();
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

  async function loadStaticHistory() {
    const archiveRoot = "../历史归档";
    try {
      const response = await fetch(archiveRoot + "/manifest.json?t=" + Date.now(), { cache: "no-store" });
      if (response.ok) {
        const manifest = await response.json();
        const files = [];
        Object.values((manifest && manifest.months) || {}).forEach((month) => {
          const categories = ((month && month.subjects) || {})["编程"] || {};
          Object.values(categories).forEach((parts) => {
            (parts || []).forEach((part) => {
              if (part && part.file) files.push(part.file);
            });
          });
        });
        const chunks = await Promise.all(files.map(async (file) => {
          try {
            const part = await fetch(archiveRoot + "/" + encodeURI(file) + "?t=" + Date.now(), { cache: "no-store" });
            if (!part.ok) return [];
            const data = await part.json();
            return Array.isArray(data.entries) ? data.entries : [];
          } catch (error) {
            return [];
          }
        }));
        const records = chunks.flat();
        if (records.length) return records;
      }
    } catch (error) { /* fall through */ }
    try {
      const response = await fetch("history/index.json?t=" + Date.now(), { cache: "no-store" });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data.records) ? data.records : [];
    } catch (error) {
      return [];
    }
  }

  function buildHistoryTabs() {
    if (!historyTabs) return;
    const rows = [{ id: "all", name: "全部" }].concat(
      (meta && meta.languages) || FALLBACK_LANGUAGES
    );
    historyTabs.innerHTML = rows.map((item) =>
      '<button type="button" class="history-tab' +
      (item.id === historyFilterLanguage ? " is-active" : "") +
      '" data-language="' + escapeHtml(item.id) + '">' + escapeHtml(item.name) + "</button>"
    ).join("");
  }

  function filteredHistoryRecords() {
    const query = (historySearch ? historySearch.value : "").trim().toLowerCase();
    const range = historyDate ? historyDate.value : "all";
    const today = new Date();
    const cutoff = range === "today" ? 0 : (range === "7" ? 7 : (range === "30" ? 30 : null));
    return historyRecords.filter((item) => {
      if (historyFilterLanguage !== "all" && item.language !== historyFilterLanguage) return false;
      if (query) {
        const haystack = [item.question, item.answer, item.language_name]
          .map((value) => String(value || "")).join("\n").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (cutoff !== null) {
        const day = item.date || String(item.time || "").slice(0, 10);
        const date = new Date(day + "T00:00:00");
        if (Number.isNaN(date.getTime())) return false;
        const diff = Math.floor((today - date) / 86400000);
        if (diff < 0 || diff > cutoff) return false;
      }
      return true;
    });
  }

  function groupHistoryRecords(records) {
    const groups = [];
    const map = new Map();
    records.forEach((item) => {
      const index = historyRecords.indexOf(item);
      const key = item.conversation_id ? "c:" + item.conversation_id : "s:" + index;
      if (!map.has(key)) {
        const group = { key, items: [] };
        map.set(key, group);
        groups.push(group);
      }
      map.get(key).items.push({ item, index });
    });
    groups.forEach((group) => {
      group.items.sort((a, b) => String(a.item.time || "").localeCompare(String(b.item.time || "")));
    });
    groups.sort((a, b) => {
      const at = a.items[a.items.length - 1].item.time || "";
      const bt = b.items[b.items.length - 1].item.time || "";
      return String(bt).localeCompare(String(at));
    });
    return groups;
  }

  function renderHistory() {
    const records = filteredHistoryRecords();
    if (window.ConversationStore && !window.ConversationStore.isLegacyImported("code")) {
      window.ConversationStore.importEntries(records, "code");
      const migrated = window.ConversationStore.entries("code");
      if (migrated.length) {
        historyRecords = migrated.sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));
        return renderHistory();
      }
    }
    const groups = groupHistoryRecords(records);
    if (historyCount) {
      historyCount.textContent = groups.length + " 个对话 / " + records.length + " 条回答";
    }
    if (!records.length) {
      historyList.innerHTML = '<p class="history-empty">' +
        (historyRecords.length ? "没有匹配的历史记录。" : "还没有历史记录，先问一个问题。") + "</p>";
      return;
    }
    historyList.innerHTML = groups.map((group) => {
      const first = group.items[0].item;
      const latest = group.items[group.items.length - 1].item;
      const options = group.items.map((row, roundIndex) =>
        '<option value="' + row.index + '">第' + (roundIndex + 1) + '轮 · ' +
        escapeHtml(String(row.item.question || "（无问题）").slice(0, 28)) + "</option>"
      ).join("");
      return '<div class="history-conversation">' +
        '<div class="history-conversation-head">' +
        '<span class="history-conversation-title">' + escapeHtml(first.question || "（无原题）") + "</span>" +
        '<span class="history-conversation-count">共 ' + group.items.length + ' 轮</span>' +
        (first.conversation_id ? '<button type="button" class="history-conversation-delete" data-delete-conversation="' + escapeHtml(first.conversation_id) + '">删除</button>' : '') +
        "</div>" +
        '<select class="history-round-select" data-history-select>' + options + "</select>" +
        '<button type="button" class="history-round-delete" data-delete-round="' + group.items[group.items.length - 1].index + '">删除本轮</button>' +
        '<p class="history-conversation-preview">' +
        escapeHtml(String(latest.answer || "").replace(/[#*`>]/g, "").slice(0, 140)) + "</p>" +
        '<button type="button" class="copy-code view-history" data-index="' +
        group.items[group.items.length - 1].index + '">查看选中的回答</button>' +
        "</div>";
    }).join("");
    Array.from(historyList.querySelectorAll("[data-history-select]")).forEach((select) => {
      select.value = String(groupHistoryValue(select));
    });
  }

  function groupHistoryValue(select) {
    const options = Array.from(select.options);
    return options.length ? options[options.length - 1].value : "";
  }

  async function loadHistory() {
    historyList.innerHTML = '<p class="history-empty">加载历史…</p>';
    if (window.ConversationStore && window.ConversationStore.isInitialized() &&
        window.ConversationStore.isLegacyImported("code")) {
      const stored = window.ConversationStore.entries("code");
      historyRecords = stored.sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));
      buildHistoryTabs();
      renderHistory();
      return;
    }
    try {
      let records = [];
      if (routeConfig().local) {
        const data = await fetchJson("/api/history?limit=100");
        records = data.records || [];
      } else {
        records = await loadStaticHistory();
        if (routeConfig().base && routeConfig().token) {
          try {
            const data = await fetchJson("/api/code-log");
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
      buildHistoryTabs();
      renderHistory();
    } catch (error) {
      historyList.innerHTML = '<p class="history-empty">历史加载失败：' + escapeHtml(error.message) + "</p>";
      if (historyCount) historyCount.textContent = "—";
    }
  }

  function exportHistory() {
    const records = filteredHistoryRecords();
    const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), records }, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "programming-history-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function classifyError(message) {
    const text = String(message || "");
    if (/(HTTP\s*5\d\d|service_unavailable|too busy|overloaded|bad gateway|gateway timeout)/i.test(text)) {
      return {
        kind: "deepseek",
        label: "DeepSeek 服务故障（不是你的配置）",
        advice: "接口返回 5xx，通常是 DeepSeek 过载或临时故障。稍后重试，或查看 status.deepseek.com。"
      };
    }
    if (/(HTTP\s*401|HTTP\s*403|invalid_api_key|unauthor|authentication|访问口令|API Key|令牌|未配置)/i.test(text)) {
      return {
        kind: "config",
        label: "配置或密钥问题",
        advice: "运行“配置.bat”检查 API Key、云端地址和访问口令。"
      };
    }
    if (/(HTTP\s*429|rate limit|quota|额度|余额|限流|too many requests)/i.test(text)) {
      return {
        kind: "limit",
        label: "额度或频率限制",
        advice: "检查 DeepSeek 余额/额度，或降低提问频率后重试。"
      };
    }
    if (/(HTTP\s*400|invalid_request|请求体|问题太长|未知语言)/i.test(text)) {
      return {
        kind: "request",
        label: "请求参数问题",
        advice: "检查问题内容、语言选择和输入长度后重试。"
      };
    }
    if (/(Failed to fetch|NetworkError|无法连接|未连接|timed? out|超时|network)/i.test(text)) {
      return {
        kind: "local",
        label: "本地服务或网络问题",
        advice: "确认 8769 / 8767 / 8768 已启动，并检查网络或代理。"
      };
    }
    return {
      kind: "unknown",
      label: "未能判断的错误",
      advice: "展开下面的原始错误；如果是 5xx，先按 DeepSeek 服务故障处理。"
    };
  }

  async function ask() {
    const session = currentSession();
    if (!session || session.busy) return;
    if (Array.isArray(session.messages) && session.messages.length >= MAX_ROUNDS * 2) {
      setStatus("本对话已达到 " + MAX_ROUNDS + " 轮上限，请点击 + 新建对话。", "error");
      return;
    }
    const question = questionInput.value.trim();
    if (!question) {
      setStatus("请先输入问题。", "error");
      questionInput.focus();
      return;
    }
    session.question = question;
    session.language = languageSelect.value || session.language;
    session.title = sessionTitle(question);
    session.busy = true;
    session.error = false;
    session.answerTime = "";
    session.answerHtml = '<div class="empty-state"><strong>生成中</strong><p>请稍等，代码题可能需要更久。</p></div>';
    askBtn.disabled = true;
    setStatus("正在请求 AI…", "");
    answerEl.innerHTML = session.answerHtml;
    answerTime.textContent = "";
    renderSessionTabs();
    saveSessions();
    try {
      const path = apiPath("/api/ask", "/api/code");
      const data = await fetchJson(path, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          language: session.language,
          question: question,
          conversation_id: session.id,
          history: (session.messages || []).slice(-MAX_ROUNDS * 2)
        })
      });
      session.answerHtml = renderMarkdown(data.answer || "");
      session.answerTime = (data.language_name || "") + " · " + (data.time || "");
      session.messages = (session.messages || []).concat([
        { role: "user", content: question },
        {
          role: "assistant",
          content: data.answer || "",
          html: renderMarkdown(data.answer || ""),
          time: (data.language_name || "") + " · " + (data.time || ""),
          usage: data.usage || null
        }
      ]).slice(-MAX_ROUNDS * 2);
      syncConversationStore();
      renderRoundSelect(true);
      session.busy = false;
      session.error = false;
      if (session.id === activeSessionId) {
        answerEl.innerHTML = session.answerHtml;
        answerTime.textContent = session.answerTime;
        setStatus("回答完成。本对话 " + Math.floor((session.messages || []).length / 2) + "/" + MAX_ROUNDS + " 轮", "ok");
        askBtn.disabled = false;
        answerEl.scrollIntoView({ behavior: "smooth", block: "start" });
        // 历史刷新不阻塞回答和按钮恢复。
        loadHistory();
      }
    } catch (error) {
      const info = classifyError(error.message);
      session.busy = false;
      session.error = true;
      session.answerTime = "";
      session.answerHtml = '<div class="empty-state error-state">' +
        '<div class="error-kind ' + info.kind + '">' + escapeHtml(info.label) + "</div>" +
        "<strong>请求失败</strong><p>" + escapeHtml(info.advice) + "</p>" +
        '<p class="error-raw">原始错误：' + escapeHtml(error.message) + "</p></div>";
      if (session.id === activeSessionId) {
        answerEl.innerHTML = session.answerHtml;
        answerTime.textContent = "";
        setStatus(info.label + "：" + info.advice, "error");
        askBtn.disabled = false;
      }
    } finally {
      session.busy = false;
      if (session.id === activeSessionId) askBtn.disabled = Array.isArray(session.messages) && session.messages.length >= MAX_ROUNDS * 2;
      renderSessionTabs();
      saveSessions();
    }
  }

  languageSelect.addEventListener("change", () => {
    const session = currentSession();
    if (!session) return;
    if (session.busy) {
      languageSelect.value = session.language;
      setStatus("当前标签正在回答，完成后再切换语言。", "error");
      return;
    }
    session.language = languageSelect.value;
    session.error = false;
    session.answerHtml = emptyAnswerHtml();
    session.answerTime = "";
    answerEl.innerHTML = session.answerHtml;
    answerTime.textContent = "";
    updateLanguageUi();
    renderSessionTabs();
    saveSessions();
  });

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
  }
  applyTheme(document.documentElement.dataset.theme || localStorage.getItem("programmingTutor.theme") || "dark");

  function saveProfileFromForm() {
    const profile = currentProfile();
    profile.url = cleanUrl(cloudUrlInput ? cloudUrlInput.value : profile.url);
    profile.token = cloudTokenInput ? cloudTokenInput.value.trim() : profile.token;
  }

  function fillProfileFields() {
    const profile = currentProfile();
    if (cloudUrlInput) cloudUrlInput.value = profile.url;
    if (cloudTokenInput) cloudTokenInput.value = profile.token;
    if (cloudProvider) cloudProvider.value = connection.provider;
  }

  function syncCloudFields() {
    if (cloudFields) cloudFields.hidden = connectionMode.value !== "cloud";
  }

  function updateRememberHint() {
    if (!rememberHint) return;
    rememberHint.textContent = remember
      ? "已开启：地址和口令保存在这台浏览器，下次打开自动填入。共用电脑请勿开启。"
      : "默认关闭：地址和口令只在当前标签页有效，关闭页面后失效。";
  }

  function persistConnection() {
    const target = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    SENSITIVE_KEYS.forEach((key) => {
      other.removeItem(key);
      localStorage.removeItem(key);
    });
    target.setItem(CONNECTION_KEY, JSON.stringify(connection));
  }

  function saveSettings() {
    if (connectionMode) connection.mode = connectionMode.value === "cloud" ? "cloud" : "local";
    if (cloudProvider) connection.provider = cloudProvider.value === "domestic" ? "domestic" : "cloudflare";
    saveProfileFromForm();
    try {
      persistConnection();
    } catch (error) { /* ignore */ }
    fillProfileFields();
    syncCloudFields();
    updateCloudStatus();
    setStatus("已切换到 " + routeConfig().label + "，正在重新加载…", "ok");
    loadMeta();
  }

  if (connectionMode) connectionMode.value = connection.mode;
  if (cloudProvider) cloudProvider.value = connection.provider;
  fillProfileFields();
  syncCloudFields();
  if (rememberSettings) rememberSettings.checked = remember;
  updateRememberHint();
  updateCloudStatus();

  const saveCloudBtn = $("saveCloud");
  const clearCloudBtn = $("clearCloud");
  if (saveCloudBtn) saveCloudBtn.addEventListener("click", saveSettings);
  if (connectionMode) {
    connectionMode.addEventListener("change", syncCloudFields);
  }
  if (cloudProvider) {
    cloudProvider.addEventListener("change", () => {
      saveProfileFromForm();
      connection.provider = cloudProvider.value === "domestic" ? "domestic" : "cloudflare";
      fillProfileFields();
    });
  }
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
  if (clearCloudBtn) {
    clearCloudBtn.addEventListener("click", () => {
      connection.profiles = {
        cloudflare: { url: "", token: "" },
        domestic: { url: "", token: "" }
      };
      try {
        SENSITIVE_KEYS.forEach((key) => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
        });
      } catch (error) { /* ignore */ }
      if (cloudUrlInput) cloudUrlInput.value = "";
      if (cloudTokenInput) cloudTokenInput.value = "";
      updateCloudStatus();
      setStatus("线路配置已清除。", "");
      loadMeta();
    });
  }


  if (addSessionBtn) addSessionBtn.addEventListener("click", addSession);
  if (sessionTabs) {
    sessionTabs.addEventListener("click", (event) => {
      const close = event.target.closest(".session-close");
      if (close) {
        event.stopPropagation();
        closeSession(close.dataset.close);
        return;
      }
      const tab = event.target.closest(".session-tab");
      if (tab) switchSession(tab.dataset.session);
    });
    sessionTabs.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const tab = event.target.closest(".session-tab");
      if (tab && !event.target.closest(".session-close")) {
        event.preventDefault();
        switchSession(tab.dataset.session);
      }
    });
  }
  questionInput.addEventListener("input", () => {
    const session = currentSession();
    if (!session) return;
    session.question = questionInput.value;
    session.title = sessionTitle(session.question);
    renderSessionTabs();
    saveSessions();
  });

  if (roundSelect) {
    roundSelect.addEventListener("change", () => showRound(Number(roundSelect.value) || 0));
  }
  if (answerRoundDelete) {
    answerRoundDelete.addEventListener("click", () => {
      const session = currentSession();
      const index = Number(roundSelect && roundSelect.value);
      if (!session || !Number.isFinite(index)) return;
      if (!window.confirm("删除第 " + (index + 1) + " 轮？删除后不可恢复。")) return;
      const removed = window.ProgrammingRemoveRound ? window.ProgrammingRemoveRound(session.id, index) : false;
      if (!removed && window.ConversationStore) {
        window.ConversationStore.removeRound(session.id, index);
      }
      renderRoundSelect(true);
      if (!conversationTurns().length) {
        answerEl.innerHTML = emptyAnswerHtml();
        answerTime.textContent = "";
        if (answerToken) answerToken.textContent = "";
      }
      loadHistory();
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
  if (exportHistoryBtn) exportHistoryBtn.addEventListener("click", exportHistory);
  if (historyTabs) {
    historyTabs.addEventListener("click", (event) => {
      const button = event.target.closest(".history-tab");
      if (!button) return;
      historyFilterLanguage = button.dataset.language || "all";
      buildHistoryTabs();
      renderHistory();
    });
  }
  if (historySearch) {
    historySearch.addEventListener("input", renderHistory);
  }
  if (historyDate) {
    historyDate.addEventListener("change", renderHistory);
  }
  function viewHistoryRecord(index) {
    const record = historyRecords[index];
    if (!record) return;
    const session = currentSession();
    if (session) {
      session.answerHtml = renderMarkdown(record.answer || "");
      session.answerTime = (record.language_name || "") + " · " + (record.time || "");
      session.error = false;
      saveSessions();
      renderSessionTabs();
    }
    answerEl.innerHTML = renderMarkdown(record.answer || "");
    answerTime.textContent = (record.language_name || "") + " · " + (record.time || "");
    if (window.renderTokenCost) window.renderTokenCost(document.getElementById("answerToken"), record.usage);
    answerEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  historyList.addEventListener("change", (event) => {
    if (event.target.closest("[data-history-select]")) {
      viewHistoryRecord(Number(event.target.value));
    }
  });

  historyList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-delete-conversation]");
    if (!deleteButton) return;
    const id = deleteButton.getAttribute("data-delete-conversation");
    if (!id || !window.confirm("删除这个对话？删除后不可恢复。")) return;
    if (window.ProgrammingCloseConversation) window.ProgrammingCloseConversation(id);
    loadHistory();
  });

  historyList.addEventListener("click", (event) => {
    const roundButton = event.target.closest("[data-delete-round]");
    if (roundButton) {
      const card = roundButton.closest(".history-conversation");
      const select = card ? card.querySelector("[data-history-select]") : null;
      const index = Number((select && select.value) || roundButton.dataset.deleteRound || 0);
      const record = historyRecords[index];
      if (!record || !record.conversation_id) return;
      const round = Number(record.round || (select ? select.selectedIndex + 1 : 1));
      if (!window.confirm("删除第 " + round + " 轮？删除后不可恢复。")) return;
      let removed = false;
      if (window.ProgrammingRemoveRound) {
        removed = window.ProgrammingRemoveRound(record.conversation_id, round - 1);
      }
      if (!removed && window.ConversationStore) {
        window.ConversationStore.removeRound(record.conversation_id, round - 1);
      }
      loadHistory();
      return;
    }
    const button = event.target.closest(".view-history");
    if (!button) return;
    const card = button.closest(".history-conversation");
    const select = card ? card.querySelector("[data-history-select]") : null;
    viewHistoryRecord(Number((select && select.value) || button.dataset.index || 0));
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
