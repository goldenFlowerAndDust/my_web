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
        return value.length > 34 ? value.slice(0, 34) + "…" : (value || "（无问题）");
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
    }

    select.addEventListener("change", function () {
        showTurn(Number(select.value) || 0);
    });
    window.addEventListener("tutor-context-updated", function () { refresh(false); });
    refresh(true);
})();
