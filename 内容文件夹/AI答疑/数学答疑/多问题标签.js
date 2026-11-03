(function () {
    "use strict";

    var question = document.getElementById("question");
    var askBtn = document.getElementById("ask-btn");
    var status = document.getElementById("status");
    var answerEmpty = document.getElementById("answer-empty");
    var answerLoading = document.getElementById("answer-loading");
    var answerError = document.getElementById("answer-error");
    var answerContent = document.getElementById("answer-content");
    var answerMode = document.getElementById("answer-mode");
    var answerTime = document.getElementById("answer-time");
    var answerMeta = document.getElementById("answer-meta");
    var tabsEl = document.getElementById("sessionTabs");
    var addEl = document.getElementById("addSession");
    if (!question || !tabsEl || !addEl) return;

    var KEY = "aiTutor.sessions." + (location.pathname.indexOf("/数学答疑/") >= 0 ? "math" : "english");
    var MAX = 8;
    var sessions = [];
    var active = "";
    var seq = 0;

    function emptyHtml() {
        return '<strong>等待提问</strong><p>输入问题后开始。每个标签会保留自己的问题和回答。</p>';
    }

    function titleOf(value) {
        var text = String(value || "").replace(/\s+/g, " ").trim();
        return text ? (text.length > 16 ? text.slice(0, 16) + "…" : text) : "新问题";
    }

    function current() {
        return sessions.find(function (s) { return s.id === active; }) || sessions[0] || null;
    }

    function mode() {
        var button = document.querySelector(".mode-tab.is-active");
        return button ? button.getAttribute("data-mode") : "";
    }

    function setMode(value) {
        if (!value) return;
        var button = document.querySelector('.mode-tab[data-mode="' + value.replace(/"/g, '\\"') + '"]');
        if (button && !button.classList.contains("is-active")) button.click();
    }

    function answerState() {
        if (!answerEmpty || !answerEmpty.hidden) return "empty";
        if (!answerLoading || !answerLoading.hidden) return "loading";
        if (!answerError || !answerError.hidden) return "error";
        return "content";
    }

    function make() {
        return {
            id: "t" + (++seq).toString(36),
            title: "新问题",
            question: "",
            mode: mode() || "",
            answerState: "empty",
            answerHtml: "",
            answerError: "",
            answerMode: answerMode ? answerMode.textContent : "等待提问",
            answerTime: answerTime ? answerTime.textContent : "—",
            answerMeta: answerMeta ? answerMeta.textContent : "",
            status: ""
        };
    }

    function capture() {
        var s = current();
        if (!s) return;
        s.question = question.value;
        s.mode = mode() || s.mode;
        s.answerState = answerState();
        s.answerHtml = answerContent ? answerContent.innerHTML : "";
        s.answerError = answerError ? answerError.innerHTML : "";
        s.answerMode = answerMode ? answerMode.textContent : s.answerMode;
        s.answerTime = answerTime ? answerTime.textContent : s.answerTime;
        s.answerMeta = answerMeta ? answerMeta.textContent : s.answerMeta;
        s.status = status ? status.textContent : "";
        if ((s.title === "新问题" || !s.title) && s.question.trim()) s.title = titleOf(s.question);
    }

    function save() {
        try { sessionStorage.setItem(KEY, JSON.stringify(sessions)); } catch (e) { /* ignore */ }
    }

    function load() {
        try {
            var raw = sessionStorage.getItem(KEY);
            var list = raw ? JSON.parse(raw) : null;
            if (Array.isArray(list)) {
                sessions = list.filter(function (s) { return s && typeof s === "object" && s.id; }).slice(0, MAX);
            }
        } catch (e) { /* ignore */ }
        if (!sessions.length) sessions = [make()];
        active = sessions[0].id;
    }

    function render() {
        tabsEl.innerHTML = sessions.map(function (s) {
            return '<div class="session-tab' + (s.id === active ? " is-active" : "") + '" data-session="' + s.id + '" role="tab" tabindex="0">' +
                '<span class="session-title">' + escape(s.title) + '</span>' +
                '<button type="button" class="session-close" data-close="' + s.id + '" title="关闭标签">×</button></div>';
        }).join("");
    }

    function escape(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function restore() {
        var s = current();
        if (!s) return;
        question.value = s.question || "";
        setMode(s.mode);
        if (answerEmpty) answerEmpty.hidden = s.answerState !== "empty";
        if (answerLoading) answerLoading.hidden = s.answerState !== "loading";
        if (answerError) answerError.hidden = s.answerState !== "error";
        if (answerContent) {
            answerContent.hidden = s.answerState !== "content";
            if (s.answerState === "content") answerContent.innerHTML = s.answerHtml || "";
        }
        if (answerError && s.answerState === "error") answerError.innerHTML = s.answerError || "";
        if (answerMode) answerMode.textContent = s.answerMode || "等待提问";
        if (answerTime) answerTime.textContent = s.answerTime || "—";
        if (answerMeta) answerMeta.textContent = s.answerMeta || "";
        if (status) status.textContent = s.status || "";
    }

    function busy() {
        return askBtn && askBtn.disabled;
    }

    function go(id) {
        if (!id || id === active) return;
        if (busy()) {
            if (status) status.textContent = "当前回答完成后再切换标签。";
            return;
        }
        capture();
        active = id;
        render();
        restore();
        save();
    }

    function add() {
        if (busy()) {
            if (status) status.textContent = "当前回答完成后再新建标签。";
            return;
        }
        capture();
        if (sessions.length >= MAX) {
            if (status) status.textContent = "最多同时保留 " + MAX + " 个问题标签。";
            return;
        }
        var s = make();
        sessions.push(s);
        active = s.id;
        render();
        restore();
        save();
        question.focus();
    }

    function close(id) {
        if (busy()) {
            if (status) status.textContent = "当前回答完成后再关闭标签。";
            return;
        }
        capture();
        var index = sessions.findIndex(function (s) { return s.id === id; });
        if (index < 0) return;
        sessions.splice(index, 1);
        if (!sessions.length) sessions = [make()];
        if (active === id) active = sessions[Math.max(0, index - 1)].id;
        render();
        restore();
        save();
    }

    question.addEventListener("input", function () {
        var s = current();
        if (!s) return;
        s.question = question.value;
        s.title = titleOf(question.value);
        render();
    });

    tabsEl.addEventListener("click", function (event) {
        var closeEl = event.target.closest("[data-close]");
        if (closeEl) {
            event.stopPropagation();
            close(closeEl.getAttribute("data-close"));
            return;
        }
        var tab = event.target.closest("[data-session]");
        if (tab) go(tab.getAttribute("data-session"));
    });

    tabsEl.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        var tab = event.target.closest("[data-session]");
        if (tab && !event.target.closest(".session-close")) {
            event.preventDefault();
            go(tab.getAttribute("data-session"));
        }
    });

    addEl.addEventListener("click", add);
    window.addEventListener("beforeunload", function () { capture(); save(); });
    load();
    render();
    restore();
})();
