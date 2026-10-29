/* ==========================================================================
   词汇复习清单（全部分类）
   - 读取 复习清单/data.json 的所有分类
   - 每日新词/复习只统计 kind: word 的词条，各最多 20 个
   - 与 每月打卡 共用 reviewPendingChanges
   ========================================================================== */

(function () {
    'use strict';

    var DATA_URL = 'data.json';
    var API_BASE = (window.location.protocol === 'http:' && window.location.port === '8767')
        ? ''
        : 'http://127.0.0.1:8767';
    var PENDING_KEY = 'reviewPendingChanges';
    var INTERVALS = [1, 3, 7, 15, 30, 60, 90];
    var CORE_CATEGORY = '核心词汇通关';
    var DAILY_NEW = 20;
    var DAILY_REVIEW = 20;

    var statusEl = document.getElementById('status');
    var todayDateEl = document.getElementById('today-date');
    var newList = document.getElementById('new-list');
    var dueList = document.getElementById('due-list');
    var newCountEl = document.getElementById('new-count');
    var dueCountEl = document.getElementById('due-count');
    var allCountEl = document.getElementById('all-count');
    var newBacklog = document.getElementById('new-backlog');
    var dueBacklog = document.getElementById('due-backlog');
    var allGroups = document.getElementById('all-groups');
    var btnExpandAll = document.getElementById('btn-expand-all');

    var statTotal = document.getElementById('stat-total');
    var statLearned = document.getElementById('stat-learned');
    var statNew = document.getElementById('stat-new');
    var statDue = document.getElementById('stat-due');
    var statToday = document.getElementById('stat-today');
    var statRemaining = document.getElementById('stat-remaining');

    var btnReload = document.getElementById('btn-reload');
    var btnSave = document.getElementById('btn-save');
    var btnUndo = document.getElementById('btn-undo');
    var btnUndoAll = document.getElementById('btn-undo-all');
    var btnExport = document.getElementById('btn-export');

    var fullData = {};
    var wordData = [];
    var originalSnapshot = {};
    var undoStack = [];
    var isDirty = false;
    var dataBaseUrl = '';

    /* ======================================================================
       基础工具
       ====================================================================== */

    function pad2(n) {
        return String(n).padStart(2, '0');
    }

    function todayString() {
        var d = new Date();
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    function parseDateString(s) {
        var p = String(s).split('-').map(Number);
        return new Date(p[0], p[1] - 1, p[2]);
    }

    function addDays(dateStr, days) {
        var d = parseDateString(dateStr);
        d.setDate(d.getDate() + days);
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    // a - b，正数表示 a 晚于 b
    function diffDays(a, b) {
        var pa = String(a).split('-').map(Number);
        var pb = String(b).split('-').map(Number);
        var ua = Date.UTC(pa[0], pa[1] - 1, pa[2]);
        var ub = Date.UTC(pb[0], pb[1] - 1, pb[2]);
        return Math.round((ua - ub) / 86400000);
    }

    function formatShort(dateStr) {
        if (!dateStr) return '';
        var p = dateStr.split('-');
        return parseInt(p[1], 10) + '月' + parseInt(p[2], 10) + '日';
    }

    function formatToday() {
        var d = new Date();
        var weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 · ' + weeks[d.getDay()];
    }

    function esc(value) {
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

    function makeHref(relPath) {
        var raw = String(relPath);
        var hashIndex = raw.indexOf('#');
        var pathPart = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw;
        var hash = hashIndex >= 0 ? raw.slice(hashIndex) : '';
        var encoded = pathPart.split('/').map(encodeURIComponent).join('/');
        return (dataBaseUrl || './') + encoded + hash;
    }

    function clampLevel(level) {
        var n = parseInt(level, 10);
        if (!isFinite(n)) n = 0;
        return Math.max(0, Math.min(INTERVALS.length, n));
    }

    function showStatus(message, isError) {
        statusEl.textContent = message;
        statusEl.className = isError ? 'error' : '';
    }

    /* ======================================================================
       数据准备
       ====================================================================== */

    function normalizeItem(item, category) {
        var name = String(item.name || item.word || '').trim();
        if (!name) return null;

        var created = /^\d{4}-\d{2}-\d{2}$/.test(item.created || '')
            ? item.created
            : todayString();
        var nextDate = /^\d{4}-\d{2}-\d{2}$/.test(item.nextDate || '')
            ? item.nextDate
            : created;
        var lastReviewed = /^\d{4}-\d{2}-\d{2}$/.test(item.lastReviewed || '')
            ? item.lastReviewed
            : null;
        var level = clampLevel(item.level);
        var suffix = String(item.suffix || '');
        var suffixLabel = item.suffixLabel ||
            (suffix === 'un' || suffix === 're' ? suffix + '-' : (suffix ? '-' + suffix : ''));

        return Object.assign({}, item, {
            name: name,
            word: item.word || name,
            zh: item.zh || '',
            root: item.root || '',
            level: level,
            created: created,
            nextDate: nextDate,
            lastReviewed: lastReviewed,
            suffix: suffix,
            suffixLabel: suffixLabel,
            category: item.category || category || '',
            kind: item.kind || '',
            priority: item.priority || ''
        });
    }

    function isWordItem(item) {
        return item.kind === 'word';
    }

    function getWordItems() {
        return wordData.filter(isWordItem);
    }

    function priorityActive(item, today) {
        if (!item.priority || item.priority > today) return false;
        // 已插队的词完成后，lastReviewed 会 >= priority，就不再显示“插队”
        if (item.lastReviewed && item.lastReviewed >= item.priority) return false;
        return true;
    }

    function priorityRank(item, today) {
        return priorityActive(item, today) ? 0 : 1;
    }

    function getPending() {
        try {
            var raw = localStorage.getItem(PENDING_KEY);
            if (!raw) return {};
            var obj = JSON.parse(raw);
            return obj && typeof obj === 'object' ? obj : {};
        } catch (e) {
            return {};
        }
    }

    var syncChain = Promise.resolve();

    function currentUpdates() {
        return getWordItems().filter(function (item) {
            var orig = originalSnapshot[item.name];
            if (!orig) return false;
            return orig.level !== item.level ||
                orig.nextDate !== item.nextDate ||
                orig.lastReviewed !== item.lastReviewed;
        }).map(function (item) {
            return {
                name: item.name,
                level: item.level,
                nextDate: item.nextDate,
                lastReviewed: item.lastReviewed
            };
        });
    }

    function fetchWithTimeout(url, options, timeoutMs) {
        var controller = new AbortController();
        var timer = window.setTimeout(function () { controller.abort(); }, timeoutMs);
        options = options || {};
        options.signal = controller.signal;
        return fetch(url, options).finally(function () {
            window.clearTimeout(timer);
        });
    }

    async function doSync(updates) {
        try {
            var resp = await fetchWithTimeout(API_BASE + '/api/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify({ updates: updates })
            }, 10000);
            var data = await resp.json();
            if (!resp.ok || !data || data.ok === false) {
                throw new Error((data && data.error) || ('HTTP ' + resp.status));
            }
            updates.forEach(function (u) {
                originalSnapshot[u.name] = {
                    level: u.level,
                    nextDate: u.nextDate,
                    lastReviewed: u.lastReviewed
                };
            });
            rebuildPending();
            recomputeDirty();
            updateDirtyUI();
            setSyncBadge(true, 'data.json 自动同步已开启');
            return { ok: true, count: data.count || updates.length };
        } catch (err) {
            rebuildPending();
            recomputeDirty();
            updateDirtyUI();
            setSyncBadge(false, '本地暂存 · 8767 服务未开');
            return { ok: false, error: err.message };
        }
    }

    function syncUpdates(updates) {
        var copy = (updates || []).map(function (u) {
            return {
                name: u.name,
                level: u.level,
                nextDate: u.nextDate,
                lastReviewed: u.lastReviewed
            };
        });
        if (copy.length === 0) {
            return Promise.resolve({ ok: true, count: 0 });
        }
        syncChain = syncChain.then(function () {
            return doSync(copy);
        }, function () {
            return doSync(copy);
        });
        return syncChain;
    }

    function syncSuffix(result) {
        return result.ok
            ? ' 已写入 data.json。'
            : ' 已保存在浏览器；启动 8767 服务后点“保存”即可同步到 data.json。';
    }

    function setSyncBadge(on, text) {
        var badge = document.getElementById('sync-badge');
        if (!badge) return;
        badge.textContent = text;
        badge.className = 'sync-badge ' + (on ? 'is-on' : 'is-off');
    }

    function checkSyncHealth() {
        fetchWithTimeout(API_BASE + '/api/health', { cache: 'no-store' }, 3000)
            .then(function (resp) {
                if (!resp.ok) throw new Error('HTTP ' + resp.status);
                return resp.json();
            })
            .then(function (data) {
                if (data && data.ok) {
                    setSyncBadge(true, 'data.json 自动同步已开启');
                } else {
                    setSyncBadge(false, '本地暂存 · 服务异常');
                }
            })
            .catch(function () {
                setSyncBadge(false, '本地暂存 · 8767 服务未开');
            });
    }

    function rebuildPending() {
        var pending = getPending();
        var changed = 0;

        getWordItems().forEach(function (item) {
            var orig = originalSnapshot[item.name];
            if (!orig) return;

            var same = orig.level === item.level &&
                orig.nextDate === item.nextDate &&
                orig.lastReviewed === item.lastReviewed;

            if (same) {
                if (Object.prototype.hasOwnProperty.call(pending, item.name)) {
                    delete pending[item.name];
                }
            } else {
                pending[item.name] = {
                    level: item.level,
                    nextDate: item.nextDate,
                    lastReviewed: item.lastReviewed
                };
                changed++;
            }
        });

        try {
            localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
        } catch (e) {
            showStatus('浏览器本地存储不可用，打卡记录没有保存。', true);
        }
        return changed;
    }

    function recomputeDirty() {
        isDirty = getWordItems().some(function (item) {
            var orig = originalSnapshot[item.name];
            if (!orig) return false;
            return orig.level !== item.level ||
                orig.nextDate !== item.nextDate ||
                orig.lastReviewed !== item.lastReviewed;
        });
        updateDirtyUI();
    }

    function updateDirtyUI() {
        if (!btnSave) return;
        if (isDirty) {
            btnSave.classList.add('dirty');
            btnSave.textContent = '💾 保存（有未同步修改）';
        } else {
            btnSave.classList.remove('dirty');
            btnSave.textContent = '💾 保存';
        }
    }

    async function loadData() {
        showStatus('正在加载 data.json...');

        try {
            var absUrl = new URL(DATA_URL, window.location.href).href;
            dataBaseUrl = absUrl.substring(0, absUrl.lastIndexOf('/') + 1);

            var resp = await fetch(DATA_URL + '?t=' + Date.now());
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            var parsed = await resp.json();

            if (!parsed || typeof parsed !== 'object') {
                throw new Error('data.json 顶层不是对象');
            }

            fullData = parsed;
            wordData = [];
            Object.keys(parsed).forEach(function (cat) {
                if (!Array.isArray(parsed[cat])) return;
                parsed[cat].forEach(function (item) {
                    var normalized = normalizeItem(item, cat);
                    if (normalized) wordData.push(normalized);
                });
            });

            if (!wordData.length) {
                throw new Error('data.json 中没有任何词条');
            }

            originalSnapshot = {};
            wordData.forEach(function (item) {
                originalSnapshot[item.name] = {
                    level: item.level,
                    nextDate: item.nextDate,
                    lastReviewed: item.lastReviewed
                };
            });

            var pending = getPending();
            var applied = 0;
            wordData.forEach(function (item) {
                var p = pending[item.name];
                if (!p) return;
                item.level = clampLevel(p.level);
                if (/^\d{4}-\d{2}-\d{2}$/.test(p.nextDate || '')) item.nextDate = p.nextDate;
                item.lastReviewed = /^\d{4}-\d{2}-\d{2}$/.test(p.lastReviewed || '')
                    ? p.lastReviewed
                    : null;
                applied++;
            });

            undoStack = [];
            recomputeDirty();
            renderAll();
            var baseStatus = '已加载 ' + getWordItems().length + ' 个词 · ' + wordData.length +
                ' 个词条（全部分类）· 每天 20 个新词 + 20 个复习' +
                (applied > 0 ? '（含 ' + applied + ' 条本地打卡记录）' : '');
            var pendingUpdates = currentUpdates();
            if (pendingUpdates.length > 0) {
                showStatus(baseStatus + '；发现 ' + pendingUpdates.length + ' 条本地记录，正在写入 data.json…');
                syncUpdates(pendingUpdates).then(function (result) {
                    if (result.ok) {
                        showStatus('已加载 ' + getWordItems().length + ' 个词 · ' +
                            wordData.length + ' 个词条；已将 ' + result.count +
                            ' 条本地记录写入 data.json。');
                    } else {
                        showStatus(baseStatus + '；有 ' + pendingUpdates.length +
                            ' 条本地记录未同步（启动 8767 服务后点“保存”）。', true);
                    }
                });
            } else {
                showStatus(baseStatus);
            }
        } catch (e) {
            fullData = {};
            wordData = [];
            originalSnapshot = {};
            undoStack = [];
            isDirty = false;
            updateDirtyUI();
            renderAll();
            showStatus('无法读取 data.json（请用 http:// 打开页面）：' + e.message, true);
        }
    }

    /* ======================================================================
       渲染
       ====================================================================== */

    function levelLabel(item) {
        if (item.level >= INTERVALS.length) return '已通关';
        if (item.level === 0) return '新词';
        return '第 ' + item.level + ' 次';
    }

    function wordCard(item, mode, today) {
        var overdue = mode === 'due' ? Math.max(0, diffDays(today, item.nextDate)) : 0;
        var dateLabel;

        if (mode === 'new') {
            dateLabel = (item.nextDate === today ? '计划 ' : '补学 · 计划 ') +
                formatShort(item.nextDate);
        } else {
            dateLabel = overdue > 0 ? '逾期 ' + overdue + ' 天' : '今天到期';
        }

        var levelClass = item.level >= INTERVALS.length
            ? ' badge-level badge-mastered'
            : ' badge-level';
        var overdueClass = overdue > 0 ? ' badge-level badge-overdue' : ' badge-level';

        var subParts = [];
        if (item.root) subParts.push('词根 <span class="root">' + esc(item.root) + '</span>');
        if (item.levelTag) subParts.push(esc(item.levelTag));
        if (item.pos) subParts.push(esc(item.pos));
        if (item.category && item.category !== CORE_CATEGORY) {
            subParts.push(esc(item.category));
        }

        var suffixBadge = item.suffixLabel
            ? '<span class="badge badge-suffix">' + esc(item.suffixLabel) + '</span>'
            : '';
        var categoryBadge = item.category && item.category !== CORE_CATEGORY
            ? '<span class="badge badge-category">' + esc(item.category.replace(/^词素\//, '')) + '</span>'
            : '';
        var priorityBadge = priorityActive(item, today)
            ? '<span class="badge badge-priority">插队</span>'
            : '';

        return '<li class="review-item word-card ' + mode + '" data-name="' + esc(item.name) + '">' +
            '<div class="word-main">' +
            '<div class="word-line">' +
            '<button type="button" class="word-name" data-toggle-zh="' + esc(item.name) + '">' + esc(item.word) + '</button>' +
            '<span class="word-zh">' + esc(item.zh) + '</span>' +
            suffixBadge +
            categoryBadge +
            priorityBadge +
            '<span class="badge' + levelClass + '">' + esc(levelLabel(item)) + '</span>' +
            '<span class="badge' + overdueClass + '">' + esc(dateLabel) + '</span>' +
            '</div>' +
            '<div class="word-sub">' + subParts.join(' · ') + '</div>' +
            '</div>' +
            '<div class="word-actions">' +
            '<a class="btn-open" href="' + esc(makeHref(item.path)) + '" target="_blank" rel="noopener">打开</a>' +
            '<button type="button" class="btn-done" data-complete="' + esc(item.name) + '">' +
            (mode === 'new' ? '学完' : '复习完成') +
            '</button>' +
            '</div>' +
            '</li>';
    }

    function renderStats(today, words, newItems, dueItems) {
        var learned = words.filter(function (item) {
            return item.level > 0 || !!item.lastReviewed;
        }).length;
        var doneToday = words.filter(function (item) {
            return item.lastReviewed === today;
        }).length;

        statTotal.textContent = words.length;
        statLearned.textContent = learned;
        statNew.textContent = newItems.length;
        statDue.textContent = dueItems.length;
        statToday.textContent = doneToday;
        statRemaining.textContent = Math.max(0, words.length - learned);

        newCountEl.textContent = newItems.length;
        dueCountEl.textContent = dueItems.length;
        allCountEl.textContent = wordData.length;
    }

    function renderAllGroups(today) {
        var openGroups = {};
        Array.prototype.forEach.call(
            allGroups.querySelectorAll('.suffix-group[open]'),
            function (el) {
                openGroups[el.dataset.groupKey] = true;
            }
        );

        var groups = [];
        var map = {};

        wordData.forEach(function (item) {
            var isWord = isWordItem(item);
            var key;
            var label;
            var categoryLabel = '';
            if (isWord && item.category === CORE_CATEGORY) {
                key = 'core:' + (item.suffix || 'other');
                label = item.suffixLabel || '未分后缀';
                categoryLabel = '核心词汇';
            } else {
                key = 'cat:' + (item.category || '其他');
                label = item.category || '其他';
            }
            if (!map[key]) {
                map[key] = {
                    key: key,
                    label: label,
                    categoryLabel: categoryLabel,
                    items: []
                };
                groups.push(map[key]);
            }
            map[key].items.push(item);
        });

        if (groups.length === 0) {
            allGroups.innerHTML = '<p class="empty">暂无词汇数据。</p>';
            btnExpandAll.textContent = '展开全部';
            return;
        }

        allGroups.innerHTML = groups.map(function (group) {
            var learned = group.items.filter(function (item) {
                return item.level > 0 || !!item.lastReviewed;
            }).length;
            var openAttr = openGroups[group.key] ? ' open' : '';

            var items = group.items.map(function (item) {
                var isWord = isWordItem(item);
                var display = item.word || item.name;
                var nameHtml = isWord
                    ? '<button type="button" class="word-name" data-toggle-zh="' + esc(item.name) + '">' + esc(display) + '</button>' +
                      '<span class="word-zh">' + esc(item.zh) + '</span>'
                    : '<span class="word-name static">' + esc(display) + '</span>';
                var pageBadge = isWord ? '' : '<span class="badge badge-page">页面</span>';
                var priorityBadge = isWord && priorityActive(item, today)
                    ? '<span class="badge badge-priority">插队</span>'
                    : '';
                var href = item.path ? makeHref(item.path) : '';
                return '<li class="all-item ' + (isWord ? 'is-word' : 'is-page') + '" data-name="' + esc(item.name) + '">' +
                    nameHtml +
                    pageBadge +
                    priorityBadge +
                    '<span class="badge badge-level">' + esc(levelLabel(item)) + '</span>' +
                    '<span class="all-date">' + esc(item.nextDate ? formatShort(item.nextDate) : '') + '</span>' +
                    (href ? '<a class="all-open" href="' + esc(href) + '" target="_blank" rel="noopener" title="打开">↗</a>' : '') +
                    '</li>';
            }).join('');

            var categoryHtml = group.categoryLabel
                ? '<span class="group-category">' + esc(group.categoryLabel) + '</span>'
                : '';

            return '<details class="suffix-group" data-group-key="' + esc(group.key) + '"' + openAttr + '>' +
                '<summary>' +
                '<span class="suffix-label">' + esc(group.label) + '</span>' +
                categoryHtml +
                '<span>共 ' + group.items.length + ' 条</span>' +
                '<span class="group-progress">已学 ' + learned + ' / ' + group.items.length + '</span>' +
                '</summary>' +
                '<ul class="all-list">' + items + '</ul>' +
                '</details>';
        }).join('');

        updateExpandAllLabel();
    }

    function updateExpandAllLabel() {
        var details = Array.prototype.slice.call(allGroups.querySelectorAll('.suffix-group'));
        if (details.length === 0) {
            btnExpandAll.textContent = '展开全部';
            return;
        }
        var allOpen = details.every(function (d) { return d.open; });
        btnExpandAll.textContent = allOpen ? '收起全部' : '展开全部';
    }

    function renderAll() {
        var today = todayString();
        if (todayDateEl) todayDateEl.textContent = formatToday();

        var words = getWordItems();

        var newCandidates = words.filter(function (item) {
            return item.level === 0 && (
                (item.nextDate && item.nextDate <= today) || priorityActive(item, today)
            );
        }).sort(function (a, b) {
            return priorityRank(a, today) - priorityRank(b, today);
        });
        var newItems = newCandidates.slice(0, DAILY_NEW);
        var newBacklogCount = Math.max(0, newCandidates.length - newItems.length);

        var dueCandidates = words.filter(function (item) {
            return item.level > 0 && (
                (item.nextDate && item.nextDate <= today) || priorityActive(item, today)
            );
        }).sort(function (a, b) {
            var pr = priorityRank(a, today) - priorityRank(b, today);
            if (pr !== 0) return pr;
            if (a.nextDate !== b.nextDate) return a.nextDate.localeCompare(b.nextDate);
            return a.name.localeCompare(b.name);
        });
        var dueItems = dueCandidates.slice(0, DAILY_REVIEW);
        var dueBacklogCount = Math.max(0, dueCandidates.length - dueItems.length);

        renderStats(today, words, newItems, dueItems);

        if (newBacklog) {
            if (newBacklogCount > 0) {
                newBacklog.hidden = false;
                newBacklog.textContent = '还有 ' + newBacklogCount + ' 个新词待学：今天先完成 20 个，剩余顺延到下一次。';
            } else {
                newBacklog.hidden = true;
                newBacklog.textContent = '';
            }
        }

        if (dueBacklog) {
            if (dueBacklogCount > 0) {
                dueBacklog.hidden = false;
                dueBacklog.textContent = '还有 ' + dueBacklogCount + ' 个到期旧词：今天先复习 20 个，剩余顺延。';
            } else {
                dueBacklog.hidden = true;
                dueBacklog.textContent = '';
            }
        }

        newList.innerHTML = newItems.length > 0
            ? newItems.map(function (item) { return wordCard(item, 'new', today); }).join('')
            : '<li class="empty">今天没有新词任务（或新词已全部学完）。</li>';

        dueList.innerHTML = dueItems.length > 0
            ? dueItems.map(function (item) { return wordCard(item, 'due', today); }).join('')
            : '<li class="empty">今天没有到期复习。学完新词后，明天会开始第一次复习。</li>';

        renderAllGroups(today);
    }

    /* ======================================================================
       打卡 / 撤销
       ====================================================================== */

    function findWord(name) {
        var words = getWordItems();
        for (var i = 0; i < words.length; i++) {
            if (words[i].name === name) return words[i];
        }
        return null;
    }

    function completeReview(name) {
        var item = findWord(name);
        if (!item) return;

        var today = todayString();
        undoStack.push({
            name: item.name,
            level: item.level,
            nextDate: item.nextDate,
            lastReviewed: item.lastReviewed
        });

        var nextLevel = Math.min(INTERVALS.length, clampLevel(item.level) + 1);
        item.level = nextLevel;
        item.lastReviewed = today;
        item.nextDate = addDays(today, INTERVALS[nextLevel - 1]);

        var changed = rebuildPending();
        recomputeDirty();
        renderAll();

        var nextText = nextLevel >= INTERVALS.length
            ? '已完成 90 天轮次，标记为已通关'
            : '下次复习 ' + formatShort(item.nextDate);
        var statusBase = '✓ 已打卡：' + item.word + '（第 ' + nextLevel + ' 次 · ' + nextText + '）';
        showStatus(statusBase + '；正在写入 data.json…');
        syncUpdates([{
            name: item.name,
            level: item.level,
            nextDate: item.nextDate,
            lastReviewed: item.lastReviewed
        }]).then(function (result) {
            showStatus(statusBase + syncSuffix(result), !result.ok);
        });
    }

    function undoLast() {
        if (undoStack.length === 0) {
            showStatus('没有可撤销的操作。', true);
            return;
        }
        var snap = undoStack.pop();
        var item = findWord(snap.name);
        if (!item) return;

        item.level = snap.level;
        item.nextDate = snap.nextDate;
        item.lastReviewed = snap.lastReviewed;

        rebuildPending();
        recomputeDirty();
        renderAll();
        showStatus('已撤销：' + item.word + '；正在写入 data.json…');
        syncUpdates([{
            name: item.name,
            level: item.level,
            nextDate: item.nextDate,
            lastReviewed: item.lastReviewed
        }]).then(function (result) {
            showStatus('已撤销：' + item.word + syncSuffix(result), !result.ok);
        });
    }

    function undoAll() {
        if (undoStack.length === 0) {
            showStatus('没有可撤销的操作。', true);
            return;
        }
        if (!confirm('撤销本次打开页面后的全部 ' + undoStack.length + ' 步操作？')) return;

        var count = undoStack.length;
        while (undoStack.length > 0) {
            var snap = undoStack.pop();
            var item = findWord(snap.name);
            if (!item) continue;
            item.level = snap.level;
            item.nextDate = snap.nextDate;
            item.lastReviewed = snap.lastReviewed;
        }

        rebuildPending();
        recomputeDirty();
        renderAll();
        var updates = currentUpdates();
        showStatus('已撤销 ' + count + ' 步操作；正在写入 data.json…');
        syncUpdates(updates).then(function (result) {
            showStatus('已撤销 ' + count + ' 步操作' + syncSuffix(result), !result.ok);
        });
    }

    async function saveNow() {
        var updates = currentUpdates();
        if (updates.length === 0) {
            rebuildPending();
            isDirty = false;
            updateDirtyUI();
            showStatus('✅ 当前没有需要同步的修改。');
            return;
        }
        showStatus('正在把 ' + updates.length + ' 条打卡写入 data.json…');
        var result = await syncUpdates(updates);
        if (result.ok) {
            showStatus('✅ 已把 ' + result.count + ' 条打卡写入 data.json。');
        } else {
            showStatus('已保存在浏览器；未写入 data.json。启动 8767 服务后点“保存”重试。', true);
        }
    }

    function exportData() {
        try {
            var current = {};
            wordData.forEach(function (item) {
                current[item.name] = item;
            });

            var out = JSON.parse(JSON.stringify(fullData));
            Object.keys(out).forEach(function (cat) {
                if (!Array.isArray(out[cat])) return;
                out[cat] = out[cat].map(function (item) {
                    var cur = current[item.name];
                    if (!cur) return item;
                    return Object.assign({}, item, {
                        level: cur.level,
                        nextDate: cur.nextDate,
                        lastReviewed: cur.lastReviewed
                    });
                });
            });

            var json = JSON.stringify(out, null, 2);
            var blob = new Blob([json], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'data.json';
            a.click();
            URL.revokeObjectURL(url);

            showStatus('已下载 data.json（全部分类，含本地打卡）。替换 复习清单/data.json 后，所有页面会读取新数据；当前本地打卡记录仍保留。');
        } catch (e) {
            showStatus('导出失败：' + e.message, true);
        }
    }

    function reloadData() {
        if (isDirty && !confirm('有未同步的修改，重新加载会丢失当前页面的撤销记录。继续？')) {
            return;
        }
        loadData();
    }

    /* ======================================================================
       事件
       ====================================================================== */

    document.addEventListener('click', function (event) {
        var toggle = event.target.closest('[data-toggle-zh]');
        if (toggle) {
            var card = toggle.closest('.review-item, .all-item');
            if (card) card.classList.toggle('is-open');
            return;
        }

        var complete = event.target.closest('[data-complete]');
        if (complete) {
            completeReview(complete.dataset.complete);
            return;
        }

        var btn = event.target.closest('button');
        if (!btn) return;

        switch (btn.id) {
            case 'btn-reload':
                reloadData();
                break;
            case 'btn-save':
                saveNow();
                break;
            case 'btn-undo':
                undoLast();
                break;
            case 'btn-undo-all':
                undoAll();
                break;
            case 'btn-export':
                exportData();
                break;
        }
    });

    if (btnExpandAll) {
        btnExpandAll.addEventListener('click', function () {
            var details = Array.prototype.slice.call(allGroups.querySelectorAll('.suffix-group'));
            var allOpen = details.length > 0 && details.every(function (d) { return d.open; });
            details.forEach(function (d) { d.open = !allOpen; });
            updateExpandAllLabel();
        });
    }

    allGroups.addEventListener('toggle', function (event) {
        if (event.target.classList && event.target.classList.contains('suffix-group')) {
            updateExpandAllLabel();
        }
    }, true);

    window.addEventListener('storage', function (event) {
        if (event.key !== PENDING_KEY) return;
        loadData();
    });

    checkSyncHealth();
    loadData();
})();
