(function () {
    "use strict";

    // 本机对话的唯一 JSON 来源：回答轮次和历史记录都从这里读取。
    var KEY = "aiTutor.conversations.v1";
    var INIT_KEY = "aiTutor.conversations.initialized.v1";
    var LEGACY_PREFIX = "aiTutor.conversations.legacy.";
    var MAX = 200;

    function read() {
        try {
            var raw = localStorage.getItem(KEY);
            var list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list : [];
        } catch (error) {
            return [];
        }
    }

    function write(list) {
        try {
            localStorage.setItem(KEY, JSON.stringify((Array.isArray(list) ? list : []).slice(0, MAX)));
            localStorage.setItem(INIT_KEY, "1");
        } catch (error) { /* 空间不足时保留当前页面状态 */ }
    }

    function isLegacyImported(subject) {
        try {
            return localStorage.getItem(LEGACY_PREFIX + subject) === "1";
        } catch (error) {
            return false;
        }
    }

    function markLegacyImported(subject) {
        try {
            localStorage.setItem(LEGACY_PREFIX + subject, "1");
        } catch (error) { /* ignore */ }
    }

    function isInitialized() {
        try {
            return localStorage.getItem(INIT_KEY) === "1" || read().length > 0;
        } catch (error) {
            return read().length > 0;
        }
    }

    function text(value) {
        return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    }

    function titleOf(session) {
        var title = text(session && session.title);
        if (title && title !== "新问题") return title.slice(0, 80);
        var messages = (session && session.messages) || [];
        for (var i = 0; i < messages.length; i += 1) {
            if (messages[i] && messages[i].role === "user" && text(messages[i].content)) {
                return text(messages[i].content).slice(0, 80);
            }
        }
        return "新对话";
    }

    function normalizeMessages(messages) {
        if (!Array.isArray(messages)) return [];
        return messages.filter(function (m) {
            return m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string";
        }).map(function (m) {
            var item = { role: m.role, content: m.content };
            if (m.role === "assistant") {
                item.html = String(m.html || "");
                item.mode = String(m.mode || "");
                item.time = String(m.time || "");
                item.usage = m.usage && typeof m.usage === "object" ? m.usage : null;
            }
            return item;
        });
    }

    function upsert(session, subject) {
        if (!session || !session.id) return;
        var messages = normalizeMessages(session.messages);
        if (!messages.length) return;
        var assistant = messages.find(function (m) { return m.role === "assistant"; }) || {};
        var conversation = {
            id: String(session.id),
            subject: String(subject || ""),
            title: titleOf(session),
            mode: String(session.mode || assistant.mode || ""),
            topic: String(session.topic || ""),
            language: String(session.language || ""),
            language_name: String(session.languageName || session.language_name || session.language || ""),
            updated_at: Date.now(),
            messages: messages
        };
        var list = read();
        var existing = list.find(function (item) { return item && item.id === conversation.id; });
        if (existing && existing.created_at) conversation.created_at = existing.created_at;
        else conversation.created_at = conversation.updated_at;
        list = list.filter(function (item) { return item && item.id !== conversation.id; });
        list.unshift(conversation);
        write(list);
        return conversation;
    }

    function importEntries(entries, subject) {
        if (isLegacyImported(subject)) return false;
        if (!Array.isArray(entries) || !entries.length) {
            markLegacyImported(subject);
            return false;
        }
        var groups = {};
        entries.forEach(function (entry, index) {
            if (!entry || !entry.question || !entry.answer) return;
            var id = entry.conversation_id || ("legacy-" + String(entry.time || "").replace(/[^0-9]/g, "") + "-" + index);
            if (!groups[id]) {
                groups[id] = {
                    id: id,
                    subject: subject,
                    title: String(entry.question).slice(0, 80),
                    mode: entry.mode || "",
                    topic: entry.topic || "",
                    messages: [],
                    created_at: entry.created_at || Date.now()
                };
            }
            var group = groups[id];
            group.messages.push({ role: "user", content: String(entry.question) });
            group.messages.push({
                role: "assistant",
                content: String(entry.answer),
                html: entry.html || "",
                mode: entry.mode || "",
                time: entry.time || "",
                usage: entry.usage || null
            });
        });
        Object.keys(groups).forEach(function (id) {
            var group = groups[id];
            if (group.messages.length) upsert(group, subject);
        });
        markLegacyImported(subject);
        return true;
    }

    function list(subject) {
        return read().filter(function (item) {
            return item && item.id && (!subject || item.subject === subject);
        });
    }

    function entries(subject) {
        var result = [];
        list(subject).forEach(function (conversation) {
            var pairIndex = 0;
            var messages = normalizeMessages(conversation.messages);
            for (var i = 0; i + 1 < messages.length; i += 2) {
                var user = messages[i];
                var assistant = messages[i + 1];
                if (user.role !== "user" || assistant.role !== "assistant") continue;
                pairIndex += 1;
                result.push({
                    conversation_id: conversation.id,
                    subject: conversation.subject,
                    title: conversation.title,
                    mode: assistant.mode || conversation.mode || "",
                    topic: conversation.topic || "",
                    language: conversation.language || "",
                    language_name: conversation.language_name || "",
                    question: user.content,
                    answer: assistant.content,
                    html: assistant.html || "",
                    usage: assistant.usage || null,
                    time: assistant.time || "",
                    date: String(assistant.time || "").slice(0, 10),
                    round: pairIndex,
                    created_at: conversation.created_at,
                    updated_at: conversation.updated_at
                });
            }
        });
        return result;
    }


    function removeRound(conversationId, roundIndex) {
        var list = read();
        var conversation = list.find(function (item) { return item && item.id === conversationId; });
        if (!conversation) return false;
        var messages = normalizeMessages(conversation.messages);
        var start = Math.max(0, Number(roundIndex) || 0) * 2;
        if (start + 1 >= messages.length) return false;
        messages.splice(start, 2);
        if (!messages.length) {
            write(list.filter(function (item) { return item && item.id !== conversationId; }));
            return true;
        }
        var firstUser = messages.find(function (message) { return message.role === "user"; });
        conversation.messages = messages;
        conversation.title = firstUser ? String(firstUser.content).slice(0, 80) : "新对话";
        conversation.updated_at = Date.now();
        write(list);
        return true;
    }

    function clearConversation(id) {
        write(read().filter(function (item) { return item && item.id !== id; }));
    }

    window.ConversationStore = {
        KEY: KEY,
        upsert: upsert,
        importEntries: importEntries,
        isInitialized: isInitialized,
        isLegacyImported: isLegacyImported,
        markLegacyImported: markLegacyImported,
        list: list,
        entries: entries,
        clearConversation: clearConversation,
        removeRound: removeRound,
        dump: read
    };
})();
