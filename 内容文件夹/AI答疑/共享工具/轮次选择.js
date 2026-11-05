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
        select.hidden = count === 0;
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
})();
