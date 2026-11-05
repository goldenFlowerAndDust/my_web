(function () {
    "use strict";

    // 英语/数学：每个标签一个轮次下拉框，点击某一轮只切换显示，不改变上下文。
    var tabs = window.TutorTabs;
    if (!tabs || typeof tabs.turns !== "function") return;

    var tools = document.querySelector(".answer-tools");
    if (!tools) return;

    var select = document.createElement("select");
    select.className = "round-select";
    select.id = "roundSelect";
    select.setAttribute("aria-label", "选择本对话的轮次");
    tools.insertBefore(select, tools.firstChild);
    var countEl = document.createElement("span");
    countEl.className = "round-count";
    countEl.id = "roundCount";
    tools.insertBefore(countEl, select.nextSibling);

    var deleteRoundBtn = document.createElement("button");
    deleteRoundBtn.type = "button";
    deleteRoundBtn.className = "answer-round-delete";
    deleteRoundBtn.id = "answerRoundDelete";
    deleteRoundBtn.textContent = "删除本轮";
    deleteRoundBtn.title = "删除当前选中的这一轮";
    tools.insertBefore(deleteRoundBtn, countEl.nextSibling);

    var answerContent = document.getElementById("answer-content");
    var answerEmpty = document.getElementById("answer-empty");
    var answerLoading = document.getElementById("answer-loading");
    var answerError = document.getElementById("answer-error");
    var answerMode = document.getElementById("answer-mode");
    var answerTime = document.getElementById("answer-time");

    var lastActive = "";
    var lastCount = -1;

    function trim(text) {
        var value = String(text || "").replace(/\s+/g, " ").trim();
        return value.length > 24 ? value.slice(0, 24) + "…" : (value || "（无问题）");
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
        });
    }

    function questionHtml(value) {
        if (window.TutorRenderQuestion) return window.TutorRenderQuestion(value);
        return escapeHtml(trim(value));
    }

    // 数学的原生 select 无法渲染公式，换成自定义下拉；英语保留原生 select。
    var picker = null;
    var pickerTrigger = null;
    var pickerMenu = null;
    if (tabs.subject === "math") {
        select.hidden = true;
        select.setAttribute("aria-hidden", "true");
        select.tabIndex = -1;
        picker = document.createElement("div");
        picker.className = "round-picker";
        pickerTrigger = document.createElement("button");
        pickerTrigger.type = "button";
        pickerTrigger.className = "round-picker-trigger";
        pickerTrigger.setAttribute("aria-haspopup", "listbox");
        pickerTrigger.setAttribute("aria-expanded", "false");
        pickerMenu = document.createElement("div");
        pickerMenu.className = "round-picker-menu";
        pickerMenu.setAttribute("role", "listbox");
        picker.appendChild(pickerTrigger);
        picker.appendChild(pickerMenu);
        tools.insertBefore(picker, select);
        pickerTrigger.addEventListener("click", function (event) {
            event.stopPropagation();
            var open = pickerMenu.hidden;
            pickerMenu.hidden = !open;
            pickerTrigger.setAttribute("aria-expanded", open ? "true" : "false");
        });
        document.addEventListener("click", function (event) {
            if (!picker.contains(event.target)) {
                pickerMenu.hidden = true;
                pickerTrigger.setAttribute("aria-expanded", "false");
            }
        });
    }

    function renderPicker() {
        if (!picker) return;
        var turns = tabs.turns();
        var index = Number(select.value) || 0;
        var current = turns[index];
        picker.hidden = turns.length === 0;
        pickerTrigger.hidden = turns.length === 0;
        pickerMenu.innerHTML = turns.map(function (turn, i) {
            return '<button type="button" class="round-picker-item' +
                (i === index ? " is-active" : "") + '" data-round-index="' + i + '">' +
                '<span class="round-picker-number">第' + turn.index + '轮 ·</span> ' +
                questionHtml(turn.question) + "</button>";
        }).join("");
        if (current) {
            pickerTrigger.innerHTML = '<span class="round-picker-number">第' + current.index + '轮 ·</span> ' +
                questionHtml(current.question);
            pickerTrigger.setAttribute("aria-expanded", pickerMenu.hidden ? "false" : "true");
            if (window.TutorRenderMath) window.TutorRenderMath(pickerTrigger);
        } else {
            pickerTrigger.innerHTML = "";
        }
        Array.from(pickerMenu.querySelectorAll("[data-round-index]")).forEach(function (button) {
            if (window.TutorRenderMath) window.TutorRenderMath(button);
            button.addEventListener("click", function () {
                select.value = button.getAttribute("data-round-index");
                showTurn(Number(select.value) || 0);
                pickerMenu.hidden = true;
                pickerTrigger.setAttribute("aria-expanded", "false");
                renderPicker();
            });
        });
    }

    function refresh(forceLatest) {
        var turns = tabs.turns();
        var active = tabs.activeId();
        var count = turns.length;
        var activeChanged = active !== lastActive;
        lastActive = active;

        select.innerHTML = turns.map(function (turn) {
            return '<option value="' + (turn.index - 1) + '">第' + turn.index + '轮 · ' +
                trim(turn.question).replace(/[&<>"]/g, function (ch) {
                    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
                }) + "</option>";
        }).join("");
        select.hidden = picker ? true : count === 0;
        select.disabled = count === 0;
        countEl.textContent = count ? "共 " + count + " 轮" : "";
        deleteRoundBtn.hidden = count === 0;
        if (!count) {
            var tokenEl = document.getElementById("answer-token");
            if (tokenEl) tokenEl.textContent = "";
        }

        if (count && (forceLatest || activeChanged || count !== lastCount)) {
            select.value = String(count - 1);
        }
        lastCount = count;
        renderPicker();
        if (count) showTurn(Number(select.value) || 0);
    }

    function showTurn(index) {
        var turns = tabs.turns();
        var turn = turns[index];
        if (!turn) return;
        if (!answerContent) return;
        var html = turn.html || (window.TutorRenderAnswer ? window.TutorRenderAnswer(turn.answer) : "");
        answerContent.innerHTML = html;
        answerContent.hidden = false;
        if (answerEmpty) answerEmpty.hidden = true;
        if (answerLoading) answerLoading.hidden = true;
        if (answerError) answerError.hidden = true;
        if (answerMode) answerMode.textContent = turn.mode || "历史回答";
        if (answerTime) answerTime.textContent = turn.time || "—";
        if (window.TutorRenderMath) window.TutorRenderMath(answerContent);
        if (window.renderTokenCost) window.renderTokenCost(document.getElementById("answer-token"), turn.usage);
        if (picker) renderPicker();
    }

    select.addEventListener("change", function () {
        showTurn(Number(select.value) || 0);
    });

    deleteRoundBtn.addEventListener("click", function () {
        var turns = tabs.turns();
        var index = Number(select.value);
        var turn = turns[index];
        if (!turn) return;
        if (!window.confirm("删除第 " + (index + 1) + " 轮？删除后不可恢复。")) return;
        var id = tabs.activeId();
        var removed = tabs.removeRound ? tabs.removeRound(id, index) : false;
        if (!removed && window.ConversationStore) {
            window.ConversationStore.removeRound(id, index, tabs.subject);
        }
        refresh(true);
        var remaining = tabs.turns();
        if (!remaining.length && answerContent) {
            answerContent.innerHTML = "";
            answerContent.hidden = true;
            if (answerEmpty) answerEmpty.hidden = false;
            if (answerMode) answerMode.textContent = "等待提问";
            if (answerTime) answerTime.textContent = "—";
            if (window.renderTokenCost) window.renderTokenCost(document.getElementById("answer-token"), null);
        }
        if (window.TutorReloadHistory) window.TutorReloadHistory();
    });
    window.addEventListener("tutor-context-updated", function () { refresh(false); });
    window.addEventListener("tutor-turn-added", function () {
        refresh(true);
        var turns = tabs.turns();
        if (turns.length) {
            select.value = String(turns.length - 1);
            showTurn(turns.length - 1);
        }
    });
    refresh(true);
    // 主应用脚本是 defer，确保它加载后再渲染一次数学公式。
    window.addEventListener("load", function () {
        refresh(false);
    });
})();
