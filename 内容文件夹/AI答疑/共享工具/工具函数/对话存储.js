(function () {
    "use strict";

    // 本科目独立存储：英语 / 数学 / 编程各一份 JSON，互不混用。
    var KEY_PREFIX = "aiTutor.conversations.v2.";
    var OLD_KEY = "aiTutor.conversations.v1";
    var INIT_PREFIX = "aiTutor.conversations.initialized.v2.";
    var LEGACY_PREFIX = "aiTutor.conversations.legacy.";
    var DELETED_PREFIX = "aiTutor.conversations.deleted.";
    var SUBJECTS = ["english", "math", "code"];
    var MAX = 200;


    var remoteBase = String(window.AI_CONVERSATION_BASE || "").replace(/\/$/, "");
    var remoteSubject = String(window.AI_CONVERSATION_SUBJECT || "");
    var remoteToken = "";
    var remoteReady = Promise.resolve();
    var remoteIds = {};
    var syncTimer = null;

    function remoteUrl(path) {
        return remoteBase ? remoteBase + path : path;
    }

    function applyRemoteDocument(document) {
        if (!document || !document.windows || typeof document.windows !== "object") return false;
        var list = Object.keys(document.windows).map(function (key) {
            var item = document.windows[key];
            if (!item || typeof item !== "object") return null;
            item.id = item.id || key;
            item.subject = remoteSubject;
            return item;
        }).filter(Boolean);
        remoteIds = {};
        list.forEach(function (item) { remoteIds[item.id] = true; });
        try {
            localStorage.setItem(storageKey(remoteSubject), JSON.stringify(list));
            localStorage.setItem(globalInitKey(remoteSubject), "1");
        } catch (error) { /* ignore */ }
        return true;
    }

    function postConversation(payload) {
        if (!remoteBase) return Promise.resolve();
        return fetch(remoteUrl("/api/conversations"), {
            method: "POST",
            headers: Object.assign(
                { "Content-Type": "application/json" },
                remoteToken ? { "X-Tutor-Token": remoteToken } : {}
            ),
            body: JSON.stringify(Object.assign({ subject: remoteSubject }, payload))
        }).then(function (response) {
            if (!response.ok) throw new Error("HTTP " + response.status);
            return response.json();
        }).then(function (data) {
            window.dispatchEvent(new CustomEvent("tutor-history-updated", { detail: { subject: remoteSubject } }));
            return data;
        }).catch(function () { /* 本地缓存继续工作 */ });
    }

    function queueSync() {
        if (!remoteBase || !remoteSubject) return;
        if (syncTimer) clearTimeout(syncTimer);
        syncTimer = setTimeout(function () {
            syncTimer = null;
            var list = read(remoteSubject);
            var currentIds = {};
            list.forEach(function (item) { if (item && item.id) currentIds[item.id] = true; });
            var jobs = Object.keys(remoteIds).filter(function (id) { return !currentIds[id]; })
                .map(function (id) { return postConversation({ action: "delete_window", window_id: id }); });
            list.forEach(function (item) {
                if (!item || !item.id) return;
                jobs.push(postConversation({
                    action: "upsert",
                    window_id: item.id,
                    title: item.title || "新对话",
                    mode: item.mode || "",
                    topic: item.topic || "",
                    language: item.language || "",
                    language_name: item.language_name || "",
                    messages: item.messages || []
                }));
            });
            remoteIds = currentIds;
            Promise.all(jobs).catch(function () { /* ignore */ });
        }, 250);
    }

    function setRemote(base, subject, token) {
        remoteBase = String(base || "").replace(/\/$/, "");
        remoteSubject = String(subject || remoteSubject || "");
        remoteToken = String(token || "");
        remoteIds = {};
        window.__AI_CONVERSATION_REMOTE__ = { base: remoteBase, subject: remoteSubject, hasToken: Boolean(remoteToken) };
        if (!remoteBase || !remoteSubject) return Promise.resolve(false);
        remoteReady = initializeRemote();
        window.ConversationStore.ready = remoteReady;
        return remoteReady;
    }

    function initializeRemote() {
        // 历史界面改用按月静态索引后，不再在页面启动时拉取全部 messages。
        if (window.__AI_HISTORY_LIGHT__) return Promise.resolve(false);
        if (!remoteBase || !remoteSubject) return Promise.resolve();
        return fetch(remoteUrl("/api/conversations?subject=" + encodeURIComponent(remoteSubject)), {
            cache: "no-store",
            headers: remoteToken ? { "X-Tutor-Token": remoteToken } : {}
        }).then(function (response) {
            if (!response.ok) throw new Error("HTTP " + response.status);
            return response.json();
        }).then(function (payload) {
            var document = payload && payload.document;
            var hasRemote = document && document.windows && Object.keys(document.windows).length > 0;
            window.__AI_CONVERSATION_DEBUG__ = {
                base: remoteBase,
                subject: remoteSubject,
                cloudWindows: document && document.windows ? Object.keys(document.windows) : [],
                hasRemote: Boolean(hasRemote)
            };
            if (hasRemote) {
                applyRemoteDocument(document);
            } else {
                // 服务端为空时，把浏览器已有历史迁移上去。
                var local = read(remoteSubject);
                remoteIds = {};
                local.forEach(function (item) { if (item && item.id) remoteIds[item.id] = true; });
                if (local.length) queueSync();
            }
            document = null;
            window.dispatchEvent(new CustomEvent("tutor-conversations-ready", { detail: { subject: remoteSubject } }));
            return true;
        }).catch(function () {
            return false;
        });
    }

    function storageKey(subject) {
        return KEY_PREFIX + String(subject || "unknown");
    }

    function globalInitKey(subject) {
        return INIT_PREFIX + String(subject || "unknown");
    }

    function readOldGlobal() {
        try {
            var raw = localStorage.getItem(OLD_KEY);
            var list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list : [];
        } catch (error) {
            return [];
        }
    }

    function read(subject) {
        try {
            var key = storageKey(subject);
            var raw = localStorage.getItem(key);
            if (raw) {
                var list = JSON.parse(raw);
                return Array.isArray(list) ? list : [];
            }
            // 把旧版共用的 v1 JSON 按 subject 拆到新键，避免科目串数据。
            var old = readOldGlobal().filter(function (item) {
                return item && item.subject === subject;
            });
            if (old.length) write(old, subject);
            return old;
        } catch (error) {
            return [];
        }
    }

    function write(list, subject) {
        try {
            localStorage.setItem(storageKey(subject), JSON.stringify((Array.isArray(list) ? list : []).slice(0, MAX)));
            localStorage.setItem(globalInitKey(subject), "1");
            queueSync();
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

    function isDeleted(subject) {
        try {
            return localStorage.getItem(DELETED_PREFIX + subject) === "1";
        } catch (error) {
            return false;
        }
    }

    function markDeleted(subject) {
        try {
            localStorage.setItem(DELETED_PREFIX + subject, "1");
        } catch (error) { /* ignore */ }
    }

    function clearDeleted(subject) {
        try {
            localStorage.removeItem(DELETED_PREFIX + subject);
        } catch (error) { /* ignore */ }
    }

    function isInitialized(subject) {
        try {
            return localStorage.getItem(globalInitKey(subject)) === "1" || read(subject).length > 0;
        } catch (error) {
            return read(subject).length > 0;
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

    function languageFromTime(value) {
        var name = String(value || "").split("·")[0].trim();
        var map = {
            "Python": "python", "JavaScript": "javascript", "Node.js": "node",
            "HTML + CSS": "web", "HTML+CSS": "web", "MySQL": "mysql"
        };
        return map[name] || "";
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
                item.language = String(m.language || "");
                item.language_name = String(m.language_name || "");
                item.usage = m.usage && typeof m.usage === "object" ? m.usage : null;
            }
            return item;
        });
    }

    function upsert(session, subject) {
        if (!session || !session.id || !subject) return;
        var messages = normalizeMessages(session.messages);
        if (!messages.length) return;
        var assistant = messages.find(function (m) { return m.role === "assistant"; }) || {};
        var conversation = {
            id: String(session.id),
            subject: String(subject),
            title: titleOf(session),
            mode: String(session.mode || assistant.mode || ""),
            topic: String(session.topic || ""),
            language: String(session.language || ""),
            language_name: String(session.languageName || session.language_name || session.language || ""),
            updated_at: Date.now(),
            messages: messages
        };
        var list = read(subject);
        var existing = list.find(function (item) { return item && item.id === conversation.id; });
        if (existing && existing.created_at) conversation.created_at = existing.created_at;
        else conversation.created_at = conversation.updated_at;
        list = list.filter(function (item) { return item && item.id !== conversation.id; });
        list.unshift(conversation);
        write(list, subject);
        clearDeleted(subject);
        return conversation;
    }

    function importEntries(entries, subject, force) {
        if (!subject || (isLegacyImported(subject) && !force) || isDeleted(subject)) return false;
        if (!Array.isArray(entries) || !entries.length) {
            markLegacyImported(subject);
            return false;
        }
        var groups = {};
        entries.forEach(function (entry, index) {
            if (!entry || !entry.question || !entry.answer) return;
            if (!modeBelongs(entry.mode, subject)) return;
            var id = entry.conversation_id || ("legacy-" + subject + "-" +
                String(entry.time || "").replace(/[^0-9]/g, "") + "-" + index);
            if (!groups[id]) {
                groups[id] = {
                    id: id,
                    subject: subject,
                    title: String(entry.question).slice(0, 80),
                    mode: entry.mode || "",
                    topic: entry.topic || "",
                    language: entry.language || (subject === "code" ? entry.mode : "") || "",
                    language_name: entry.language_name || entry.language || entry.mode || "",
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
                language: entry.language || (subject === "code" ? entry.mode : "") || "",
                language_name: entry.language_name || entry.language || entry.mode || "",
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

    function modeBelongs(mode, subject) {
        var value = String(mode || "");
        if (subject === "math") {
            return ["单词解释", "作文", "句子分析"].indexOf(value) < 0;
        }
        if (subject === "english") {
            return ["题目讲解", "错题诊断", "概念公式"].indexOf(value) < 0;
        }
        return true;
    }

    function list(subject) {
        return read(subject).filter(function (item) {
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
                if (!modeBelongs(assistant.mode || conversation.mode, subject)) continue;
                result.push({
                    conversation_id: conversation.id,
                    subject: conversation.subject,
                    title: conversation.title,
                    mode: assistant.mode || conversation.mode || "",
                    topic: conversation.topic || "",
                    language: (conversation.subject === "code"
                        ? (conversation.language || assistant.language || languageFromTime(assistant.time) || conversation.mode)
                        : (conversation.language || "")) || "",
                    language_name: (conversation.subject === "code"
                        ? (conversation.language_name || conversation.language || assistant.language_name ||
                           languageFromTime(assistant.time) || conversation.mode)
                        : (conversation.language_name || conversation.language || "")) || "",
                    question: user.content,
                    answer: assistant.content,
                    html: assistant.html || "",
                    usage: assistant.usage || null,
                    time: assistant.time || "",
                    date: (String(assistant.time || "").match(/\d{4}-\d{2}-\d{2}/) || [""])[0] ||
                        String(assistant.time || "").slice(0, 10),
                    round: pairIndex,
                    created_at: conversation.created_at,
                    updated_at: conversation.updated_at
                });
            }
        });
        return result;
    }

    function removeRound(conversationId, roundIndex, subject) {
        var subjects = subject ? [subject] : SUBJECTS;
        for (var s = 0; s < subjects.length; s += 1) {
            var currentSubject = subjects[s];
            var list = read(currentSubject);
            var conversation = list.find(function (item) { return item && item.id === conversationId; });
            if (!conversation) continue;
            var messages = normalizeMessages(conversation.messages);
            var start = Math.max(0, Number(roundIndex) || 0) * 2;
            if (start + 1 >= messages.length) return false;
            messages.splice(start, 2);
            if (!messages.length) {
                write(list.filter(function (item) { return item && item.id !== conversationId; }), currentSubject);
                markDeleted(currentSubject);
                return true;
            }
            var firstUser = messages.find(function (message) { return message.role === "user"; });
            conversation.messages = messages;
            conversation.title = firstUser ? String(firstUser.content).slice(0, 80) : "新对话";
            conversation.updated_at = Date.now();
            write(list, currentSubject);
            return true;
        }
        return false;
    }

    function clearConversation(id, subject) {
        var subjects = subject ? [subject] : SUBJECTS;
        subjects.forEach(function (currentSubject) {
            var remaining = read(currentSubject).filter(function (item) {
                return item && item.id !== id;
            });
            write(remaining, currentSubject);
            if (!remaining.length) markDeleted(currentSubject);
        });
    }

    window.ConversationStore = {
        KEY_PREFIX: KEY_PREFIX,
        upsert: upsert,
        importEntries: importEntries,
        isInitialized: isInitialized,
        isLegacyImported: isLegacyImported,
        isDeleted: isDeleted,
        markLegacyImported: markLegacyImported,
        list: list,
        entries: entries,
        clearConversation: clearConversation,
        removeRound: removeRound,
        dump: function (subject) { return read(subject || "english"); },
        ready: initializeRemote(),
        setRemote: setRemote,
        syncNow: queueSync
    };
})();
