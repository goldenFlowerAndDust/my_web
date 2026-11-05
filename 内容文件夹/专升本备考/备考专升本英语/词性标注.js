/* 核心词汇页：在原词族页上补充词性标注和筛选，不另建视图 */
(function () {
    "use strict";

    var DATA_URL = "复习清单/data.json";
    var content = document.getElementById("wordContent");
    if (!content) return;

    var POS_ORDER = ["n.", "v.", "adj.", "adv.", "interj.", "pron.", "prep.", "conj.", "num.", "art.", "aux.", "modal", "phrase"];
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

    fetch(DATA_URL + "?t=" + Date.now(), { cache: "no-store" })
        .then(function (response) { return response.ok ? response.json() : null; })
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

            var cards = Array.prototype.slice.call(content.querySelectorAll(".word_item"));
            cards.forEach(function (card) {
                var word = String(card.getAttribute("data-word") || "").toLowerCase();
                enhanceCard(card, map[word]);
            });

            var available = [];
            cards.forEach(function (card) {
                var word = String(card.getAttribute("data-word") || "").toLowerCase();
                var item = map[word];
                sensesOf(item).forEach(function (s) {
                    if (available.indexOf(s.pos) < 0) available.push(s.pos);
                });
            });
            available.sort(function (a, b) {
                var ia = POS_ORDER.indexOf(a), ib = POS_ORDER.indexOf(b);
                return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
            });

            var bar = document.createElement("div");
            bar.className = "pos_filter_bar";
            bar.innerHTML = '<span class="pos_filter_label">按词性筛选：</span>' +
                '<button type="button" class="is-active" data-filter="all">全部</button>' +
                available.map(function (pos) {
                    return '<button type="button" data-filter="' + esc(pos) + '">' + esc(posLabel(pos)) + '</button>';
                }).join("") +
                '<span class="pos_filter_count"></span>';
            content.parentNode.insertBefore(bar, content);

            var countEl = bar.querySelector(".pos_filter_count");
            function applyFilter(filter) {
                var visible = 0;
                cards.forEach(function (card) {
                    var word = String(card.getAttribute("data-word") || "").toLowerCase();
                    var item = map[word];
                    var show = filter === "all" || sensesOf(item).some(function (s) { return s.pos === filter; });
                    card.hidden = !show;
                    if (show) visible++;
                    var group = card.closest(".word_group");
                    if (group) {
                        group.hidden = !Array.prototype.some.call(group.querySelectorAll(".word_item"), function (row) {
                            return !row.hidden;
                        });
                    }
                });
                countEl.textContent = visible + " 词";
                Array.prototype.forEach.call(bar.querySelectorAll("[data-filter]"), function (button) {
                    button.classList.toggle("is-active", button.getAttribute("data-filter") === filter);
                });
            }
            bar.addEventListener("click", function (event) {
                var button = event.target.closest("[data-filter]");
                if (!button) return;
                applyFilter(button.getAttribute("data-filter"));
            });
            applyFilter("all");
        })
        .catch(function () { /* 离线或 file:// 打开时保留原词族页面 */ });
})();
