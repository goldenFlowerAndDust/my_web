(function () {
    const DATA_URL = '../复习清单/data.json';
    const PENDING_KEY = 'reviewPendingChanges';

    let allRecords = {};   // { '2026-10-07': { news: [...], reviews: [...] } }
    let dataBaseUrl = '';

    function getYearMonth() {
        const h1 = document.querySelector('h1');
        if (!h1) return { y: 2026, m: 10 };
        const m = h1.textContent.match(/(\d{4})年(\d{1,2})月/);
        if (m) return { y: parseInt(m[1]), m: parseInt(m[2]) };
        const d = new Date();
        return { y: d.getFullYear(), m: d.getMonth() + 1 };
    }

    function fmtDate(s) {
        const p = s.split('-');
        return p[0] + '年' + parseInt(p[1]) + '月' + parseInt(p[2]) + '日';
    }

    function pad2(n) { return String(n).padStart(2, '0'); }

    function makeHref(path) {
        const encoded = String(path).split('/').map(encodeURIComponent).join('/');
        return (dataBaseUrl || './') + encoded;
    }

    function getPending() {
        try { return JSON.parse(localStorage.getItem(PENDING_KEY) || '{}'); }
        catch (e) { return {}; }
    }

    function todayStr() {
        const d = new Date();
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    // ============ 加载数据 ============
    async function loadData() {
        try {
            const absUrl = new URL(DATA_URL, window.location.href).href;
            dataBaseUrl = absUrl.substring(0, absUrl.lastIndexOf('/') + 1);
            const resp = await fetch(absUrl + '?t=' + Date.now());
            const data = await resp.json();

            const allItems = [];
            for (const [cat, list] of Object.entries(data)) {
                if (!Array.isArray(list)) continue;
                for (const item of list) {
                    allItems.push({ ...item, category: cat });
                }
            }

            // 叠加本地 pending
            const pending = getPending();
            for (const item of allItems) {
                if (pending[item.name]) {
                    item.lastReviewed = pending[item.name].lastReviewed;
                    item.level = pending[item.name].level;
                    item.nextDate = pending[item.name].nextDate;
                }
            }

            // 按日期聚合
            allRecords = {};
            for (const item of allItems) {
                if (item.created) {
                    if (!allRecords[item.created]) allRecords[item.created] = { news: [], reviews: [] };
                    allRecords[item.created].news.push(item);
                }
                if (item.lastReviewed) {
                    if (!allRecords[item.lastReviewed]) allRecords[item.lastReviewed] = { news: [], reviews: [] };
                    allRecords[item.lastReviewed].reviews.push(item);
                }
            }

            renderCalendar();
            renderSummary();
        } catch (e) {
            console.error(e);
            document.getElementById('calendar').innerHTML =
                '<p style="color:red">无法读取 data.json</p>';
        }
    }

    // ============ 渲染日历 ============
    function renderCalendar() {
        const { y, m } = getYearMonth();
        const cal = document.getElementById('calendar');

        // 第一天是星期几（周一 = 0）
        const firstWeekday = (new Date(y, m - 1, 1).getDay() + 6) % 7;
        const daysInMonth = new Date(y, m, 0).getDate();
        const today = todayStr();

        let html = '';

        // 星期表头
        ['一', '二', '三', '四', '五', '六', '日'].forEach(w => {
            html += '<div class="cal-head">' + w + '</div>';
        });

        // 前置空格
        for (let i = 0; i < firstWeekday; i++) {
            html += '<div class="cal-cell empty"></div>';
        }

        // 每一天
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = y + '-' + pad2(m) + '-' + pad2(d);
            const rec = allRecords[dateStr];
            const hasRec = rec && (rec.news.length > 0 || rec.reviews.length > 0);

            let cls = 'cal-cell';
            if (dateStr === today) cls += ' today';
            else if (hasRec) cls += ' has-record';
            else if (dateStr < today) cls += ' past-empty';
            else cls += ' future';

            let badges = '';
            if (rec) {
                if (rec.news.length > 0) {
                    badges += '<span class="badge-new">新增 ' + rec.news.length + '</span>';
                }
                if (rec.reviews.length > 0) {
                    badges += '<span class="badge-review">复习 ' + rec.reviews.length + '</span>';
                }
            }

            html += '<div class="' + cls + '" data-date="' + dateStr + '">' +
                '<div class="day-num">' + d + '</div>' +
                '<div class="cal-badges">' + badges + '</div>' +
                '</div>';
        }

        cal.innerHTML = html;

        // 点击某天显示详情
        cal.addEventListener('click', function (e) {
            const cell = e.target.closest('.cal-cell');
            if (!cell || cell.classList.contains('empty')) return;
            showDayDetail(cell.dataset.date);
        });
    }

    // ============ 显示某天详情 ============
    function showDayDetail(dateStr) {
        const el = document.getElementById('day-detail');
        const rec = allRecords[dateStr];
        if (!rec) {
            el.innerHTML = '<h3>' + fmtDate(dateStr) + '</h3><p>这天没有记录</p>';
            return;
        }

        let html = '<h3>' + fmtDate(dateStr) + '</h3>';

        if (rec.news.length > 0) {
            html += '<div class="section-label">📄 新增（' + rec.news.length + '）</div>';
            html += '<div class="root-list">';
            html += rec.news.map(item =>
                '<a href="' + makeHref(item.path) + '" target="_blank">' +
                '[' + (item.category || '') + '] ' + item.name + '</a>'
            ).join('');
            html += '</div>';
        }

        if (rec.reviews.length > 0) {
            html += '<div class="section-label">🔁 复习（' + rec.reviews.length + '）</div>';
            html += '<div class="root-list">';
            html += rec.reviews.map(item =>
                '<a href="' + makeHref(item.path) + '" target="_blank">' +
                '[' + (item.category || '') + '] ' + item.name + '</a>'
            ).join('');
            html += '</div>';
        }

        el.innerHTML = html;
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ============ 顶部汇总 ============
    function renderSummary() {
        const { y, m } = getYearMonth();
        const prefix = y + '-' + pad2(m);

        let newCount = 0;
        let reviewCount = 0;
        let activeDays = 0;

        for (const [date, rec] of Object.entries(allRecords)) {
            if (!date.startsWith(prefix)) continue;
            if (rec.news.length > 0 || rec.reviews.length > 0) activeDays++;
            newCount += rec.news.length;
            reviewCount += rec.reviews.length;
        }

        document.getElementById('summary').textContent =
            '本月：新增 ' + newCount + ' 个 · 复习 ' + reviewCount + ' 次 · 有记录 ' + activeDays + ' 天';
    }

    // ============ 启动 ============
    loadData();
    window.addEventListener('focus', loadData);
    window.addEventListener('pageshow', loadData);
    window.addEventListener('storage', e => {
        if (e.key === PENDING_KEY) loadData();
    });
})();