/* ==========================================================================
   单词自动归档 · AI 分类
   前端只负责输入和展示；API Key、文件写入都在本地 Python 服务。
   ========================================================================== */

(function () {
    'use strict';

    var API_BASE = (window.location.protocol === 'http:' && window.location.port === '8767')
        ? ''
        : 'http://127.0.0.1:8767';

    var wordInput = document.getElementById('wordInput');
    var hintInput = document.getElementById('hintInput');
    var btnCheck = document.getElementById('btnCheck');
    var btnAnalyze = document.getElementById('btnAnalyze');
    var btnArchive = document.getElementById('btnArchive');
    var btnHealth = document.getElementById('btnHealth');
    var resultArea = document.getElementById('resultArea');
    var resultBadge = document.getElementById('resultBadge');
    var inputBadge = document.getElementById('inputBadge');
    var statusEl = document.getElementById('genStatus');
    var serviceBar = document.getElementById('serviceBar');
    var serviceDot = document.getElementById('serviceDot');
    var serviceTitle = document.getElementById('serviceTitle');
    var serviceText = document.getElementById('serviceText');
    var toastEl = document.getElementById('toast');
    var toastTimer = null;

    var lastAnalysis = null;
    var busy = false;

    function esc(value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[ch];
        });
    }

    function setStatus(message, type) {
        statusEl.textContent = message || '';
        statusEl.className = 'gen_status' + (type ? ' is_' + type : '');
    }

    function toast(message) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.classList.remove('is_error');
        toastEl.classList.add('is_show');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            toastEl.classList.remove('is_show');
        }, 2400);
    }

    function normalizeWord() {
        return (wordInput.value || '').trim().toLowerCase();
    }

    function validWord(word) {
        return /^[a-z][a-z'-]{0,48}$/.test(word);
    }

    function setBusy(value, mode) {
        busy = value;
        btnCheck.disabled = value;
        btnAnalyze.disabled = value;
        btnArchive.disabled = value;
        btnHealth.disabled = value;
        if (value) {
            if (mode === 'archive') {
                inputBadge.textContent = '写入中…';
                setStatus('正在调用 DeepSeek 并写入文件，请稍候…', 'busy');
            } else if (mode === 'check') {
                inputBadge.textContent = '检查中…';
                setStatus('正在检查是否已录入，不调用 API…', 'busy');
            } else {
                inputBadge.textContent = '分析中…';
                setStatus('正在调用 DeepSeek 分析构词，请稍候…', 'busy');
            }
        }
    }

    function setService(kind, title, text) {
        serviceBar.classList.remove('is_ok', 'is_warn', 'is_error');
        serviceBar.classList.add('is_' + kind);
        serviceTitle.textContent = title;
        serviceText.textContent = text;
    }

    async function checkHealth() {
        btnHealth.disabled = true;
        setService('warn', '正在检测本地服务…', '检查 ' + (API_BASE || '当前地址') + '/api/health');
        try {
            var resp = await fetch(API_BASE + '/api/health', { cache: 'no-store' });
            var data = await resp.json();
            if (!resp.ok || !data.ok) throw new Error('服务返回异常');
            if (!data.api_key) {
                setService('warn', '服务已连接，但缺少 API Key', '请把 Key 写入 词素工具/API.txt（和 py 同目录），或设置 DEEPSEEK_API_KEY。');
            } else {
                setService('ok', '本地服务已连接 · ' + data.model,
                    'API Key 只在服务端；工具页：' + (window.location.port === '8767' ? '当前地址' : 'http://127.0.0.1:8767/单词模块/词汇代码生成器.html'));
            }
        } catch (err) {
            setService('error', '本地服务未连接', '先运行 python 词素工具/server.py，再点“重新检测”。');
        } finally {
            btnHealth.disabled = false;
        }
    }

    async function post(path, payload) {
        var resp = await fetch(API_BASE + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload)
        });
        var data = null;
        try {
            data = await resp.json();
        } catch (err) {
            throw new Error('服务返回的不是 JSON（HTTP ' + resp.status + '）。');
        }
        if (!resp.ok || !data || data.ok === false) {
            throw new Error((data && data.error) || ('请求失败：HTTP ' + resp.status));
        }
        return data;
    }

    function typeLabel(type) {
        return {
            suffix: '后缀派生',
            prefix: '前缀派生',
            root_family: '词根 / 本体-变体',
            compound: '复合词',
            atom: '原子词'
        }[type] || type;
    }

    function fileHref(location) {
        if (!location || !location.file) return '';
        var file = String(location.file).replace(/\\/g, '/');
        var anchor = location.anchor ? '#' + location.anchor : '';
        return '../' + file + anchor;
    }

    function renderPreview(analysis) {
        var morph = analysis.morphology || {};
        var senses = (analysis.senses || []).map(function (sense) {
            var colloc = sense.collocation
                ? '<span class="preview_colloc"><code>' + esc(sense.collocation) + '</code>' + esc(sense.collocation_zh || '') + '</span>'
                : '';
            return '<li><span>' + esc(sense.zh) + '</span>' + colloc + '</li>';
        }).join('');
        var related = (analysis.related || []).length
            ? '<div class="preview_related"><strong>同族词</strong>' +
              analysis.related.map(function (item) {
                  return '<span><code>' + esc(item.word) + '</code> ' + esc(item.meaning_zh || '') + '</span>';
              }).join('') + '</div>'
            : '';

        return '<div class="preview_card">' +
            '<div class="preview_card_top">' +
            '<span class="preview_word">' + esc(analysis.word) + '</span>' +
            '<span class="preview_meaning">' + esc(analysis.meaning_zh) + '</span>' +
            '<span class="preview_pos">' + esc(analysis.pos) + '</span>' +
            '</div>' +
            '<p class="preview_formula"><code>' + esc(morph.root || '') + '</code>' +
            '<span>——&gt;</span><code>' + esc(analysis.word) + '</code>' +
            '<span class="preview_explain">' + esc(morph.explanation || '') + '</span></p>' +
            '<ul class="preview_senses">' + senses + '</ul>' +
            '<p class="preview_example"><span>例</span><code>' + esc(analysis.example) + '</code>' +
            '<em>' + esc(analysis.example_zh) + '</em></p>' +
            '<p class="preview_note">' + esc(analysis.note || '') + '</p>' +
            related +
            '</div>';
    }

    function renderResult(data, written) {
        var analysis = data.analysis;
        var morph = analysis.morphology || {};
        var target = analysis.target || {};
        var location = data.location;
        var schedule = data.data && data.data.schedule;
        var href = fileHref(location);
        var backup = data.backup;

        lastAnalysis = analysis;
        resultBadge.textContent = written ? '已写入' : '仅分析';
        inputBadge.textContent = written ? '已归档' : '已分析';

        var targetRows = [
            ['分类', target.label || ''],
            ['构词', morph.explanation || ''],
            ['词根', (morph.root || '') + (morph.root_meaning_zh ? '（' + morph.root_meaning_zh + '）' : '')]
        ];
        if (written) {
            targetRows.push(['写入文件', location && location.file ? location.file : '']);
            targetRows.push(['额外新增', schedule ? schedule + ' · 不占每日 20 词' : '']);
        } else {
            targetRows.push(['状态', '仅预览，尚未写入任何文件']);
        }
        if (backup) targetRows.push(['备份', backup]);

        var rowsHtml = targetRows.map(function (row) {
            return '<div class="result_row"><span>' + esc(row[0]) + '</span><strong>' + esc(row[1]) + '</strong></div>';
        }).join('');

        var actionHtml = '';
        if (written) {
            actionHtml = '<div class="result_actions">' +
                (href ? '<a class="btn btn_primary btn_small" href="' + esc(href) + '" target="_blank" rel="noopener">打开写入页面</a>' : '') +
                '<a class="btn btn_soft btn_small" href="../复习清单/核心词汇复习清单.html">去复习清单</a>' +
                '<button type="button" class="btn btn_soft btn_small" id="btnAgain">再添加一个</button>' +
                '</div>';
        } else {
            actionHtml = '<div class="result_actions">' +
                '<button type="button" class="btn btn_primary btn_small" id="btnWriteFromPreview">写入这个分析</button>' +
                '<a class="btn btn_soft btn_small" href="../复习清单/核心词汇复习清单.html">去复习清单</a>' +
                '</div>';
        }

        resultArea.innerHTML =
            '<div class="result_head">' +
            '<div><span class="result_word">' + esc(analysis.word) + '</span>' +
            '<span class="result_meaning">' + esc(analysis.meaning_zh) + '</span></div>' +
            '<div class="result_tags"><span class="result_tag">' + esc(typeLabel(morph.type)) + '</span>' +
            '<span class="result_tag">' + esc(analysis.pos) + '</span>' +
            '<span class="result_tag">' + esc(analysis.level) + '</span></div>' +
            '</div>' +
            '<div class="result_rows">' + rowsHtml + '</div>' +
            renderPreview(analysis) +
            actionHtml;

        var again = document.getElementById('btnAgain');
        if (again) {
            again.addEventListener('click', function () {
                wordInput.value = '';
                hintInput.value = '';
                wordInput.focus();
                resultArea.innerHTML = '<div class="result_empty"><span class="result_empty_icon">A</span>' +
                    '<p>输入下一个单词。</p></div>';
                resultBadge.textContent = '等待输入';
                inputBadge.textContent = '等待输入';
                setStatus('', '');
            });
        }

        var writeBtn = document.getElementById('btnWriteFromPreview');
        if (writeBtn) {
            writeBtn.addEventListener('click', function () {
                doArchive();
            });
        }
    }

    function renderError(message) {
        resultBadge.textContent = '失败';
        inputBadge.textContent = '失败';
        resultArea.innerHTML = '<div class="result_error">' +
            '<strong>没有写入</strong>' +
            '<p>' + esc(message) + '</p>' +
            '<p class="result_error_hint">修复后可以重试；如果 API 连接中断，直接再点一次即可。</p>' +
            '</div>';
    }

    function renderCheckResult(data) {
        var exists = !!data.exists;
        var item = data.data_item || (data.data && data.data.item) || null;
        resultBadge.textContent = exists ? '已录入' : '未录入';
        inputBadge.textContent = exists ? '已录入' : '可录入';

        var rows = [];
        if (data.data_category || (item && item.category)) rows.push(['分类', data.data_category || item.category]);
        if (data.page_file) rows.push(['页面', data.page_file]);
        if (item) {
            rows.push(['当前等级', '第 ' + (item.level || 0) + ' 次']);
            rows.push(['当前日程', item.nextDate || '']);
        }
        if (!rows.length) rows.push(['状态', '尚未录入']);

        var rowsHtml = rows.map(function (row) {
            return '<div class="result_row"><span>' + esc(row[0]) + '</span><strong>' + esc(row[1]) + '</strong></div>';
        }).join('');

        var body = exists
            ? '<div class="result_exists">' +
              '<strong>已录入，不会新建页面。</strong>' +
              '<p>已录入的词不会重复创建，也不再提供“插队”操作。需要复习时直接在复习清单或全部词条中查看。</p>' +
              '</div>'
            : '<div class="result_not_exists">' +
              '<strong>尚未录入。</strong>' +
              '<p>可以点“分析并写入”，AI 会判断分类并创建对应内容；新词会排到明天的“额外新增”。</p>' +
              '</div>';

        var actions = '<div class="result_actions">' +
            (exists
                ? '<a class="btn btn_primary btn_small" href="../复习清单/核心词汇复习清单.html">去复习清单</a>'
                : '<button type="button" class="btn btn_primary btn_small" id="btnWriteFromCheck">分析并写入</button>' +
                  '<a class="btn btn_soft btn_small" href="../复习清单/核心词汇复习清单.html">去复习清单</a>') +
            '</div>';

        resultArea.innerHTML =
            '<div class="result_head">' +
            '<div><span class="result_word">' + esc(data.word) + '</span></div>' +
            '<div class="result_tags"><span class="result_tag">' + (exists ? '已录入' : '新词') + '</span></div>' +
            '</div>' +
            '<div class="result_rows">' + rowsHtml + '</div>' +
            body +
            actions;

        var writeBtn = document.getElementById('btnWriteFromCheck');
        if (writeBtn) writeBtn.addEventListener('click', doArchive);
    }

    async function doAnalyze() {
        if (busy) return;
        var word = normalizeWord();
        if (!validWord(word)) {
            setStatus('请输入单个英文单词（字母、连字符或撇号）。', 'error');
            wordInput.focus();
            return;
        }
        setBusy(true, 'analyze');
        try {
            var data = await post('/api/analyze', { word: word, hint: hintInput.value.trim() });
            renderResult(data, false);
            setStatus('分析完成：' + data.analysis.target.label + '。尚未写入。', 'ok');
            toast('分析完成');
        } catch (err) {
            renderError(err.message);
            setStatus('分析失败：' + err.message, 'error');
            toast('分析失败');
        } finally {
            setBusy(false);
        }
    }

    async function doArchive() {
        if (busy) return;
        var word = normalizeWord();
        if (!validWord(word)) {
            setStatus('请输入单个英文单词（字母、连字符或撇号）。', 'error');
            wordInput.focus();
            return;
        }
        setBusy(true, 'archive');
        try {
            var data = await post('/api/archive', { word: word, hint: hintInput.value.trim() });
            if (data.exists) {
                renderCheckResult(data);
                setStatus(data.message || '已录入，不会重复创建。', 'ok');
                toast('已录入');
            } else {
                renderResult(data, true);
                setStatus('已写入：' + data.location.target + '；额外新增 ' + data.data.schedule + '。', 'ok');
                toast('已写入，排到明天的额外新增');
            }
        } catch (err) {
            renderError(err.message);
            setStatus('写入失败：' + err.message, 'error');
            toast('写入失败');
        } finally {
            setBusy(false);
        }
    }

    async function doCheck() {
        if (busy) return;
        var word = normalizeWord();
        if (!validWord(word)) {
            setStatus('请输入单个英文单词（字母、连字符或撇号）。', 'error');
            wordInput.focus();
            return;
        }
        setBusy(true, 'check');
        try {
            var data = await post('/api/check', { word: word });
            renderCheckResult(data);
            setStatus(data.message, data.exists ? 'ok' : '');
            toast(data.exists ? '已录入' : '尚未录入');
        } catch (err) {
            renderError(err.message);
            setStatus('检查失败：' + err.message, 'error');
            toast('检查失败');
        } finally {
            setBusy(false);
        }
    }

    btnCheck.addEventListener('click', doCheck);
    btnAnalyze.addEventListener('click', doAnalyze);
    btnArchive.addEventListener('click', doArchive);
    btnHealth.addEventListener('click', checkHealth);

    wordInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            doAnalyze();
        }
    });

    document.querySelectorAll('.quick_word').forEach(function (button) {
        button.addEventListener('click', function () {
            wordInput.value = button.dataset.word || '';
            hintInput.value = '';
            wordInput.focus();
            inputBadge.textContent = '等待分析';
        });
    });

    checkHealth();
})();
