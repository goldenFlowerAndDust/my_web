// 生成json索引.js
const fs = require('fs');
const path = require('path');

function findContentFolder(startDir) {
    let dir = startDir;
    while (true) {
        if (path.basename(dir) === '内容文件夹') return dir;
        const parent = path.dirname(dir);
        if (parent === dir) return null;
        dir = parent;
    }
}

const SCRIPT_DIR = __dirname;
const CONTENT_ROOT = findContentFolder(SCRIPT_DIR);
if (!CONTENT_ROOT) {
    console.error('❌ 向上找不到「内容文件夹」');
    process.exit(1);
}

console.log('📁 内容文件夹:', CONTENT_ROOT);

const OUTPUT = path.join(SCRIPT_DIR, 'data.json');
const CATEGORY_ANCHOR = '备考专升本英语';

// ⭐ 每天配额
const DAILY_QUOTA = 2;
// ⭐ 新词根从最晚日期往后第几天开始找
const NEW_ROOT_OFFSET_DAYS = 1;

const EXCLUDE_DIRS = [
    'AI','frontend——前端','MySql','node.js','python_study','自建本地网站','自建网站中用到的外部引用',
    '复习清单','每月打卡','00-总目录'
];
const EXCLUDE_FILES = [
    '专升本可用的动态a标签显示.js','模板.html','笔记模板.html'
];

function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

function addDaysFromDate(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

function extractH1(html) {
    const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (!m) return null;
    return m[1].replace(/<[^>]+>/g, '').trim();
}

function extractCategory(fullPath) {
    const rel = path.relative(CONTENT_ROOT, fullPath).replace(/\\/g, '/');
    const parts = rel.split('/');
    const idx = parts.indexOf(CATEGORY_ANCHOR);
    if (idx > -1 && parts.length > idx + 2) return parts[idx + 1];
    return '其他';
}

function scanDir(dir) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    for (const item of fs.readdirSync(dir)) {
        if (EXCLUDE_DIRS.includes(item)) continue;
        const full = path.join(dir, item);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            results.push(...scanDir(full));
        } else if (item.endsWith('.html')) {
            if (EXCLUDE_FILES.includes(item)) continue;
            const html = fs.readFileSync(full, 'utf-8');
            const h1 = extractH1(html);
            if (!h1) {
                console.warn('  ⚠ 跳过（无 h1）:', full);
                continue;
            }
            const relPath = path.relative(SCRIPT_DIR, full).replace(/\\/g, '/');
            results.push({
                name: h1,
                path: relPath,
                category: extractCategory(full),
                created: stat.birthtime.toISOString().split('T')[0],
                modified: stat.mtime.toISOString().split('T')[0]
            });
        }
    }
    return results;
}

// ================== 扫描 ==================
const entries = [];
for (const item of fs.readdirSync(CONTENT_ROOT)) {
    if (EXCLUDE_DIRS.includes(item)) continue;
    const full = path.join(CONTENT_ROOT, item);
    if (fs.statSync(full).isDirectory()) entries.push(...scanDir(full));
}
console.log('扫描到 ' + entries.length + ' 个 HTML');

// ================== 读旧数据 ==================
let existingMap = new Map();
if (fs.existsSync(OUTPUT)) {
    try {
        const parsed = JSON.parse(fs.readFileSync(OUTPUT, 'utf-8'));
        if (Array.isArray(parsed)) {
            for (const item of parsed) existingMap.set(item.name, item);
        } else {
            const values = Object.values(parsed);
            if (values.length > 0 && Array.isArray(values[0])) {
                for (const list of values) {
                    if (!Array.isArray(list)) continue;
                    for (const item of list) existingMap.set(item.name, item);
                }
            } else {
                for (const [name, rec] of Object.entries(parsed)) {
                    existingMap.set(name, { name, ...rec });
                }
            }
        }
        console.log('  ℹ 旧数据加载完成：' + existingMap.size + ' 条');
    } catch (e) {
        console.warn('旧 data.json 解析失败，将重建');
    }
}

// ================== ⭐ 统计 + 分配器（修正核心） ==================
let maxNextDate = todayStr();
const dateCount = {};   // 每个日期已有多少条

for (const rec of existingMap.values()) {
    if (rec.nextDate) {
        if (rec.nextDate > maxNextDate) maxNextDate = rec.nextDate;
        dateCount[rec.nextDate] = (dateCount[rec.nextDate] || 0) + 1;
    }
}
console.log('  📅 当前最晚日期:', maxNextDate);

// 显示每个日期的占用情况
console.log('  📅 已有日期分布:');
Object.keys(dateCount).sort().forEach(d => {
    console.log('     ' + d + '：' + dateCount[d] + ' 个');
});

// ⭐ 分配器：从 maxNextDate 之后开始，找第一个未满的日期
let cursor = addDaysFromDate(maxNextDate, NEW_ROOT_OFFSET_DAYS);

function findNextSlot() {
    while ((dateCount[cursor] || 0) >= DAILY_QUOTA) {
        cursor = addDaysFromDate(cursor, 1);
    }
    dateCount[cursor] = (dateCount[cursor] || 0) + 1;   // ⭐ 立即占用！
    return cursor;
}

console.log('  📅 新词根起始查找:', cursor);

// ================== 合并 ==================
const grouped = {};
let added = 0;

for (const e of entries) {
    const cat = e.category || '其他';
    if (!grouped[cat]) grouped[cat] = [];

    if (existingMap.has(e.name)) {
        const old = existingMap.get(e.name);
        grouped[cat].push({
            ...old,
            name: e.name,
            path: e.path,
            category: cat,
            modified: e.modified
        });
        existingMap.delete(e.name);
    } else {
        const slot = findNextSlot();
        grouped[cat].push({
            name: e.name,
            path: e.path,
            category: cat,
            level: 0,
            nextDate: slot,
            lastReviewed: null,
            created: e.created,
            modified: e.modified
        });
        added++;
        console.log('  + [' + cat + '] ' + e.name + '  →  ' + slot);
    }
}

let removed = 0;
for (const [name] of existingMap) {
    removed++;
    console.log('  - 已删除：' + name);
}

// ================== 排序 + 写入 ==================
const finalData = {};
Object.keys(grouped).sort().forEach(cat => {
    grouped[cat].sort((a, b) => (a.nextDate || '').localeCompare(b.nextDate || ''));
    finalData[cat] = grouped[cat];
});

fs.writeFileSync(OUTPUT, JSON.stringify(finalData, null, 2), 'utf-8');

console.log('');
console.log('✅ 写入 ' + OUTPUT);
console.log('   总计 ' + entries.length + ' 个（新增 ' + added + '，删除 ' + removed + '）');
console.log('');
console.log('📂 分类统计：');
Object.entries(grouped).forEach(([cat, list]) => {
    console.log('   ' + cat + '：' + list.length + ' 个');
});