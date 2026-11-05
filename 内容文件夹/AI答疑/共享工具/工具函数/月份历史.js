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
        section.id = "ai-history";
        section.innerHTML = '<div class="month-history-head"><p class="month-history-kicker">AI HISTORY</p>' +
            "<h2>AI 历史记录</h2><p>按月份和日期查看历史问答，点击后才加载完整回答。</p></div>";
        if (isDarkTheme()) section.classList.add("month-history-dark");
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

    function isDarkTheme() {
        if (document.documentElement.dataset.theme === "dark") return true;
        try {
            var bg = getComputedStyle(document.body).backgroundColor || "";
            var match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
                var luminance = 0.299 * Number(match[1]) + 0.587 * Number(match[2]) + 0.114 * Number(match[3]);
                return luminance < 95;
            }
        } catch (error) { /* ignore */ }
        return false;
    }
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
        return simpleMarkdown(text);
    }

    function simpleMarkdown(markdown) {
        var source = String(markdown || "").replace(/\r\n/g, "\n");
        var codeBlocks = [];
        source = source.replace(/```[A-Za-z0-9_+-]*\n([\s\S]*?)```/g, function (_, code) {
            codeBlocks.push("<pre><code>" + escapeHtml(code.replace(/\n$/, "")) + "</code></pre>");
            return "\n@@HISTORY_CODE_" + (codeBlocks.length - 1) + "@@\n";
        });
        var mathBlocks = [];
        source = source.replace(/\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g, function (match) {
            mathBlocks.push(match);
            return "\n@@HISTORY_MATH_" + (mathBlocks.length - 1) + "@@\n";
        });
        source = escapeHtml(source);
        source = source.replace(/`([^`\n]+)`/g, "<code>$1</code>");
        source = source.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
        var lines = source.split("\n");
        var out = [];
        var list = "";
        var paragraph = [];
        function flushParagraph() {
            if (paragraph.length) {
                out.push("<p>" + paragraph.join("<br>") + "</p>");
                paragraph = [];
            }
        }
        function closeList() {
            if (list) { out.push("</" + list + ">"); list = ""; }
        }
        lines.forEach(function (line) {
            var textLine = line.trim();
            var code = textLine.match(/^@@HISTORY_CODE_(\d+)@@$/);
            if (code) {
                flushParagraph(); closeList();
                out.push(codeBlocks[Number(code[1])] || "");
                return;
            }
            if (!textLine) { flushParagraph(); closeList(); return; }
            var mathBlock = textLine.match(/^@@HISTORY_MATH_(\d+)@@$/);
            if (mathBlock) {
                flushParagraph(); closeList();
                out.push('<div class="history-math-raw">' + escapeHtml(mathBlocks[Number(mathBlock[1])] || "") + "</div>");
                return;
            }
            var heading = textLine.match(/^(#{1,4})\s+(.*)$/);
            if (heading) {
                flushParagraph(); closeList();
                var level = heading[1].length <= 2 ? 2 : heading[1].length;
                out.push("<h" + level + ">" + heading[2] + "</h" + level + ">");
                return;
            }
            var bullet = textLine.match(/^[-*]\s+(.*)$/);
            if (bullet) {
                flushParagraph();
                if (list !== "ul") { closeList(); out.push("<ul>"); list = "ul"; }
                out.push("<li>" + bullet[1] + "</li>");
                return;
            }
            var numbered = textLine.match(/^\d+[.)]\s+(.*)$/);
            if (numbered) {
                flushParagraph();
                if (list !== "ol") { closeList(); out.push("<ol>"); list = "ol"; }
                out.push("<li>" + numbered[1] + "</li>");
                return;
            }
            paragraph.push(textLine);
        });
        flushParagraph(); closeList();
        return out.join("");
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
        if (isDarkTheme()) panel.classList.add("month-history-dark");
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
        document.querySelectorAll(".history-query, .history-actions").forEach(function (node) {
            node.style.display = "none";
        });
        ["historySearch", "historyDate", "exportHistory", "refreshHistory", "historyCount", "historyDateLabel"].forEach(function (id) {
            var node = document.getElementById(id);
            if (node) node.style.display = "none";
        });
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
        function metaText(item, roundIndex) {
            var hasRound = Array.isArray(item.round_tokens) && item.round_tokens.length > roundIndex;
            var tokens = hasRound ? Number(item.round_tokens[roundIndex] || 0) : Number(item.tokens || 0);
            var costText = Array.isArray(item.round_cost_texts) && item.round_cost_texts.length > roundIndex
                ? item.round_cost_texts[roundIndex]
                : (item.cost_text || "");
            var tokenText = tokens > 0 ? tokens.toLocaleString("zh-CN") + " tokens · " : "";
            var moneyText = costText ? costText + " · " : "";
            return tokenText + moneyText + (item.updated_at || item.created_at || "") + " · " + Number(item.rounds || 0) + " 轮";
        }

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
            var initialRound = Math.max(0, Number(item.rounds || 1) - 1);
            var initialQuestion = (Array.isArray(item.questions) && item.questions[initialRound]) || item.title || "（无问题）";
            card.innerHTML =
                '<div class="month-history-card-head">' +
                '<span class="month-history-card-title">' + questionHtml(initialQuestion) + "</span>" +
                '<span class="month-history-card-meta">' + escapeHtml(metaText(item, initialRound)) + "</span>" +
                "</div>" +
                '<div class="month-history-card-actions">' +
                (Number(item.rounds || 0) > 0
                    ? '<select class="month-history-round-select" aria-label="选择这个对话的轮次">' +
                      Array.from({ length: Number(item.rounds || 0) }, function (_, i) {
                          return '<option value="' + i + '">第' + (i + 1) + '轮</option>';
                      }).join("") + "</select>"
                    : "") +
                '<button type="button" class="month-history-open">查看回答</button>' +
                '<button type="button" class="month-history-cost" title="显示当前对话花费的 token 以及对应 RMB">显示花费</button>' +
                '<button type="button" class="month-history-delete-round">删除本轮</button>' +
                '<button type="button" class="month-history-delete">删除对话</button>' +
                (window.TutorTabs && window.TutorTabs.resumeConversation
                    ? '<button type="button" class="month-history-resume">继续提问</button>'
                    : (window.ProgrammingResumeConversation
                        ? '<button type="button" class="month-history-resume">继续提问</button>' : "")) +
                "</div>" +
                '<div class="month-history-cost-panel" hidden></div>' +
                '<div class="month-history-detail" hidden></div>';

            var roundSelect = card.querySelector(".month-history-round-select");
            if (roundSelect) {
                roundSelect.value = String(initialRound);
                roundSelect.addEventListener("change", function () {
                    var selected = Number(roundSelect.value) || 0;
                    var title = card.querySelector(".month-history-card-title");
                    var text = (Array.isArray(item.questions) && item.questions[selected]) || item.title || "（无问题）";
                    if (title) {
                        title.innerHTML = questionHtml(text);
                        if (window.TutorRenderMath) window.TutorRenderMath(title);
                    }
                    var meta = card.querySelector(".month-history-card-meta");
                    if (meta) meta.textContent = metaText(item, selected);
                    var detail = card.querySelector(".month-history-detail");
                    if (!detail.hidden) toggleDetail(card, item, true);
                });
            }
            card.querySelector(".month-history-open").addEventListener("click", function () {
                toggleDetail(card, item);
            });
            var costButton = card.querySelector(".month-history-cost");
            var costPanel = card.querySelector(".month-history-cost-panel");
            if (costButton && costPanel) {
                var costSummary = Number(item.tokens || 0) > 0
                    ? "当前对话共 " + Number(item.tokens).toLocaleString("zh-CN") + " tokens · " + (item.cost_text || "≈RMB 0.000000")
                    : "当前对话暂无 token 记录";
                costPanel.textContent = costSummary;
                costButton.addEventListener("click", function () {
                    var show = costPanel.hidden;
                    costPanel.hidden = !show;
                    costButton.textContent = show ? "隐藏花费" : "显示花费";
                });
            }
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
