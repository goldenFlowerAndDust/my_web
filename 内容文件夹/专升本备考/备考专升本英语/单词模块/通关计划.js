/* ==========================================================================
   专升本英语 · 核心词汇 10 个月通关计划
   - 默认隐藏答案 / 单卡核对 / 全部展开
   - 按后缀或词根搜索
   - 艾宾浩斯 3 / 5 / 7 / 15 / 30 天复习打卡（localStorage）
   ========================================================================== */

(function () {
    'use strict';

    var STORAGE_KEY = 'zsb_word_ebbinghaus_v1';
    var INTERVALS = [3, 5, 7, 15, 30];
    var STAGE_TOTAL = INTERVALS.length;
    var WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    var PLANNED = [
        { month: 2, family: '-able / -ible', keys: ['able', 'ible'] },
        { month: 3, family: '-tion / -sion / -ment', keys: ['tion', 'sion', 'ment'] },
        { month: 4, family: '-ness / -ity / -ty', keys: ['ness', 'ity', 'ty'] },
        { month: 5, family: '-er / -or / -ist / -ant', keys: ['er', 'or', 'ist', 'ant'] },
        { month: 6, family: '-ive / -ous / -al / -ic', keys: ['ive', 'ous', 'al', 'ic'] },
        { month: 7, family: 'un- / in- / im- / dis-', keys: ['un', 'in', 'im', 'dis'] },
        { month: 8, family: 're- / pre- / pro- / over-', keys: ['re', 'pre', 'pro', 'over'] },
        { month: 9, family: 'spect / port / dict / form', keys: ['spect', 'port', 'dict', 'form'] },
        { month: 10, family: 'struct / duc / tract / press', keys: ['struct', 'duc', 'tract', 'press'] }
    ];

    var wordContent = document.getElementById('word_content');
    var wordToolbar = document.getElementById('wordToolbar');
    var btnToggleAll = document.getElementById('btnToggleAll');
    var btnResetReview = document.getElementById('btnResetReview');
    var dueList = document.getElementById('dueList');
    var dueCount = document.getElementById('dueCount');
    var newBatchList = document.getElementById('newBatchList');
    var newCount = document.getElementById('newCount');
    var upcomingList = document.getElementById('upcomingList');
    var statDue = document.getElementById('statDue');
    var statJoined = document.getElementById('statJoined');
    var statTotal = document.getElementById('statTotal');
    var statReviewed = document.getElementById('statReviewed');
    var statDone = document.getElementById('statDone');
    var reviewDate = document.getElementById('reviewDate');
    var reviewWeekday = document.getElementById('reviewWeekday');
    var wordTotalEl = document.getElementById('wordTotal');
    var groupTotalEl = document.getElementById('groupTotal');
    var levelStats = document.getElementById('levelStats');
    var visibleCount = document.getElementById('visibleCount');
    var searchForm = document.getElementById('searchForm');
    var suffixInput = document.getElementById('suffixInput');
    var btnClearSearch = document.getElementById('btnClearSearch');
    var quickFilters = document.getElementById('quickFilters');
    var searchResult = document.getElementById('searchResult');
    var searchEmpty = document.getElementById('searchEmpty');
    var searchEmptyText = document.getElementById('searchEmptyText');
    var toastEl = document.getElementById('toast');

    var store = loadStore();
    var groupEntries = [];
    var wordEntries = [];
    var wordMap = new Map();
    var toastTimer = null;

    /* ======================================================================
       日期工具
       ====================================================================== */

    function pad2(n) {
        return String(n).padStart(2, '0');
    }

    function dateToString(d) {
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    function todayString() {
        return dateToString(new Date());
    }

    function parseDateString(s) {
        var p = String(s).split('-').map(Number);
        return new Date(p[0], p[1] - 1, p[2]);
    }

    function addDays(dateStr, days) {
        var d = parseDateString(dateStr);
        d.setDate(d.getDate() + days);
        return dateToString(d);
    }

    // a - b，单位天；正数表示 a 晚于 b
    function diffDays(a, b) {
        var pa = String(a).split('-').map(Number);
        var pb = String(b).split('-').map(Number);
        var ua = Date.UTC(pa[0], pa[1] - 1, pa[2]);
        var ub = Date.UTC(pb[0], pb[1] - 1, pb[2]);
        return Math.round((ua - ub) / 86400000);
    }

    function formatDateShort(dateStr) {
        if (!dateStr) return '';
        var p = dateStr.split('-');
        return parseInt(p[1], 10) + '月' + parseInt(p[2], 10) + '日';
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (ch) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[ch];
        });
    }

    /* ======================================================================
       数据采集
       ====================================================================== */

    function collectData() {
        var groups = Array.prototype.slice.call(
            wordContent.querySelectorAll('article.word_group')
        );

        groupEntries = groups.map(function (group) {
            var list = group.querySelector('ol.word_div');
            var cards = Array.prototype.slice.call(
                group.querySelectorAll('li.word_item[data-word]')
            );
            return {
                el: group,
                suffix: (group.dataset.suffix || '').toLowerCase(),
                month: group.dataset.month || '补充词族',
                list: list,
                cards: cards
            };
        }).filter(function (g) {
            return g.cards.length > 0;
        });

        wordEntries = [];
        wordMap = new Map();
        var seen = new Set();

        groupEntries.forEach(function (group) {
            group.cards.forEach(function (li) {
                var word = li.dataset.word;
                if (!word || seen.has(word)) return;
                seen.add(word);
                var entry = {
                    word: word,
                    root: li.dataset.root || '',
                    suffix: li.dataset.suffix || group.suffix,
                    level: li.dataset.level || '',
                    meaning: li.dataset.meaning || '',
                    el: li
                };
                wordEntries.push(entry);
                wordMap.set(word, entry);
            });
        });
    }

    function setupCards() {
        wordEntries.forEach(function (entry) {
            var li = entry.el;
            if (!li.hasAttribute('tabindex')) li.tabIndex = 0;
            li.setAttribute('role', 'button');
            li.setAttribute('aria-expanded', li.classList.contains('show-answer') ? 'true' : 'false');
        });
    }

    /* ======================================================================
       本地存储
       ====================================================================== */

    function emptyStore() {
        return { version: 1, words: {} };
    }

    function loadStore() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return emptyStore();
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object' || !parsed.words ||
                typeof parsed.words !== 'object' || Array.isArray(parsed.words)) {
                return emptyStore();
            }
            return parsed;
        } catch (e) {
            return emptyStore();
        }
    }

    function saveStore() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
            return true;
        } catch (e) {
            toast('浏览器本地存储不可用，打卡记录没有保存。', true);
            return false;
        }
    }

    function getRecord(word) {
        if (!store.words || !store.words[word]) return null;
        var rec = store.words[word];
        if (!rec || typeof rec.start !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(rec.start)) {
            return null;
        }
        return rec;
    }

    function clampStage(stage) {
        var n = parseInt(stage, 10);
        if (!isFinite(n)) n = 0;
        return Math.max(0, Math.min(STAGE_TOTAL, n));
    }

    /* ======================================================================
       艾宾浩斯排期
       ====================================================================== */

    // 返回 { rounds, target, stage, complete }
    // rounds：截至今天，已经到期、需要补做的复习轮数
    function dueInfo(rec, today) {
        if (!rec) return { rounds: 0, target: null, stage: 0, complete: false };
        var stage = clampStage(rec.stage);
        if (stage >= STAGE_TOTAL) {
            return { rounds: 0, target: null, stage: stage, complete: true };
        }

        var target = addDays(rec.start, INTERVALS[stage]);
        var rounds = 0;
        for (var i = stage; i < STAGE_TOTAL; i++) {
            if (diffDays(today, addDays(rec.start, INTERVALS[i])) >= 0) {
                rounds++;
            } else {
                break;
            }
        }
        return { rounds: rounds, target: target, stage: stage, complete: false };
    }

    function nextTarget(rec) {
        var stage = clampStage(rec.stage);
        if (stage >= STAGE_TOTAL) return null;
        return addDays(rec.start, INTERVALS[stage]);
    }

    /* ======================================================================
       渲染：顶部统计 / 复习清单 / 新学打卡 / 预告
       ====================================================================== */

    function renderReview() {
        var today = todayString();
        var stats = computeStats(today);

        statDue.textContent = stats.due;
        statJoined.textContent = stats.joined;
        statTotal.textContent = stats.total;
        statReviewed.textContent = stats.reviewedToday;
        statDone.textContent = stats.done;
        dueCount.textContent = stats.due;
        newCount.textContent = stats.total - stats.joined;

        renderDue(stats, today);
        renderBatches();
        renderUpcoming(stats, today);
        updateVisibleCount();
    }

    function computeStats(today) {
        var joined = 0;
        var due = 0;
        var reviewedToday = 0;
        var done = 0;

        wordEntries.forEach(function (entry) {
            var rec = getRecord(entry.word);
            if (!rec) return;
            joined++;
            var info = dueInfo(rec, today);
            if (info.rounds > 0) due++;
            if (rec.lastReview === today) reviewedToday++;
            if (clampStage(rec.stage) >= STAGE_TOTAL) done++;
        });

        return {
            total: wordEntries.length,
            joined: joined,
            due: due,
            reviewedToday: reviewedToday,
            done: done
        };
    }

    function renderDue(stats, today) {
        if (!dueList) return;

        var items = [];
        wordEntries.forEach(function (entry) {
            var rec = getRecord(entry.word);
            if (!rec) return;
            var info = dueInfo(rec, today);
            if (info.rounds > 0) {
                items.push({ entry: entry, rec: rec, info: info });
            }
        });

        if (items.length === 0) {
            var title;
            var detail;

            if (stats.total === 0) {
                title = '页面里还没有词条';
                detail = '补充词族后，这里会自动出现复习任务。';
            } else if (stats.joined === 0) {
                title = '还没有加入计划';
                detail = '先在「今日新学打卡」里选一组词，3 天后开始第 1 次复习。';
            } else if (stats.done === stats.joined) {
                title = '全部通关 🎉';
                detail = '已加入计划的 ' + stats.joined + ' 个词都完成了 5 轮复习。继续学新词吧。';
            } else {
                title = '今天没有到期复习';
                detail = '按计划学新词即可；到期的词会在当天自动出现在这里。';
            }

            dueList.innerHTML = '<li class="due_empty"><strong>' + title + '</strong>' + detail + '</li>';
            return;
        }

        items.sort(function (a, b) {
            var ta = a.info.target || '';
            var tb = b.info.target || '';
            if (ta !== tb) return ta.localeCompare(tb);
            return a.entry.word.localeCompare(b.entry.word);
        });

        var html = items.map(function (item) {
            var word = item.entry.word;
            var suffix = item.entry.suffix;
            var stage = item.info.stage;
            var overdue = Math.max(0, diffDays(today, item.info.target));
            var meta = item.info.rounds > 1
                ? '补 ' + item.info.rounds + ' 轮'
                : '第 ' + (stage + 1) + ' 轮';

            meta += overdue === 0 ? ' · 今天到期' : ' · 逾期 ' + overdue + ' 天';

            var dots = '';
            for (var i = 0; i < STAGE_TOTAL; i++) {
                var cls = 'dot';
                if (i < stage) cls += ' done';
                else if (i === stage) cls += ' current';
                dots += '<i class="' + cls + '"></i>';
            }

            return '<li class="due_item' + (overdue > 0 ? ' overdue' : '') + '">' +
                '<button type="button" class="link_word" data-jump="' + escapeHtml(word) + '">' + escapeHtml(word) + '</button>' +
                (suffix ? '<span class="due_tag">-' + escapeHtml(suffix) + '</span>' : '') +
                '<span class="due_meta">' + escapeHtml(meta) + '</span>' +
                '<span class="stage_dots" title="已完成 ' + stage + ' / ' + STAGE_TOTAL + ' 轮">' + dots + '</span>' +
                '<button type="button" class="btn btn_checkin" data-checkin="' + escapeHtml(word) + '">打卡</button>' +
                '</li>';
        }).join('');

        dueList.innerHTML = html;
    }

    function suffixClass(suffix) {
        if (suffix === 'ful') return 'suffix_ful';
        if (suffix === 'less') return 'suffix_less';
        return 'suffix_generic';
    }

    function renderBatches() {
        if (!newBatchList) return;

        if (groupEntries.length === 0) {
            newBatchList.innerHTML = '<p class="batch_empty">当前页面没有可加入计划的词族。</p>';
            return;
        }

        var html = groupEntries.map(function (group) {
            var total = group.cards.length;
            var joined = group.cards.filter(function (li) {
                return !!getRecord(li.dataset.word);
            }).length;
            var remaining = total - joined;
            var label = group.suffix === 'mixed'
                ? '混合'
                : (group.suffix ? '-' + group.suffix : '补充');
            var pct = total > 0 ? Math.round((joined / total) * 100) : 0;

            return '<div class="batch_card">' +
                '<div class="batch_top">' +
                '<span class="suffix_badge ' + suffixClass(group.suffix) + '">' + escapeHtml(label) + '</span>' +
                '<div><strong>' + escapeHtml(label) + ' 词族</strong>' +
                '<p>' + escapeHtml(group.month) + ' · ' + total + ' 个词</p></div>' +
                '</div>' +
                '<div class="batch_progress"><span style="width:' + pct + '%"></span></div>' +
                '<div class="batch_bottom">' +
                '<span>已加入 ' + joined + ' / ' + total + '</span>' +
                '<button type="button" class="btn btn_small btn_primary" data-enroll-group="' +
                escapeHtml(group.el.id) + '"' + (remaining === 0 ? ' disabled' : '') + '>' +
                (remaining === 0 ? '已全部加入' : '打卡本组（' + remaining + '）') +
                '</button>' +
                '</div>' +
                '</div>';
        }).join('');

        newBatchList.innerHTML = html;
    }

    function renderUpcoming(stats, today) {
        if (!upcomingList) return;

        var buckets = new Map();

        wordEntries.forEach(function (entry) {
            var rec = getRecord(entry.word);
            if (!rec) return;
            var stage = clampStage(rec.stage);
            if (stage >= STAGE_TOTAL) return;

            var target = addDays(rec.start, INTERVALS[stage]);
            if (diffDays(target, today) <= 0) return;

            var key = target + '|' + stage;
            if (!buckets.has(key)) {
                buckets.set(key, { target: target, stage: stage, count: 0 });
            }
            buckets.get(key).count++;
        });

        var rows = Array.from(buckets.values()).sort(function (a, b) {
            if (a.target !== b.target) return a.target.localeCompare(b.target);
            return a.stage - b.stage;
        }).slice(0, 4);

        if (rows.length === 0) {
            var text = stats.joined === 0
                ? '加入新词后，这里会自动排出 3 / 5 / 7 / 15 / 30 天的复习日期'
                : '暂无后续复习节点';
            upcomingList.innerHTML = '<li class="upcoming_empty">' + text + '</li>';
            return;
        }

        upcomingList.innerHTML = rows.map(function (row) {
            return '<li><strong>' + formatDateShort(row.target) + '</strong> · 第 ' +
                (row.stage + 1) + ' 轮 · ' + row.count + ' 词</li>';
        }).join('');
    }

    function renderLevelStats() {
        if (!levelStats) return;

        var order = ['小学', '初中', '专升本', '补充'];
        var counts = {};
        wordEntries.forEach(function (entry) {
            var level = entry.level || '未标注';
            counts[level] = (counts[level] || 0) + 1;
        });

        var html = order.filter(function (level) {
            return counts[level];
        }).map(function (level) {
            return '<span class="level_pill">' + escapeHtml(level) + ' <b>' + counts[level] + '</b></span>';
        }).join('');

        levelStats.innerHTML = html;
    }

    /* ======================================================================
       打卡动作
       ====================================================================== */

    function enrollGroup(groupId) {
        var group = groupEntries.find(function (g) {
            return g.el.id === groupId;
        });
        if (!group) {
            toast('没有找到这个词族。', true);
            return;
        }

        var today = todayString();
        var added = 0;

        group.cards.forEach(function (li) {
            var word = li.dataset.word;
            if (!word || getRecord(word)) return;
            store.words[word] = {
                start: today,
                stage: 0,
                lastReview: null,
                history: []
            };
            added++;
        });

        if (added === 0) {
            toast('这组词已经全部加入计划了。');
            return;
        }

        saveStore();
        renderReview();
        toast('已打卡：' + (group.suffix ? '-' + group.suffix : '') + ' 词族 ' + added +
            ' 个词 · 第 1 次复习在 ' + formatDateShort(addDays(today, INTERVALS[0])) + '。');
    }

    function checkIn(word) {
        var rec = getRecord(word);
        var today = todayString();

        if (!rec) {
            toast('这个词还没有加入计划。', true);
            return;
        }

        var info = dueInfo(rec, today);
        if (info.complete) {
            toast('这个词已经通关了。');
            return;
        }
        if (info.rounds === 0) {
            toast('还没到复习时间，下次是 ' + formatDateShort(info.target) + '。');
            return;
        }

        var nextStage = Math.min(STAGE_TOTAL, info.stage + info.rounds);
        rec.stage = nextStage;
        rec.lastReview = today;
        if (!Array.isArray(rec.history)) rec.history = [];
        if (rec.history.indexOf(today) === -1) rec.history.push(today);

        saveStore();
        renderReview();

        if (nextStage >= STAGE_TOTAL) {
            toast(word + ' 完成第 5 轮复习，已通关 🎉');
        } else {
            toast(word + ' 打卡成功 · 下次复习 ' +
                formatDateShort(addDays(rec.start, INTERVALS[nextStage])) + '。');
        }
    }

    function resetProgress() {
        if (!store.words || Object.keys(store.words).length === 0) {
            toast('还没有任何打卡记录。');
            return;
        }
        if (!confirm('确定清除全部单词的艾宾浩斯打卡记录吗？此操作不可撤销。')) {
            return;
        }

        store = emptyStore();
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            // localStorage 不可用时，内存状态也已经清空
        }
        renderReview();
        toast('已清除全部打卡记录。');
    }

    /* ======================================================================
       显示 / 隐藏
       ====================================================================== */

    function getWordLists() {
        return Array.prototype.slice.call(wordContent.querySelectorAll('ol.word_div'));
    }

    function clearAnswers(scope) {
        if (!scope) return;
        Array.prototype.forEach.call(scope.querySelectorAll('.word_item.show-answer'), function (li) {
            li.classList.remove('show-answer');
            li.setAttribute('aria-expanded', 'false');
        });
    }

    function syncAllLabels() {
        var lists = getWordLists();

        lists.forEach(function (list) {
            if (!list.id) return;
            var btn = document.querySelector('button[data-target="' + list.id + '"]');
            if (!btn) return;
            var hidden = list.classList.contains('hide-zh');
            btn.textContent = hidden ? '显示中文' : '隐藏中文';
            btn.setAttribute('aria-pressed', hidden ? 'false' : 'true');
            btn.classList.toggle('is_on', !hidden);
        });

        var allHidden = lists.length > 0 && lists.every(function (list) {
            return list.classList.contains('hide-zh');
        });

        btnToggleAll.textContent = allHidden ? '显示全部答案' : '隐藏全部答案';
        btnToggleAll.setAttribute('aria-pressed', allHidden ? 'false' : 'true');
        btnToggleAll.classList.toggle('is_on', !allHidden);
    }

    function setAllAnswers(show) {
        getWordLists().forEach(function (list) {
            list.classList.toggle('hide-zh', !show);
            clearAnswers(list);
        });
        syncAllLabels();
    }

    function toggleOneList(list) {
        if (!list) return;
        var willShow = list.classList.contains('hide-zh');
        list.classList.toggle('hide-zh', !willShow);
        clearAnswers(list);
        syncAllLabels();
    }

    function toggleCard(li) {
        if (!li) return;
        var open = li.classList.toggle('show-answer');
        li.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function revealWord(word) {
        var entry = wordMap.get(word);
        if (!entry) {
            toast('在页面里没有找到 ' + word + '。', true);
            return;
        }

        var group = entry.el.closest('.word_group');
        if ((group && group.hidden) || entry.el.hidden) {
            suffixInput.value = '';
            applySearch();
        }

        entry.el.classList.add('show-answer');
        entry.el.setAttribute('aria-expanded', 'true');
        entry.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        entry.el.classList.add('is-target');
        window.setTimeout(function () {
            entry.el.classList.remove('is-target');
        }, 1800);

        if (entry.el.focus) {
            try {
                entry.el.focus({ preventScroll: true });
            } catch (e) {
                entry.el.focus();
            }
        }
    }

    /* ======================================================================
       搜索
       ====================================================================== */

    function normalizeQuery(raw) {
        return String(raw || '')
            .trim()
            .toLowerCase()
            .replace(/^以\s*/, '')
            .replace(/\s*结尾$/, '')
            .replace(/^[\s\-—–−]+/, '')
            .replace(/[\s\-—–−]+$/, '')
            .replace(/\s+/g, '');
    }

    function findPlanned(q) {
        if (!q || q.length < 2) return null;
        for (var i = 0; i < PLANNED.length; i++) {
            var p = PLANNED[i];
            for (var j = 0; j < p.keys.length; j++) {
                var k = p.keys[j];
                if (k.indexOf(q) !== -1 || q.indexOf(k) !== -1) return p;
            }
        }
        return null;
    }

    function applySearch() {
        var raw = suffixInput.value.trim();
        var q = normalizeQuery(raw);
        var shownGroups = 0;
        var shownWords = 0;

        groupEntries.forEach(function (group) {
            var suffix = group.suffix;
            var groupMatch = q === '' ||
                (suffix !== '' && suffix.indexOf(q) !== -1) ||
                group.cards.some(function (li) {
                    return (li.dataset.suffix || '').toLowerCase().indexOf(q) !== -1;
                });
            var visible = 0;

            group.cards.forEach(function (li) {
                var haystack = ((li.dataset.word || '') + ' ' + (li.dataset.root || '')).toLowerCase();
                var wordMatch = q === '' || (q.length >= 3 && haystack.indexOf(q) !== -1);
                var matched = q === '' || groupMatch || wordMatch;
                li.hidden = !matched;
                if (matched) visible++;
            });

            var showGroup = visible > 0;
            group.el.hidden = !showGroup;
            if (showGroup) {
                shownGroups++;
                shownWords += visible;
            }
        });

        Array.prototype.forEach.call(quickFilters.querySelectorAll('.chip'), function (chip) {
            var chipQuery = normalizeQuery(chip.dataset.query || '');
            chip.classList.toggle('is_active', chipQuery === q);
        });

        var totalGroups = groupEntries.length;
        var totalWords = wordEntries.length;

        if (q === '') {
            searchResult.textContent = '当前展示 ' + totalGroups + ' 个词族 · ' + totalWords + ' 个单词。';
            searchResult.className = 'search_result';
            searchEmpty.hidden = true;
        } else if (shownGroups > 0) {
            searchResult.textContent = '找到 ' + shownGroups + ' 个词族 · ' + shownWords + ' 个单词。';
            searchResult.className = 'search_result is_hit';
            searchEmpty.hidden = true;
        } else {
            var planned = findPlanned(q);
            if (planned) {
                searchResult.textContent = '第 ' + planned.month + ' 个月将上线 ' + planned.family +
                    ' 词族；现在可以先用生成器试做。';
                searchEmptyText.textContent = '“' + raw + '”对应 ' + planned.family +
                    '（第 ' + planned.month + ' 个月）。可以先用词汇代码生成器生成，再粘贴回本页。';
            } else {
                searchResult.textContent = '没有找到与“' + raw + '”匹配的词族。';
                searchEmptyText.textContent = '试试 ful、less，或输入词根（如 help、care）。也可以去生成器新建词族。';
            }
            searchResult.className = 'search_result is_miss';
            searchEmpty.hidden = false;
        }

        updateVisibleCount();
    }

    function updateVisibleCount() {
        if (!visibleCount) return;
        var count = 0;
        Array.prototype.forEach.call(wordContent.querySelectorAll('li.word_item'), function (li) {
            var group = li.closest('.word_group');
            if (!li.hidden && !(group && group.hidden)) count++;
        });
        visibleCount.textContent = count + ' 个单词';
    }

    /* ======================================================================
       提示条
       ====================================================================== */

    function toast(message, isError) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.toggle('is_error', !!isError);
        toastEl.classList.add('is_show');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            toastEl.classList.remove('is_show');
        }, 2600);
    }

    /* ======================================================================
       初始化与事件
       ====================================================================== */

    function renderTodayBadge() {
        var d = new Date();
        reviewDate.textContent = (d.getMonth() + 1) + '月' + d.getDate() + '日';
        reviewWeekday.textContent = WEEKDAYS[d.getDay()];
        reviewDate.title = d.getFullYear() + '年' + (d.getMonth() + 1) + '月' +
            d.getDate() + '日 ' + WEEKDAYS[d.getDay()];
    }

    function bindEvents() {
        // 全局显示 / 隐藏
        btnToggleAll.addEventListener('click', function () {
            var lists = getWordLists();
            var allHidden = lists.length > 0 && lists.every(function (list) {
                return list.classList.contains('hide-zh');
            });
            setAllAnswers(allHidden);
        });

        // 词族级显示 / 隐藏（生成器自带的脚本会先接管，见 data-ready 判断）
        document.addEventListener('click', function (event) {
            var btn = event.target.closest('button[data-target]');
            if (!btn) return;
            var generated = btn.closest('.generated_group');
            if (generated && generated.dataset.ready === '1') return;
            var list = document.getElementById(btn.dataset.target);
            if (!list) return;
            toggleOneList(list);
        });

        // 复习清单 / 新学打卡 / 重置
        document.addEventListener('click', function (event) {
            var jump = event.target.closest('[data-jump]');
            if (jump) {
                revealWord(jump.dataset.jump);
                return;
            }

            var check = event.target.closest('[data-checkin]');
            if (check) {
                checkIn(check.dataset.checkin);
                return;
            }

            var enroll = event.target.closest('[data-enroll-group]');
            if (enroll) {
                enrollGroup(enroll.dataset.enrollGroup);
                return;
            }

            if (event.target.closest('#btnResetReview')) {
                resetProgress();
            }
        });

        // 点击词条：单独核对答案
        wordContent.addEventListener('click', function (event) {
            var li = event.target.closest('li.word_item');
            if (!li || event.target.closest('a, button')) return;
            toggleCard(li);
        });

        // 键盘：Enter / Space 展开词条
        wordContent.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            var li = event.target.closest('li.word_item');
            if (!li || event.target !== li) return;
            event.preventDefault();
            toggleCard(li);
        });

        // 搜索
        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applySearch();
        });

        btnClearSearch.addEventListener('click', function () {
            suffixInput.value = '';
            applySearch();
            suffixInput.focus();
        });

        quickFilters.addEventListener('click', function (event) {
            var chip = event.target.closest('.chip');
            if (!chip) return;
            suffixInput.value = chip.dataset.query || '';
            applySearch();
        });

        // 多标签页同步打卡状态
        window.addEventListener('storage', function (event) {
            if (event.key !== STORAGE_KEY) return;
            store = loadStore();
            renderReview();
        });
    }

    function init() {
        collectData();
        setupCards();
        renderTodayBadge();

        statTotal.textContent = wordEntries.length;
        wordTotalEl.textContent = wordEntries.length;
        groupTotalEl.textContent = groupEntries.length;

        renderLevelStats();
        renderReview();
        syncAllLabels();
        applySearch();
        bindEvents();
    }

    init();
})();
