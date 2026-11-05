(function () {
    "use strict";

    // DeepSeek 公开价格估算（人民币 / 每百万 token）。
    // 不同账号、模型、缓存命中率可能不同；这里只做用量估算，不是账单。
    var PRICES = {
        cacheHit: 0.5,
        cacheMiss: 2.0,
        output: 8.0,
        note: "按 DeepSeek 公开价估算，实际以平台账单为准。"
    };
    window.AI_TOKEN_PRICES = PRICES;

    function num(value) {
        var n = Number(value);
        return Number.isFinite(n) && n > 0 ? n : 0;
    }

    function formatCount(value) {
        return Number(value || 0).toLocaleString("zh-CN");
    }

    function formatMoney(value) {
        if (!value) return "¥0.000000";
        if (value < 0.01) return "¥" + value.toFixed(6);
        if (value < 1) return "¥" + value.toFixed(4);
        return "¥" + value.toFixed(2);
    }

    function calculate(usage) {
        if (!usage || typeof usage !== "object") return null;
        var prompt = num(usage.prompt_tokens);
        var completion = num(usage.completion_tokens);
        var total = num(usage.total_tokens) || prompt + completion;
        if (!prompt && !completion && !total) return null;

        var hit = num(usage.prompt_cache_hit_tokens);
        var miss = num(usage.prompt_cache_miss_tokens);
        if (!hit && !miss) miss = prompt;

        var cost = (hit / 1000000) * PRICES.cacheHit +
            (miss / 1000000) * PRICES.cacheMiss +
            (completion / 1000000) * PRICES.output;

        return {
            prompt: prompt,
            completion: completion,
            total: total,
            cost: cost,
            text: "本次 " + formatCount(total) + " tokens（输入 " + formatCount(prompt) +
                " / 输出 " + formatCount(completion) + "）· 估算 " + formatMoney(cost)
        };
    }

    window.renderTokenCost = function (element, usage) {
        if (!element) return null;
        var result = calculate(usage);
        element.textContent = result ? result.text : "本次未返回 token 用量";
        element.title = PRICES.note;
        return result;
    };

    window.calculateTokenCost = calculate;
    window.AI_TOKEN_NOTE = PRICES.note;
})();
