/* ==========================================================================
   词汇复习清单（全部分类）
   - 读取 复习清单/data.json 的所有分类
   - 每日新词/复习只统计 kind: word 的词条，各最多 20 个
   - 与 每月打卡 共用 reviewPendingChanges
   ========================================================================== */

(function () {
    'use strict';

    var DATA_URL = 'data.json';
    var LOCAL_API_BASE = (window.location.protocol === 'http:' && window.location.port === '8767')
        ? ''
        : 'http://127.0.0.1:8767';
    var isRemotePage = !(window.location.protocol === 'http:' && window.location.port === '8767');
    var TUTOR_CONFIG_KEY = 'english-tutor-connection-v1';
    var PENDING_KEY = 'reviewPendingChanges';
    var CLOUD_SAVED_KEY = 'reviewCloudSaved';
    var INTERVALS = [1, 3, 7, 15, 30, 60, 90];
    var CORE_CATEGORY = '核心词汇通关';
    var DAILY_NEW = 20;
    var DAILY_REVIEW = 20;

    var statusEl = document.getElementById('status');
    var todayDateEl = document.getElementById('today-date');
    var newList = document.getElementById('new-list');
    var dueList = document.getElementById('due-list');
    var extraList = document.getElementById('extra-list');
    var doneList = document.getElementById('done-list');
    var newCountEl = document.getElementById('new-count');
    var dueCountEl = document.getElementById('due-count');
    var extraCountEl = document.getElementById('extra-count');
    var doneCountEl = document.getElementById('done-count');
    var allCountEl = document.getElementById('all-count');
    var newBacklog = document.getElementById('new-backlog');
    var dueBacklog = document.getElementById('due-backlog');
    var allGroups = document.getElementById('all-groups');
    var btnExpandAll = document.getElementById('btn-expand-all');
    var btnDueAll = document.getElementById('btn-due-all');
    var btnNewAll = document.getElementById('btn-new-all');
    var btnExtraAll = document.getElementById('btn-extra-all');

    var statTotal = document.getElementById('stat-total');
    var statLearned = document.getElementById('stat-learned');
    var statNew = document.getElementById('stat-new');
    var statDue = document.getElementById('stat-due');
    var statExtra = document.getElementById('stat-extra');
    var statToday = document.getElementById('stat-today');
    var statRemaining = document.getElementById('stat-remaining');

    var btnReload = document.getElementById('btn-reload');
    var btnSave = document.getElementById('btn-save');
    var btnExport = document.getElementById('btn-export');

    var fullData = {};
    var wordData = [];
    var originalSnapshot = {};
    var currentGroups = { new: [], due: [], extra: [] };
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
        var extraDate = /^\d{4}-\d{2}-\d{2}$/.test(item.extraDate || '')
            ? item.extraDate
            : '';

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
            extra: item.extra === true,
            extraDate: extraDate
        });
    }

    function isWordItem(item) {
        return item.kind === 'word';
    }

    function getWordItems() {
        return wordData.filter(isWordItem);
    }

    function extraActive(item, today) {
        if (!item.extra || item.level !== 0 || !item.extraDate) return false;
        if (item.extraDate > today) return false;
        // 额外新增完成一次后不再重复出现；未完成则持续保留。
        if (item.lastReviewed && item.lastReviewed >= item.extraDate) return false;
        return true;
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

    function getCloudSaved() {
        try {
            var raw = localStorage.getItem(CLOUD_SAVED_KEY);
            if (!raw) return {};
            var obj = JSON.parse(raw);
            return obj && typeof obj === 'object' ? obj : {};
        } catch (e) {
            return {};
        }
    }

    function saveCloudSaved(updates) {
        if (!isRemotePage) return;
        var saved = getCloudSaved();
        (updates || []).forEach(function (u) {
            saved[u.name] = {
                level: u.level,
                nextDate: u.nextDate,
                lastReviewed: u.lastReviewed
            };
        });
        try {
            localStorage.setItem(CLOUD_SAVED_KEY, JSON.stringify(saved));
        } catch (e) {
            // 浏览器存储不可用时仅保留当前页状态。
        }
    }

    function clearCloudSaved(names) {
        var saved = getCloudSaved();
        (names || []).forEach(function (name) { delete saved[name]; });
        try {
            localStorage.setItem(CLOUD_SAVED_KEY, JSON.stringify(saved));
        } catch (e) {
            // 忽略。
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

    function readCloudConfig() {
        try {
            var raw = localStorage.getItem(TUTOR_CONFIG_KEY);
            if (!raw) return null;
            var data = JSON.parse(raw);
            if (!data || typeof data !== 'object') return null;
            var provider = data.provider === 'domestic' ? 'domestic' : 'cloudflare';
            var profiles = data.profiles && typeof data.profiles === 'object' ? data.profiles : {};
            var profile = profiles[provider] || {};
            var url = String(profile.url || data.cloudUrl || '').trim().replace(/\/+$/, '');
            var token = String(profile.token || data.token || '').trim();
            if (!url || !token) return null;
            return { url: url, token: token };
        } catch (err) {
            return null;
        }
    }

    async function doSync(updates) {
        var cloud = isRemotePage ? readCloudConfig() : null;
        if (isRemotePage && !cloud) {
            setSyncBadge(false, '未配置云端连接');
            return { ok: false, error: '先到 AI 答疑页配置云端连接，再来复习。' };
        }
        var endpoint = isRemotePage ? cloud.url + '/api/review-queue' : LOCAL_API_BASE + '/api/review';
        var headers = { 'Content-Type': 'application/json; charset=utf-8' };
        if (isRemotePage) headers['X-Tutor-Token'] = cloud.token;
        try {
            var resp = await fetchWithTimeout(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ updates: updates })
            }, 15000);
            var data = await resp.json();
            if (!resp.ok || !data || data.ok === false) {
                throw new Error((data && data.error) || ('HTTP ' + resp.status));
            }
            if (isRemotePage) {
                saveCloudSaved(updates);
            } else {
                clearCloudSaved(updates.map(function (u) { return u.name; }));
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
            setSyncBadge(true, isRemotePage ? '已上传云端 · 等待电脑同步' : '已写入本地 data.json');
            return { ok: true, count: data.count || updates.length };
        } catch (err) {
            rebuildPending();
            recomputeDirty();
            updateDirtyUI();
            setSyncBadge(false, isRemotePage ? '云端上传失败 · 仍保存在浏览器' : '本地暂存 · 8767 服务未开');
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
        if (result.ok) {
            return isRemotePage ? ' 已上传云端，等待电脑 BAT 拉取。' : ' 已写入本地 data.json。';
        }
        return isRemotePage
            ? ' 已保存在浏览器；请检查云端连接后重试。'
            : ' 已保存在浏览器；启动 8767 服务后点“统一保存”。';
    }

    function setSyncBadge(on, text) {
        var badge = document.getElementById('sync-badge');
        if (!badge) return;
        badge.textContent = text;
        badge.className = 'sync-badge ' + (on ? 'is-on' : 'is-off');
    }

    function checkSyncHealth() {
        if (isRemotePage) {
            setSyncBadge(Boolean(readCloudConfig()), readCloudConfig()
                ? '云端模式 · 点击统一上传'
                : '未配置云端连接');
            if (btnSave) btnSave.textContent = '☁️ 统一上传到云端';
            return;
        }
        fetchWithTimeout(LOCAL_API_BASE + '/api/health', { cache: 'no-store' }, 3000)
            .then(function (resp) {
                if (!resp.ok) throw new Error('HTTP ' + resp.status);
                return resp.json();
            })
            .then(function (data) {
                if (data && data.ok) {
                    setSyncBadge(true, '本地模式 · 点击统一保存');
                } else {
                    setSyncBadge(false, '本地服务异常');
                }
            })
            .catch(function () {
                setSyncBadge(false, '本地服务未开 · 仍可暂存');
            });
        if (btnSave) btnSave.textContent = '💾 统一保存到本地';
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
        var label = isRemotePage ? '☁️ 统一上传' : '💾 统一保存';
        var count = pendingCount();
        if (isDirty) {
            btnSave.classList.add('dirty');
            btnSave.textContent = label + '（' + count + '）';
        } else {
            btnSave.classList.remove('dirty');
            btnSave.textContent = label;
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

            // 云端已上传但本地 BAT 还没拉取的记录，继续在当前浏览器显示。
            var cloudSaved = getCloudSaved();
            wordData.forEach(function (item) {
                if (pending[item.name]) return;
                var saved = cloudSaved[item.name];
                if (!saved) return;
                if (String(saved.lastReviewed || '') < String(item.lastReviewed || '')) return;
                if (clampLevel(saved.level) < item.level) return;
                item.level = clampLevel(saved.level);
                if (/^\d{4}-\d{2}-\d{2}$/.test(saved.nextDate || '')) item.nextDate = saved.nextDate;
                item.lastReviewed = /^\d{4}-\d{2}-\d{2}$/.test(saved.lastReviewed || '')
                    ? saved.lastReviewed
                    : item.lastReviewed;
                originalSnapshot[item.name] = {
                    level: item.level,
                    nextDate: item.nextDate,
                    lastReviewed: item.lastReviewed
                };
            });

            recomputeDirty();
            renderAll();
            var baseStatus = '已加载 ' + getWordItems().length + ' 个词 · ' + wordData.length +
                ' 个词条（全部分类）· 每天 20 个新词 + 20 个复习' +
                (applied > 0 ? '（含 ' + applied + ' 条待保存复习记录）' : '');
            showStatus(baseStatus);
        } catch (e) {
            fullData = {};
            wordData = [];
            originalSnapshot = {};
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
        var completed = mode === 'done' || item.lastReviewed === today;
        var overdue = mode === 'due' ? Math.max(0, diffDays(today, item.nextDate)) : 0;
        var dateLabel;

        if (completed) {
            dateLabel = '已完成 · 下次 ' + formatShort(item.nextDate);
        } else if (mode === 'new') {
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
        var extraBadge = item.extra
            ? '<span class="badge badge-extra">额外新增</span>'
            : '';

        return '<li class="review-item word-card ' + mode + (completed ? ' is-done' : '') + '" data-name="' + esc(item.name) + '">' +
            '<div class="word-main">' +
            '<div class="word-line">' +
            '<button type="button" class="word-name" data-toggle-zh="' + esc(item.name) + '">' + esc(item.word) + '</button>' +
            '<span class="word-zh">' + esc(item.zh) + '</span>' +
            suffixBadge +
            categoryBadge +
            extraBadge +
            '<span class="badge' + levelClass + '">' + esc(levelLabel(item)) + '</span>' +
            '<span class="badge' + overdueClass + '">' + esc(dateLabel) + '</span>' +
            '</div>' +
            '<div class="word-sub">' + subParts.join(' · ') + '</div>' +
            '</div>' +
            '<div class="word-actions">' +
            '<a class="btn-open" href="' + esc(makeHref(item.path)) + '" target="_blank" rel="noopener">打开</a>' +
            (completed
                ? '<button type="button" class="btn-done" disabled>已完成</button>'
                : '<button type="button" class="btn-done" data-complete="' + esc(item.name) + '">' +
                    (mode === 'new' ? '学完' : (mode === 'extra' ? '额外完成' : '复习完成')) +
                    '</button>') +
            '</div>' +
            '</li>';
    }

    function renderStats(today, words, newItems, dueItems, extraItems, doneItems) {
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
        if (statExtra) statExtra.textContent = extraItems.length;
        statToday.textContent = doneToday;
        statRemaining.textContent = Math.max(0, words.length - learned);

        newCountEl.textContent = newItems.length;
        dueCountEl.textContent = dueItems.length;
        if (extraCountEl) extraCountEl.textContent = extraItems.length;
        if (doneCountEl) doneCountEl.textContent = doneItems.length;
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
                var extraBadge = isWord && item.extra
                    ? '<span class="badge badge-extra">额外新增</span>'
                    : '';
                var href = item.path ? makeHref(item.path) : '';
                return '<li class="all-item ' + (isWord ? 'is-word' : 'is-page') + '" data-name="' + esc(item.name) + '">' +
                    nameHtml +
                    pageBadge +
                    extraBadge +
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

        var extraItems = words.filter(function (item) {
            return extraActive(item, today);
        }).sort(function (a, b) {
            if (a.extraDate !== b.extraDate) return a.extraDate.localeCompare(b.extraDate);
            return a.name.localeCompare(b.name);
        });

        var newCandidates = words.filter(function (item) {
            return item.level === 0 &&
                !extraActive(item, today) &&
                item.nextDate && item.nextDate <= today;
        }).sort(function (a, b) {
            if (a.nextDate !== b.nextDate) return a.nextDate.localeCompare(b.nextDate);
            return a.name.localeCompare(b.name);
        });
        var newItems = newCandidates.slice(0, DAILY_NEW);
        var newBacklogCount = Math.max(0, newCandidates.length - newItems.length);

        var dueCandidates = words.filter(function (item) {
            return item.level > 0 &&
                !extraActive(item, today) &&
                item.nextDate && item.nextDate <= today;
        }).sort(function (a, b) {
            if (a.nextDate !== b.nextDate) return a.nextDate.localeCompare(b.nextDate);
            return a.name.localeCompare(b.name);
        });
        var dueItems = dueCandidates.slice(0, DAILY_REVIEW);
        var dueBacklogCount = Math.max(0, dueCandidates.length - dueItems.length);

        var doneItems = words.filter(function (item) {
            return item.lastReviewed === today;
        }).sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });

        currentGroups = { new: newItems, due: dueItems, extra: extraItems, done: doneItems };
        renderStats(today, words, newItems, dueItems, extraItems, doneItems);

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

        if (extraList) {
            extraList.innerHTML = extraItems.length > 0
                ? extraItems.map(function (item) { return wordCard(item, 'extra', today); }).join('')
                : '<li class="empty">今天没有额外新增。前一天通过生成器/答疑新增的词会出现在这里，不占 20 新词配额。</li>';
        }

        if (doneList) {
            doneList.innerHTML = doneItems.length > 0
                ? doneItems.map(function (item) { return wordCard(item, 'done', today); }).join('')
                : '<li class="empty">今天还没有完成的词。</li>';
        }

        if (btnDueAll) btnDueAll.disabled = dueItems.length === 0;
        if (btnNewAll) btnNewAll.disabled = newItems.length === 0;
        if (btnExtraAll) btnExtraAll.disabled = extraItems.length === 0;

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

    function markReviewed(item, today) {
        if (!item || item.lastReviewed === today) return false;
        var nextLevel = Math.min(INTERVALS.length, clampLevel(item.level) + 1);
        item.level = nextLevel;
        item.lastReviewed = today;
        item.nextDate = addDays(today, INTERVALS[nextLevel - 1]);
        return true;
    }

    function completeReview(name) {
        var item = findWord(name);
        if (!item || item.lastReviewed === todayString()) return;
        var today = todayString();
        markReviewed(item, today);
        rebuildPending();
        recomputeDirty();
        renderAll();
        showStatus('✓ 已加入待保存队列：' + item.word + '（' + pendingCount() + ' 条待保存）');
    }

    function completeBatch(mode) {
        var items = (currentGroups[mode] || []).filter(function (item) {
            return item.lastReviewed !== todayString();
        });
        if (!items.length) return;
        var labels = { new: '今日新词', due: '复习词', extra: '临时单词' };
        if (!confirm('确定把「' + (labels[mode] || mode) + '」这一组 ' + items.length + ' 个词全部标记完成？')) {
            return;
        }
        var today = todayString();
        items.forEach(function (item) { markReviewed(item, today); });
        rebuildPending();
        recomputeDirty();
        renderAll();
        showStatus('✓ 已加入待保存队列：' + items.length + ' 个词（' + pendingCount() + ' 条待保存）');
    }

    function pendingCount() {
        return Object.keys(getPending()).length;
    }

    async function saveNow() {
        var updates = currentUpdates();
        if (updates.length === 0) {
            rebuildPending();
            isDirty = false;
            updateDirtyUI();
            showStatus('当前没有需要保存的复习记录。');
            return;
        }
        setSyncBadge(true, isRemotePage ? '正在上传云端…' : '正在写入本地 data.json…');
        var result = await syncUpdates(updates);
        if (result.ok) {
            renderAll();
            showStatus('✅ 已保存 ' + result.count + ' 条记录' + syncSuffix(result));
        } else {
            renderAll();
            showStatus('保存失败：' + result.error + '。记录仍留在浏览器。', true);
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
            case 'btn-due-all':
                completeBatch('due');
                break;
            case 'btn-new-all':
                completeBatch('new');
                break;
            case 'btn-extra-all':
                completeBatch('extra');
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
