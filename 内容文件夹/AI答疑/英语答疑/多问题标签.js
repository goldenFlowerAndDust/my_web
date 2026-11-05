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
    var MAX_ROUNDS = 8;
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
            id: "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            title: "新问题",
            messages: [],
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
        syncStore();
    }

    function storeSubject() {
        return location.pathname.indexOf("/数学答疑/") >= 0 ? "math" : "english";
    }

    function syncStore() {
        if (!window.ConversationStore) return;
        sessions.forEach(function (item) {
            if (item && Array.isArray(item.messages) && item.messages.length) {
                window.ConversationStore.upsert(item, storeSubject());
            }
        });
    }

    function load() {
        try {
            var raw = sessionStorage.getItem(KEY);
            var list = raw ? JSON.parse(raw) : null;
            if (Array.isArray(list)) {
                sessions = list.filter(function (s) { return s && typeof s === "object" && s.id; }).slice(0, MAX).map(function (s) {
                    s.messages = Array.isArray(s.messages) ? s.messages.filter(function (m) {
                        return m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string";
                    }).slice(-MAX_ROUNDS * 2) : [];
                    return s;
                });
            }
        } catch (e) { /* ignore */ }
        if (!sessions.length) sessions = [make()];
        sessions.forEach(function (item) {
            var parsed = parseInt(String(item.id || "").replace(/^t/, ""), 36);
            if (Number.isFinite(parsed) && parsed > seq) seq = parsed;
        });
        active = sessions[0].id;
    }

    function render() {
        tabsEl.innerHTML = sessions.map(function (s) {
            return '<div class="session-tab' + (s.id === active ? " is-active" : "") + '" data-session="' + s.id + '" role="tab" tabindex="0">' +
                '<span class="session-title">' + escape(s.title) + '</span>' +
                '<button type="button" class="session-close" data-close="' + s.id + '" title="关闭标签">×</button></div>';
        }).join("");
        updateHint();
        window.dispatchEvent(new CustomEvent("tutor-context-updated"));
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
        updateHint();
    }

    function busy() {
        return askBtn && askBtn.disabled;
    }

    function roundsOf(session) {
        return Math.floor((session && session.messages ? session.messages.length : 0) / 2);
    }

    function canAsk() {
        var s = current();
        return !!s && roundsOf(s) < MAX_ROUNDS;
    }

    function historyFor(id) {
        var s = sessions.find(function (item) { return item.id === id; }) || current();
        return s && Array.isArray(s.messages) ? s.messages.slice(-MAX_ROUNDS * 2) : [];
    }

    function appendTurnTo(id, questionText, answerText, answerHtml, answerMode, answerTime, usage) {
        var s = sessions.find(function (item) { return item.id === id; });
        if (!s || !questionText || !answerText) return;
        s.messages = (Array.isArray(s.messages) ? s.messages : []).concat([
            { role: "user", content: String(questionText) },
            {
                role: "assistant",
                content: String(answerText),
                html: String(answerHtml || ""),
                mode: String(answerMode || ""),
                time: String(answerTime || ""),
                usage: usage && typeof usage === "object" ? usage : null
            }
        ]).slice(-MAX_ROUNDS * 2);
        save();
        render();
        syncStore();
        window.dispatchEvent(new CustomEvent("tutor-context-updated"));
        window.dispatchEvent(new CustomEvent("tutor-turn-added", { detail: { id: id } }));
    }

    function turns() {
        var s = current();
        var result = [];
        if (!s || !Array.isArray(s.messages)) return result;
        for (var i = 0; i + 1 < s.messages.length; i += 2) {
            var user = s.messages[i];
            var assistant = s.messages[i + 1];
            if (!user || !assistant || user.role !== "user" || assistant.role !== "assistant") continue;
            result.push({
                index: result.length + 1,
                question: user.content,
                answer: assistant.content,
                html: assistant.html || "",
                mode: assistant.mode || "",
                time: assistant.time || "",
                usage: assistant.usage || null
            });
        }
        return result;
    }

    var contextHint = document.createElement("span");
    contextHint.className = "context-hint";
    contextHint.id = "contextHint";
    addEl.parentNode.appendChild(contextHint);

    function updateHint() {
        var s = current();
        if (!s) return;
        var rounds = roundsOf(s);
        contextHint.textContent = rounds >= MAX_ROUNDS
            ? "本对话已满 " + MAX_ROUNDS + " 轮，请新建对话"
            : "本对话 " + rounds + "/" + MAX_ROUNDS + " 轮";
        contextHint.classList.toggle("is-full", rounds >= MAX_ROUNDS);
    }

    window.TutorTabs = {
        subject: storeSubject(),
        maxRounds: MAX_ROUNDS,
        activeId: function () { return active; },
        canAsk: canAsk,
        history: function () { return historyFor(active); },
        historyFor: historyFor,
        appendTurnTo: appendTurnTo,
        rounds: function () { return roundsOf(current()); },
        turns: turns,
        removeConversation: removeConversation,
        removeRound: removeRound,
        resumeConversation: resumeConversation
    };

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

    function removeRound(id, roundIndex) {
        var session = sessions.find(function (item) { return item.id === id; });
        if (!session || !Array.isArray(session.messages)) return false;
        var start = Math.max(0, Number(roundIndex) || 0) * 2;
        if (start + 1 >= session.messages.length) return false;
        if (busy()) return false;
        session.messages.splice(start, 2);
        if (!session.messages.length) return removeConversation(id);
        var firstUser = session.messages.find(function (message) { return message.role === "user"; });
        session.title = firstUser ? titleOf(firstUser.content) : "新问题";
        session.answerHtml = "";
        session.answerState = "empty";
        session.answerMode = "等待提问";
        session.answerTime = "—";
        save();
        render();
        restore();
        syncStore();
        window.dispatchEvent(new CustomEvent("tutor-turn-added", { detail: { id: id, removed: true } }));
        return true;
    }

    function resumeConversation(id, roundLimit) {
        if (!id || !window.ConversationStore) return false;
        var conversation = window.ConversationStore.list(storeSubject()).find(function (item) { return item.id === id; });
        if (!conversation || !Array.isArray(conversation.messages) || !conversation.messages.length) return false;
        var pairs = Math.max(1, Math.min(Number(roundLimit) || conversation.messages.length / 2, conversation.messages.length / 2));
        var messages = conversation.messages.slice(0, Math.floor(pairs) * 2);
        if (sessions.length >= MAX) {
            if (status) status.textContent = "最多同时保留 " + MAX + " 个标签，请先关闭一个。";
            return false;
        }
        var session = make();
        sessions.push(session);
        session.messages = messages;
        session.title = "续：" + (conversation.title || titleOf(messages[0] && messages[0].content) || "历史对话");
        session.mode = conversation.mode || session.mode;
        session.question = "";
        session.answerState = "content";
        session.answerHtml = "";
        session.answerMode = "";
        session.answerTime = "";
        session.status = "";
        var lastAssistant = messages.slice().reverse().find(function (m) { return m.role === "assistant"; });
        if (lastAssistant) {
            session.answerHtml = lastAssistant.html ||
                (window.TutorRenderAnswer ? window.TutorRenderAnswer(lastAssistant.content || "") : "");
            session.answerMode = lastAssistant.mode || session.mode || "历史回答";
            session.answerTime = lastAssistant.time || "";
        }
        active = id;
        render();
        restore();
        save();
        syncStore();
        question.focus();
        return true;
    }

    function removeConversation(id) {
        if (!id) return false;
        var index = sessions.findIndex(function (item) { return item.id === id; });
        if (index < 0) return false;
        if (busy()) return false;
        sessions.splice(index, 1);
        if (!sessions.length) sessions = [make()];
        if (active === id) active = sessions[Math.max(0, index - 1)].id;
        render();
        restore();
        save();
        if (window.ConversationStore) window.ConversationStore.clearConversation(id, storeSubject());
        return true;
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
    syncStore();
})();
