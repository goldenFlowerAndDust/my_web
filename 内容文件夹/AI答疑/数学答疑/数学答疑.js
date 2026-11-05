/* 数学答疑 · 本地/云端双线路 + LaTeX 渲染 + 分类历史 */
(function () {
    "use strict";

    var CONNECTION_KEY = "math-tutor-connection-v1";
    var REMEMBER_KEY = "math-tutor-connection-remember";
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
    var connectionRemember = document.getElementById("connection-remember");
    var connectionRememberHint = document.getElementById("connection-remember-hint");
    var rememberConnection = false;
    try {
        rememberConnection = localStorage.getItem(REMEMBER_KEY) === "true";
        if (!rememberConnection) localStorage.removeItem(CONNECTION_KEY);
    } catch (error) { /* ignore */ }

    var serviceBadge = document.getElementById("service-badge");
    var offlineNotice = document.getElementById("offline-notice");
    var offlineTitle = document.getElementById("offline-title");
    var offlineText = document.getElementById("offline-text");

    var modeTabs = Array.prototype.slice.call(document.querySelectorAll(".mode-tab"));
    var topicSelect = document.getElementById("topic-select");
    var questionEl = document.getElementById("question");
    var charCount = document.getElementById("char-count");
    var inputHint = document.getElementById("input-hint");
    var questionPreview = document.getElementById("question-preview");
    var previewBody = document.getElementById("question-preview-body");
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
    var historyTopicSelect = document.getElementById("history-topic");
    var historyList = document.getElementById("history-list");
    var historyEmpty = document.getElementById("history-empty");
    var historyCount = document.getElementById("history-count");
    var historyNote = document.getElementById("history-note");
    var historyRefresh = document.getElementById("history-refresh");
    var historyExport = document.getElementById("history-export");
    var toastEl = document.getElementById("toast");

    var currentMode = "题目讲解";
    var currentTopic = "其他";
    var currentAnswer = "";
    var historyCategory = "all";
    var historyTopic = "all";
    var historyEntries = [];
    var busy = false;
    var toastTimer = null;
    var dialogProfiles = emptyProfiles();
    var dialogProvider = "cloudflare";

    var TOPICS = [
        "极限", "导数与微分", "积分", "三角函数", "矩阵",
        "向量与空间几何", "微分方程", "无穷级数", "多元函数", "概率统计", "其他"
    ];
    try {
        var savedTopic = localStorage.getItem("math-tutor-topic");
        if (savedTopic === "微分") savedTopic = "导数与微分";
        if (TOPICS.indexOf(savedTopic) >= 0) currentTopic = savedTopic;
    } catch (error) {
        // localStorage 可能被禁用。
    }
    if (topicSelect) topicSelect.value = currentTopic;

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
            var store = rememberConnection ? localStorage : sessionStorage;
            var raw = store.getItem(CONNECTION_KEY);
            if (raw) {
                var parsed = JSON.parse(raw);
                if (parsed && (parsed.mode === "local" || parsed.mode === "cloud")) {
                    return normalizeConnection(parsed);
                }
            }
        } catch (error) {
            // 浏览器可能禁用存储。
        }
        return defaultConnection();
    }

    function saveConnection(value) {
        try {
            var target = rememberConnection ? localStorage : sessionStorage;
            var other = rememberConnection ? sessionStorage : localStorage;
            target.setItem(CONNECTION_KEY, JSON.stringify(value));
            other.removeItem(CONNECTION_KEY);
        } catch (error) {
            showToast("浏览器禁止了本地存储，设置只在本次页面有效。", true);
        }
    }

    function updateRememberHint() {
        if (!connectionRememberHint) return;
        connectionRememberHint.textContent = rememberConnection
            ? "已开启：地址和口令保存在这台浏览器，下次打开自动填入。共用电脑请勿开启。"
            : "默认关闭：地址和口令只在当前标签页有效，关闭页面后失效。";
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

    function normalizeBareMathNotation(value) {
        var text = String(value || "");
        // 中文输入法常把 ^ 打成全角 ＾，先统一成 ASCII。
        text = text.replace(/＾/g, "^").replace(/＿/g, "_");
        // 有些手机键盘会把 ^ 输出成 ˆ / ⌃ / ˄，这些也直接当乘方符号。
        text = text.replace(/[ˆ⌃˄]/g, "^");
        // ∧ 本身是逻辑“且”，只有在“底数 ∧ 数字/花括号”这种明显是乘方的上下文才替换。
        text = text.replace(/([A-Za-z0-9\)\]\}）］｝])\s*∧\s*(?=[0-9{+\-\\])/g, "$1^");
        text = text.replace(/([0-9])\s*∧\s*([A-Za-z])/g, "$1^$2");
        // x^(n+1) 这种写法补上花括号，避免 ^ 只吃到左括号。
        text = text.replace(/\^\(([^()]*)\)/g, "^{$1}");
        // 裸上标：x^2 -> x^{2}；已经带括号的保持原样。
        text = text.replace(/\^(\{[^}]*\}|\\[a-zA-Z]+|[0-9]+|[A-Za-z])/g, function (_, group) {
            var body = group.charAt(0) === "{" ? group.slice(1, -1) : group;
            return "^{" + body + "}";
        });
        // 裸下标：x_1 -> x_{1}；避免把 my_file 这类单词误判。
        text = text.replace(/(^|[^A-Za-z0-9])([A-Za-z])_(\{[^}]*\}|\\[a-zA-Z]+|[A-Za-z0-9])/g, function (_, prefix, base, group) {
            var body = group.charAt(0) === "{" ? group.slice(1, -1) : group;
            return prefix + base + "_{" + body + "}";
        });
        return text;
    }

    function wrapPlainMath(part) {
        if (!part) return part;
        return part.split(/([\u4e00-\u9fff]+)/).map(function (piece) {
            if (!piece || /^[\u4e00-\u9fff]+$/.test(piece)) return piece;
            var match = piece.match(/^(\s*)([\s\S]*?)(\s*)$/);
            var lead = match[1] || "";
            var core = match[2] || "";
            var trail = match[3] || "";
            if (!core || !/[\\^_=<>]/.test(core) || !/[A-Za-z0-9\\]/.test(core)) {
                return piece;
            }
            if (core.indexOf("$") !== -1) return piece;
            // 手机复制出来的公式常混入全角运算符/长破折号，数学段内统一成 ASCII。
            core = core.replace(/[—–]/g, "-")
                .replace(/＋/g, "+")
                .replace(/－/g, "-")
                .replace(/＝/g, "=")
                .replace(/（/g, "(")
                .replace(/）/g, ")")
                .replace(/［/g, "[")
                .replace(/］/g, "]")
                .replace(/｛/g, "{")
                .replace(/｝/g, "}");
            var tail = "";
            var punctuation = core.match(/[，。；：、,.!?;:]+$/);
            if (punctuation) {
                tail = punctuation[0];
                core = core.slice(0, -tail.length);
            }
            if (!core) return piece;
            return lead + "$" + core + "$" + tail + trail;
        }).join("");
    }

    function wrapBareMath(value) {
        var text = String(value || "");
        var token = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$\n]*\$|\\\([\s\S]*?\\\))/g;
        var result = "";
        var last = 0;
        var match;
        while ((match = token.exec(text))) {
            result += wrapPlainMath(text.slice(last, match.index));
            result += match[0];
            last = token.lastIndex;
        }
        result += wrapPlainMath(text.slice(last));
        return result;
    }

    function normalizeQuestionForStorage(value) {
        var text = String(value || "").trim();
        if (!text) return "";
        return wrapBareMath(normalizeBareMathNotation(text));
    }

    function questionHtml(value) {
        // 历史里的旧记录也可能是裸 x^2，显示时同样先规范化。
        return escapeHtml(normalizeQuestionForStorage(value));
    }

    function renderMarkdown(markdown) {
        var source = String(markdown).replace(/\r\n/g, "\n");
        var mathBlocks = [];
        source = source.replace(/\$\$([\s\S]*?)\$\$/g, function (_, body) {
            mathBlocks.push(body);
            return "\n@@MATH" + (mathBlocks.length - 1) + "@@\n";
        });
        // API 经常用 \[...\] 写独立公式；先提取，避免被 Markdown 拆成多个段落。
        source = source.replace(/\\\[([\s\S]*?)\\\]/g, function (_, body) {
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

    function updateQuestionPreview() {
        if (!questionPreview || !previewBody) return;
        var raw = questionEl.value.trim();
        if (!raw) {
            previewBody.innerHTML = '<span class="preview-placeholder">在输入框里写题目，这里会实时显示渲染结果。</span>';
            return;
        }
        var normalized = normalizeQuestionForStorage(raw);
        previewBody.innerHTML = escapeHtml(normalized).replace(/\n/g, "<br>");
        renderMath(previewBody);
    }

    function setMode(mode) {
        if (!MODE_HINTS[mode]) return;
        currentMode = mode;
        modeTabs.forEach(function (tab) {
            var active = tab.dataset.mode === mode;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", active ? "true" : "false");
        });
        inputHint.innerHTML = escapeHtml(MODE_HINTS[mode]);
        renderMath(inputHint);
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
                updateQuestionPreview();
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
        if (window.TutorTabs && !window.TutorTabs.canAsk()) {
            showToast("本对话已达到 " + window.TutorTabs.maxRounds + " 轮上限，请点击 + 新建对话。", true);
            return;
        }
        var rawQuestion = questionEl.value.trim();
        if (!rawQuestion) {
            showToast("先输入题目或问题。", true);
            questionEl.focus();
            return;
        }
        if (rawQuestion.length > 4000) {
            showToast("题目太长了，请控制在 4000 字以内。", true);
            return;
        }
        var question = normalizeQuestionForStorage(rawQuestion);
        if (question.length > 4000) {
            showToast("公式规范化后太长了，请精简一下。", true);
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
                    topic: currentTopic,
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
            answerMeta.textContent = where + " · " + (data.topic || currentTopic) +
                (data.logged === false ? "（日志写入失败）" : "") +
                " · " + (data.model || "deepseek-chat");
            showToast("回答完成。");
            // 新记录可能不属于当前筛选；回到“全部”，避免看起来没保存。
            historyTopic = "all";
            if (historyTopicSelect) historyTopicSelect.value = "all";
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

    function groupHistoryEntries(entries) {
        var groups = [];
        var map = {};
        entries.forEach(function (entry, index) {
            var key = entry && entry.conversation_id
                ? "c:" + String(entry.conversation_id)
                : "s:" + index;
            if (!map[key]) {
                map[key] = { key: key, items: [] };
                groups.push(map[key]);
            }
            map[key].items.push({ entry: entry, index: index });
        });
        groups.forEach(function (group) {
            group.items.sort(function (a, b) {
                return String(a.entry.time || "").localeCompare(String(b.entry.time || ""));
            });
        });
        groups.sort(function (a, b) {
            var at = a.items[a.items.length - 1].entry.time || "";
            var bt = b.items[b.items.length - 1].entry.time || "";
            return String(bt).localeCompare(String(at));
        });
        return groups;
    }

    function deleteRound(conversationId, roundNumber) {
        if (!conversationId || !roundNumber || !window.confirm("删除第 " + roundNumber + " 轮？删除后不可恢复。")) return;
        var removed = false;
        if (window.TutorTabs && window.TutorTabs.removeRound) {
            removed = window.TutorTabs.removeRound(conversationId, roundNumber - 1);
        }
        if (!removed && window.ConversationStore) {
            window.ConversationStore.removeRound(conversationId, roundNumber - 1);
        }
        loadHistory(historyCategory);
    }

    function deleteConversation(conversationId) {
        if (!conversationId || !window.confirm("删除这个对话？删除后不可恢复。")) return;
        if (window.TutorTabs && window.TutorTabs.removeConversation) {
            window.TutorTabs.removeConversation(conversationId);
        }
        if (window.ConversationStore) window.ConversationStore.clearConversation(conversationId);
        loadHistory(historyCategory, historyTopic);
    }

    function loadHistoryEntry(index) {
        var item = historyEntries[index];
        if (!item) return;
        renderAnswer(item.answer || "");
        answerMode.textContent = item.mode || "历史记录";
        answerTime.textContent = item.time || "";
        answerMeta.textContent = "历史记录 · " + (item.model || "deepseek-chat");
        if (window.renderTokenCost) window.renderTokenCost(document.getElementById("answer-token"), item.usage);
        document.querySelector(".answer-panel").scrollIntoView({ behavior: "smooth", block: "start" });
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
        var groups = groupHistoryEntries(historyEntries);
        historyCount.textContent = groups.length + " 个对话 · " + historyEntries.length + " 条回答";
        groups.forEach(function (group) {
            var first = group.items[0].entry;
            var card = document.createElement("div");
            card.className = "history-conversation";

            var head = document.createElement("div");
            head.className = "history-conversation-head";
            head.innerHTML = '<span class="history-conversation-title">' +
                escapeHtml(truncate(first.question || "（无原题）", 80)) + "</span>" +
                '<span class="history-conversation-count">共 ' + group.items.length + " 轮</span>";
            var headDelete = document.createElement("button");
            headDelete.type = "button";
            headDelete.className = "history-conversation-delete";
            headDelete.textContent = "删除";
            headDelete.title = "删除这个对话";
            headDelete.addEventListener("click", function (event) {
                event.stopPropagation();
                deleteConversation(first.conversation_id);
            });
            head.appendChild(headDelete);
            card.appendChild(head);

            var select = document.createElement("select");
            select.className = "history-round-select";
            select.setAttribute("aria-label", "选择这个对话的轮次");
            group.items.forEach(function (row, roundIndex) {
                var option = document.createElement("option");
                option.value = String(row.index);
                option.textContent = "第" + (roundIndex + 1) + "轮 · " +
                    truncate(row.entry.question || "（无问题）", 28);
                select.appendChild(option);
            });
            select.value = String(group.items[group.items.length - 1].index);
            select.addEventListener("change", function () {
                loadHistoryEntry(Number(select.value));
            });

            var roundDelete = document.createElement("button");
            roundDelete.type = "button";
            roundDelete.className = "history-round-delete";
            roundDelete.textContent = "删除本轮";
            roundDelete.title = "删除当前选中的这一轮";
            roundDelete.addEventListener("click", function () {
                var entry = historyEntries[Number(select.value)];
                var round = entry && entry.round ? Number(entry.round) : (select.selectedIndex + 1);
                deleteRound(first.conversation_id, round);
            });

            var preview = document.createElement("button");
            preview.type = "button";
            preview.className = "history-conversation-preview";
            preview.textContent = truncate(String(group.items[group.items.length - 1].entry.answer || "").replace(/[#*`>]/g, ""), 120);
            preview.addEventListener("click", function () {
                loadHistoryEntry(Number(select.value));
            });

            card.appendChild(select);
            card.appendChild(roundDelete);
            card.appendChild(preview);
            historyList.appendChild(card);
        });
    }

    async function deleteHistoryItem(item) {
        if (!window.confirm("删除这条答疑记录？删除后不可恢复。")) return;
        var payload = {
            subject: SUBJECT,
            mode: item.mode || "",
            created_at: item.created_at || "",
            time: item.time || ""
        };
        try {
            var resp = await fetchWithTimeout(apiUrl("/api/tutor-log-delete"), {
                method: "POST",
                headers: requestHeaders(true),
                body: JSON.stringify(payload)
            }, 15000);
            var data = await resp.json().catch(function () { return null; });
            if (!resp.ok || !data || !data.ok) {
                throw new Error((data && data.error) || "删除失败");
            }
            showToast("已删除这条答疑记录。");
            await loadHistory(historyCategory);
        } catch (error) {
            showToast("删除失败：" + (error.message || "未知错误"), true);
        }
    }

    var staticHistoryPromise = null;
    var staticHistoryCache = null;

    function staticHistoryKey(item) {
        return [
            String(item && (item.created_at || item.time) || ""),
            String(item && item.mode || ""),
            String(item && item.question || "")
        ].join("\u0001");
    }

    function mergeHistory(primary, archive, category, topic) {
        var merged = {};
        (Array.isArray(primary) ? primary : []).concat(
            Array.isArray(archive) ? archive : []
        ).forEach(function (item) {
            if (!item || typeof item !== "object") return;
            if (category && category !== "all" && item.mode !== category) return;
            if (topic && topic !== "all" && item.topic !== topic) return;
            merged[staticHistoryKey(item)] = item;
        });
        return Object.keys(merged).map(function (key) { return merged[key]; }).sort(function (a, b) {
            return String(b.time || b.created_at || "").localeCompare(String(a.time || a.created_at || ""));
        });
    }

    function loadStaticHistory() {
        if (staticHistoryPromise) return staticHistoryPromise;
        var archiveRoot = "../历史归档";
        staticHistoryPromise = fetch(archiveRoot + "/manifest.json?v=" + Date.now(), { cache: "no-store" })
            .then(function (resp) {
                if (!resp.ok) throw new Error("manifest");
                return resp.json();
            })
            .then(function (manifest) {
                var files = [];
                var months = (manifest && manifest.months) || {};
                Object.keys(months).forEach(function (label) {
                    var subjects = (months[label] && months[label].subjects) || {};
                    var categories = subjects["数学"] || {};
                    Object.keys(categories).forEach(function (category) {
                        (categories[category] || []).forEach(function (part) {
                            if (part && part.file) files.push(part.file);
                        });
                    });
                });
                return Promise.all(files.map(function (file) {
                    return fetch(archiveRoot + "/" + encodeURI(file) + "?v=" + Date.now(), { cache: "no-store" })
                        .then(function (resp) { return resp.ok ? resp.json() : null; })
                        .then(function (data) { return data && Array.isArray(data.entries) ? data.entries : []; })
                        .catch(function () { return []; });
                }));
            })
            .then(function (chunks) {
                var merged = [];
                chunks.forEach(function (rows) { merged = merged.concat(rows); });
                if (merged.length) {
                    staticHistoryCache = merged;
                    return staticHistoryCache;
                }
                return fetch("答疑历史.json?v=" + Date.now(), { cache: "no-store" })
                    .then(function (resp) { return resp.ok ? resp.json() : null; })
                    .then(function (data) {
                        staticHistoryCache = data && Array.isArray(data.entries) ? data.entries : [];
                        return staticHistoryCache;
                    });
            })
            .catch(function () {
                staticHistoryCache = [];
                return [];
            });
        return staticHistoryPromise;
    }
    async function loadHistory(category, topic) {
        historyCategory = category || "all";
        if (topic !== undefined) historyTopic = topic || "all";
        if (historyTopicSelect) historyTopicSelect.value = historyTopic;
        historyTabs.forEach(function (tab) {
            var active = tab.dataset.category === historyCategory;
            tab.classList.toggle("is-active", active);
        });

        if (window.ConversationStore) {
            var allStored = window.ConversationStore.entries("math");
            var stored = allStored.filter(function (entry) {
                return !historyCategory || historyCategory === "all" || entry.mode === historyCategory;
            });
            historyEntries = stored;
            renderHistory();
            return;
        }

        var archived = await loadStaticHistory();

        if (!connectionReady()) {
            historyEntries = mergeHistory([], archived, historyCategory, historyTopic);
            renderHistory();
            historyCount.textContent = historyEntries.length + " 条";
            return;
        }
        try {
            var url = apiUrl("/api/tutor-log?category=" + encodeURIComponent(historyCategory) +
                "&limit=20&subject=" + SUBJECT + "&topic=" + encodeURIComponent(historyTopic));
            var resp = await fetchWithTimeout(url, {
                cache: "no-store",
                headers: requestHeaders(false)
            }, 10000);
            var data = await resp.json().catch(function () { return null; });
            if (!resp.ok || !data || !data.ok) {
                throw new Error((data && data.error) || "读取历史失败");
            }
            historyEntries = mergeHistory(
                Array.isArray(data.entries) ? data.entries : [],
                archived,
                historyCategory,
                historyTopic
            );
            renderHistory();
            historyNote.textContent = "历史 = 本地/云端日志 + GitHub 的 答疑历史.json；原始 JSONL 不上传，归档 JSON 会上传。";
            if (connection.mode === "cloud") {
                historyNote.textContent += " 当前从 " + providerLabel() + " 读取。";
            }
        } catch (error) {
            historyEntries = mergeHistory([], archived, historyCategory, historyTopic);
            renderHistory();
            if (!historyEntries.length) {
                historyList.hidden = true;
                historyEmpty.hidden = false;
                historyCount.textContent = "—";
                historyEmpty.textContent = "读取历史失败：" + (error.message || "未知错误");
            }
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
              "。地址和口令默认不保存，勾选后才保存在浏览器。"
            : "本地模式：需要先启动 8768 数学服务；地址和口令不会上传。";
        connectionNote.className = "connection-note";
        if (connectionRemember) connectionRemember.checked = rememberConnection;
        updateRememberHint();
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
        rememberConnection = Boolean(connectionRemember && connectionRemember.checked);
        try { localStorage.setItem(REMEMBER_KEY, String(rememberConnection)); } catch (error) { /* ignore */ }
        connection = value;
        saveConnection(value);
        updateRememberHint();
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
    if (topicSelect) {
        topicSelect.addEventListener("change", function () {
            if (TOPICS.indexOf(topicSelect.value) < 0) return;
            currentTopic = topicSelect.value;
            try { localStorage.setItem("math-tutor-topic", currentTopic); } catch (error) {}
        });
    }
    if (historyTopicSelect) {
        historyTopicSelect.addEventListener("change", function () {
            loadHistory(historyCategory, historyTopicSelect.value);
        });
    }
    questionEl.addEventListener("input", function () {
        updateCharCount();
        updateQuestionPreview();
    });
    questionEl.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            submitQuestion();
        }
    });
    askBtn.addEventListener("click", submitQuestion);
    copyBtn.addEventListener("click", copyAnswer);
    historyRefresh.addEventListener("click", function () { loadHistory(historyCategory); });
    if (historyExport) historyExport.addEventListener("click", exportHistory);
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
    updateQuestionPreview();
    showAnswerEmpty();
    checkService();
    loadHistory("all");

    window.TutorRenderAnswer = function (text) {
        return renderMarkdown(text || "");
    };
    window.TutorRenderMath = function (root) {
        if (root) renderMath(root);
    };
    window.TutorReloadHistory = function () {
        loadHistory(historyCategory, historyTopic);
    };
})();
