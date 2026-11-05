/* 核心词汇页：词性视图 + 词族视图（数据来自 复习清单/data.json） */
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
        return (POS_ZH[pos] ? pos + " " + POS_ZH[pos] : (pos || "其他"));
    }

    function senseList(item) {
        if (!item || !Array.isArray(item.senses)) return [];
        return item.senses.filter(function (s) { return s && s.pos && s.zh; });
    }

    function summaryHtml(item) {
        var senses = senseList(item);
        if (!senses.length) return "";
        return '<div class="pos_senses">' + senses.map(function (s) {
            return '<div class="pos_sense"><span class="pos_tag">' + esc(posLabel(s.pos)) +
                '</span><span>' + esc(s.zh) + '</span></div>';
        }).join("") + "</div>";
    }

    function enhanceCard(card, item) {
        if (!item || !senseList(item).length) return;
        card.setAttribute("data-pos", senseList(item)[0].pos);
        var posEl = card.querySelector(".word_pos");
        if (posEl) {
            var labels = [];
            senseList(item).forEach(function (s) {
                var label = posLabel(s.pos);
                if (labels.indexOf(label) < 0) labels.push(label);
            });
            posEl.textContent = labels.join(" / ");
        }
        if (!card.querySelector(".pos_senses")) {
            var answer = card.querySelector(".answer");
            if (answer) answer.insertAdjacentHTML("afterbegin", summaryHtml(item));
        }
        var lis = card.querySelectorAll(".sense_list > li");
        senseList(item).forEach(function (s, index) {
            var li = lis[index];
            if (!li || li.querySelector(".sense_pos_inline")) return;
            var badge = document.createElement("span");
            badge.className = "sense_pos_inline pos_tag";
            badge.textContent = posLabel(s.pos);
            li.insertBefore(badge, li.firstChild);
        });
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
            if (!Object.keys(map).some(function (key) { return map[key] && Array.isArray(map[key].senses) && map[key].senses.length; })) return;
            var cards = Array.prototype.slice.call(content.querySelectorAll(".word_item"));
            cards.forEach(function (card) {
                var word = String(card.getAttribute("data-word") || "").toLowerCase();
                enhanceCard(card, map[word]);
            });
            buildPosView(cards, map);
        })
        .catch(function () { /* 离线打开时保留词族视图 */ });

    function buildPosView(cards, map) {
        var bar = document.createElement("div");
        bar.className = "pos_view_bar";
        bar.innerHTML = '<div class="pos_view_buttons">' +
            '<button type="button" data-view="family">词族视图</button>' +
            '<button type="button" data-view="pos" class="is-active">词性视图</button>' +
            '</div><input type="search" class="pos_search" placeholder="搜索单词、词性或中文…" aria-label="搜索单词">' +
            '<span class="pos_view_count"></span>';
        content.parentNode.insertBefore(bar, content);

        var view = document.createElement("section");
        view.className = "pos_view";
        view.setAttribute("aria-label", "按词性查看单词");
        content.parentNode.insertBefore(view, content.nextSibling);

        var groups = {};
        POS_ORDER.forEach(function (pos) { groups[pos] = []; });
        groups.other = [];
        cards.forEach(function (card) {
            var word = String(card.getAttribute("data-word") || "").toLowerCase();
            var item = map[word];
            var senses = senseList(item);
            var primary = senses.length ? senses[0].pos : "other";
            if (!groups[primary]) primary = "other";
            groups[primary].push({ card: card, item: item });
        });

        var nav = document.createElement("nav");
        nav.className = "pos_nav";
        nav.innerHTML = '<span class="pos_nav_label">按词性：</span>' + POS_ORDER.concat(["other"]).filter(function (pos) {
            return groups[pos] && groups[pos].length;
        }).map(function (pos) {
            return '<a href="#pos_' + esc(pos) + '">' + esc(pos === "other" ? "其他" : posLabel(pos)) +
                ' <span>' + groups[pos].length + '</span></a>';
        }).join("");
        view.appendChild(nav);

        POS_ORDER.concat(["other"]).forEach(function (pos) {
            var list = groups[pos];
            if (!list || !list.length) return;
            var group = document.createElement("section");
            group.className = "pos_group";
            group.id = "pos_" + pos;
            group.innerHTML = '<h2>' + esc(pos === "other" ? "其他" : posLabel(pos)) +
                '<span>' + list.length + ' 词</span></h2><ol class="word_div pos_word_div"></ol>';
            var ol = group.querySelector("ol");
            list.forEach(function (entry) {
                var clone = entry.card.cloneNode(true);
                clone.removeAttribute("id");
                clone.classList.remove("is-open");
                Array.prototype.forEach.call(clone.querySelectorAll("[id]"), function (node) {
                    node.removeAttribute("id");
                });
                if (entry.item) enhanceCard(clone, entry.item);
                clone.setAttribute("data-pos", pos);
                clone.setAttribute("data-anchor", word);
                ol.appendChild(clone);
            });
            view.appendChild(group);
        });

        view.hidden = true;
        var countEl = bar.querySelector(".pos_view_count");
        function setView(name) {
            var pos = name === "pos";
            content.hidden = pos;
            view.hidden = !pos;
            Array.prototype.forEach.call(bar.querySelectorAll("[data-view]"), function (button) {
                button.classList.toggle("is-active", button.getAttribute("data-view") === name);
            });
            if (pos) {
                countEl.textContent = cards.length + " 词 · " + Object.keys(groups).filter(function (key) { return groups[key].length; }).length + " 个词性组";
            } else {
                countEl.textContent = "";
            }
        }
        bar.addEventListener("click", function (event) {
            var button = event.target.closest("[data-view]");
            if (button) setView(button.getAttribute("data-view"));
        });
        var search = bar.querySelector(".pos_search");
        search.addEventListener("input", function () {
            var query = search.value.trim().toLowerCase();
            Array.prototype.forEach.call(view.querySelectorAll(".word_item"), function (card) {
                var text = (card.textContent || "").toLowerCase();
                card.hidden = Boolean(query) && text.indexOf(query) < 0;
            });
            Array.prototype.forEach.call(view.querySelectorAll(".pos_group"), function (group) {
                group.hidden = !Array.prototype.some.call(group.querySelectorAll(".word_item"), function (card) { return !card.hidden; });
            });
        });
        view.addEventListener("click", function (event) {
            var toggle = event.target.closest(".card_toggle");
            if (!toggle) return;
            var card = toggle.closest(".word_item");
            if (!card) return;
            var open = card.classList.toggle("is-open");
            toggle.textContent = open ? "收起" : "显示";
        });
        var hash = location.hash || "";
        var familyHash = hash.indexOf("#group_") === 0;
        setView(familyHash ? "family" : "pos");
        if (hash.indexOf("#word-") === 0) {
            var word = hash.slice(6).toLowerCase();
            setTimeout(function () {
                var target = null;
                Array.prototype.forEach.call(view.querySelectorAll(".word_item"), function (card) {
                    if (!target && String(card.getAttribute("data-anchor") || "").toLowerCase() === word) target = card;
                });
                if (target) {
                    target.classList.add("is-open");
                    target.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 0);
        }
    }
})();
