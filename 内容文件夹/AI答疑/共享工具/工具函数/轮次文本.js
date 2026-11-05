(function () {
    "use strict";

    // 所有科目统一的自定义轮次文本：
    // 原生 select 不能渲染公式，这里把 .round-select / .history-round-select 升级成按钮 + 浮层。
    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
        });
    }

    function questionHtml(text) {
        if (window.TutorRenderQuestion) return window.TutorRenderQuestion(text);
        return escapeHtml(text);
    }

    function upgrade(select) {
        if (!select || select.dataset.roundTextReady === "1") return;
        if (select.closest(".round-picker")) return;
        select.dataset.roundTextReady = "1";

        var picker = document.createElement("div");
        picker.className = "round-text-picker";
        var trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "round-text-trigger";
        trigger.setAttribute("aria-haspopup", "listbox");
        trigger.setAttribute("aria-expanded", "false");
        var menu = document.createElement("div");
        menu.className = "round-text-menu";
        menu.setAttribute("role", "listbox");
        picker.appendChild(trigger);
        picker.appendChild(menu);
        select.parentNode.insertBefore(picker, select);
        select.style.display = "none";
        select.setAttribute("aria-hidden", "true");

        function render() {
            var options = Array.from(select.options || []);
            var index = select.selectedIndex;
            picker.hidden = options.length === 0;
            trigger.disabled = options.length === 0 || select.disabled;
            if (!options.length) {
                trigger.innerHTML = "";
                menu.innerHTML = "";
                return;
            }
            if (index < 0) index = 0;
            trigger.innerHTML = questionHtml(options[index].textContent);
            menu.innerHTML = options.map(function (option, i) {
                return '<button type="button" class="round-text-item' +
                    (i === index ? " is-active" : "") + '" data-round-text-index="' + i + '">' +
                    questionHtml(option.textContent) + "</button>";
            }).join("");
            if (window.TutorRenderMath) {
                window.TutorRenderMath(trigger);
                window.TutorRenderMath(menu);
            }
            Array.from(menu.querySelectorAll("[data-round-text-index]")).forEach(function (button) {
                button.addEventListener("click", function () {
                    select.selectedIndex = Number(button.getAttribute("data-round-text-index"));
                    select.dispatchEvent(new Event("change", { bubbles: true }));
                    menu.hidden = true;
                    trigger.setAttribute("aria-expanded", "false");
                    render();
                });
            });
        }

        trigger.addEventListener("click", function (event) {
            event.stopPropagation();
            var open = menu.hidden;
            menu.hidden = !open;
            trigger.setAttribute("aria-expanded", open ? "true" : "false");
        });
        document.addEventListener("click", function (event) {
            if (!picker.contains(event.target)) {
                menu.hidden = true;
                trigger.setAttribute("aria-expanded", "false");
            }
        });
        select.addEventListener("change", render);
        new MutationObserver(function () {
            // 业务代码通常在 innerHTML 之后才设置 value，延后一帧再读。
            setTimeout(render, 0);
        }).observe(select, {
            childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "disabled"]
        });
        render();
        setTimeout(render, 0);
    }

    function upgradeAll() {
        document.querySelectorAll("select.round-select, select.history-round-select").forEach(upgrade);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", upgradeAll);
    } else {
        upgradeAll();
    }
    window.addEventListener("load", upgradeAll);
    new MutationObserver(function () {
        upgradeAll();
    }).observe(document.documentElement, { childList: true, subtree: true });
})();
