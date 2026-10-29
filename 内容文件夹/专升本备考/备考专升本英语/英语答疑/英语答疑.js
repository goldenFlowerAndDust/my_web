(function () {
    "use strict";

    var CONNECTION_KEY = "english-tutor-connection-v1";
    var TEST_BASE = window.__TUTOR_API_BASE__ || "";
    var isGitHubPages = /\.github\.io$/i.test(window.location.hostname);

    var MODES = {
        "单词解释": {
            placeholder: "输入一个英文单词，例如 account、contribute、affect…",
            hint: "解释词义、搭配、例句、易混词和记忆方法。",
            examples: [
                "解释 account 的核心词义、常见搭配和易混词。",
                "辨析 affect 和 effect，并各给一个例句。",
                "说明 contribute 的用法和常见搭配。"
            ]
        },
        "作文": {
            placeholder: "输入作文题目或题材，例如：大学生是否应该做兼职？写 120 词…",
            hint: "会给出审题、反例、问题诊断、修改和范文。",
            examples: [
                "题目：大学生是否应该做兼职？写 120 词，并给出反例和修改。",
                "题目：Should students use AI in learning? 写 120 词，给出反例和范文。",
                "题目：My View on Online Learning，写 120 词，并指出常见失分点。"
            ]
        },
        "句子分析": {
            placeholder: "粘贴一个英文句子，例如：What matters is not how fast you read but how much you understand.",
            hint: "拆主干、修饰、从句，给翻译和可迁移仿写。",
            examples: [
                "分析：What matters is not how fast you read but how much you understand.",
                "分析：The book that you lent me last week is worth reading twice.",
                "分析：Only when we face difficulties can we grow."
            ]
        },
        "其他": {
            placeholder: "问一个语法、用法、翻译或备考问题…",
            hint: "先结论，再规则、例子和常见错误。",
            examples: [
                "虚拟语气在 if 条件句中的用法，配例句。",
                "专升本作文开头有哪些自然、不模板化的写法？",
                "说明 affect 和 effect 的用法区别。"
            ]
        }
    };

    var questionEl = document.getElementById("question");
    var askBtn = document.getElementById("ask-btn");
    var charCount = document.getElementById("char-count");
    var inputHint = document.getElementById("input-hint");
    var examplesEl = document.getElementById("examples");
    var modeTabs = Array.prototype.slice.call(document.querySelectorAll(".mode-tab"));
    var serviceBadge = document.getElementById("service-badge");
    var offlineNotice = document.getElementById("offline-notice");
    var offlineTitle = document.getElementById("offline-title");
    var offlineText = document.getElementById("offline-text");
    var answerEmpty = document.getElementById("answer-empty");
    var answerLoading = document.getElementById("answer-loading");
    var answerError = document.getElementById("answer-error");
    var answerContent = document.getElementById("answer-content");
    var answerMode = document.getElementById("answer-mode");
    var answerTime = document.getElementById("answer-time");
    var answerMeta = document.getElementById("answer-meta");
    var copyBtn = document.getElementById("copy-btn");
    var historyTabs = Array.prototype.slice.call(document.querySelectorAll(".history-tab"));
    var historyList = document.getElementById("history-list");
    var historyEmpty = document.getElementById("history-empty");
    var historyCount = document.getElementById("history-count");
    var historyRefresh = document.getElementById("history-refresh");
    var historyExport = document.getElementById("history-export");
    var historyNote = document.getElementById("history-note");
    var toastEl = document.getElementById("toast");
    var connectionBtn = document.getElementById("connection-btn");
    var connectionDialog = document.getElementById("connection-dialog");
    var connectionForm = document.getElementById("connection-form");
    var connectionClose = document.getElementById("connection-close");
    var connectionMode = document.getElementById("connection-mode");
    var cloudFields = document.getElementById("cloud-fields");
    var cloudUrl = document.getElementById("cloud-url");
    var cloudToken = document.getElementById("cloud-token");
    var connectionNote = document.getElementById("connection-note");
    var connectionTest = document.getElementById("connection-test");

    var currentMode = "单词解释";
    var currentAnswer = "";
    var historyCategory = "all";
    var historyEntries = [];
    var busy = false;
    var toastTimer = null;
    var serviceOnline = false;

    function normalizeBase(value) {
        return String(value || "").trim().replace(/\/+$/, "");
    }

    function normalizeConnection(value) {
        var mode = value && value.mode === "cloud" ? "cloud" : "local";
        return {
            mode: mode,
            cloudUrl: normalizeBase(value && value.cloudUrl),
            token: String((value && value.token) || "").trim()
        };
    }

    function defaultConnection() {
        return {
            mode: isGitHubPages ? "cloud" : "local",
            cloudUrl: "",
            token: ""
        };
    }

    function loadConnection() {
        try {
            var raw = localStorage.getItem(CONNECTION_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (parsed && (parsed.mode === "local" || parsed.mode === "cloud")) {
                    return normalizeConnection(parsed);
                }
            }
        } catch (error) {
            // localStorage 在 file:// 下也不一定可用。
        }
        return defaultConnection();
    }

    function saveConnection(value) {
        try {
            localStorage.setItem(CONNECTION_KEY, JSON.stringify(value));
        } catch (error) {
            showToast("浏览器禁止了本地存储，设置只在本次页面有效。", true);
        }
    }

    var connection = loadConnection();
    if (window.__TUTOR_CONNECTION__) {
        connection = normalizeConnection(window.__TUTOR_CONNECTION__);
    }

    function localBase() {
        if (TEST_BASE) return normalizeBase(TEST_BASE);
        if (window.location.protocol === "http:" && window.location.port === "8767") return "";
        return "http://127.0.0.1:8767";
    }

    function currentBase() {
        return connection.mode === "cloud"
            ? normalizeBase(connection.cloudUrl)
            : localBase();
    }

    function apiUrl(path) {
        var base = currentBase();
        return base ? base + path : path;
    }

    function isSecureCloudUrl(value) {
        return /^https:\/\//i.test(value) ||
            /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/i.test(value);
    }

    function cloudConfigured() {
        return connection.mode === "cloud" &&
            isSecureCloudUrl(connection.cloudUrl) &&
            connection.token.length > 0;
    }

    function connectionReady() {
        return connection.mode === "local" || cloudConfigured();
    }

    function requestHeaders(withJson) {
        var headers = {};
        if (withJson) headers["Content-Type"] = "application/json";
        if (connection.mode === "cloud" && connection.token) {
            headers["X-Tutor-Token"] = connection.token;
        }
        return headers;
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[ch];
        });
    }

    function inline(value) {
        return value
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(/`([^`]+)`/g, "<code>$1</code>")
            .replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
    }

    function renderMarkdown(markdown) {
        var lines = String(markdown).replace(/\r\n/g, "\n").split("\n");
        var html = [];
        var inCode = false;
        var listType = "";
        var paragraph = [];

        function closeList() {
            if (listType) {
                html.push("</" + listType + ">");
                listType = "";
            }
        }

        function flushParagraph() {
            if (paragraph.length) {
                html.push("<p>" + paragraph.join("<br>") + "</p>");
                paragraph = [];
            }
        }

        lines.forEach(function (line) {
            var trimmed = line.trim();

            if (inCode) {
                if (trimmed.indexOf("```") === 0) {
                    html.push("</code></pre>");
                    inCode = false;
                } else {
                    html.push(escapeHtml(line));
                }
                return;
            }

            if (trimmed.indexOf("```") === 0) {
                flushParagraph();
                closeList();
                html.push("<pre><code>");
                inCode = true;
                return;
            }

            if (!trimmed) {
                flushParagraph();
                closeList();
                return;
            }

            if (/^---+$/.test(trimmed)) {
                flushParagraph();
                closeList();
                html.push("<hr>");
                return;
            }

            var heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
            if (heading) {
                flushParagraph();
                closeList();
                var level = heading[1].length <= 2 ? 2 : heading[1].length;
                html.push("<h" + level + ">" + inline(escapeHtml(heading[2])) + "</h" + level + ">");
                return;
            }

            if (/^>\s?/.test(trimmed)) {
                flushParagraph();
                closeList();
                html.push("<blockquote>" + inline(escapeHtml(trimmed.replace(/^>\s?/, ""))) + "</blockquote>");
                return;
            }

            var bullet = trimmed.match(/^[-*]\s+(.*)$/);
            if (bullet) {
                flushParagraph();
                if (listType !== "ul") {
                    closeList();
                    html.push("<ul>");
                    listType = "ul";
                }
                html.push("<li>" + inline(escapeHtml(bullet[1])) + "</li>");
                return;
            }

            var numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);
            if (numbered) {
                flushParagraph();
                if (listType !== "ol") {
                    closeList();
                    html.push("<ol>");
                    listType = "ol";
                }
                html.push("<li>" + inline(escapeHtml(numbered[1])) + "</li>");
                return;
            }

            closeList();
            paragraph.push(inline(escapeHtml(trimmed)));
        });

        flushParagraph();
        closeList();
        if (inCode) {
            html.push("</code></pre>");
        }
        return html.join("\n");
    }

    function updateCharCount() {
        var len = questionEl.value.length;
        charCount.textContent = len + " / 2000";
        charCount.style.color = len >= 2000 ? "var(--red)" : "";
    }

    function renderExamples() {
        var config = MODES[currentMode];
        inputHint.textContent = config.hint;
        questionEl.placeholder = config.placeholder;
        examplesEl.innerHTML = "";
        config.examples.forEach(function (example) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "example-chip";
            button.textContent = example;
            button.title = example;
            button.addEventListener("click", function () {
                questionEl.value = example;
                updateCharCount();
                questionEl.focus();
            });
            examplesEl.appendChild(button);
        });
    }

    function setMode(mode) {
        if (!MODES[mode]) return;
        currentMode = mode;
        modeTabs.forEach(function (tab) {
            var active = tab.dataset.mode === mode;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", active ? "true" : "false");
        });
        renderExamples();
        answerMode.textContent = mode;
    }

    function showToast(message, error) {
        if (toastTimer) clearTimeout(toastTimer);
        toastEl.textContent = message;
        toastEl.className = "toast is-visible" + (error ? " is-error" : "");
        toastTimer = setTimeout(function () {
            toastEl.className = "toast";
        }, 3000);
    }

    function setBusy(value) {
        busy = value;
        askBtn.disabled = value;
        var label = askBtn.querySelector(".btn-label");
        if (label) label.textContent = value ? "老师思考中…" : "请教老师";
    }

    function setService(reachable, text, kind) {
        serviceOnline = reachable;
        serviceBadge.textContent = text;
        serviceBadge.className = "service-badge " + (kind || (reachable ? "is-on" : "is-off"));
        offlineNotice.hidden = reachable;
    }

    function showOffline(kind) {
        if (kind === "cloud-config") {
            offlineTitle.textContent = "云端还没有配置。";
            offlineText.innerHTML = "点“连接设置”，填 Worker 地址和访问口令。GitHub Pages 只能通过云端 Worker 调用 AI；本地 8767 在线上不可用。";
        } else if (kind === "cloud-error") {
            offlineTitle.textContent = "云端连接失败。";
            offlineText.innerHTML = "检查 Worker 地址是否完整、Worker 是否已部署、网络是否正常；然后到“连接设置”里重新保存。";
        } else {
            offlineTitle.textContent = "本地服务没有连接。";
            offlineText.innerHTML = "先双击项目根目录的 <code>启动词素服务.bat</code>，再刷新本页。也可以点“连接设置”切到云端 Worker。";
        }
    }

    function updateHistoryNote() {
        if (connection.mode === "cloud") {
            historyNote.innerHTML = "日志存放：Cloudflare Worker 的 <code>TUTOR_KV</code>，按分类保存；“访问口令”只保存在当前浏览器 localStorage，不写进网页源码。";
        } else {
            historyNote.innerHTML = "日志位置：<code>词素工具/英语问答日志/单词解释.jsonl</code>、<code>作文.jsonl</code>、<code>句子分析.jsonl</code>、<code>其他.jsonl</code>。已加入 <code>.gitignore</code>，不会上传 GitHub。";
        }
    }

    function fetchWithTimeout(url, options, timeoutMs) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
        options = options || {};
        options.signal = controller.signal;
        return fetch(url, options).finally(function () {
            clearTimeout(timer);
        });
    }

    async function checkService() {
        if (connection.mode === "cloud" && !cloudConfigured()) {
            showOffline("cloud-config");
            setService(false, "云端未配置", "is-warn");
            return;
        }

        try {
            var resp = await fetchWithTimeout(apiUrl("/api/health"), { cache: "no-store" }, 8000);
            var data = await resp.json();
            if (!resp.ok || !data.ok) throw new Error("健康检查失败");

            if (connection.mode === "cloud") {
                if (data.has_key === false) {
                    setService(true, "云端已连接 · 缺少 Key", "is-warn");
                    return;
                }
                if (data.kv_bound === false) {
                    setService(true, "云端已连接 · KV 未绑定", "is-warn");
                    return;
                }
                setService(true, "云端已连接 · " + (data.model || "deepseek-chat"), "is-on");
                return;
            }

            if (data.api_key === false) {
                setService(true, "本地已连接 · 缺少 API Key", "is-warn");
                return;
            }
            setService(true, "本地已连接 · " + (data.model || "deepseek-chat"), "is-on");
        } catch (error) {
            if (connection.mode === "cloud") {
                showOffline("cloud-error");
                setService(false, "云端未连接", "is-off");
            } else {
                showOffline("local");
                setService(false, "本地服务未连接", "is-off");
            }
        }
    }

    function showAnswerState(state) {
        answerEmpty.hidden = state !== "empty";
        answerLoading.hidden = state !== "loading";
        answerError.hidden = state !== "error";
        answerContent.hidden = state !== "content";
    }

    function errorMarkup(message) {
        var text = String(message || "未知错误");
        var hint = "";
        if (/401|口令/i.test(text)) {
            hint = "<br>点页面顶部的“连接设置”，检查访问口令是否和 Worker 的 <code>TUTOR_ACCESS_TOKEN</code> 一致。";
        } else if (/404|未知接口/i.test(text)) {
            hint = connection.mode === "cloud"
                ? "<br>Worker 路由可能不完整，确认 Worker 已部署最新代码。"
                : "<br>当前 8767 服务可能还是旧版本。关闭服务窗口，重新双击 <code>启动词素服务.bat</code> 后再试。";
        } else if (/Failed to fetch|NetworkError|无法连接/i.test(text)) {
            hint = connection.mode === "cloud"
                ? "<br>检查 Worker 地址、Cloudflare 部署和网络；也可以点“连接设置”测试连接。"
                : "<br>请先双击项目根目录的 <code>启动词素服务.bat</code>，再重试。";
        } else if (/429|太快/i.test(text)) {
            hint = "<br>云端已限流，请等一分钟再问。";
        }
        return "<strong>没有拿到回答</strong>" + escapeHtml(text) + hint;
    }

    async function submitQuestion() {
        if (busy) return;
        if (!connectionReady()) {
            showToast("先配置云端 Worker 地址和访问口令。", true);
            openConnectionDialog();
            return;
        }

        var question = questionEl.value.trim();
        if (!question) {
            showToast("先输入一个问题。", true);
            questionEl.focus();
            return;
        }
        if (question.length > 2000) {
            showToast("问题太长了，请控制在 2000 字以内。", true);
            return;
        }

        setBusy(true);
        currentAnswer = "";
        copyBtn.disabled = true;
        answerMode.textContent = currentMode;
        answerTime.textContent = "—";
        answerMeta.textContent = connection.mode === "cloud"
            ? "云端老师正在回答，完成后会写入对应分类的 KV 日志。"
            : "本地老师正在回答，完成后会写入对应分类的日志。";
        showAnswerState("loading");

        try {
            var resp = await fetchWithTimeout(
                apiUrl("/api/tutor"),
                {
                    method: "POST",
                    headers: requestHeaders(true),
                    body: JSON.stringify({ mode: currentMode, question: question })
                },
                125000
            );
            var data = await resp.json().catch(function () { return null; });
            if (!resp.ok || !data || !data.ok) {
                throw new Error((data && data.error) || ("HTTP " + resp.status));
            }

            currentAnswer = data.answer || "";
            answerContent.innerHTML = renderMarkdown(currentAnswer);
            answerContent.hidden = false;
            answerEmpty.hidden = true;
            answerLoading.hidden = true;
            answerError.hidden = true;
            answerMode.textContent = data.mode || currentMode;
            answerTime.textContent = data.time || "";
            var logWhere = connection.mode === "cloud" ? "已写入云端 KV" : "已写入对应分类日志";
            answerMeta.textContent = data.logged
                ? logWhere + " · " + (data.model || "deepseek-chat")
                : "回答已生成，但日志写入失败：" + (data.warning || "请检查配置");
            copyBtn.disabled = !currentAnswer;
            showToast(data.logged ? "回答完成，已写入日志。" : "回答完成，但日志未写入。", !data.logged);
            if (window.innerWidth < 940) {
                document.querySelector(".answer-panel").scrollIntoView({ behavior: "smooth", block: "start" });
            }
            await loadHistory(historyCategory);
        } catch (error) {
            showAnswerState("error");
            answerError.innerHTML = errorMarkup(error && error.message ? error.message : error);
            answerMeta.textContent = "回答失败，未写入日志。";
            answerTime.textContent = "—";
            showToast("回答失败，请看右侧提示。", true);
        } finally {
            setBusy(false);
        }
    }

    async function copyAnswer() {
        if (!currentAnswer) return;
        try {
            await navigator.clipboard.writeText(currentAnswer);
            showToast("回答已复制。");
        } catch (error) {
            var area = document.createElement("textarea");
            area.value = currentAnswer;
            area.style.position = "fixed";
            area.style.opacity = "0";
            document.body.appendChild(area);
            area.select();
            try {
                document.execCommand("copy");
                showToast("回答已复制。");
            } catch (copyError) {
                showToast("复制失败，请手动选择文本。", true);
            }
            document.body.removeChild(area);
        }
    }

    function truncate(value, length) {
        var text = String(value || "").replace(/\s+/g, " ").trim();
        return text.length > length ? text.slice(0, length) + "…" : text;
    }

    function renderHistory() {
        historyList.innerHTML = "";
        if (!historyEntries.length) {
            historyEmpty.hidden = false;
            historyEmpty.textContent = "还没有记录。问第一个问题后，这里会自动出现。";
            historyCount.textContent = "0 条";
            return;
        }
        historyEmpty.hidden = true;
        historyCount.textContent = historyEntries.length + " 条";
        historyEntries.forEach(function (entry, index) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "history-item";
            button.dataset.index = String(index);
            var mode = entry.mode || "其他";
            var time = entry.time || "";
            var question = truncate(entry.question || "", 68);
            var answer = truncate(String(entry.answer || "").replace(/[#*`>]/g, ""), 80);
            button.innerHTML =
                '<span class="history-item-top">' +
                '<span class="history-mode">' + escapeHtml(mode) + "</span>" +
                '<span class="history-time">' + escapeHtml(time) + "</span>" +
                "</span>" +
                '<span class="history-question">' + escapeHtml(question) + "</span>" +
                '<span class="history-preview">' + escapeHtml(answer) + "</span>";
            button.addEventListener("click", function () {
                loadHistoryEntry(index);
            });
            historyList.appendChild(button);
        });
    }

    function loadHistoryEntry(index) {
        var entry = historyEntries[index];
        if (!entry) return;
        setMode(entry.mode || "其他");
        questionEl.value = entry.question || "";
        updateCharCount();
        currentAnswer = entry.answer || "";
        answerContent.innerHTML = renderMarkdown(currentAnswer);
        answerMode.textContent = entry.mode || "其他";
        answerTime.textContent = entry.time || "";
        answerMeta.textContent = connection.mode === "cloud"
            ? "来自云端历史 · KV"
            : "来自历史记录 · 已写入对应分类日志";
        copyBtn.disabled = !currentAnswer;
        showAnswerState(currentAnswer ? "content" : "empty");
        document.querySelector(".answer-panel").scrollIntoView({ behavior: "smooth", block: "start" });
        showToast("已载入历史记录。");
    }

    async function exportHistory() {
        if (!connectionReady()) {
            showToast("先配置云端 Worker 地址和访问口令。", true);
            openConnectionDialog();
            return;
        }

        var categories = ["单词解释", "作文", "句子分析", "其他"];
        historyExport.disabled = true;
        showToast("正在导出记录…");
        try {
            var all = [];
            for (var i = 0; i < categories.length; i += 1) {
                var category = categories[i];
                var url = apiUrl("/api/tutor-log?category=" +
                    encodeURIComponent(category) + "&limit=50");
                var resp = await fetchWithTimeout(url, {
                    cache: "no-store",
                    headers: requestHeaders(false)
                }, 15000);
                var data = await resp.json().catch(function () { return null; });
                if (!resp.ok || !data || !data.ok) {
                    throw new Error((data && data.error) || ("HTTP " + resp.status));
                }
                if (Array.isArray(data.entries)) {
                    all = all.concat(data.entries);
                }
            }

            var seen = {};
            var entries = all.filter(function (entry) {
                var key = String(entry.time || "") + "|" +
                    String(entry.mode || "") + "|" +
                    String(entry.question || "");
                if (seen[key]) return false;
                seen[key] = true;
                return !!entry.answer;
            }).sort(function (a, b) {
                return String(b.time || "").localeCompare(String(a.time || ""));
            });

            if (!entries.length) {
                showToast("当前没有可导出的记录。", true);
                return;
            }

            var now = new Date();
            var stamp = now.getFullYear() + "-" +
                String(now.getMonth() + 1).padStart(2, "0") + "-" +
                String(now.getDate()).padStart(2, "0") + "-" +
                String(now.getHours()).padStart(2, "0") +
                String(now.getMinutes()).padStart(2, "0");
            var payload = {
                exported_at: now.toISOString(),
                source: connection.mode === "cloud" ? "cloudflare-kv" : "local-jsonl",
                count: entries.length,
                entries: entries
            };
            var blob = new Blob([JSON.stringify(payload, null, 2)], {
                type: "application/json;charset=utf-8"
            });
            var objectUrl = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.href = objectUrl;
            link.download = "英语答疑记录-" + stamp + ".json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(function () {
                URL.revokeObjectURL(objectUrl);
            }, 1000);
            showToast("已导出 " + entries.length + " 条记录。");
        } catch (error) {
            showToast("导出失败：" + (error.message || "未知错误"), true);
        } finally {
            historyExport.disabled = false;
        }
    }

    async function loadHistory(category) {
        historyCategory = category || "all";
        historyTabs.forEach(function (tab) {
            var active = tab.dataset.category === historyCategory;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", active ? "true" : "false");
        });

        if (!connectionReady()) {
            historyEntries = [];
            historyList.innerHTML = "";
            historyEmpty.hidden = false;
            historyEmpty.textContent = "云端未配置。点“连接设置”填 Worker 地址和访问口令。";
            historyCount.textContent = "—";
            return;
        }

        historyEmpty.hidden = true;
        try {
            var url = apiUrl("/api/tutor-log?category=" +
                encodeURIComponent(historyCategory) + "&limit=20");
            var resp = await fetchWithTimeout(url, {
                cache: "no-store",
                headers: requestHeaders(false)
            }, 12000);
            var data = await resp.json();
            if (!resp.ok || !data.ok) throw new Error((data && data.error) || ("HTTP " + resp.status));
            historyEntries = Array.isArray(data.entries) ? data.entries : [];
            renderHistory();
        } catch (error) {
            historyEntries = [];
            historyList.innerHTML = "";
            historyEmpty.hidden = false;
            if (error.message && /401|口令/.test(error.message)) {
                historyEmpty.textContent = "读取日志失败：访问口令不正确。点“连接设置”检查。";
            } else if (connection.mode === "cloud") {
                historyEmpty.textContent = "读取云端日志失败：" + (error.message || "未知错误") +
                    "。如果刚部署，刷新页面或检查 Worker。";
            } else {
                historyEmpty.textContent = "读取日志失败：" + (error.message || "未知错误") +
                    "。如果服务刚更新过，请重启 8767 服务。";
            }
            historyCount.textContent = "—";
        }
    }

    function toggleCloudFields() {
        cloudFields.hidden = connectionMode.value !== "cloud";
    }

    function openConnectionDialog() {
        connectionMode.value = connection.mode;
        cloudUrl.value = connection.cloudUrl;
        cloudToken.value = connection.token;
        toggleCloudFields();
        connectionNote.textContent = connection.mode === "cloud"
            ? "云端模式：需要 Worker 地址和访问口令。口令只保存在本浏览器。"
            : "本地模式：需要先启动 8767 服务。只想在电脑上用，选这个最省事。";
        connectionNote.className = "connection-note";
        if (!connectionDialog.open) connectionDialog.showModal();
    }

    function readConnectionForm() {
        return normalizeConnection({
            mode: connectionMode.value,
            cloudUrl: cloudUrl.value,
            token: cloudToken.value
        });
    }

    function validateConnectionForm(value) {
        if (value.mode !== "cloud") return "";
        if (!value.cloudUrl) return "请填 Worker 地址。";
        if (!isSecureCloudUrl(value.cloudUrl)) {
            return "Worker 地址必须是 https://…；本地测试可用 http://127.0.0.1:端口。";
        }
        if (value.token.length < 8) {
            return "访问口令至少 8 位；建议使用 24 位以上随机字符串。";
        }
        return "";
    }

    async function testConnectionFromDialog() {
        var value = readConnectionForm();
        var error = validateConnectionForm(value);
        if (error) {
            connectionNote.textContent = error;
            connectionNote.className = "connection-note is-error";
            return;
        }
        var base = value.mode === "cloud" ? value.cloudUrl : localBase();
        var url = (base ? base : "") + "/api/health";
        connectionNote.textContent = "正在测试连接…";
        connectionNote.className = "connection-note";
        try {
            var resp = await fetchWithTimeout(url, { cache: "no-store" }, 8000);
            var data = await resp.json();
            if (!resp.ok || !data.ok) throw new Error("健康检查失败");

            if (value.mode === "cloud") {
                var logUrl = (base ? base : "") + "/api/tutor-log?category=all&limit=1";
                var logResp = await fetchWithTimeout(logUrl, {
                    cache: "no-store",
                    headers: { "X-Tutor-Token": value.token }
                }, 8000);
                var logData = await logResp.json().catch(function () { return null; });
                if (!logResp.ok || !logData || !logData.ok) {
                    throw new Error((logData && logData.error) || "访问口令校验失败");
                }
            }

            connectionNote.textContent = "连接正常" +
                (data.has_key === false || data.api_key === false ? "，但缺少 API Key。" : "。") +
                (data.kv_bound === false ? " KV 未绑定。" : "");
            connectionNote.className = "connection-note is-ok";
        } catch (error) {
            connectionNote.textContent = "连接失败：" + (error.message || "未知错误");
            connectionNote.className = "connection-note is-error";
        }
    }

    function saveConnectionFromDialog(event) {
        event.preventDefault();
        var value = readConnectionForm();
        var error = validateConnectionForm(value);
        if (error) {
            connectionNote.textContent = error;
            connectionNote.className = "connection-note is-error";
            return;
        }
        connection = value;
        saveConnection(value);
        connectionDialog.close();
        updateHistoryNote();
        showToast(value.mode === "cloud" ? "已切换到云端 Worker。" : "已切换到本地服务。");
        checkService();
        loadHistory(historyCategory);
    }

    modeTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            setMode(tab.dataset.mode);
        });
    });

    questionEl.addEventListener("input", updateCharCount);
    questionEl.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            submitQuestion();
        }
    });

    askBtn.addEventListener("click", submitQuestion);
    copyBtn.addEventListener("click", copyAnswer);
    historyRefresh.addEventListener("click", function () {
        loadHistory(historyCategory);
    });
    historyExport.addEventListener("click", exportHistory);
    historyTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            loadHistory(tab.dataset.category || "all");
        });
    });

    connectionBtn.addEventListener("click", openConnectionDialog);
    connectionClose.addEventListener("click", function () {
        connectionDialog.close();
    });
    connectionMode.addEventListener("change", toggleCloudFields);
    connectionTest.addEventListener("click", testConnectionFromDialog);
    connectionForm.addEventListener("submit", saveConnectionFromDialog);
    connectionDialog.addEventListener("close", function () {
        connectionNote.className = "connection-note";
    });

    setMode(currentMode);
    updateCharCount();
    showAnswerState("empty");
    updateHistoryNote();
    checkService();
    loadHistory("all");
})();
