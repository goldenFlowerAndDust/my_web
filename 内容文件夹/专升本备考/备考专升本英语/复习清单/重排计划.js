// 重排复习计划.js
// 用法：node 重排复习计划.js
// 功能：按 created 从早到晚排序，从明天开始，每天分 N 个，依次摊开
// 已复习过的（level > 0）不动

const fs = require('fs');
const path = require('path');

// ================== 配置 ==================
// ⭐ 每天分配多少个
//    调这个数控制节奏：太小拖太久，太大每天压力大
const DAILY_QUOTA = 2;

// ⭐ 从第几天开始排（1 = 明天）
const START_OFFSET_DAYS = 0;

const DATA_FILE = path.join(__dirname, 'data.json');

// ================== 工具 ==================
function addDaysFromDate(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

// ================== 读数据 ==================
if (!fs.existsSync(DATA_FILE)) {
    console.error('❌ 找不到 ' + DATA_FILE);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

// ================== 打平 ==================
const allItems = [];
for (const [cat, list] of Object.entries(data)) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
        allItems.push({ cat, item });
    }
}

console.log('总条目：' + allItems.length);

// ================== 按 created 排序 ==================
allItems.sort((a, b) => {
    const ca = a.item.created || '9999-99-99';
    const cb = b.item.created || '9999-99-99';
    if (ca !== cb) return ca.localeCompare(cb);
    return (a.item.name || '').localeCompare(b.item.name || '');
});

// ================== 重排 ==================
const today = todayStr();
let dayOffset = START_OFFSET_DAYS;
let countOnDay = 0;
let scheduled = 0;
let skipped = 0;
let lastDate = '';

console.log('');
console.log('=== 排期 ===');

for (const { item } of allItems) {
    // 已复习的跳过
    if (item.level && item.level > 0) {
        skipped++;
        continue;
    }

    // 当天配额满了 → 进入下一天
    if (countOnDay >= DAILY_QUOTA) {
        dayOffset++;
        countOnDay = 0;
    }

    item.nextDate = addDaysFromDate(today, dayOffset);
    countOnDay++;
    scheduled++;
    lastDate = item.nextDate;

    console.log('  ' + item.nextDate + '  ←  [' + (item.category || '') + '] ' + item.name);
}

// ================== 写入 ==================
fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

console.log('');
console.log('✅ 已重排 ' + DATA_FILE);
console.log('   排入 ' + scheduled + ' 个，跳过 ' + skipped + ' 个（已复习）');
console.log('   每天配额：' + DAILY_QUOTA + ' 个');
console.log('   起始：' + addDaysFromDate(today, START_OFFSET_DAYS));
console.log('   结束：' + lastDate);