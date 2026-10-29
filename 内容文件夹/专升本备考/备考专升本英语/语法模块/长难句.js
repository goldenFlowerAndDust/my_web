/* ==========================================================================
   专升本英语 · 语法模块 · 长难句拆解
   - 主干 / 修饰 / 连接词高亮
   - 翻译与解析默认隐藏
   - 结构筛选 + 关键词搜索
   - 已掌握进度 localStorage
   ========================================================================== */

(function () {
    'use strict';

    var MASTERED_KEY = 'zsb_grammar_mastered_v1';

    var library = document.getElementById('sentence_library');
    var cards = Array.prototype.slice.call(library.querySelectorAll('.sentence_card'));
    var searchForm = document.getElementById('grammarSearchForm');
    var searchInput = document.getElementById('grammarSearch');
    var btnResetSearch = document.getElementById('btnGrammarReset');
    var typeChips = document.getElementById('typeChips');
    var resultEl = document.getElementById('grammarResult');
    var emptyEl = document.getElementById('grammarEmpty');

    var btnAllMain = document.getElementById('btnAllMain');
    var btnAllMod = document.getElementById('btnAllMod');
    var btnCollapseAll = document.getElementById('btnCollapseAll');
    var btnResetMastered = document.getElementById('btnResetMastered');

    var masteredCount = document.getElementById('masteredCount');
    var masteredTotal = document.getElementById('masteredTotal');
    var masteredBar = document.getElementById('masteredBar');
    var masteryBar = document.querySelector('.mastery_bar');

    var toastEl = document.getElementById('toast');
    var toastTimer = null;

    var activeType = '';
    var mastered = new Set(loadMastered());

    /* ======================================================================
       基础工具
       ====================================================================== */

    function toast(message, isError) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.toggle('is_error', !!isError);
        toastEl.classList.add('is_show');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            toastEl.classList.remove('is_show');
        }, 2400);
    }

    function loadMastered() {
        try {
            var raw = localStorage.getItem(MASTERED_KEY);
            if (!raw) return [];
            var arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr.filter(function (x) {
                return typeof x === 'string';
            }) : [];
        } catch (e) {
            return [];
        }
    }

    function saveMastered() {
        try {
            localStorage.setItem(MASTERED_KEY, JSON.stringify(Array.from(mastered)));
        } catch (e) {
            toast('浏览器本地存储不可用，掌握进度没有保存。', true);
        }
    }

    /* ======================================================================
       卡片状态
       ====================================================================== */

    var ACTION_CLASS = {
        main: 'show-main',
        mod: 'show-mod',
        trans: 'show-trans',
        analysis: 'show-analysis'
    };

    function cardButtons(card) {
        return Array.prototype.slice.call(card.querySelectorAll('.seg_btn[data-act]'));
    }

    function syncCardButtons(card) {
        cardButtons(card).forEach(function (btn) {
            var act = btn.dataset.act;
            if (act === 'mastered') return;
            var on = card.classList.contains(ACTION_CLASS[act]);
            btn.classList.toggle('is_on', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
    }

    function syncMasteredButton(card) {
        var btn = card.querySelector('.seg_btn[data-act="mastered"]');
        if (!btn) return;
        var on = mastered.has(card.dataset.id);
        btn.classList.toggle('is_on', on);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.textContent = on ? '已掌握 ✓' : '标记掌握';
    }

    function updateGlobalButtons() {
        var allMain = cards.length > 0 && cards.every(function (card) {
            return card.classList.contains('show-main');
        });
        var allMod = cards.length > 0 && cards.every(function (card) {
            return card.classList.contains('show-mod');
        });

        btnAllMain.classList.toggle('is_on', allMain);
        btnAllMain.setAttribute('aria-pressed', allMain ? 'true' : 'false');
        btnAllMain.textContent = allMain ? '隐藏全部主干' : '显示全部主干';

        btnAllMod.classList.toggle('is_on', allMod);
        btnAllMod.setAttribute('aria-pressed', allMod ? 'true' : 'false');
        btnAllMod.textContent = allMod ? '隐藏全部修饰' : '显示全部修饰';
    }

    function updateProgress() {
        var total = cards.length;
        var count = 0;

        cards.forEach(function (card) {
            var on = mastered.has(card.dataset.id);
            card.classList.toggle('is-mastered', on);
            if (on) count++;
            syncMasteredButton(card);
        });

        masteredCount.textContent = count;
        masteredTotal.textContent = total;
        var pct = total > 0 ? (count / total) * 100 : 0;
        masteredBar.style.width = pct + '%';

        if (masteryBar) {
            masteryBar.setAttribute('aria-valuemax', String(total));
            masteryBar.setAttribute('aria-valuenow', String(count));
        }

        if (btnResetMastered) {
            btnResetMastered.disabled = count === 0;
        }
    }

    function toggleCardFlag(card, act) {
        var cls = ACTION_CLASS[act];
        if (!cls) return;
        card.classList.toggle(cls);
        syncCardButtons(card);
        updateGlobalButtons();
    }

    function setAllFlag(act) {
        var cls = ACTION_CLASS[act];
        if (!cls) return;
        var allOn = cards.length > 0 && cards.every(function (card) {
            return card.classList.contains(cls);
        });
        cards.forEach(function (card) {
            card.classList.toggle(cls, !allOn);
            syncCardButtons(card);
        });
        updateGlobalButtons();
    }

    function collapseAll() {
        cards.forEach(function (card) {
            card.classList.remove('show-main', 'show-mod', 'show-trans', 'show-analysis');
            syncCardButtons(card);
        });
        updateGlobalButtons();
        toast('已收起全部高亮与解析。');
    }

    function toggleMastered(card) {
        var id = card.dataset.id;
        if (!id) return;
        if (mastered.has(id)) {
            mastered.delete(id);
            toast('已取消掌握标记。');
        } else {
            mastered.add(id);
            toast('已标记掌握，可继续拆下一句。');
        }
        saveMastered();
        updateProgress();
    }

    function resetMastered() {
        if (mastered.size === 0) {
            toast('还没有掌握记录。');
            return;
        }
        if (!confirm('确定清除全部“已掌握”标记吗？此操作不可撤销。')) return;
        mastered.clear();
        try {
            localStorage.removeItem(MASTERED_KEY);
        } catch (e) {
            // 内存状态已清空
        }
        updateProgress();
        toast('已清除全部掌握进度。');
    }

    /* ======================================================================
       筛选与搜索
       ====================================================================== */

    function applyFilter() {
        var q = searchInput.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
            var typeOk = activeType === '' || card.dataset.type === activeType;
            var textOk = q === '' || card.textContent.toLowerCase().indexOf(q) !== -1;
            var show = typeOk && textOk;
            card.hidden = !show;
            if (show) visible++;
        });

        Array.prototype.forEach.call(typeChips.querySelectorAll('.chip'), function (chip) {
            chip.classList.toggle('is_active', (chip.dataset.type || '') === activeType);
        });

        if (visible === 0) {
            resultEl.textContent = '没有找到匹配的长难句。';
            resultEl.className = 'search_result is_miss';
        } else if (q === '' && activeType === '') {
            resultEl.textContent = '当前展示 ' + visible + ' 个长难句。';
            resultEl.className = 'search_result';
        } else {
            resultEl.textContent = '展示 ' + visible + ' / ' + cards.length + ' 个长难句。';
            resultEl.className = 'search_result is_hit';
        }

        emptyEl.hidden = visible > 0;
    }

    function resetFilter() {
        searchInput.value = '';
        activeType = '';
        applyFilter();
    }

    /* ======================================================================
       事件
       ====================================================================== */

    function bindEvents() {
        // 句子卡片上的按钮
        library.addEventListener('click', function (event) {
            var btn = event.target.closest('.seg_btn[data-act]');
            if (!btn) return;
            var card = btn.closest('.sentence_card');
            if (!card) return;
            var act = btn.dataset.act;

            if (act === 'mastered') {
                toggleMastered(card);
            } else {
                toggleCardFlag(card, act);
            }
        });

        // 结构筛选
        typeChips.addEventListener('click', function (event) {
            var chip = event.target.closest('.chip');
            if (!chip) return;
            activeType = chip.dataset.type || '';
            applyFilter();
        });

        // 搜索
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        searchInput.addEventListener('input', applyFilter);

        btnResetSearch.addEventListener('click', function () {
            resetFilter();
            searchInput.focus();
        });

        // 全局高亮
        btnAllMain.addEventListener('click', function () {
            setAllFlag('main');
        });

        btnAllMod.addEventListener('click', function () {
            setAllFlag('mod');
        });

        btnCollapseAll.addEventListener('click', collapseAll);
        btnResetMastered.addEventListener('click', resetMastered);
    }

    function init() {
        // 给从句片段加悬停提示，便于不打开解析也能看到标签
        Array.prototype.forEach.call(library.querySelectorAll('.g-mod[data-clause]'), function (span) {
            span.title = span.dataset.clause;
        });

        masteredTotal.textContent = cards.length;
        cards.forEach(syncCardButtons);
        updateProgress();
        updateGlobalButtons();
        applyFilter();
        bindEvents();
    }

    init();
})();
