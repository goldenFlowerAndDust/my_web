(function () {
    "use strict";

    // 只读静态月索引：先加载目录，再加载当月摘要；详情点击后才请求 chunk。
    var sourceList = document.getElementById("history-list") || document.getElementById("historyList");
    if (!sourceList) return;
    var list = null;
    var subject = document.body.getAttribute("data-history-subject") || "";
    if (!subject) {
        var path = decodeURIComponent(location.pathname);
        subject = /数学答疑/.test(path) ? "math" : (/编程语言AI/.test(path) ? "code" : "english");
    }

    var state = {
        months: [],
        month: "",
        monthIndex: null,
        chunks: {},
        cards: [],
        selectedId: "",
        loading: false
    };

    function base(relative) {
        return new URL(relative, location.href).toString();
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

        var toolbar = document.createElement("div");
        toolbar.id = "month-history-toolbar";
        toolbar.className = "month-history-toolbar";
        toolbar.innerHTML =
            '<label class="month-history-label">月份' +
            '<select id="month-history-select" aria-label="选择历史月份"></select></label>' +
            '<span id="month-history-count" class="month-history-count"></span>' +
            '<span id="month-history-note" class="month-history-note">先读月份索引，点开对话再读回答</span>';
        panel.insertBefore(toolbar, sourceList);

        var select = document.getElementById("month-history-select");
        select.addEventListener("change", function () {
            loadMonth(select.value);
        });
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

    function renderSummaries() {
        list.innerHTML = "";
        var windows = (state.monthIndex && state.monthIndex.windows) || [];
        document.getElementById("month-history-count").textContent =
            state.month + " · " + windows.length + " 个对话";
        if (!windows.length) {
            renderEmpty("这个月还没有历史记录。");
            return;
        }
        windows.forEach(function (item) {
            var card = document.createElement("article");
            card.className = "month-history-card";
            card.setAttribute("data-window-id", item.id);
            card.innerHTML =
                '<div class="month-history-card-head">' +
                '<span class="month-history-card-title">' + escapeHtml(item.title || "（无问题）") + "</span>" +
                '<span class="month-history-card-meta">' + escapeHtml(item.updated_at || item.created_at || "") +
                " · " + Number(item.rounds || 0) + " 轮</span>" +
                "</div>" +
                '<div class="month-history-card-actions">' +
                '<button type="button" class="month-history-open">查看回答</button>' +
                (window.TutorTabs && window.TutorTabs.resumeConversation
                    ? '<button type="button" class="month-history-resume">继续提问</button>'
                    : (window.ProgrammingResumeConversation
                        ? '<button type="button" class="month-history-resume">继续提问</button>' : "")) +
                "</div>" +
                '<div class="month-history-detail" hidden></div>';

            card.querySelector(".month-history-open").addEventListener("click", function () {
                toggleDetail(card, item);
            });
            var resume = card.querySelector(".month-history-resume");
            if (resume) resume.addEventListener("click", function () {
                if (window.TutorTabs && window.TutorTabs.resumeConversation) {
                    window.TutorTabs.resumeConversation(item.id, Number(item.rounds || 1));
                } else if (window.ProgrammingResumeConversation) {
                    window.ProgrammingResumeConversation(item.id, Number(item.rounds || 1));
                }
            });
            list.appendChild(card);
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

    function toggleDetail(card, item) {
        var detail = card.querySelector(".month-history-detail");
        if (!detail.hidden) {
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
            var html = "";
            for (var i = 0; i < messages.length; i += 2) {
                var user = messages[i] || {};
                var assistant = messages[i + 1] || {};
                html += '<section class="month-history-round">' +
                    '<div class="month-history-question"><b>问</b>' + questionHtml(user.content || "") + "</div>" +
                    '<div class="month-history-answer"><b>答</b>' + answerHtml(assistant.content || "") + "</div>" +
                    "</section>";
            }
            detail.innerHTML = html || '<p class="month-history-empty">这一轮没有内容。</p>';
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
                renderSummaries();
            })
            .catch(function (error) {
                renderEmpty("月份索引读取失败：" + error.message);
            });
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
