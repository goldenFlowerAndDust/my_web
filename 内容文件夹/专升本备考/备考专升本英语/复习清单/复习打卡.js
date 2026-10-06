// ================== 配置 ==================
const DATA_URL = 'data.json';
const PENDING_KEY = 'reviewPendingChanges';
const INTERVALS = [1, 3, 7, 15, 30, 60, 90];
const START_DATE = '2026-09-01';

let reviewData = {};
let dataBaseUrl = '';
let undoStack = [];
let isDirty = false;
let originalSnapshot = {};   // ⭐ data.json 加载时的原始状态

// ================== 工具 ==================
function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

function addDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

function dateDiff(a, b) {
    const da = new Date(a + 'T00:00:00');
    const db = new Date(b + 'T00:00:00');
    return Math.round((da - db) / 86400000);
}

function fmtDate(s) {
    if (!s) return '';
    const p = s.split('-');
    return p[0] + '年' + parseInt(p[1]) + '月' + parseInt(p[2]) + '日';
}

function showStatus(msg, isError) {
    const el = document.getElementById('status');
    if (!el) return;
    el.textContent = msg;
    el.className = isError ? 'error' : '';
}

function escapeStr(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function makeHref(relPath) {
    const encoded = String(relPath).split('/').map(encodeURIComponent).join('/');
    return (dataBaseUrl || './') + encoded;
}

function getSavedPending() {
    try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '{}'); }
    catch (e) { return {}; }
}

// ⭐ 重建 pending：只记录"和 data.json 原始值不同"的条目
function rebuildPending() {
    const pending = {};
    for (const cat of Object.keys(reviewData)) {
        for (const item of reviewData[cat]) {
            const orig = originalSnapshot[item.name];
            if (!orig) continue;
            const changed = orig.level !== item.level ||
                orig.nextDate !== item.nextDate ||
                orig.lastReviewed !== item.lastReviewed;
            if (changed) {
                pending[item.name] = {
                    level: item.level,
                    nextDate: item.nextDate,
                    lastReviewed: item.lastReviewed
                };
            }
        }
    }
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

// ================== 数据操作 ==================
function flattenData() {
    const out = [];
    for (const cat of Object.keys(reviewData)) {
        for (const item of reviewData[cat]) {
            out.push({ ...item, category: item.category || cat });
        }
    }
    return out;
}

function findByName(name) {
    for (const cat of Object.keys(reviewData)) {
        const list = reviewData[cat];
        for (const item of list) {
            if (item.name === name) return { cat, record: item };
        }
    }
    return null;
}

// ================== 加载 ==================
async function loadData() {
    showStatus('正在加载 data.json...');
    try {
        const absUrl = new URL(DATA_URL, window.location.href).href;
        dataBaseUrl = absUrl.substring(0, absUrl.lastIndexOf('/') + 1);
    } catch (e) { dataBaseUrl = ''; }

    let fromFile = null;
    try {
        const resp = await fetch(DATA_URL + '?t=' + Date.now());
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        fromFile = await resp.json();
    } catch (e) {
        showStatus('无法读取 data.json（请用 http:// 打开）', true);
        updateDirtyUI();
        render();
        return;
    }

    reviewData = {};
    if (Array.isArray(fromFile)) {
        for (const item of fromFile) {
            const cat = item.category || '其他';
            if (!reviewData[cat]) reviewData[cat] = [];
            reviewData[cat].push(item);
        }
    } else {
        const vals = Object.values(fromFile);
        if (vals.length > 0 && Array.isArray(vals[0])) {
            reviewData = fromFile;
        } else {
            for (const [name, rec] of Object.entries(fromFile)) {
                const cat = rec.category || '其他';
                if (!reviewData[cat]) reviewData[cat] = [];
                reviewData[cat].push({ name, ...rec });
            }
        }
    }

    // ⭐ 记录原始快照（注入 pending 之前）
    originalSnapshot = {};
    for (const cat of Object.keys(reviewData)) {
        for (const item of reviewData[cat]) {
            originalSnapshot[item.name] = {
                level: item.level,
                nextDate: item.nextDate,
                lastReviewed: item.lastReviewed
            };
        }
    }

    // 叠加 pending
    const pending = getSavedPending();
    let applied = 0;
    for (const cat of Object.keys(reviewData)) {
        for (const item of reviewData[cat]) {
            if (pending[item.name]) {
                item.level = pending[item.name].level;
                item.nextDate = pending[item.name].nextDate;
                item.lastReviewed = pending[item.name].lastReviewed;
                applied++;
            }
        }
    }

    isDirty = applied > 0;
    undoStack = [];
    updateDirtyUI();
    render();
    showStatus('已加载 ' + flattenData().length + ' 个词根' +
        (applied > 0 ? '（含 ' + applied + ' 条本地修改）' : ''));
}

// ================== 保存 / 导出 ==================
function saveNow() {
    rebuildPending();
    const pending = getSavedPending();
    const count = Object.keys(pending).length;
    isDirty = false;
    updateDirtyUI();
    if (count === 0) {
        showStatus('✅ 已保存（无未同步修改）');
    } else {
        showStatus('✅ 已保存 ' + count + ' 条到浏览器本地');
    }
}

function updateDirtyUI() {
    const btnSave = document.getElementById('btn-save');
    if (btnSave) {
        if (isDirty) {
            btnSave.classList.add('dirty');
            btnSave.textContent = '💾 保存（有未保存修改）';
        } else {
            btnSave.classList.remove('dirty');
            btnSave.textContent = '💾 保存';
        }
    }
}

function exportData() {
    const json = JSON.stringify(reviewData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);

    // 导出后清空 pending（已经落到 data.json 里了）
    localStorage.removeItem(PENDING_KEY);
    isDirty = false;
    undoStack = [];
    updateDirtyUI();
    showStatus('已下载 data.json，替换仓库里的文件后 commit');
}

// ================== 复习操作 ==================
function completeReview(name) {
    const found = findByName(name);
    if (!found) return;
    const rec = found.record;

    undoStack.push({
        name, level: rec.level, nextDate: rec.nextDate, lastReviewed: rec.lastReviewed
    });

    const nextLevel = Math.min((rec.level || 0) + 1, INTERVALS.length);
    rec.level = nextLevel;
    rec.nextDate = addDays(INTERVALS[nextLevel - 1]);
    rec.lastReviewed = todayStr();

    isDirty = true;
    updateDirtyUI();
    render();
    showStatus('✓ 已复习：' + name + '（记得点💾保存）');
}

function resetReview(name) {
    if (!confirm('重置「' + name + '」的复习进度？')) return;
    const found = findByName(name);
    if (!found) return;
    const rec = found.record;

    undoStack.push({
        name, level: rec.level, nextDate: rec.nextDate, lastReviewed: rec.lastReviewed
    });

    // ⭐ 恢复到 data.json 里的原始值
    const orig = originalSnapshot[name];
    if (orig) {
        rec.level = orig.level;
        rec.nextDate = orig.nextDate;
        rec.lastReviewed = orig.lastReviewed;
    } else {
        rec.level = 0;
        rec.nextDate = addDays(1);
        rec.lastReviewed = todayStr();
    }

    isDirty = true;
    updateDirtyUI();
    render();
    showStatus('✓ 已重置：' + name + '（记得点💾保存）');
}

function undoLast() {
    if (undoStack.length === 0) {
        showStatus('没有可撤销的操作', true);
        return;
    }
    const snap = undoStack.pop();
    const found = findByName(snap.name);
    if (!found) return;
    found.record.level = snap.level;
    found.record.nextDate = snap.nextDate;
    found.record.lastReviewed = snap.lastReviewed;
    isDirty = true;
    updateDirtyUI();
    render();
    showStatus('已撤销：' + snap.name);
}

function undoAll() {
    if (undoStack.length === 0) {
        showStatus('没有可撤销的操作', true);
        return;
    }
    if (!confirm('撤销全部 ' + undoStack.length + ' 步操作？')) return;
    const count = undoStack.length;
    while (undoStack.length > 0) {
        const snap = undoStack.pop();
        const found = findByName(snap.name);
        if (!found) continue;
        found.record.level = snap.level;
        found.record.nextDate = snap.nextDate;
        found.record.lastReviewed = snap.lastReviewed;
    }
    isDirty = true;
    updateDirtyUI();
    render();
    showStatus('已撤销 ' + count + ' 步');
}

function reloadData() {
    if (isDirty) {
        if (!confirm('有未保存的修改，重新加载会丢弃。继续？')) return;
    }
    loadData();
}

// ================== 过滤 ==================
function filterByStartDate(items) {
    return items.filter(e => !e.created || e.created >= START_DATE);
}

// ================== 渲染 ==================
function render() {
    const today = todayStr();
    const all = flattenData();
    const filtered = filterByStartDate(all);
    const diffCount = all.length - filtered.length;

    const due = filtered
        .filter(e => e.nextDate && e.nextDate <= today)
        .sort((a, b) => (a.nextDate || '').localeCompare(b.nextDate || ''));

    const titleEl = document.getElementById('today-title');
    if (titleEl) titleEl.textContent = '今天要复习的（' + due.length + '）';

    renderDueList(due, today);
    renderAllList(filtered, today);

    if (diffCount > 0) {
        const el = document.getElementById('status');
        const base = el.textContent;
        if (!base.includes('已过滤')) {
            el.textContent = base + '  ·  已过滤 ' + diffCount + ' 个';
        }
    }
}

function renderDueList(items, today) {
    const ul = document.getElementById('due-list');
    if (!ul) return;
    if (items.length === 0) {
        ul.innerHTML = '<li class="empty">今天没有要复习的 🎉</li>';
        return;
    }
    ul.innerHTML = items.map(item => {
        const overdueDays = dateDiff(today, item.nextDate);
        const overdue = overdueDays > 0;
        const diffText = overdue ? '逾期 ' + overdueDays + ' 天' : '今天';
        const href = makeHref(item.path);
        const cat = item.category ? '[' + item.category + '] ' : '';
        return [
            '<li class="review-item ' + (overdue ? 'overdue' : '') + '">',
            '<span class="name"><a href="' + href + '" target="_blank">' + cat + item.name + '</a></span>',
            '<span class="badge">Lv.' + item.level + '</span>',
            '<span class="badge">' + diffText + '</span>',
            '<button class="btn-done" onclick="completeReview(\'' + escapeStr(item.name) + '\')">✓ 已复习</button>',
            '</li>'
        ].join('');
    }).join('');
}

function renderAllList(items, today) {
    const ul = document.getElementById('all-list');
    if (!ul) return;
    if (items.length === 0) {
        ul.innerHTML = '<li class="empty">暂无数据</li>';
        return;
    }

    const byDate = {};
    items.forEach(item => {
        const d = item.nextDate || '未安排';
        if (!byDate[d]) byDate[d] = [];
        byDate[d].push(item);
    });

    const dates = Object.keys(byDate).sort((a, b) => a.localeCompare(b));

    let html = '';
    for (const date of dates) {
        const list = byDate[date];
        const isPast = date < today;
        const isToday = date === today;
        const diff = dateDiff(date, today);

        let label;
        if (date === '未安排') label = '未安排';
        else if (isPast) label = fmtDate(date) + '（逾期 ' + Math.abs(diff) + ' 天）';
        else if (isToday) label = fmtDate(date) + '（今天）';
        else if (diff === -1) label = fmtDate(date) + '（明天）';
        else label = fmtDate(date) + '（' + Math.abs(diff) + ' 天后）';

        const cls = isPast ? 'group-title overdue-group' : 'group-title';
        html += '<li class="' + cls + '">' + label + '：' + list.length + ' 个</li>';

        list.sort((a, b) => {
            const ca = a.category || '';
            const cb = b.category || '';
            if (ca !== cb) return ca.localeCompare(cb);
            return (a.name || '').localeCompare(b.name || '');
        });

        for (const item of list) {
            const href = makeHref(item.path);
            const cat = item.category ? '[' + item.category + '] ' : '';
            html += [
                '<li class="review-item' + (isPast ? ' overdue' : '') + '">',
                '<span class="name"><a href="' + href + '" target="_blank">' +
                cat + item.name + '</a></span>',
                '<span class="badge">Lv.' + item.level + '</span>',
                '<button class="btn-reset" onclick="resetReview(\'' +
                escapeStr(item.name) + '\')">重置</button>',
                '</li>'
            ].join('');
        }
    }
    ul.innerHTML = html;
}

// ================== 启动 ==================
const btnReload = document.getElementById('btn-reload');
const btnSave = document.getElementById('btn-save');
const btnExport = document.getElementById('btn-export');
const btnUndo = document.getElementById('btn-undo');
const btnUndoAll = document.getElementById('btn-undo-all');
if (btnReload) btnReload.addEventListener('click', reloadData);
if (btnSave) btnSave.addEventListener('click', saveNow);
if (btnExport) btnExport.addEventListener('click', exportData);
if (btnUndo) btnUndo.addEventListener('click', undoLast);
if (btnUndoAll) btnUndoAll.addEventListener('click', undoAll);

loadData();