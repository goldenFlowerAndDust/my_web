(function () {
    "use strict";

    // 英语/数学答疑：把当前标签的最近消息带进 /api/tutor 请求。
    // 只修改请求体和成功后的本地记录，不改页面原有提交/错误处理逻辑。
    var tabs = window.TutorTabs;
    if (!tabs || typeof window.fetch !== "function") return;

    var nativeFetch = window.fetch;
    var ENDPOINT = /\/api\/tutor(?:\?|$)/;

    window.fetch = function (input, init) {
        var url = typeof input === "string" ? input : (input && input.url) || "";
        if (!ENDPOINT.test(url) || !init || !init.body) {
            return nativeFetch.apply(window, arguments);
        }
        if (!tabs.canAsk()) {
            return Promise.resolve(new Response(JSON.stringify({
                ok: false,
                error: "本对话已达到 " + tabs.maxRounds + " 轮上限，请点击 + 新建对话。"
            }), {
                status: 429,
                headers: { "Content-Type": "application/json; charset=utf-8" }
            }));
        }

        var body;
        try {
            body = JSON.parse(init.body);
        } catch (error) {
            return nativeFetch.apply(window, arguments);
        }
        if (!body || typeof body !== "object") return nativeFetch.apply(window, arguments);

        var sessionId = tabs.activeId();
        var question = String(body.question || "");
        var history = tabs.history();
        if (history.length) body.history = history;

        var nextInit = {};
        Object.keys(init).forEach(function (key) { nextInit[key] = init[key]; });
        nextInit.body = JSON.stringify(body);

        return nativeFetch.call(window, input, nextInit).then(function (response) {
            if (response.ok) {
                response.clone().json().then(function (data) {
                    if (data && data.ok && data.answer && question) {
                        var answerHtml = "";
                        try {
                            answerHtml = window.TutorRenderAnswer ? window.TutorRenderAnswer(data.answer || "") : "";
                        } catch (renderError) { answerHtml = ""; }
                        tabs.appendTurnTo(sessionId, question, data.answer, answerHtml, data.mode, data.time);
                    }
                }).catch(function () { /* ignore */ });
            }
            return response;
        });
    };
})();
