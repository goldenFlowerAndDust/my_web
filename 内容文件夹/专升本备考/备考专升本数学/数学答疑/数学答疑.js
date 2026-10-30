/* 数学答疑 · 本地/云端双线路 + LaTeX 渲染 + 分类历史 */
(function () {
    "use strict";

    var CONNECTION_KEY = "math-tutor-connection-v1";
    var LOCAL_PORT = 8768;
    var SUBJECT = "math";
    var isGitHubPages = /\.github\.io$/i.test(window.location.hostname);

    var connectionBtn = document.getElementById("connection-btn");
    var connectionDialog = document.getElementById("connection-dialog");
    var connectionForm = document.getElementById("connection-form");
    var connectionClose = document.getElementById("connection-close");
    var connectionMode = document.getElementById("connection-mode");
    var cloudFields = document.getElementById("cloud-fields");
    var cloudProvider = document.getElementById("cloud-provider");
    var cloudUrl = document.getElementById("cloud-url");
    var cloudToken = document.getElementById("cloud-token");
    var connectionNote = document.getElementById("connection-note");
    var connectionTest = document.getElementById("connection-test");

    var serviceBadge = document.getElementById("service-badge");
    var offlineNotice = document.getElementById("offline-notice");
    var offlineTitle = document.getElementById("offline-title");
    var offlineText = document.getElementById("offline-text");

    var modeTabs = Array.prototype.slice.call(document.querySelectorAll(".mode-tab"));
    var questionEl = document.getElementById("question");
    var charCount = document.getElementById("char-count");
    var inputHint = document.getElementById("input-hint");
    var examplesEl = document.getElementById("examples");
    var askBtn = document.getElementById("ask-btn");

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
    var historyNote = document.getElementById("history-note");
    var historyRefresh = document.getElementById("history-refresh");
    var historyExport = document.getElementById("history-export");
    var toastEl = document.getElementById("toast");

    var currentMode = "题目讲解";
    var currentAnswer = "";
    var historyCategory = "all";
    var historyEntries = [];
    var busy = false;
    var toastTimer = null;
    var dialogProfiles = emptyProfiles();
    var dialogProvider = "cloudflare";

    var MODE_HINTS = {
        "题目讲解": "例如：求极限 $\\lim_{x\\to 0}\\frac{\\sin x}{x}$，并说明每一步依据。",
        "错题诊断": "粘贴你的错误解法和答案，老师会先找第一处错误。",
        "概念公式": "例如：洛必达法则的适用条件是什么？",
        "其他": "例如：高数错题应该怎么整理？"
    };

    var EXAMPLES = {
        "题目讲解": [
            ["极限", "求 $\\lim_{x\\to 0}\\frac{\\sin x}{x}$，并说明每一步依据。"],
            ["导数", "求 $y=x^2\\ln x$ 的导数，写出使用的求导法则。"],
            ["积分", "求 $\\int_0^1 x e^x dx$，写出分部积分过程。"]
        ],
        "错题诊断": [
            ["极限错题", "我的解法：$\\lim_{x\\to 0}\\frac{\\sin x}{x}=\\frac{0}{0}=1$。这样写错在哪？"],
            ["导数错题", "我把 $(x^2\\ln x)'=2x\\cdot\\frac1x$，为什么不对？"],
            ["积分错题", "我算 $\\int \\frac1x dx=\\ln|x|+C$，但漏了什么条件？"]
        ],
        "概念公式": [
            ["洛必达", "洛必达法则的适用条件是什么？什么时候不能用？"],
            ["等价无穷小", "常用等价无穷小有哪些？替换时要注意什么？"],
            ["中值定理", "拉格朗日中值定理和罗尔定理有什么区别？"]
        ],
        "其他": [
            ["错题整理", "高数错题本应该怎么整理才有效？"],
            ["复习顺序", "极限、导数、积分应该按什么顺序复习？"],
            ["计算习惯", "怎样减少高数计算中的低级错误？"]
        ]
    };

    function normalizeBase(value) {
        return String(value || "").trim().replace(/\/+$/, "");
    }

    function emptyProfiles() {
        return {
            cloudflare: { url: "", token: "" },
            domestic: { url: "", token: "" }
        };
    }

    function normalizeProfile(value) {
        return {
            url: normalizeBase(value && value.url),
            token: String((value && value.token) || "").trim()
        };
    }

    function normalizeConnection(value) {
        var mode = value && value.mode === "cloud" ? "cloud" : "local";
        var provider = value && value.provider === "domestic" ? "domestic" : "cloudflare";
        var profiles = emptyProfiles();
        if (value && value.profiles && typeof value.profiles === "object") {
            profiles.cloudflare = normalizeProfile(value.profiles.cloudflare);
            profiles.domestic = normalizeProfile(value.profiles.domestic);
        } else if (value && (value.cloudUrl || value.token)) {
            profiles.cloudflare = normalizeProfile({
                url: value.cloudUrl,
                token: value.token
            });
        }
        return { mode: mode, provider: provider, profiles: profiles };
    }

    function defaultConnection() {
        return {
            mode: isGitHubPages ? "cloud" : "local",
            provider: "cloudflare",
            profiles: emptyProfiles()
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
            // localStorage 可能被浏览器禁用。
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
    if (window.__MATH_TUTOR_CONNECTION__) {
        connection = normalizeConnection(window.__MATH_TUTOR_CONNECTION__);
    }

    function activeProfile() {
        return connection.profiles[connection.provider] || { url: "", token: "" };
    }

    function providerLabel() {
        return connection.provider === "domestic" ? "国内 SCF" : "Cloudflare";
    }

    function localBase() {
        if (window.location.protocol === "http:" && window.location.port === String(LOCAL_PORT)) {
            return "";
        }
        return "http://127.0.0.1:" + LOCAL_PORT;
    }

    function currentBase() {
        return connection.mode === "cloud"
            ? normalizeBase(activeProfile().url)
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
        var profile = activeProfile();
        return connection.mode === "cloud" &&
            isSecureCloudUrl(profile.url) &&
            profile.token.length > 0;
    }

    function connectionReady() {
        return connection.mode === "local" || cloudConfigured();
    }

    function requestHeaders(withJson) {
        var headers = {};
        if (withJson) headers["Content-Type"] = "application/json";
        if (connection.mode === "cloud" && activeProfile().token) {
            headers["X-Tutor-Token"] = activeProfile().token;
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
        var source = String(markdown).replace(/\r\n/g, "\n");
        var mathBlocks = [];
        source = source.replace(/\$\$([\s\S]*?)\$\$/g, function (_, body) {
            mathBlocks.push(body);
            return "\n@@MATH" + (mathBlocks.length - 1) + "@@\n";
        });

        var lines = source.split("\n");
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

            var mathMatch = trimmed.match(/^@@MATH(\d+)@@$/);
            if (mathMatch) {
                flushParagraph();
                closeList();
                var body = mathBlocks[Number(mathMatch[1])] || "";
                html.push('<div class="math-display">$$' + escapeHtml(body) + "$$</div>");
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

    function renderMath(container) {
        if (!container || typeof window.renderMathInElement !== "function") return;
        try {
            window.renderMathInElement(container, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "\\[", right: "\\]", display: true },
                    { left: "$", right: "$", display: false },
                    { left: "\\(", right: "\\)", display: false }
                ],
                throwOnError: false,
                strict: false,
                ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"]
            });
        } catch (error) {
            // 单个公式错误不能影响整页。
        }
    }

    function updateCharCount() {
        var len = questionEl.value.length;
        charCount.textContent = len + " / 4000";
        charCount.style.color = len >= 4000 ? "var(--red)" : "";
    }

    function setMode(mode) {
        if (!MODE_HINTS[mode]) return;
        currentMode = mode;
        modeTabs.forEach(function (tab) {
            var active = tab.dataset.mode === mode;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", active ? "true" : "false");
        });
        inputHint.textContent = MODE_HINTS[mode];
        renderExamples();
    }

    function renderExamples() {
        examplesEl.innerHTML = "";
        (EXAMPLES[currentMode] || []).forEach(function (item) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "example-chip";
            btn.textContent = item[0];
            btn.title = item[1];
            btn.addEventListener("click", function () {
                questionEl.value = item[1];
                updateCharCount();
                questionEl.focus();
            });
            examplesEl.appendChild(btn);
        });
    }

    function showToast(message, isError) {
        toastEl.textContent = message;
        toastEl.className = "toast is-show" + (isError ? " is-error" : "");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toastEl.className = "toast";
        }, 2800);
    }

    function showOffline(kind) {
        offlineNotice.hidden = false;
        if (kind === "cloud-config") {
            offlineTitle.textContent = "云端线路还没配置。";
            offlineText.innerHTML = "点右上角“连接设置”，选择 Cloudflare 或国内 SCF，填入地址和口令。";
        } else if (kind === "cloud-error") {
            offlineTitle.textContent = "云端暂时没有连接。";
            offlineText.innerHTML = "检查网络、Cloudflare Worker / 国内 SCF，以及连接设置里的地址和口令。";
        } else {
            offlineTitle.textContent = "本地数学服务没有连接。";
            offlineText.innerHTML = "双击 <code>启动数学答疑服务.bat</code>，再刷新本页；或者切换到云端线路。";
        }
    }

    function hideOffline() {
        offlineNotice.hidden = true;
    }

    function setService(ok, text, className) {
        serviceBadge.textContent = text;
        serviceBadge.className = "service-badge " + (className || "");
        if (ok) hideOffline();
    }

    async function fetchWithTimeout(url, options, timeout) {
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, timeout || 90000);
        try {
            var opts = Object.assign({}, options || {}, { signal: controller.signal });
            return await fetch(url, opts);
        } finally {
            clearTimeout(timer);
        }
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
                setService(true, providerLabel() + " 已连接 · " + (data.model || "deepseek-chat"), "is-on");
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
                setService(false, providerLabel() + " 未连接", "is-off");
            } else {
                showOffline("local");
                setService(false, "本地服务未连接", "is-off");
            }
        }
    }

    function showAnswerEmpty() {
        answerEmpty.hidden = false;
        answerLoading.hidden = true;
        answerError.hidden = true;
        answerContent.hidden = true;
        copyBtn.disabled = true;
        answerMode.textContent = "等待提问";
        answerTime.textContent = "—";
        answerMeta.textContent = "回答只用于学习参考，重要考试信息请以考纲和老师为准。";
    }

    function showAnswerLoading() {
        answerEmpty.hidden = true;
        answerLoading.hidden = false;
        answerError.hidden = true;
        answerContent.hidden = true;
        copyBtn.disabled = true;
        answerMode.textContent = currentMode;
        answerTime.textContent = "正在生成…";
        answerMeta.textContent = "请稍候，长题和证明可能需要几十秒。";
    }

    function errorMarkup(message) {
        return "<strong>这次没有拿到回答</strong>" + escapeHtml(message || "未知错误");
    }

    function showAnswerError(message) {
        answerEmpty.hidden = true;
        answerLoading.hidden = true;
        answerError.hidden = false;
        answerContent.hidden = true;
        answerError.innerHTML = errorMarkup(message);
        copyBtn.disabled = true;
        answerTime.textContent = "失败";
        answerMeta.textContent = "检查连接设置后再试。";
    }

    function renderAnswer(answer) {
        currentAnswer = String(answer || "");
        answerEmpty.hidden = true;
        answerLoading.hidden = true;
        answerError.hidden = true;
        answerContent.hidden = false;
        answerContent.innerHTML = renderMarkdown(currentAnswer);
        renderMath(answerContent);
        copyBtn.disabled = !currentAnswer;
    }

    async function submitQuestion() {
        if (busy) return;
        var question = questionEl.value.trim();
        if (!question) {
            showToast("先输入题目或问题。", true);
            questionEl.focus();
            return;
        }
        if (question.length > 4000) {
            showToast("题目太长了，请控制在 4000 字以内。", true);
            return;
        }
        if (!connectionReady()) {
            openConnectionDialog();
            showToast("先配置本地或云端连接。", true);
            return;
        }

        busy = true;
        askBtn.disabled = true;
        askBtn.querySelector(".btn-label").textContent = "数学家思考中…";
        showAnswerLoading();
        try {
            var resp = await fetchWithTimeout(apiUrl("/api/tutor"), {
                method: "POST",
                headers: requestHeaders(true),
                body: JSON.stringify({
                    subject: SUBJECT,
                    mode: currentMode,
                    question: question
                })
            }, 120000);
            var data = await resp.json().catch(function () { return null; });
            if (!resp.ok || !data || !data.ok) {
                throw new Error((data && data.error) || "请求失败，HTTP " + resp.status);
            }
            renderAnswer(data.answer);
            answerMode.textContent = data.mode || currentMode;
            answerTime.textContent = data.time || "";
            var where = connection.mode === "cloud" ? "已写入云端数学日志" : "已写入本地数学日志";
            answerMeta.textContent = where + (data.logged === false ? "（日志写入失败）" : "") +
                " · " + (data.model || "deepseek-chat");
            showToast("回答完成。");
            loadHistory(historyCategory);
        } catch (error) {
            var message = error && error.message ? error.message : "未知错误";
            if (/401|口令/.test(message)) message += "，请检查访问口令。";
            if (/404|未知接口/.test(message) && connection.mode === "local") {
                message = "本地服务没有更新，请重启 启动数学答疑服务.bat。";
            }
            showAnswerError(message);
            showToast("答疑失败：" + message, true);
        } finally {
            busy = false;
            askBtn.disabled = false;
            askBtn.querySelector(".btn-label").textContent = "请教老师";
        }
    }

    function renderHistory() {
        historyList.innerHTML = "";
        if (!historyEntries.length) {
            historyList.hidden = true;
            historyEmpty.hidden = false;
            historyCount.textContent = "0 条";
            return;
        }
        historyList.hidden = false;
        historyEmpty.hidden = true;
        historyCount.textContent = historyEntries.length + " 条";
        historyEntries.forEach(function (item, index) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "history-item";
            btn.dataset.index = String(index);
            var question = String(item.question || "（无原题）");
            var answer = String(item.answer || "");
            var preview = answer.replace(/\s+/g, " ").slice(0, 160);
            btn.innerHTML =
                '<span class="history-item-top">' +
                '<span class="history-mode">' + escapeHtml(item.mode || "其他") + "</span>" +
                '<span class="history-time">' + escapeHtml(item.time || "") + "</span>" +
                "</span>" +
                '<span class="history-question">' + escapeHtml(question) + "</span>" +
                '<span class="history-preview">' + escapeHtml(preview) + "</span>";
            btn.addEventListener("click", function () {
                renderAnswer(answer);
                answerMode.textContent = item.mode || "历史记录";
                answerTime.textContent = item.time || "";
                answerMeta.textContent = "历史记录 · " + (item.model || "deepseek-chat");
                document.querySelector(".answer-panel").scrollIntoView({ behavior: "smooth", block: "start" });
            });
            historyList.appendChild(btn);
        });
    }

    async function loadHistory(category) {
        historyCategory = category || "all";
        historyTabs.forEach(function (tab) {
            var active = tab.dataset.category === historyCategory;
            tab.classList.toggle("is-active", active);
        });
        if (!connectionReady()) {
            historyEntries = [];
            renderHistory();
            historyCount.textContent = "—";
            return;
        }
        try {
            var url = apiUrl("/api/tutor-log?category=" + encodeURIComponent(historyCategory) + "&limit=20&subject=" + SUBJECT);
            var resp = await fetchWithTimeout(url, {
                cache: "no-store",
                headers: requestHeaders(false)
            }, 10000);
            var data = await resp.json().catch(function () { return null; });
            if (!resp.ok || !data || !data.ok) {
                throw new Error((data && data.error) || "读取历史失败");
            }
            historyEntries = Array.isArray(data.entries) ? data.entries : [];
            renderHistory();
            historyNote.textContent = "日志位置：数学工具/数学问答日志/（按分类保存，已 gitignore）。";
            if (connection.mode === "cloud") {
                historyNote.textContent += " 当前从 " + providerLabel() + " 读取。";
            }
        } catch (error) {
            historyEntries = [];
            renderHistory();
            historyList.hidden = true;
            historyEmpty.hidden = false;
            historyCount.textContent = "—";
            historyEmpty.textContent = "读取历史失败：" + (error.message || "未知错误");
        }
    }

    function exportHistory() {
        if (!historyEntries.length) {
            showToast("当前没有可导出的答疑记录。", true);
            return;
        }
        var now = new Date();
        var pad = function (n) { return String(n).padStart(2, "0"); };
        var name = "数学答疑记录-" + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) +
            "-" + pad(now.getHours()) + pad(now.getMinutes()) + ".json";
        var payload = {
            exported_at: now.toISOString(),
            subject: "math",
            category: historyCategory,
            count: historyEntries.length,
            entries: historyEntries
        };
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        showToast("已导出 " + historyEntries.length + " 条记录。");
    }

    function copyAnswer() {
        if (!currentAnswer) return;
        var text = currentAnswer;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                showToast("已复制。");
            }).catch(function () {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        var textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try { document.execCommand("copy"); showToast("已复制。"); }
        catch (error) { showToast("复制失败，请手动选择。", true); }
        textarea.remove();
    }

    function toggleCloudFields() {
        cloudFields.hidden = connectionMode.value !== "cloud";
    }

    function fillProviderFields() {
        var profile = dialogProfiles[dialogProvider] || { url: "", token: "" };
        cloudProvider.value = dialogProvider;
        cloudUrl.value = profile.url;
        cloudToken.value = profile.token;
    }

    function syncProviderFields() {
        dialogProfiles[dialogProvider] = {
            url: normalizeBase(cloudUrl.value),
            token: String(cloudToken.value || "").trim()
        };
    }

    function openConnectionDialog() {
        connectionMode.value = connection.mode;
        dialogProfiles = {
            cloudflare: normalizeProfile(connection.profiles.cloudflare),
            domestic: normalizeProfile(connection.profiles.domestic)
        };
        dialogProvider = connection.provider;
        fillProviderFields();
        toggleCloudFields();
        connectionNote.textContent = connection.mode === "cloud"
            ? "云端模式：当前线路 " + (dialogProvider === "domestic" ? "国内 SCF" : "Cloudflare") +
              "。地址和口令只保存在本浏览器。"
            : "本地模式：需要先启动 8768 数学服务；地址和口令不会上传。";
        connectionNote.className = "connection-note";
        if (!connectionDialog.open) connectionDialog.showModal();
    }

    function readConnectionForm() {
        syncProviderFields();
        return normalizeConnection({
            mode: connectionMode.value,
            provider: dialogProvider,
            profiles: dialogProfiles
        });
    }

    function validateConnectionForm(value) {
        if (value.mode !== "cloud") return "";
        var profile = value.profiles[value.provider] || { url: "", token: "" };
        if (!profile.url) return "请填云端地址。";
        if (!isSecureCloudUrl(profile.url)) {
            return "地址必须是 https://…；本地测试可用 http://127.0.0.1:端口。";
        }
        if (profile.token.length < 8) {
            return "访问口令至少 8 位。";
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
        var profile = value.profiles[value.provider] || { url: "", token: "" };
        var base = value.mode === "cloud" ? profile.url : localBase();
        connectionNote.textContent = "正在测试连接…";
        connectionNote.className = "connection-note";
        try {
            var health = await fetchWithTimeout((base || "") + "/api/health", { cache: "no-store" }, 8000);
            var data = await health.json();
            if (!health.ok || !data.ok) throw new Error("健康检查失败");
            if (value.mode === "cloud") {
                var logs = await fetchWithTimeout((base || "") + "/api/tutor-log?category=all&limit=1&subject=" + SUBJECT, {
                    cache: "no-store",
                    headers: { "X-Tutor-Token": profile.token }
                }, 8000);
                var logData = await logs.json().catch(function () { return null; });
                if (!logs.ok || !logData || !logData.ok) {
                    throw new Error((logData && logData.error) || "访问口令校验失败");
                }
            }
            connectionNote.textContent = "连接正常" +
                (data.api_key === false || data.has_key === false ? "，但缺少 API Key。" : "。");
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
        showToast(value.mode === "cloud"
            ? "已切换到" + (value.provider === "domestic" ? "国内 SCF" : "Cloudflare") + "。"
            : "已切换到本地数学服务。");
        checkService();
        loadHistory(historyCategory);
    }

    modeTabs.forEach(function (tab) {
        tab.addEventListener("click", function () { setMode(tab.dataset.mode); });
    });
    historyTabs.forEach(function (tab) {
        tab.addEventListener("click", function () { loadHistory(tab.dataset.category); });
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
    historyRefresh.addEventListener("click", function () { loadHistory(historyCategory); });
    historyExport.addEventListener("click", exportHistory);
    connectionBtn.addEventListener("click", openConnectionDialog);
    connectionClose.addEventListener("click", function () { connectionDialog.close(); });
    connectionMode.addEventListener("change", toggleCloudFields);
    cloudProvider.addEventListener("change", function () {
        syncProviderFields();
        dialogProvider = cloudProvider.value;
        fillProviderFields();
        connectionNote.textContent = dialogProvider === "domestic"
            ? "国内 SCF：地址填 SCF 函数 URL，口令填 PROXY_TOKEN。"
            : "Cloudflare：地址填 Worker URL，口令填 TUTOR_ACCESS_TOKEN。";
        connectionNote.className = "connection-note";
    });
    connectionTest.addEventListener("click", testConnectionFromDialog);
    connectionForm.addEventListener("submit", saveConnectionFromDialog);

    setMode("题目讲解");
    updateCharCount();
    showAnswerEmpty();
    checkService();
    loadHistory("all");
})();
