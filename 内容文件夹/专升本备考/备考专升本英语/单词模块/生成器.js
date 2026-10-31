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
    var btnJsonAudit = document.getElementById('btnJsonAudit');
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

    var genModeEl = document.getElementById('genMode');
    var cloudDialog = document.getElementById('cloudDialog');
    var cloudForm = document.getElementById('cloudForm');
    var btnCloudSettings = document.getElementById('btnCloudSettings');
    var cloudClose = document.getElementById('cloudClose');
    var cloudUrl = document.getElementById('cloudUrl');
    var cloudToken = document.getElementById('cloudToken');
    var cloudBadge = document.getElementById('cloudBadge');
    var cloudStatus = document.getElementById('cloudStatus');
    var cloudDialogStatus = document.getElementById('cloudDialogStatus');
    var btnCloudTest = document.getElementById('btnCloudTest');
    var btnCloudExport = document.getElementById('btnCloudExport');
    var CLOUD_CONFIG_KEY = 'english-generator-cloud-v1';

    var lastAnalysis = null;
    var lastCheckState = 'none';
    var busy = false;
    var actionsLocked = false;

    function lockMainActions(lock) {
        actionsLocked = Boolean(lock);
        btnAnalyze.disabled = actionsLocked || busy;
        btnArchive.disabled = actionsLocked || busy;
        btnJsonAudit.disabled = busy;
    }

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

    function cloudBase() {
        return (cloudUrl.value || '').trim().replace(/\/+$/, '');
    }

    function cloudConfigured() {
        return Boolean(cloudBase() && (cloudToken.value || '').trim());
    }

    function saveCloudConfig() {
        try {
            localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify({
                mode: genModeEl.value,
                url: cloudBase(),
                token: cloudToken.value.trim()
            }));
        } catch (err) {
            // localStorage 不可用时忽略。
        }
    }

    function loadCloudConfig() {
        try {
            var raw = localStorage.getItem(CLOUD_CONFIG_KEY);
            if (!raw) return;
            var data = JSON.parse(raw);
            if (data && (data.mode === 'cloud' || data.mode === 'local')) {
                genModeEl.value = data.mode;
            }
            if (data && data.url) cloudUrl.value = data.url;
            if (data && data.token) cloudToken.value = data.token;
        } catch (err) {
            // 忽略损坏配置。
        }
    }

    function setCloudStatus(message, type) {
        if (!cloudStatus) return;
        cloudStatus.textContent = message || '';
        cloudStatus.className = 'cloud_status' + (type ? ' is-' + type : '');
    }

    function setDialogStatus(message, type) {
        if (!cloudDialogStatus) return;
        cloudDialogStatus.textContent = message || '';
        cloudDialogStatus.className = 'cloud_status' + (type ? ' is-' + type : '');
    }

    function applyMode() {
        var cloud = genModeEl.value === 'cloud';
        btnCheck.hidden = cloud;
        btnAnalyze.hidden = cloud;
        if (btnJsonAudit) btnJsonAudit.hidden = cloud;
        btnArchive.hidden = !cloud;
        btnArchive.textContent = cloud ? '加入云端待归档' : '分析并写入';
        wordInput.placeholder = cloud
            ? '例如：mean，或中文“意思是；平均的”'
            : '例如：friendship';
        if (cloudBadge) cloudBadge.textContent = cloud ? '云端排队' : '本地模式';
        if (btnCloudExport) btnCloudExport.disabled = !cloud;
        if (cloud) {
            setCloudStatus(
                cloudConfigured()
                    ? '云端模式：只入队，不写本地文件。输入英文单词或中文意思。'
                    : '先点“云端连接设置”填写地址和口令，再输入英文单词或中文意思。',
                cloudConfigured() ? 'ok' : 'error'
            );
        } else {
            setCloudStatus('本地模式：分析并直接写入文件。', '');
        }
        saveCloudConfig();
    }

    function validCloudQuery(value) {
        var text = String(value || '').trim();
        if (/^[A-Za-z][A-Za-z'-]{1,40}$/.test(text)) return true;
        if (!/[\u4e00-\u9fff]/.test(text)) return false;
        if (text.length > 40 || /[\n\r?？!！。]/.test(text)) return false;
        return true;
    }

    async function cloudPost(path, payload) {
        if (!cloudConfigured()) {
            throw new Error('先填写云端地址和访问口令。');
        }
        var resp = await fetch(cloudBase() + path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'X-Tutor-Token': cloudToken.value.trim()
            },
            body: JSON.stringify(payload)
        });
        var data = await resp.json().catch(function () { return null; });
        if (!resp.ok || !data || !data.ok) {
            throw new Error((data && data.error) || ('HTTP ' + resp.status));
        }
        return data;
    }

    async function doCloudTest() {
        if (busy) return;
        if (!cloudBase()) {
            setCloudStatus('先填写云端地址。', 'error');
            return;
        }
        btnCloudTest.disabled = true;
        setCloudStatus('正在检测云端…', '');
        setDialogStatus('正在检测云端…', '');
        try {
            var resp = await fetch(cloudBase() + '/api/health', { cache: 'no-store' });
            var data = await resp.json().catch(function () { return null; });
            if (!resp.ok || !data || !data.ok) {
                throw new Error((data && data.error) || ('HTTP ' + resp.status));
            }
            var message = '云端已连接 · ' + (data.model || 'deepseek-chat') +
                (data.kv_bound ? ' · KV 已绑定' : ' · 未绑定 KV');
            setCloudStatus(message, data.kv_bound ? 'ok' : 'error');
            setDialogStatus(message, data.kv_bound ? 'ok' : 'error');
        } catch (err) {
            setCloudStatus('云端连接失败：' + (err.message || '未知错误'), 'error');
            setDialogStatus('云端连接失败：' + (err.message || '未知错误'), 'error');
        } finally {
            btnCloudTest.disabled = false;
        }
    }

    function downloadCloudPending(entries, cleanupToken, cleanupUrl) {
        var now = new Date();
        var stamp = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + '-' +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0');
        var payload = {
            exported_at: now.toISOString(),
            source: 'cloudflare-kv',
            cloud_url: cloudBase(),
            cleanup_url: cleanupUrl || '',
            cleanup_token: cleanupToken || '',
            count: entries.length,
            entries: entries
        };
        var blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: 'application/json;charset=utf-8'
        });
        var objectUrl = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = objectUrl;
        link.download = '生成器待归档单词-' + stamp + '.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function () { URL.revokeObjectURL(objectUrl); }, 1000);
    }

    async function doCloudExport() {
        if (busy) return;
        if (!cloudConfigured()) {
            setCloudStatus('先填写云端地址和访问口令。', 'error');
            return;
        }
        btnCloudExport.disabled = true;
        setCloudStatus('正在读取云端待归档…', '');
        try {
            var resp = await fetch(cloudBase() + '/api/pending-words', {
                cache: 'no-store',
                headers: { 'X-Tutor-Token': cloudToken.value.trim() }
            });
            var data = await resp.json().catch(function () { return null; });
            if (!resp.ok || !data || !data.ok) {
                throw new Error((data && data.error) || ('HTTP ' + resp.status));
            }
            var entries = (Array.isArray(data.entries) ? data.entries : []).filter(function (item) {
                return item && item.source === 'generator';
            });
            if (!entries.length) {
                setCloudStatus('云端没有生成器待归档单词。', 'error');
                return;
            }
            downloadCloudPending(entries, data.cleanup_token || '', data.cleanup_url || '');
            setCloudStatus('已导出 ' + entries.length + ' 个待归档单词；本地导入成功后会自动清理云端队列。', 'ok');
        } catch (err) {
            setCloudStatus('导出失败：' + (err.message || '未知错误'), 'error');
        } finally {
            btnCloudExport.disabled = false;
        }
    }

    function renderCloudQueue(data) {
        var word = String(data.word || '');
        var meaning = String(data.meaning_zh || '');
        lastAnalysis = null;
        resultBadge.textContent = data.already_pending ? '已在队列' : '已入队';
        inputBadge.textContent = '云端待归档';
        resultArea.innerHTML =
            '<div class="result_head">' +
            '<div><span class="result_word">' + esc(word) + '</span>' +
            (meaning ? '<span class="result_meaning">' + esc(meaning) + '</span>' : '') +
            '</div>' +
            '<div class="result_tags"><span class="result_tag">云端待归档</span></div>' +
            '</div>' +
            '<div class="result_exists"><strong>' +
            (data.already_pending ? '这个词已经在队列里。' : '已加入云端待归档。') +
            '</strong><p>' + esc(data.message || '') + '</p>' +
            '<p>导出 JSON 后，拖到 <code>导入待归档单词.bat</code>；本地会重新分析并写入词库。</p></div>' +
            '<div class="result_actions">' +
            '<button type="button" class="btn btn_primary btn_small" id="btnCloudExportNow">导出待归档 JSON</button>' +
            '</div>';
        var exportNow = document.getElementById('btnCloudExportNow');
        if (exportNow) exportNow.addEventListener('click', doCloudExport);
    }

    async function doCloudQueue() {
        if (busy) return;
        var query = (wordInput.value || '').trim();
        if (!validCloudQuery(query)) {
            setStatus('云端只接受一个英文单词，或一个简短中文意思；不要输入句子或问句。', 'error');
            wordInput.focus();
            return;
        }
        setBusy(true, 'cloud');
        try {
            var data = await cloudPost('/api/queue-word', { query: query });
            renderCloudQueue(data);
            setStatus(data.message || '已加入云端待归档。', 'ok');
            toast(data.already_pending ? '已在云端待归档' : '已加入云端待归档');
        } catch (err) {
            renderError(err.message);
            setStatus('加入云端待归档失败：' + err.message, 'error');
            toast('加入云端失败');
        } finally {
            setBusy(false);
        }
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
        btnAnalyze.disabled = value || actionsLocked;
        btnArchive.disabled = value || actionsLocked;
        btnJsonAudit.disabled = value;
        btnHealth.disabled = value;
        if (value) {
            if (mode === 'archive') {
                inputBadge.textContent = '写入中…';
                setStatus('正在调用 DeepSeek 并写入文件，请稍候…', 'busy');
            } else if (mode === 'check') {
                inputBadge.textContent = '检查中…';
                setStatus('正在检查是否已录入，不调用 API…', 'busy');
            } else if (mode === 'repair') {
                inputBadge.textContent = '修复中…';
                setStatus('正在删除旧记录并重建 HTML / JSON，请稍候…', 'busy');
            } else if (mode === 'cloud') {
                inputBadge.textContent = '入队中…';
                setStatus('正在加入云端待归档，不写本地文件…', 'busy');
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

    function senseGroups(analysis) {
        var groups = [];
        var groupMap = {};
        (analysis.senses || []).forEach(function (sense) {
            var pos = String(sense.pos || analysis.pos || '其他').trim();
            if (!groupMap[pos]) {
                groupMap[pos] = [];
                groups.push([pos, groupMap[pos]]);
            }
            groupMap[pos].push(sense);
        });
        if (!groups.length) {
            groups.push([String(analysis.pos || '其他'), [{ zh: analysis.meaning_zh || '' }]]);
        }
        return groups;
    }

    function posSummary(analysis) {
        var values = [];
        (analysis.senses || []).forEach(function (sense) {
            var pos = String(sense.pos || '').trim();
            if (pos && values.indexOf(pos) < 0) values.push(pos);
        });
        return values.length ? values.join(' / ') : String(analysis.pos || '');
    }

    function renderPreview(analysis) {
        var morph = analysis.morphology || {};
        var groups = senseGroups(analysis);

        var senses = groups.map(function (group) {
            var pos = group[0];
            var items = group[1].map(function (sense) {
                var colloc = sense.collocation
                    ? '<span class="preview_colloc"><code>' + esc(sense.collocation) + '</code>' + esc(sense.collocation_zh || '') + '</span>'
                    : '';
                return '<li><span>' + esc(sense.zh) + '</span>' + colloc + '</li>';
            }).join('');
            return '<li class="preview_pos_group">' +
                '<span class="preview_pos_badge">' + esc(pos) + '</span>' +
                '<ul class="preview_sense_list">' + items + '</ul>' +
                '</li>';
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
            '<span class="preview_pos">' + esc(posSummary(analysis)) + '</span>' +
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

    function renderResult(data, written, state) {
        var analysis = data.analysis;
        var morph = analysis.morphology || {};
        var target = analysis.target || {};
        var location = data.location;
        var schedule = data.data && data.data.schedule;
        var href = fileHref(location);
        var backup = data.backup;
        var checkState = state || lastCheckState || 'none';

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

        var posRows = senseGroups(analysis).map(function (group) {
            var pos = group[0];
            var meanings = group[1].map(function (sense) {
                return String(sense.zh || '').trim();
            }).filter(Boolean).join('；');
            if (!meanings) return '';
            return '<div class="result_pos_row">' +
                '<span class="result_pos_chip">' + esc(pos) + '</span>' +
                '<span class="result_pos_text">' + esc(meanings) + '</span>' +
                '</div>';
        }).join('');

        var actionHtml = '';
        if (written) {
            actionHtml = '<div class="result_actions">' +
                (href ? '<a class="btn btn_primary btn_small" href="' + esc(href) + '" target="_blank" rel="noopener">打开写入页面</a>' : '') +
                '<a class="btn btn_soft btn_small" href="../复习清单/核心词汇复习清单.html">去复习清单</a>' +
                '<button type="button" class="btn btn_soft btn_small" id="btnAgain">再添加一个</button>' +
                '</div>';
        } else if (checkState === 'ok') {
            actionHtml = '<div class="result_actions">' +
                '<button type="button" class="btn btn_soft btn_small" id="btnPreviewOverwrite">覆盖原内容（保留进度）</button>' +
                '</div>';
        } else if (checkState === 'none') {
            actionHtml = '<div class="result_actions">' +
                '<button type="button" class="btn btn_primary btn_small" id="btnPreviewDirect">直接导入</button>' +
                '</div>';
        } else {
            actionHtml = '<div class="result_actions">' +
                '<button type="button" class="btn btn_primary btn_small" id="btnPreviewRepair">修复并重建</button>' +
                '</div>';
        }

        resultArea.innerHTML =
            '<div class="result_head">' +
            '<div><span class="result_word">' + esc(analysis.word) + '</span></div>' +
            '<div class="result_tags"><span class="result_tag">' + esc(typeLabel(morph.type)) + '</span>' +
            '<span class="result_tag">' + esc(posSummary(analysis)) + '</span>' +
            '<span class="result_tag">' + esc(analysis.level) + '</span></div>' +
            '</div>' +
            '<div class="result_pos_groups">' + posRows + '</div>' +
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

        var directFromPreview = document.getElementById('btnPreviewDirect');
        if (directFromPreview) directFromPreview.addEventListener('click', doArchive);
        var repairFromPreview = document.getElementById('btnPreviewRepair');
        if (repairFromPreview) repairFromPreview.addEventListener('click', doRepair);
        var overwriteFromPreview = document.getElementById('btnPreviewOverwrite');
        if (overwriteFromPreview) overwriteFromPreview.addEventListener('click', doOverwrite);
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
        var state = data.state || (data.exists ? 'ok' : 'none');
        var item = data.data_item || (data.data && data.data.item) || null;
        var labels = {
            none: '未录入',
            html_only: 'HTML 在 / JSON 缺失',
            json_only: 'JSON 在 / HTML 缺失',
            broken: 'HTML 与 JSON 不一致',
            ok: '已录入'
        };
        resultBadge.textContent = labels[state] || '已检查';
        inputBadge.textContent = labels[state] || '已检查';

        var rows = [];
        rows.push(['HTML', data.has_html ? ('有 · ' + (data.page_file || '')) : '无']);
        rows.push(['JSON', data.has_json ? '有' : '无']);
        if (data.data_path) rows.push(['JSON 路径', data.data_path + (data.data_path_ok ? ' · 有效' : ' · 失效')]);
        if (data.data_category) rows.push(['分类', data.data_category]);
        if (item) {
            rows.push(['当前等级', '第 ' + (item.level || 0) + ' 次']);
            rows.push(['当前日程', item.nextDate || '']);
        }
        var rowsHtml = rows.map(function (row) {
            return '<div class="result_row"><span>' + esc(row[0]) + '</span><strong>' + esc(row[1]) + '</strong></div>';
        }).join('');

        var body = '<div class="result_exists">' +
            '<strong>' + esc(labels[state] || '检查结果') + '</strong>' +
            '<p>' + esc(data.message || '') + '</p>' +
            '<p>这里只显示状态，不提供操作。需要写入时，请点“AI 分析（不写入）”，分析结果里只给一个对应按钮。</p>' +
            '</div>';

        resultArea.innerHTML =
            '<div class="result_head">' +
            '<div><span class="result_word">' + esc(data.word) + '</span></div>' +
            '<div class="result_tags"><span class="result_tag">' + esc(labels[state] || '已检查') + '</span></div>' +
            '</div>' +
            '<div class="result_rows">' + rowsHtml + '</div>' +
            body;
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
            var checked = await post('/api/check', { word: word });
            lastCheckState = checked.state || (checked.exists ? 'ok' : 'none');
            var data = await post('/api/analyze', { word: word, hint: hintInput.value.trim() });
            renderResult(data, false, lastCheckState);
            setStatus('分析完成：' + data.analysis.target.label + '。当前状态：' + lastCheckState + '，尚未写入。', 'ok');
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
        if (genModeEl.value === 'cloud') {
            await doCloudQueue();
            return;
        }
        var word = normalizeWord();
        if (!validWord(word)) {
            setStatus('本地模式只接受英文单词；中文意思请切换云端排队。', 'error');
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
                lockMainActions(false);
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

    async function doOverwrite() {
        if (busy) return;
        var word = normalizeWord();
        if (!validWord(word)) {
            setStatus('请输入单个英文单词（字母、连字符或撇号）。', 'error');
            wordInput.focus();
            return;
        }
        if (!window.confirm('重新分析并覆盖「' + word + '」的页面和释义？\n\n复习进度、等级和 nextDate 会保留；旧页面会先备份。')) {
            return;
        }
        setBusy(true, 'overwrite');
        try {
            var data = await post('/api/archive', {
                word: word,
                hint: hintInput.value.trim(),
                overwrite: true
            });
            renderResult(data, true);
            setStatus(data.summary || '已覆盖原内容，复习进度保留。', 'ok');
            lockMainActions(false);
            toast('已覆盖，复习进度保留');
        } catch (err) {
            renderError(err.message);
            setStatus('覆盖失败：' + err.message, 'error');
            toast('覆盖失败');
        } finally {
            setBusy(false);
        }
    }

    async function doRepair() {
        if (busy) return;
        var word = normalizeWord();
        if (!validWord(word)) {
            setStatus('请输入单个英文单词（字母、连字符或撇号）。', 'error');
            wordInput.focus();
            return;
        }
        if (!window.confirm('修复「' + word + '」？\n\n会删除该词的旧 JSON 记录，重建 HTML 和 JSON，并重新进入额外新增。')) {
            return;
        }
        setBusy(true, 'repair');
        try {
            var data = await post('/api/archive', {
                word: word,
                hint: hintInput.value.trim(),
                repair: true
            });
            renderResult(data, true);
            lockMainActions(false);
            setStatus(data.summary || '修复完成，已进入额外新增。', 'ok');
            toast('修复完成');
        } catch (err) {
            renderError(err.message);
            setStatus('修复失败：' + err.message, 'error');
            toast('修复失败');
        } finally {
            setBusy(false);
        }
    }

    async function doJsonAudit() {
        if (busy) return;
        if (!window.confirm('检查 data.json？\n\n会删除所有“找不到 HTML / 页面不含该词”的失效记录，并先备份 data.json。')) {
            return;
        }
        setBusy(true, 'check');
        try {
            var data = await post('/api/json-audit', {});
            var removed = data.removed || [];
            resultArea.innerHTML =
                '<div class="result_head"><div><span class="result_word">JSON 自查</span></div>' +
                '<div class="result_tags"><span class="result_tag">' + (removed.length ? '已清理' : '正常') + '</span></div></div>' +
                '<div class="result_exists"><strong>' + esc(data.message || '') + '</strong>' +
                (removed.length ? '<p>' + removed.map(function (x) { return esc(x.word); }).join('、') + '</p>' : '') +
                '</div>';
            setStatus(data.message || 'JSON 自查完成。', 'ok');
            lockMainActions(false);
            toast('JSON 自查完成');
        } catch (err) {
            renderError(err.message);
            setStatus('JSON 自查失败：' + err.message, 'error');
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
    btnJsonAudit.addEventListener('click', doJsonAudit);
    btnCloudTest.addEventListener('click', doCloudTest);
    btnCloudExport.addEventListener('click', doCloudExport);
    btnCloudSettings.addEventListener('click', function () {
        setDialogStatus(
            cloudConfigured() ? '已填写云端连接。' : '填写 Worker 或 SCF 地址，以及对应访问口令。',
            cloudConfigured() ? 'ok' : ''
        );
        if (typeof cloudDialog.showModal === 'function') cloudDialog.showModal();
        else cloudDialog.setAttribute('open', '');
    });
    cloudClose.addEventListener('click', function () {
        cloudDialog.close();
    });
    cloudForm.addEventListener('submit', function (event) {
        event.preventDefault();
        saveCloudConfig();
        applyMode();
        cloudDialog.close();
    });
    genModeEl.addEventListener('change', applyMode);
    cloudUrl.addEventListener('input', function () {
        saveCloudConfig();
        if (genModeEl.value === 'cloud') applyMode();
    });
    cloudToken.addEventListener('input', function () {
        saveCloudConfig();
        if (genModeEl.value === 'cloud') applyMode();
    });

    wordInput.addEventListener('input', function () {
        if (actionsLocked) lockMainActions(false);
    });

    wordInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (genModeEl.value === 'cloud') doCloudQueue();
            else doAnalyze();
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

    loadCloudConfig();
    applyMode();
    checkHealth();
})();
