(function () {
    "use strict";

    // 只读静态月索引：先加载目录，再加载当月摘要；详情点击后才请求 chunk。
    var script = document.currentScript;
    var sourceList = document.getElementById("history-list") || document.getElementById("historyList");
    var generatedHost = false;
    if (!sourceList) {
        var host = document.querySelector("main") || document.body;
        var section = document.createElement("section");
        section.className = "month-history-embedded";
        section.innerHTML = '<div class="month-history-head"><p class="month-history-kicker">AI HISTORY</p>' +
            "<h2>AI 历史记录</h2><p>按月份和日期查看历史问答，点击后才加载完整回答。</p></div>";
        host.appendChild(section);
        sourceList = document.createElement("div");
        sourceList.className = "month-history-source";
        section.appendChild(sourceList);
        generatedHost = true;
    }
    var list = null;
    var subject = (script && script.dataset.subject) ||
        document.body.getAttribute("data-history-subject") || "";
    if (!subject) {
        var path = decodeURIComponent(location.pathname);
        subject = /数学答疑/.test(path) ? "math" : (/编程语言AI/.test(path) ? "code" : "english");
    }
    var languageFilter = (script && script.dataset.language) || "";
    var historyRoot = script && script.src
        ? new URL("../../历史/", script.src)
        : new URL("../历史/", location.href);
    var MODE_TABS = {
        english: [["all", "全部"], ["单词解释", "单词解释"], ["句子分析", "句子分析"], ["作文", "作文"], ["其他", "其他"]],
        math: [["all", "全部"], ["题目讲解", "题目讲解"], ["错题诊断", "错题分析"], ["概念公式", "概念公式"], ["其他", "其他"]]
    };
    var state = {
        months: [],
        month: "",
        monthIndex: null,
        chunks: {},
        cards: [],
        selectedId: "",
        language: "",
        category: "all",
        loading: false
    };

    function base(relative) {
        return new URL(relative, historyRoot).toString();
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
        });
    }

    function questionHtml(text) {
        if (window.TutorRenderQuestion) return window.TutorRenderQuestion(text);
        return escapeHtml(text);
    }

    function answerHtml(text) {
        if (window.TutorRenderAnswer) return window.TutorRenderAnswer(text);
        return escapeHtml(text);
    }

    function fetchJson(url) {
        return fetch(url, { cache: "no-store" }).then(function (response) {
            if (!response.ok) throw new Error("HTTP " + response.status);
            return response.json();
        });
    }

    function insertToolbar() {
        if (list) return;
        var panel = sourceList.parentElement;
        list = document.createElement("div");
        list.id = "month-history-list";
        list.className = "month-history-list";
        panel.insertBefore(list, sourceList.nextSibling);
        sourceList.style.display = "none";
        var empty = document.getElementById("history-empty");
        if (empty) empty.style.display = "none";
        var oldCount = document.getElementById("history-count");
        if (oldCount) oldCount.style.display = "none";
        var oldTabs = document.getElementById("history-tabs") || document.querySelector(".history-tabs");
        if (oldTabs) oldTabs.style.display = "none";
        var desc = document.querySelector(".history-desc");
        if (desc) desc.textContent = "按月份加载摘要；点击“查看回答”后才读取该对话详情。";
        var oldArchive = document.querySelector('.hub-section[data-section="ai-history"]');
        if (oldArchive) oldArchive.style.display = "none";

        var toolbar = document.createElement("div");
        toolbar.id = "month-history-toolbar";
        toolbar.className = "month-history-toolbar";
        toolbar.innerHTML =
            '<label class="month-history-label">月份' +
            '<select id="month-history-select" aria-label="选择历史月份"></select></label>' +
            (subject === "code" && !languageFilter
                ? '<label class="month-history-label">语言<select id="month-history-language-select" aria-label="选择编程语言"><option value="">全部语言</option></select></label>'
                : "") +
            '<span id="month-history-count" class="month-history-count"></span>' +
            '<span id="month-history-note" class="month-history-note">先读月份索引，点开对话再读回答</span>';
        panel.insertBefore(toolbar, sourceList);

        var select = document.getElementById("month-history-select");
        select.addEventListener("change", function () {
            loadMonth(select.value);
        });
        var lang = document.getElementById("month-history-language-select");
        if (lang) lang.addEventListener("change", function () {
            state.language = lang.value;
            var appLang = document.getElementById("languageSelect");
            if (appLang) appLang.value = lang.value;
            renderSummaries();
        });
        var appLanguage = document.getElementById("languageSelect");
        if (appLanguage) {
            state.language = appLanguage.value || state.language;
            appLanguage.addEventListener("change", function () {
                state.language = appLanguage.value;
                if (lang) lang.value = appLanguage.value;
                renderSummaries();
            });
        }
        if (MODE_TABS[subject]) {
            var categories = document.createElement("div");
            categories.id = "month-history-categories";
            categories.className = "month-history-categories";
            categories.innerHTML = MODE_TABS[subject].map(function (item) {
                return '<button type="button" data-category="' + escapeHtml(item[0]) + '"' +
                    (item[0] === state.category ? ' class="is-active"' : "") + ">" + escapeHtml(item[1]) + "</button>";
            }).join("");
            toolbar.appendChild(categories);
            categories.addEventListener("click", function (event) {
                var button = event.target.closest("[data-category]");
                if (!button) return;
                state.category = button.getAttribute("data-category");
                Array.from(categories.querySelectorAll("[data-category]")).forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                renderSummaries();
            });
        }
    }

    function renderEmpty(text) {
        var card = document.createElement("div");
        card.className = "month-history-empty";
        card.textContent = text;
        list.innerHTML = "";
        list.appendChild(card);
        list.style.display = "";
        document.getElementById("month-history-count").textContent = "";
    }

    function renderMonths() {
        var select = document.getElementById("month-history-select");
        select.innerHTML = state.months.map(function (item) {
            return '<option value="' + escapeHtml(item.month) + '">' +
                escapeHtml(item.month) + "（" + Number(item.count || 0) + " 个对话）</option>";
        }).join("");
        if (state.month) select.value = state.month;
    }

    function renderLanguageOptions() {
        var select = document.getElementById("month-history-language-select");
        if (!select) return;
        var seen = {};
        (state.monthIndex && state.monthIndex.windows || []).forEach(function (item) {
            var value = String(item.language || "");
            if (!value) return;
            seen[value] = String(item.language_name || value);
        });
        var current = select.value;
        select.innerHTML = '<option value="">全部语言</option>' + Object.keys(seen).sort().map(function (value) {
            return '<option value="' + escapeHtml(value) + '">' + escapeHtml(seen[value]) + "</option>";
        }).join("");
        select.value = seen[current] ? current : (state.language && seen[state.language] ? state.language : "");
        state.language = select.value;
    }

    function renderSummaries() {
        list.innerHTML = "";
        var windows = (state.monthIndex && state.monthIndex.windows) || [];
        windows = windows.filter(function (item) {
            return !item.subject || String(item.subject) === subject;
        });
        if (MODE_TABS[subject] && state.category !== "all") {
            windows = windows.filter(function (item) {
                return String(item.mode || "") === state.category;
            });
        }
        var activeLanguage = languageFilter || state.language;
        if (activeLanguage) {
            windows = windows.filter(function (item) {
                return String(item.language || "") === activeLanguage;
            });
        }
        document.getElementById("month-history-count").textContent =
            state.month + " · " + windows.length + " 个对话";
        if (!windows.length) {
            renderEmpty(state.category !== "all" ? "这个分类下还没有记录。" : "这个月还没有历史记录。");
            return;
        }
        var lastDate = "";
        windows.forEach(function (item) {
            var date = String(item.updated_at || item.created_at || "").slice(0, 10);
            if (date && date !== lastDate) {
                var day = document.createElement("h3");
                day.className = "month-history-day";
                day.textContent = date;
                list.appendChild(day);
                lastDate = date;
            }
            var card = document.createElement("article");
            card.className = "month-history-card";
            card.setAttribute("data-window-id", item.id);
            card.innerHTML =
                '<div class="month-history-card-head">' +
                '<span class="month-history-card-title">' + questionHtml(item.title || "（无问题）") + "</span>" +
                '<span class="month-history-card-meta">' + escapeHtml(item.updated_at || item.created_at || "") +
                " · " + Number(item.rounds || 0) + " 轮</span>" +
                "</div>" +
                '<div class="month-history-card-actions">' +
                (Number(item.rounds || 0) > 0
                    ? '<select class="month-history-round-select" aria-label="选择这个对话的轮次">' +
                      Array.from({ length: Number(item.rounds || 0) }, function (_, i) {
                          return '<option value="' + i + '">第' + (i + 1) + '轮</option>';
                      }).join("") + "</select>"
                    : "") +
                '<button type="button" class="month-history-open">查看回答</button>' +
                '<button type="button" class="month-history-delete-round">删除本轮</button>' +
                '<button type="button" class="month-history-delete">删除对话</button>' +
                (window.TutorTabs && window.TutorTabs.resumeConversation
                    ? '<button type="button" class="month-history-resume">继续提问</button>'
                    : (window.ProgrammingResumeConversation
                        ? '<button type="button" class="month-history-resume">继续提问</button>' : "")) +
                "</div>" +
                '<div class="month-history-detail" hidden></div>';

            var roundSelect = card.querySelector(".month-history-round-select");
            if (roundSelect) {
                roundSelect.value = String(Math.max(0, Number(item.rounds || 1) - 1));
                roundSelect.addEventListener("change", function () {
                    var detail = card.querySelector(".month-history-detail");
                    if (!detail.hidden) toggleDetail(card, item, true);
                });
            }
            card.querySelector(".month-history-open").addEventListener("click", function () {
                toggleDetail(card, item);
            });
            var resume = card.querySelector(".month-history-resume");
            if (resume) resume.addEventListener("click", function () {
                var selectedRound = roundSelect ? Number(roundSelect.value) : Math.max(0, Number(item.rounds || 1) - 1);
                loadChunk(item).then(function (data) {
                    var windowData = (data.windows || {})[item.id];
                    if (!windowData) return;
                    if (window.TutorTabs && window.TutorTabs.resumeWindow) {
                        window.TutorTabs.resumeWindow(windowData, selectedRound + 1);
                        var ask = document.querySelector(".ask-panel");
                        if (ask && ask.scrollIntoView) ask.scrollIntoView({ behavior: "smooth", block: "start" });
                    } else if (window.ProgrammingResumeWindow) {
                        window.ProgrammingResumeWindow(windowData, selectedRound + 1);
                        var ask2 = document.querySelector(".ask-panel, .composer");
                        if (ask2 && ask2.scrollIntoView) ask2.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                });
            });
            var del = card.querySelector(".month-history-delete");
            if (del) del.addEventListener("click", function () {
                if (!window.confirm("删除这个对话？")) return;
                callConversationApi({ action: "delete_window", window_id: item.id }).then(refreshNow);
            });
            var delRound = card.querySelector(".month-history-delete-round");
            if (delRound) delRound.addEventListener("click", function () {
                var index = roundSelect ? Number(roundSelect.value) : Math.max(0, Number(item.rounds || 1) - 1);
                if (!window.confirm("删除第 " + (index + 1) + " 轮？")) return;
                callConversationApi({ action: "remove_round", window_id: item.id, round: index }).then(refreshNow);
            });
            list.appendChild(card);
            if (window.TutorRenderMath) window.TutorRenderMath(card);
        });
        list.style.display = "";
    }

    function loadChunk(item) {
        if (state.chunks[item.chunk]) return Promise.resolve(state.chunks[item.chunk]);
        return fetchJson(base("../历史/" + subject + "/" + state.month + "/" + item.chunk))
            .then(function (data) {
                state.chunks[item.chunk] = data;
                return data;
            });
    }

    function toggleDetail(card, item, force) {
        var detail = card.querySelector(".month-history-detail");
        if (!force && !detail.hidden) {
            detail.hidden = true;
            return;
        }
        detail.hidden = false;
        detail.innerHTML = '<p class="month-history-loading">正在读取回答...</p>';
        loadChunk(item).then(function (data) {
            var windowData = (data.windows || {})[item.id];
            if (!windowData) {
                detail.innerHTML = '<p class="month-history-error">详情不存在。</p>';
                return;
            }
            var messages = windowData.messages || [];
            var select = card.querySelector(".month-history-round-select");
            var selected = select ? Math.max(0, Number(select.value) || 0) : 0;
            var start = selected * 2;
            var user = messages[start] || {};
            var assistant = messages[start + 1] || {};
            detail.innerHTML = '<section class="month-history-round">' +
                '<div class="month-history-question"><b>问</b>' + questionHtml(user.content || "") + "</div>" +
                '<div class="month-history-answer"><b>答</b>' + answerHtml(assistant.content || "") + "</div>" +
                "</section>";
            if (window.TutorRenderMath) window.TutorRenderMath(detail);
        }).catch(function (error) {
            detail.innerHTML = '<p class="month-history-error">回答读取失败：' + escapeHtml(error.message) + "</p>";
        });
    }

    function loadMonth(month) {
        if (!month) return;
        state.month = month;
        state.monthIndex = null;
        state.chunks = {};
        list.innerHTML = '<p class="month-history-loading">正在读取 ' + escapeHtml(month) + " 索引...</p>";
        list.style.display = "";
        fetchJson(base("../历史/" + subject + "/" + month + "/index.json"))
            .then(function (data) {
                state.monthIndex = data;
                renderLanguageOptions();
                renderSummaries();
            })
            .catch(function (error) {
                renderEmpty("月份索引读取失败：" + error.message);
            });
    }

    function callConversationApi(payload) {
        var port = subject === "math" ? 8768 : (subject === "code" ? 8769 : 8767);
        var url = location.protocol + "//" + (location.hostname || "127.0.0.1") + ":" + port + "/api/conversations";
        return fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.assign({ subject: subject }, payload))
        }).then(function (response) {
            if (!response.ok) throw new Error("HTTP " + response.status);
            return response.json();
        }).catch(function (error) {
            window.alert("操作失败：" + error.message);
        });
    }

    function refreshNow() {
        if (list) init();
    }

    function init() {
        insertToolbar();
        list.innerHTML = '<p class="month-history-loading">正在读取月份索引...</p>';
        list.style.display = "";
        fetchJson(base("../历史/" + subject + "/index.json")).then(function (data) {
            state.months = (data.months || []).slice().sort(function (a, b) {
                return String(b.month).localeCompare(String(a.month));
            });
            if (!state.months.length) {
                renderEmpty("还没有历史记录。");
                return;
            }
            var now = new Date();
            var current = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
            state.month = state.months.some(function (item) { return item.month === current; })
                ? current : state.months[0].month;
            renderMonths();
            loadMonth(state.month);
        }).catch(function (error) {
            renderEmpty("月份目录读取失败：" + error.message);
        });
    }

    var refreshTimer = null;
    window.addEventListener("tutor-history-updated", function (event) {
        var updatedSubject = event && event.detail && event.detail.subject;
        if (updatedSubject && updatedSubject !== subject) return;
        if (!list) return;
        if (refreshTimer) clearTimeout(refreshTimer);
        refreshTimer = setTimeout(function () {
            refreshTimer = null;
            fetchJson(base("../历史/" + subject + "/index.json")).then(function (data) {
                state.months = (data.months || []).slice().sort(function (a, b) {
                    return String(b.month).localeCompare(String(a.month));
                });
                if (!state.months.length) {
                    renderEmpty("还没有历史记录。");
                    return;
                }
                var keep = state.month;
                state.month = state.months.some(function (item) { return item.month === keep; })
                    ? keep : state.months[0].month;
                renderMonths();
                loadMonth(state.month);
            }).catch(function () { /* 保留当前月份 */ });
        }, 350);
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
