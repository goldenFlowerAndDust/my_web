/**
 * Markmap 思维导图渲染器
 * —— 彩色文本 · 曲线连接 · 移动端可拖动
 */

var MARKMAP_CONFIG = {
    libsDir: '../../一些必备脚本/数学公式js/libs/',
    mdDir:   '../../思维导图准备/mindmmap_md/'
};

// ============================================================
// 【主题色板】每个一级分支一种主色，子级用同色系深色文字
// ============================================================
var MARKMAP_THEMES = [
    { main: '#E74C3C', dark: '#7B241C' }, // 红
    { main: '#E67E22', dark: '#7E4A0E' }, // 橙
    { main: '#C9A227', dark: '#7D6608' }, // 黄（文字加深，避免看不清）
    { main: '#27AE60', dark: '#186A3B' }, // 绿
    { main: '#2980B9', dark: '#1A5276' }, // 蓝
    { main: '#8E44AD', dark: '#6C3483' }  // 紫
];

var MARKMAP_ROOT_COLOR = {
    main: '#0B3D91',
    dark: '#0B3D91'
};

var MARKMAP_COLORS = {
    levels: ['#0B3D91', '#1565C0', '#C0392B', '#E67E22', '#16A085', '#8E44AD'],
    linkColor: '#90CAF9',
    formula: '#9C27B0',
    pageBackground: '#FAF7F0',
    dotColor: '#1565C0',
    dotHoverColor: '#0B3D91'
};

var MARKMAP_MAX_WIDTH = 1200;
var MARKMAP_FONT_SIZES = [18, 16, 15, 14, 13, 13];
var MARKMAP_DEFAULT_HEIGHT = 400;
var MARKMAP_FIT_RATIO = 0.92;

var MARKMAP_FULLSCREEN = {
    top: '0', left: '0', width: '100vw', height: '100vh',
    radius: '0', shadow: 'none'
};
// ============================================================


(function (global) {
    'use strict';

    var loaded = {};

    var PATHS = {
        katexCss:      MARKMAP_CONFIG.libsDir + 'katex.min.css',
        katexJs:       MARKMAP_CONFIG.libsDir + 'katex.min.js',
        d3Js:          MARKMAP_CONFIG.libsDir + 'd3.min.js',
        markmapViewJs: MARKMAP_CONFIG.libsDir + 'markmap-view.js',
        markmapLibJs:  MARKMAP_CONFIG.libsDir + 'markmap-lib.js'
    };

    function loadCss(href) {
        return new Promise(function (resolve) {
            if (loaded[href]) return resolve();
            var exist = document.querySelector('link[rel="stylesheet"][href="' + href + '"]');
            if (exist) { loaded[href] = true; return resolve(); }

            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload  = function () { loaded[href] = true; resolve(); };
            link.onerror = function () { console.warn('CSS 加载失败: ' + href); resolve(); };
            document.head.appendChild(link);
        });
    }

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            if (loaded[src]) return resolve();

            var exist = document.querySelector('script[src="' + src + '"]');
            if (exist) {
                if (exist.dataset.__mmLoaded === '1') { loaded[src] = true; return resolve(); }
                exist.addEventListener('load',  function () { loaded[src] = true; resolve(); });
                exist.addEventListener('error', function () { reject(new Error('JS 加载失败: ' + src)); });
                return;
            }

            var s = document.createElement('script');
            s.src = src;
            s.onload  = function () { loaded[src] = true; s.dataset.__mmLoaded = '1'; resolve(); };
            s.onerror = function () { reject(new Error('JS 加载失败: ' + src)); };
            document.head.appendChild(s);
        });
    }

    async function ensureLibs() {
        await loadCss(PATHS.katexCss);
        if (!global.katex) await loadScript(PATHS.katexJs);
        await loadScript(PATHS.d3Js);
        await loadScript(PATHS.markmapViewJs);
        await loadScript(PATHS.markmapLibJs);

        if (!global.markmap || !global.markmap.Markmap || !global.markmap.Transformer) {
            throw new Error('markmap 未正确加载');
        }
    }

    async function loadMarkdown(name) {
        var url = MARKMAP_CONFIG.mdDir + name + '/' + name + '.md';
        var res = await fetch(url);
        if (!res.ok) throw new Error('md 加载失败: ' + url);
        return await res.text();
    }

    function normalizeDelimiters(md) {
        md = md.replace(/\\\[([\s\S]+?)\\\]/g, function (_, inner) { return '$$' + inner + '$$'; });
        md = md.replace(/\\\(([\s\S]+?)\\\)/g, function (_, inner) { return '$'  + inner + '$';  });
        return md;
    }

    function ensureSvg(container) {
        var el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return null;
        if (el.tagName && el.tagName.toLowerCase() === 'svg') return el;

        var svg = el.querySelector('svg');
        if (!svg) {
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            el.innerHTML = '';
            el.appendChild(svg);
        }

        svg.style.display = 'block';
        svg.style.width   = '100%';
        svg.style.height  = '100%';
        svg.style.touchAction = 'none';
        svg.style.webkitUserSelect = 'none';
        svg.style.userSelect = 'none';

        return svg;
    }

    function unifiedColor() {
        return MARKMAP_COLORS.linkColor;
    }

    // ============================================================
    // 深度 & 分支索引
    // ============================================================
    function getDepth(node) {
        var d = node.__data__;
        if (d && d.state) {
            if (typeof d.state.depth === 'number') return d.state.depth;
            if (Array.isArray(d.state.path)) return d.state.path.length - 1;
        }
        var depth = 0;
        var p = node.parentElement;
        while (p) {
            if (p.classList && p.classList.contains('markmap-node')) depth++;
            p = p.parentElement;
        }
        return depth;
    }

    function getBranchIndex(node) {
        var d = node.__data__;
        if (d && d.state && Array.isArray(d.state.path) && d.state.path.length > 0) {
            return d.state.path[0];
        }
        return 0;
    }

    function getTheme(depth, branchIdx) {
        if (depth === 0) {
            return { text: MARKMAP_ROOT_COLOR.dark, size: MARKMAP_FONT_SIZES[0], weight: '700' };
        }
        var t = MARKMAP_THEMES[branchIdx % MARKMAP_THEMES.length];
        var size = MARKMAP_FONT_SIZES[Math.min(depth, MARKMAP_FONT_SIZES.length - 1)];
        if (depth === 1) return { text: t.main, size: size, weight: '700' };
        if (depth === 2) return { text: t.main, size: size, weight: '600' };
        if (depth === 3) return { text: t.dark, size: size, weight: '500' };
        return                  { text: t.dark, size: size, weight: '400' };
    }

    // ============================================================
    // CSS
    // ============================================================
    function buildCss() {
        var fs = MARKMAP_FULLSCREEN;
        return [
            'html, body {',
            '  background: ' + MARKMAP_COLORS.pageBackground + ' !important;',
            '  overscroll-behavior: none !important;',
            '}',

            'body.mm-fullscreen-lock {',
            '  overflow: hidden !important;',
            '  overscroll-behavior: none !important;',
            '}',

            /* 容器 */
            '[data-mindmap] {',
            '  width: 100%;',
            '  height: ' + MARKMAP_DEFAULT_HEIGHT + 'px;',
            '  background: ' + MARKMAP_COLORS.pageBackground + ';',
            '  border-radius: 8px;',
            '  position: relative;',
            '  overflow: hidden;',
            '  -webkit-user-select: none;',
            '  user-select: none;',
            '  -webkit-touch-callout: none;',
            '  overscroll-behavior: contain;',
            '}',

            '[data-mindmap] > svg {',
            '  display: block;',
            '  width: 100%;',
            '  height: 100%;',
            '  touch-action: none;',
            '  -webkit-user-select: none;',
            '  user-select: none;',
            '}',

            /* 全屏 */
            '[data-mindmap].mm-fullscreen {',
            '  position: fixed;',
            '  top: '    + fs.top    + ';',
            '  left: '   + fs.left   + ';',
            '  width: '  + fs.width  + ';',
            '  height: ' + fs.height + ';',
            '  height: 100dvh;',
            '  border-radius: ' + fs.radius + ';',
            '  box-shadow: '    + fs.shadow + ';',
            '  z-index: 99999;',
            '  touch-action: none;',
            '  overscroll-behavior: contain;',
            '}',

            /* 全屏按钮 */
            '.mm-fullscreen-btn {',
            '  position: absolute;',
            '  top: 8px;',
            '  right: 8px;',
            '  width: 34px;',
            '  height: 34px;',
            '  border: none;',
            '  border-radius: 6px;',
            '  background: ' + MARKMAP_COLORS.dotColor + ';',
            '  color: #FFFFFF;',
            '  font-size: 16px;',
            '  line-height: 1;',
            '  cursor: pointer;',
            '  z-index: 100;',
            '  opacity: 0.5;',
            '  transition: opacity .15s;',
            '  padding: 0;',
            '  touch-action: manipulation;',
            '  -webkit-tap-highlight-color: transparent;',
            '}',
            '.mm-fullscreen-btn:hover { opacity: 1; }',
            '[data-mindmap]:hover .mm-fullscreen-btn { opacity: 0.9; }',

            /* 节点圆点 */
            '.markmap-node > circle {',
            '  stroke: #FFFFFF !important;',
            '  stroke-width: 1.5 !important;',
            '  cursor: pointer !important;',
            '}',

            '.mm-plus-h, .mm-plus-v {',
            '  fill: #FFFFFF !important;',
            '  pointer-events: none !important;',
            '}',

            /* ============================================================
               节点文本容器：overflow: visible 让公式不被 foreignObject 裁剪
               ============================================================ */
            '.markmap-foreign {',
            '  font-family: -apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif !important;',
            '  line-height: 1.4 !important;',
            '  white-space: normal !important;',
            '  word-break: break-word !important;',
            '  overflow: visible !important;',
            '  padding-top: 2px !important;',
            '}',

            /* foreignObject 本身不裁剪 */
            '.markmap-node foreignObject {',
            '  overflow: visible !important;',
            '  pointer-events: none !important;',   /* ★ 新增 */
            '}',

            /* KaTeX 跟随文本字号 */
            '.markmap-foreign .katex {',
            '  font-size: 1em !important;',
            '  line-height: 1.4 !important;',
            '}',
            '.markmap-foreign .katex-display {',
            '  margin: 0.15em 0 !important;',
            '  font-size: 1em !important;',
            '}',

            /* 公式单独颜色：紫色 + 加粗 */
            '.markmap-node .katex,',
            '.markmap-node .katex * {',
            '  color: ' + MARKMAP_COLORS.formula + ' !important;',
            '  font-weight: 600 !important;',
            '}',

            /* 连接线：柔和浅蓝 */
            '.markmap-link {',
            '  stroke: ' + MARKMAP_COLORS.linkColor + ' !important;',
            '  stroke-width: 1.6 !important;',
            '  stroke-linecap: round !important;',
            '  stroke-linejoin: round !important;',
            '  fill: none !important;',
            '}'
        ].join('\n');
    }

    function injectBaseCss() {
        var old = document.getElementById('markmap-custom-style');
        if (old) { old.textContent = buildCss(); return; }
        var style = document.createElement('style');
        style.id = 'markmap-custom-style';
        style.textContent = buildCss();
        document.head.appendChild(style);
    }

    // ============================================================
    // 节点着色
    // ============================================================
    function paintNode(node) {
        var depth = getDepth(node);
        var branchIdx = depth >= 1 ? getBranchIndex(node) : 0;
        var theme = getTheme(depth, branchIdx);

        node.setAttribute('data-depth', depth);

        var fo = node.querySelector(':scope > foreignObject');
        if (!fo) return;

        fo.style.color = theme.text;

        var inner = fo.firstElementChild;
        if (inner && inner.nodeType === 1) {
            inner.style.color      = theme.text;
            inner.style.fontSize   = theme.size + 'px';
            inner.style.fontWeight = theme.weight;
        }

        var circle = node.querySelector(':scope > circle');
        if (circle) {
            var dotColor = depth === 0
                ? MARKMAP_ROOT_COLOR.main
                : MARKMAP_THEMES[branchIdx % MARKMAP_THEMES.length].main;
            circle.style.fill = dotColor;
        }
    }

    function paintAllNodes() {
        document.querySelectorAll('.markmap-node').forEach(paintNode);
    }

    // ============================================================
    // 折叠图标（+ / -）
    // ============================================================
    function updateFoldIcons() {
        var visibleData = new Set();
        document.querySelectorAll('.markmap-node').forEach(function (n) {
            if (n.__data__) visibleData.add(n.__data__);
        });

        document.querySelectorAll('.markmap-node').forEach(function (node) {
            var data   = node.__data__;
            var circle = node.querySelector(':scope > circle');
            if (!circle) return;

            var hasChildren = !!(data && data.children && data.children.length > 0);

            var newState;
            if (!hasChildren) {
                newState = 'hidden';
            } else {
                var firstChild = data.children[0];
                newState = visibleData.has(firstChild) ? 'minus' : 'plus';
            }

            var bbox;
            try { bbox = circle.getBBox(); } catch (e) { return; }
            if (!bbox || bbox.width < 1) return;

            var cx = bbox.x + bbox.width  / 2;
            var cy = bbox.y + bbox.height / 2;
            var r  = Math.min(bbox.width, bbox.height) / 2;

            var cacheKey = newState + '|' + cx.toFixed(1) + '|' + cy.toFixed(1);
            if (node.__mmIconKey === cacheKey) return;
            node.__mmIconKey = cacheKey;

            node.querySelectorAll(':scope > .mm-plus-h, :scope > .mm-plus-v').forEach(function (el) {
                el.remove();
            });

            if (newState === 'hidden') {
                circle.style.display = 'none';
                return;
            }
            circle.style.display = '';

            var armLen = r * 0.55;
            var armW   = Math.max(1, r * 0.22);

            var h = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            h.setAttribute('class',  'mm-plus-h');
            h.setAttribute('x',      cx - armLen);
            h.setAttribute('y',      cy - armW / 2);
            h.setAttribute('width',  armLen * 2);
            h.setAttribute('height', armW);
            h.setAttribute('rx',     armW / 2);
            circle.parentNode.insertBefore(h, circle.nextSibling);

            if (newState === 'plus') {
                var v = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                v.setAttribute('class',  'mm-plus-v');
                v.setAttribute('x',      cx - armW / 2);
                v.setAttribute('y',      cy - armLen);
                v.setAttribute('width',  armW);
                v.setAttribute('height', armLen * 2);
                v.setAttribute('rx',     armW / 2);
                circle.parentNode.insertBefore(v, h.nextSibling);
            }
        });
    }

    function processHeavy(svg, observer) {
        if (svg.__mmProcessing) return;
        svg.__mmProcessing = true;
        if (observer) observer.disconnect();
        try {
            paintAllNodes();
            updateFoldIcons();
        } catch (e) {
            console.error('processHeavy 失败:', e);
        }
        if (observer) observer.observe(svg, { childList: true, subtree: true });
        svg.__mmProcessing = false;
    }

    function startProcessing(svg) {
        var pendingTimer = null;
        var observer = new MutationObserver(function () {
            if (svg.__mmProcessing) return;
            clearTimeout(pendingTimer);
            pendingTimer = setTimeout(function () {
                processHeavy(svg, observer);
            }, 80);
        });
        observer.observe(svg, { childList: true, subtree: true });
        [100, 300, 800, 1500].forEach(function (t) {
            setTimeout(function () { processHeavy(svg, observer); }, t);
        });
    }

    function bindMobileZoom(mm, svg) {
        if (!global.d3 || !mm || !mm.zoom || !svg) return;
        try {
            mm.zoom.filter(function (event) {
                if (event.type === 'mousedown' && event.button) return false;
                return true;
            });
            global.d3.select(svg).call(mm.zoom);
        } catch (e) {
            console.warn('bindMobileZoom 跳过:', e);
        }
    }

    // ============================================================
    // 全屏按钮
    // ============================================================
    function addFullscreenButton(container, mm) {
        if (container.querySelector('.mm-fullscreen-btn')) return;

        var btn = document.createElement('button');
        btn.className = 'mm-fullscreen-btn';
        btn.title = '全屏显示';
        btn.innerHTML = '⛶';

        function refit() {
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    if (mm && mm.fit) { try { mm.fit(); } catch (e) {} }
                });
            });
        }

        function syncBodyLock(isFull) {
            document.body.classList.toggle('mm-fullscreen-lock', !!isFull);
        }

        btn.onclick = function (e) {
            e.stopPropagation();
            var isFull = container.classList.toggle('mm-fullscreen');
            syncBodyLock(isFull);
            btn.innerHTML = isFull ? '✕' : '⛶';
            btn.title = isFull ? '退出全屏（按 ESC）' : '全屏显示';
            refit();
        };
        container.appendChild(btn);

        container.__mmEscHandler = function (e) {
            if (e.key === 'Escape' && container.classList.contains('mm-fullscreen')) {
                container.classList.remove('mm-fullscreen');
                syncBodyLock(false);
                btn.innerHTML = '⛶';
                btn.title = '全屏显示';
                refit();
            }
        };
        document.addEventListener('keydown', container.__mmEscHandler);
    }

    // ============================================================
    // 主入口
    // ============================================================
    async function renderMindmap(name, container, options) {
        var svg = ensureSvg(container);
        if (!svg) { console.error('❌ 找不到容器: ' + container); return null; }

        try {
            await ensureLibs();
            injectBaseCss();

            var md = await loadMarkdown(name);
            md = normalizeDelimiters(md);

            var transformer = new global.markmap.Transformer();
            var result = transformer.transform(md);

            var mergedOptions = Object.assign({
                color:             unifiedColor,
                maxWidth:          MARKMAP_MAX_WIDTH,
                paddingX:          14,
                paddingY:          8,
                nodeMinHeight:     28,
                spacingVertical:   16,
                spacingHorizontal: 90,
                duration:          300,
                autoFit:           true,
                fitRatio:          MARKMAP_FIT_RATIO
            }, options || {});

            var mm = global.markmap.Markmap.create(svg, mergedOptions, result.root);

            bindMobileZoom(mm, svg);

            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    try { mm.fit && mm.fit(); } catch (e) {}
                });
            });

            startProcessing(svg);
            addFullscreenButton(container, mm);

            if (!global.__markmapResizeBound) {
                global.__markmapResizeBound = true;
                var t = null;
                global.addEventListener('resize', function () {
                    clearTimeout(t);
                    t = setTimeout(function () {
                        try { mm.fit && mm.fit(); } catch (e) {}
                    }, 120);
                });
            }

            return result.root;
        } catch (e) {
            console.error('❌ 渲染失败:', e);
            return null;
        }
    }

    global.renderMindmap = renderMindmap;

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('[data-mindmap]').forEach(function (node) {
            var name = node.getAttribute('data-mindmap');
            if (name) renderMindmap(name, node);
        });
    });

})(window);