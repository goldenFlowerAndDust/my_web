/* 核心词汇页：在词族页内为每个词补全词性中文义项，不再分视图/筛选 */
(function () {
    "use strict";

    var DATA_URL = "复习清单/data.json";
    var content = document.getElementById("wordContent");
    if (!content) return;

    var POS_ZH = {
        "n.": "名词", "v.": "动词", "vt.": "及物动词", "vi.": "不及物动词",
        "adj.": "形容词", "adv.": "副词", "pron.": "代词", "prep.": "介词",
        "conj.": "连词", "num.": "数词", "art.": "冠词", "interj.": "感叹词",
        "aux.": "助动词", "modal": "情态动词", "phrase": "短语"
    };

    function esc(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function posLabel(pos) {
        return POS_ZH[pos] ? pos + " " + POS_ZH[pos] : (pos || "其他");
    }

    function sensesOf(item) {
        if (!item || !Array.isArray(item.senses)) return [];
        return item.senses.filter(function (s) { return s && s.pos && s.zh; });
    }

    function summaryHtml(item) {
        var senses = sensesOf(item);
        if (!senses.length) return "";
        return '<div class="pos_senses">' + senses.map(function (s) {
            return '<div class="pos_sense"><span class="pos_tag">' + esc(posLabel(s.pos)) +
                '</span><span>' + esc(s.zh) + '</span></div>';
        }).join("") + "</div>";
    }

    function enhanceCard(card, item) {
        var senses = sensesOf(item);
        if (!senses.length) return;
        var labels = [];
        senses.forEach(function (s) {
            var label = posLabel(s.pos);
            if (labels.indexOf(label) < 0) labels.push(label);
        });
        var posEl = card.querySelector(".word_pos");
        if (posEl) posEl.textContent = labels.join(" / ");
        if (!card.querySelector(".pos_senses")) {
            var answer = card.querySelector(".answer");
            if (answer) answer.insertAdjacentHTML("afterbegin", summaryHtml(item));
        }
        var lis = card.querySelectorAll(".sense_list > li");
        senses.forEach(function (s, index) {
            var li = lis[index];
            if (!li || li.querySelector(".sense_pos_inline")) return;
            var badge = document.createElement("span");
            badge.className = "sense_pos_inline pos_tag";
            badge.textContent = posLabel(s.pos);
            li.insertBefore(badge, li.firstChild);
        });
        card.setAttribute("data-pos", senses[0].pos);
    }

    function loadData() {
        if (location.protocol === "file:" && window.__WORD_DATA__) {
            return Promise.resolve(window.__WORD_DATA__);
        }
        return fetch(DATA_URL + "?t=" + Date.now(), { cache: "no-store" })
            .then(function (response) { return response.ok ? response.json() : null; })
            .catch(function () { return window.__WORD_DATA__ || null; });
    }

    loadData()
        .then(function (data) { return data; })
        .then(function (data) {
            if (!data || typeof data !== "object") return;
            var map = {};
            Object.keys(data).forEach(function (category) {
                if (!Array.isArray(data[category])) return;
                data[category].forEach(function (item) {
                    if (item && item.kind === "word" && item.name) {
                        map[String(item.name).toLowerCase()] = item;
                        if (item.pluralName) map[String(item.pluralName).toLowerCase()] = item;
                    }
                });
            });
            if (!Object.keys(map).some(function (key) { return sensesOf(map[key]).length; })) return;
            content.querySelectorAll(".word_item").forEach(function (card) {
                var word = String(card.getAttribute("data-word") || "").toLowerCase();
                enhanceCard(card, map[word]);
            });
        })
        .catch(function () { /* file:// 或未启动服务时保留原词族页面 */ });
})();
