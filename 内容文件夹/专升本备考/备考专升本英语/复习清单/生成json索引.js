// 生成json索引.js
// 用法：node 生成json索引.js
// 新词根自动排在"当前最晚复习日期"之后，不再堆在一起

const fs = require('fs');
const path = require('path');

// ================== 向上查找「内容文件夹」 ==================
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
    console.error('❌ 从 ' + SCRIPT_DIR + ' 向上找不到「内容文件夹」');
    process.exit(1);
}

console.log('📁 内容文件夹:', CONTENT_ROOT);
console.log('📁 data.json 目录:', SCRIPT_DIR);

// ================== 配置 ==================
const OUTPUT = path.join(SCRIPT_DIR, 'data.json');
const CATEGORY_ANCHOR = '备考专升本英语';

// ⭐ 新词根：排在当前最晚 nextDate 之后的第几天
// 比如最新排到 10-15，新词根排到 10-16（加 1）
const NEW_ROOT_OFFSET_DAYS = 1;

// 跳过的目录名
const EXCLUDE_DIRS = [
    'AI','frontend——前端','MySql','node.js','python_study','自建本地网站','自建网站中用到的外部引用',
    '复习清单','每月打卡','00-总目录'
];

// 跳过的文件名
const EXCLUDE_FILES = [
    '专升本可用的动态a标签显示.js','模板.html','笔记模板.html'
];

// ================== 工具 ==================
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

// ================== 递归扫描 ==================
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

// ================== 主流程 ==================
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
            console.log('  ℹ 旧数据：数组格式');
        } else {
            const values = Object.values(parsed);
            if (values.length > 0 && Array.isArray(values[0])) {
                for (const list of values) {
                    if (!Array.isArray(list)) continue;
                    for (const item of list) existingMap.set(item.name, item);
                }
                console.log('  ℹ 旧数据：分类分组格式');
            } else {
                for (const [name, rec] of Object.entries(parsed)) {
                    existingMap.set(name, {name, ...rec});
                }
                console.log('  ℹ 旧数据：对象格式');
            }
        }
    } catch (e) {
        console.warn('旧 data.json 解析失败，将重建');
    }
}

// ⭐ 计算当前所有条目里最大的 nextDate
let maxNextDate = todayStr();
for (const rec of existingMap.values()) {
    if (rec.nextDate && rec.nextDate > maxNextDate) {
        maxNextDate = rec.nextDate;
    }
}
console.log('  📅 当前最晚复习日期:', maxNextDate);

// 新词根的 nextDate
const newRootNextDate = addDaysFromDate(maxNextDate, NEW_ROOT_OFFSET_DAYS);
console.log('  📅 新词根将排在:', newRootNextDate);

// ================== 合并 ==================
const grouped = {};
let added = 0;

for (const e of entries) {
    const cat = e.category || '其他';
    if (!grouped[cat]) grouped[cat] = [];

    if (existingMap.has(e.name)) {
        // 旧条目：保留进度，只更新路径/分类/修改时间
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
        // 新条目：排在 maxNextDate 之后
        grouped[cat].push({
            name: e.name,
            path: e.path,
            category: cat,
            level: 0,
            nextDate: newRootNextDate,
            lastReviewed: null,
            created: e.created,
            modified: e.modified
        });
        added++;
        console.log('  + [' + cat + '] ' + e.name + '  →  ' + newRootNextDate);
    }
}

// ================== 清理 ==================
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