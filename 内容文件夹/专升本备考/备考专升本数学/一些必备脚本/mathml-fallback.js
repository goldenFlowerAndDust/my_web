/*!
 * mathml-fallback.js —— 纯 MathML 公式的离线降级渲染器（单文件 / 无依赖 / ES5）
 * ---------------------------------------------------------------------------
 * 背景：
 *   本站数学讲义由 KaTeX 预渲染成「纯 MathML」，页面里没有任何 KaTeX CSS/JS。
 *   于是公式能否显示，完全取决于两件事：
 *     1) 浏览器是否实现了 MathML（Chromium 内核需要 109+ 才有 MathML Core）；
 *     2) 设备系统里是否存在可用的数学字体。
 *   荣耀手机（较新的 Chromium 内核）正常，华为平板（旧内核 / 旧 WebView /
 *   缺少 math 字体）会出现字母丢失、分式塌陷、原始 TeX 外漏、\boxed 无边框。
 *
 * 本脚本做三件事：
 *   1) 用三步检测判断「原生 MathML 是否真的可用」；
 *   2) 可用 → 什么都不做，保留浏览器原生渲染（零开销、效果最好）；
 *   3) 不可用 → 把 <math> 子树转换成等价的 HTML + CSS 排版。字母、数字、
 *      运算符全部使用系统正文字体，不再依赖 MathML 实现，也不依赖数学字体文件。
 *   转换完成后统一测量一次，微调根号、花括号、括号的缩放比例。
 *
 * 用法（放在 </body> 之前即可，必须在本页所有公式之后）：
 *   <script src="../../一些必备脚本/mathml-fallback.js"></script>
 *
 * 强制模式（便于对比和救急）：
 *   页面 URL 追加 ?mathml=fallback 或 ?mathml=native；
 *   或者在加载本脚本之前设置 window.__MATHML_MODE__ = 'fallback'。
 *   控制台可用 window.MathMLFallback 查看状态与手动重跑。
 *
 * 版本：1.1.0
 *
 * 1.1.0 修复：
 *   - 华为/鸿蒙平板即使「MathML 接口存在、排版高度正常」，其 <mi> 字母仍可能
 *     因系统数学字体缺字而整体留白；现在对这类设备直接走 HTML 降级。
 *   - 降级排版不再优先使用 Cambria Math / STIX 等数学字体，改用普通正文字体，
 *     避免再次落回同一套缺字字体。
 */
(function (window, document) {
    'use strict';

    var VERSION = '1.0.0';
    var NS = 'http://www.w3.org/1998/Math/MathML';
    var STYLE_ID = 'mfb-style';
    var MODE_ATTR = 'data-mathml';

    var PENDING = [];                 // 需要在插入文档后测量微调的元素
    var STATS = { converted: 0, failed: 0, ms: 0 };
    var BOOTED = false;

    /* =====================================================================
     * 一、注入样式（全部限定在 .mfb 作用域内，不影响页面其它内容）
     * ===================================================================== */
    var CSS = [
        '.mfb{font-family:"Times New Roman","Liberation Serif","Noto Serif","Noto Serif SC","Source Han Serif SC","Songti SC",SimSun,serif;',
        'font-style:normal;font-weight:400;line-height:1.4;white-space:nowrap;display:inline-block;',
        'vertical-align:baseline;text-align:left;letter-spacing:normal;word-spacing:normal;',
        'text-indent:0;border:0;padding:0;margin:0;direction:ltr;color:inherit}',
        '.mfb .mfb-row{display:inline-block;white-space:nowrap;vertical-align:baseline}',
        '.mfb .mfb-mi{display:inline-block;font-style:italic}',
        '.mfb .mfb-mi-up{display:inline-block;font-style:normal}',
        '.mfb .mfb-ds{font-weight:400}',
        '.mfb .mfb-mn{display:inline-block;font-style:normal}',
        '.mfb .mfb-mo{display:inline-block;font-style:normal}',
        '.mfb .mfb-text{font-family:"Noto Serif SC","Source Han Serif SC","Songti SC",SimSun,serif;',
        'font-style:normal;white-space:pre;display:inline-block}',
        /* 运算符间距：严格按 TeX 的 4/18em、5/18em、3/18em */
        '.mfb .mfb-bin{margin:0 .22em}',
        '.mfb .mfb-bin-un{margin:0 .1em 0 0}',
        '.mfb .mfb-rel{margin:0 .26em}',
        '.mfb .mfb-punct{margin:0 .16em 0 0}',
        '.mfb .mfb-open{margin:0 .04em 0 0}',
        '.mfb .mfb-close{margin:0 0 0 .04em}',
        '.mfb .mfb-large{font-size:1.35em;line-height:1;vertical-align:-.18em;margin:0 .1em}',
        '.mfb .mfb-prime{font-size:.85em;vertical-align:.5em;margin-left:-.04em}',
        '.mfb .mfb-ellipsis{margin:0 .12em}',
        /* 分式 */
        '.mfb .mfb-frac{display:inline-flex;flex-direction:column;align-items:center;',
        'vertical-align:middle;margin:0 .14em;line-height:1.2}',
        '.mfb .mfb-num{display:block;text-align:center;padding:0 .3em .07em;border-bottom:1px solid currentColor}',
        '.mfb .mfb-den{display:block;text-align:center;padding:.07em .3em 0}',
        /* 上下标 */
        '.mfb .mfb-msup,.mfb .mfb-msub,.mfb .mfb-msubsup{display:inline-block;white-space:nowrap}',
        '.mfb .mfb-sup{display:inline-block;font-size:.72em;line-height:1;vertical-align:.62em;margin-left:.03em}',
        '.mfb .mfb-sub{display:inline-block;font-size:.72em;line-height:1;vertical-align:-.24em;margin-left:.03em}',
        '.mfb .mfb-scripts{display:inline-flex;flex-direction:column;font-size:.72em;line-height:1.08;',
        'vertical-align:middle;margin-left:.03em}',
        '.mfb .mfb-scripts>span{display:block}',
        /* 根式 */
        '.mfb .mfb-sqrt{display:inline-block;white-space:nowrap;vertical-align:middle;margin:0 .05em}',
        '.mfb .mfb-rad{display:inline-block;font-size:1.12em;line-height:1;vertical-align:-.06em;margin-right:-.06em}',
        '.mfb .mfb-radicand{display:inline-block;border-top:1.2px solid currentColor;padding:.03em .2em 0}',
        '.mfb .mfb-root-index{display:inline-block;font-size:.55em;line-height:1;vertical-align:.95em;margin-right:-.34em}',
        /* 方框 \boxed */
        '.mfb .mfb-box{display:inline-block;border:1px solid currentColor;border-radius:4px;',
        'padding:.12em .42em;vertical-align:middle;margin:0 .06em}',
        /* 表格（cases / 矩阵 / 方程组） */
        '.mfb .mfb-table{display:inline-table;border-collapse:collapse;vertical-align:middle;margin:0 .1em}',
        '.mfb .mfb-tr{display:table-row}',
        '.mfb .mfb-td{display:table-cell;padding:.07em .3em;text-align:left;vertical-align:middle;line-height:1.4}',
        /* 空白 */
        '.mfb .mfb-space{display:inline-block;height:1em;vertical-align:-.2em}',
        /* 上下限（lim、∑ 的上下标） */
        '.mfb .mfb-under,.mfb .mfb-over,.mfb .mfb-underover{display:inline-flex;flex-direction:column;',
        'align-items:center;vertical-align:middle;margin:0 .12em;line-height:1.15}',
        '.mfb .mfb-under-script,.mfb .mfb-over-script{font-size:.66em;line-height:1.1;white-space:nowrap}',
        '.mfb .mfb-accent{font-size:.8em;line-height:1;margin-bottom:-.2em}',
        '.mfb .mfb-fence{display:inline-block;vertical-align:middle;line-height:1}',
        /* 原生 MathML 的注释节点不该被看见 */
        'math annotation,math annotation-xml{display:none}'
    ].join('\n');

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.appendChild(document.createTextNode(CSS));
        (document.head || document.documentElement).appendChild(style);
    }

    /* =====================================================================
     * 二、字符表
     * ===================================================================== */
    var CH_BIN = '+-−±∓×÷⋅∗∘∪∩⊕⊗';
    var CH_REL = '=<>≤≥≠≈≡∼≅∈∉⊂⊃⊆⊇→←↔⇒⇐⇔⟺⟹⊥∥≪≫∝';
    var CH_PUNCT = ',;:';
    var CH_OPEN = '([{⟨';
    var CH_CLOSE = ')]}⟩';
    var CH_LARGE = '∑∏∫∬∭⋃⋂';
    var CH_FENCE = '()[]{}|∣‖⟨⟩';
    var CH_ACCENT = '̲⃗̂̄̇̃̊̌̀́¯^~→←↔⏟⏞';
    var ACCENT_MAP = {
        '\u20D7': '→', '\u20D6': '←', '\u20E1': '↔',
        '\u0302': '^', '\u0304': '¯', '\u0305': '‾', '\u0307': '˙',
        '\u0303': '~', '\u030A': '°', '\u030C': 'ˇ', '\u0300': '`',
        '\u0301': '´', '\u0332': '_', '\u0336': '/', '\u23DF': '⏟', '\u23DE': '⏞'
    };
    var DOUBLE_STRUCK = { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' };
    var INVISIBLE = /[\u200B-\u200F\u2060-\u2064\uFEFF]/g;

    /* =====================================================================
     * 三、小工具
     * ===================================================================== */
    function make(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.appendChild(document.createTextNode(text));
        return node;
    }

    function append(parent, child) {
        if (child) parent.appendChild(child);
        return parent;
    }

    function clean(str) {
        return (str || '').replace(INVISIBLE, '');
    }

    function tagOf(node) {
        return (node.localName || node.nodeName || '').toLowerCase();
    }

    function elementChildren(node) {
        var out = [], child;
        for (child = node.firstChild; child; child = child.nextSibling) {
            if (child.nodeType === 1) out.push(child);
        }
        return out;
    }

    function px(value) {
        var n = parseFloat(value);
        return isFinite(n) ? n : 0;
    }

    function clamp(v, min, max) {
        return Math.min(max, Math.max(min, v));
    }

    function classify(ch, node) {
        if (!ch) return null;
        if (node && node.getAttribute && node.getAttribute('separator') === 'true') return 'punct';
        if (CH_LARGE.indexOf(ch) >= 0) return 'large';
        if (CH_BIN.indexOf(ch) >= 0) return 'bin';
        if (CH_REL.indexOf(ch) >= 0) return 'rel';
        if (CH_PUNCT.indexOf(ch) >= 0) return 'punct';
        if (CH_OPEN.indexOf(ch) >= 0) return 'open';
        if (CH_CLOSE.indexOf(ch) >= 0) return 'close';
        return null;
    }

    /* =====================================================================
     * 四、渲染核心：MathML 元素 → HTML 元素
     * ===================================================================== */
    var RENDERERS = {
        /* <math> 根 */
        math: function (node) {
            var root = make('span', 'mfb');
            root.setAttribute('role', 'math');
            var tex = '';
            var ann = node.querySelector ? node.querySelector('annotation[encoding="application/x-tex"]') : null;
            if (ann && ann.textContent) tex = ann.textContent;
            if (tex) {
                root.setAttribute('data-tex', tex);
                root.setAttribute('aria-label', tex);
            }
            root.appendChild(renderChildren(node));
            return root;
        },

        /* <semantics> 只渲染第一个子元素（TeX 原文藏在 annotation 里） */
        semantics: function (node) {
            var kids = elementChildren(node), i;
            for (i = 0; i < kids.length; i++) {
                if (tagOf(kids[i]) !== 'annotation' && tagOf(kids[i]) !== 'annotation-xml') {
                    return renderNode(kids[i]);
                }
            }
            return renderChildren(node);
        },

        mrow: function (node) {
            return renderRow(node);
        },

        /* 单字母斜体，多字母（lim/sin/log…）正体，双线体映射到 Unicode */
        mi: function (node) {
            var txt = clean(node.textContent || '').replace(/^\s+|\s+$/g, '');
            if (!txt) return null;
            var variant = (node.getAttribute('mathvariant') || '').toLowerCase();
            if (variant === 'double-struck') {
                var mapped = '', i;
                for (i = 0; i < txt.length; i++) {
                    mapped += DOUBLE_STRUCK[txt.charAt(i)] || txt.charAt(i);
                }
                return make('span', 'mfb-mi-up mfb-ds', mapped);
            }
            if (variant === 'normal' || variant === 'upright' || variant === 'bold') {
                return make('span', 'mfb-mi-up', txt);
            }
            if (txt.length > 1) return make('span', 'mfb-mi-up', txt);   // sin、cos、lim…
            return make('span', 'mfb-mi', txt);
        },

        mn: function (node) {
            var txt = clean(node.textContent || '').replace(/^\s+|\s+$/g, '');
            return txt ? make('span', 'mfb-mn', txt) : null;
        },

        mo: function (node) {
            var txt = clean(node.textContent || '').replace(/^\s+|\s+$/g, '');
            if (!txt) return null;
            var span = make('span', 'mfb-mo');
            span.appendChild(document.createTextNode(txt));
            var kind = classify(txt, node);
            if (kind) {
                span.className += ' mfb-' + kind;
                span.setAttribute('data-mfb-kind', kind);
            } else if (txt === '′' || txt === '″') {
                span.className += ' mfb-prime';
                span.setAttribute('data-mfb-kind', 'ord');
            } else if (txt === '…' || txt === '⋯' || txt === '⋮' || txt === '⋱') {
                span.className += ' mfb-ellipsis';
                span.setAttribute('data-mfb-kind', 'ord');
            } else {
                span.setAttribute('data-mfb-kind', 'ord');
            }
            if (CH_FENCE.indexOf(txt) >= 0) {
                span.className += ' mfb-fence';
                PENDING.push({ type: 'fence', el: span });
            }
            return span;
        },

        mtext: function (node) {
            var txt = clean(node.textContent || '');
            return txt ? make('span', 'mfb-text', txt) : null;
        },

        mspace: function (node) {
            var w = node.getAttribute('width') || '0.25em';
            var span = make('span', 'mfb-space');
            span.style.width = /^[\d.]+(em|ex|px|%)$/.test(w) ? w : '0.25em';
            return span;
        },

        mfrac: function (node) {
            var kids = elementChildren(node);
            if (kids.length < 2) return renderRow(node);
            var wrap = make('span', 'mfb-frac');
            var num = make('span', 'mfb-num');
            var den = make('span', 'mfb-den');
            append(num, renderNode(kids[0]));
            append(den, renderNode(kids[1]));
            wrap.appendChild(num);
            wrap.appendChild(den);
            return wrap;
        },

        msup: function (node) {
            var kids = elementChildren(node);
            if (kids.length < 2) return renderRow(node);
            var wrap = make('span', 'mfb-msup');
            append(wrap, renderNode(kids[0]));
            var sup = make('span', 'mfb-sup');
            append(sup, renderNode(kids[1]));
            wrap.appendChild(sup);
            return wrap;
        },

        msub: function (node) {
            var kids = elementChildren(node);
            if (kids.length < 2) return renderRow(node);
            var wrap = make('span', 'mfb-msub');
            append(wrap, renderNode(kids[0]));
            var sub = make('span', 'mfb-sub');
            append(sub, renderNode(kids[1]));
            wrap.appendChild(sub);
            return wrap;
        },

        /* 同时有上下标：右侧竖排（上标在上、下标在下） */
        msubsup: function (node) {
            var kids = elementChildren(node);
            if (kids.length < 3) return renderRow(node);
            var wrap = make('span', 'mfb-msubsup');
            append(wrap, renderNode(kids[0]));
            var col = make('span', 'mfb-scripts');
            append(col, renderNode(kids[2]));
            append(col, renderNode(kids[1]));
            wrap.appendChild(col);
            return wrap;
        },

        mover: function (node) {
            var kids = elementChildren(node);
            if (kids.length < 2) return renderRow(node);
            var base = renderNode(kids[0]);
            var over = renderNode(kids[1]);
            var isAccent = (node.getAttribute('accent') || '').toLowerCase() === 'true';
            var wrap = make('span', 'mfb-over');
            if (isAccent) {
                var accText = clean(kids[1].textContent || '').replace(/^\s+|\s+$/g, '');
                var acc = make('span', 'mfb-accent', ACCENT_MAP[accText] || accText);
                wrap.appendChild(acc);
                wrap.appendChild(base || make('span', ''));
            } else {
                var script = make('span', 'mfb-over-script');
                if (over) script.appendChild(over);
                wrap.appendChild(script);
                wrap.appendChild(base || make('span', ''));
            }
            return wrap;
        },

        munder: function (node) {
            var kids = elementChildren(node);
            if (kids.length < 2) return renderRow(node);
            var wrap = make('span', 'mfb-under');
            append(wrap, renderNode(kids[0]));
            var script = make('span', 'mfb-under-script');
            append(script, renderNode(kids[1]));
            wrap.appendChild(script);
            return wrap;
        },

        /* 上、下限：竖排（上 → 主体 → 下） */
        munderover: function (node) {
            var kids = elementChildren(node);
            if (kids.length < 3) return renderRow(node);
            var wrap = make('span', 'mfb-underover');
            var over = make('span', 'mfb-over-script');
            append(over, renderNode(kids[2]));
            wrap.appendChild(over);
            append(wrap, renderNode(kids[0]));
            var under = make('span', 'mfb-under-script');
            append(under, renderNode(kids[1]));
            wrap.appendChild(under);
            return wrap;
        },

        msqrt: function (node) {
            var wrap = make('span', 'mfb-sqrt');
            var rad = make('span', 'mfb-rad', '√');
            var body = make('span', 'mfb-radicand');
            body.appendChild(renderChildren(node));
            wrap.appendChild(rad);
            wrap.appendChild(body);
            PENDING.push({ type: 'sqrt', el: wrap, rad: rad, body: body });
            return wrap;
        },

        mroot: function (node) {
            var kids = elementChildren(node);
            if (kids.length < 2) return RENDERERS.msqrt(node);
            var wrap = make('span', 'mfb-sqrt');
            var index = make('span', 'mfb-root-index');
            append(index, renderNode(kids[1]));
            var rad = make('span', 'mfb-rad', '√');
            var body = make('span', 'mfb-radicand');
            append(body, renderNode(kids[0]));
            wrap.appendChild(index);
            wrap.appendChild(rad);
            wrap.appendChild(body);
            PENDING.push({ type: 'sqrt', el: wrap, rad: rad, body: body });
            return wrap;
        },

        menclose: function (node) {
            var notation = (node.getAttribute('notation') || '').toLowerCase();
            if (notation.indexOf('box') < 0 && notation.indexOf('roundedbox') < 0) {
                return renderChildren(node);
            }
            var wrap = make('span', 'mfb-box');
            wrap.appendChild(renderChildren(node));
            return wrap;
        },

        mstyle: function (node) {
            return renderChildren(node);
        },

        mphantom: function (node) {
            var wrap = make('span', '');
            wrap.style.visibility = 'hidden';
            wrap.appendChild(renderChildren(node));
            return wrap;
        },

        mtable: function (node) {
            var table = make('span', 'mfb-table');
            var rows = elementChildren(node);
            var align = (node.getAttribute('columnalign') || '').trim().split(/\s+/);
            var rowLines = (node.getAttribute('rowlines') || '').trim().split(/\s+/);
            var colLines = (node.getAttribute('columnlines') || '').trim().split(/\s+/);
            var r, c, row, cell, cells;

            for (r = 0; r < rows.length; r++) {
                if (tagOf(rows[r]) !== 'mtr') continue;
                row = make('span', 'mfb-tr');
                cells = elementChildren(rows[r]);
                for (c = 0; c < cells.length; c++) {
                    if (tagOf(cells[c]) !== 'mtd') continue;
                    cell = make('span', 'mfb-td');
                    var a = (cells[c].getAttribute('columnalign') || align[c] || 'left').toLowerCase();
                    cell.style.textAlign = (a === 'center' || a === 'right') ? a : 'left';
                    if (rowLines[r - 1] === 'solid' && r > 0) cell.style.borderTop = '1px solid currentColor';
                    if (colLines[c - 1] === 'solid' && c > 0) cell.style.borderLeft = '1px solid currentColor';
                    cell.appendChild(renderChildren(cells[c]));
                    row.appendChild(cell);
                }
                table.appendChild(row);
            }
            return table;
        }
    };

    /* mrow：顺带处理一元负号（-x 的减号不该有左侧间距） */
    function renderRow(node) {
        var span = make('span', 'mfb-row');
        var prevKind = null;
        var child, out, kind;
        for (child = node.firstChild; child; child = child.nextSibling) {
            out = renderNode(child);
            if (!out) continue;
            kind = out.getAttribute ? out.getAttribute('data-mfb-kind') : null;
            if (kind === 'bin' &&
                (prevKind === null || prevKind === 'open' || prevKind === 'bin' ||
                 prevKind === 'rel' || prevKind === 'punct' || prevKind === 'large')) {
                out.className = out.className.replace(/\bmfb-bin\b/, 'mfb-bin-un');
            }
            prevKind = kind || 'operand';
            span.appendChild(out);
        }
        return span;
    }

    function renderChildren(node) {
        var frag = document.createDocumentFragment();
        var child, out;
        for (child = node.firstChild; child; child = child.nextSibling) {
            out = renderNode(child);
            if (out) frag.appendChild(out);
        }
        return frag;
    }

    function renderNode(node) {
        if (node.nodeType === 3) {
            var text = clean(node.nodeValue);
            if (!text) return null;
            // 元素之间的换行、缩进不该进入公式
            if (!/\S/.test(text) && tagOf(node.parentNode) !== 'mtext') return null;
            return document.createTextNode(text);
        }
        if (node.nodeType !== 1) return null;

        var name = tagOf(node);
        var renderer = RENDERERS[name];
        if (!renderer) return renderChildren(node);   // 未知元素：只渲染内部
        return renderer(node) || null;
    }

    /* =====================================================================
     * 五、插入文档后的一次性测量：根号高度、大括号缩放
     * ===================================================================== */
    /* 括号/花括号要跟着「成对括号之间的内容」长高，
       而不是跟着整行高度长高——否则 (x≠1) 会被旁边的分式撑成巨括号。 */
    function fenceTargetHeight(el) {
        var isOpen = el.className.indexOf('mfb-open') >= 0;
        var node = isOpen ? el.nextElementSibling : el.previousElementSibling;
        var best = 0, gap = 0;
        while (node && gap < 4) {
            if (node.className && /(^|\s)mfb-(open|close)(\s|$)/.test(node.className)) break;
            var h = node.getBoundingClientRect().height;
            if (h > best) best = h;
            node = isOpen ? node.nextElementSibling : node.previousElementSibling;
            gap++;
        }
        return best;
    }

    function adjustAll() {
        if (!PENDING.length) return;
        var items = PENDING.slice();
        var reads = [], i, it, h, fs, body, bh;

        PENDING.length = 0;

        // 先全部读，避免读写交替导致的反复重排
        for (i = 0; i < items.length; i++) {
            it = items[i];
            try {
                if (it.type === 'fence') {
                    if (!it.el.parentNode) continue;
                    h = fenceTargetHeight(it.el);
                    if (!h) continue;
                    fs = px(window.getComputedStyle(it.el).fontSize) || 16;
                    reads.push({ type: 'fence', el: it.el, ratio: h / fs });
                } else {
                    body = it.body;
                    if (!body) continue;
                    bh = body.getBoundingClientRect().height;
                    fs = px(window.getComputedStyle(it.el).fontSize) || 16;
                    reads.push({ type: 'sqrt', el: it.rad, ratio: bh / fs });
                }
            } catch (e) { /* 布局异常时保持默认样式 */ }
        }

        // 再全部写
        for (i = 0; i < reads.length; i++) {
            var r = reads[i];
            try {
                if (r.type === 'fence') {
                    if (r.ratio > 1.35) {
                        r.el.style.fontSize = clamp(r.ratio * 0.95, 1.2, 3.4).toFixed(2) + 'em';
                    }
                } else if (r.ratio > 1.15) {
                    r.el.style.fontSize = clamp(r.ratio, 1, 3.6).toFixed(2) + 'em';
                }
            } catch (e) { }
        }
    }

    /* =====================================================================
     * 六、检测：原生 MathML 到底能不能用
     * ===================================================================== */
    /* 1) 构造函数 + 版式：Chromium 109 以下没有 MathMLElement，<mfrac> 也不会被布局 */
    function probeLayout() {
        if (typeof window.MathMLElement === 'undefined') {
            return { ok: false, reason: 'no-mathml-api' };
        }
        var wrap, frac, height = 0;
        try {
            wrap = document.createElement('div');
            wrap.setAttribute('aria-hidden', 'true');
            wrap.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden;' +
                'font-size:16px;line-height:normal;white-space:normal;';
            wrap.innerHTML = '<math><mfrac><mn>1</mn><mn>2</mn></mfrac></math>' +
                '<span style="display:inline-block;width:2em;height:1em"></span>';
            document.body.appendChild(wrap);
            frac = wrap.getElementsByTagName('mfrac')[0];
            if (frac) height = frac.getBoundingClientRect().height;
            document.body.removeChild(wrap);
        } catch (e) {
            return { ok: false, reason: 'probe-error' };
        }
        // 正常 MathML 的分式是两行叠排，高度约 2em 以上；退化成行内文本时只有一行
        if (!(height > 24)) return { ok: false, reason: 'mathml-no-layout' };
        return { ok: true, reason: 'mathml-ok' };
    }

    /* 2) 字形墨水检测：MathML 能用，但系统缺数学字体时字母会变成空白。
          用 Canvas 按 mi 的实际字体画一个 x，数一下有没有像素。 */
    function probeGlyphs() {
        var ok = true, holder = null, canvas = null, ctx = null, data = null;
        try {
            var mi = document.createElementNS(NS, 'mi');
            mi.textContent = 'x';
            holder = document.createElement('div');
            holder.setAttribute('aria-hidden', 'true');
            holder.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden;font-size:16px;';
            holder.appendChild(mi);
            document.body.appendChild(holder);

            var cs = window.getComputedStyle(mi);
            var font = (cs.fontStyle || 'normal') + ' ' + (cs.fontWeight || '400') + ' ' +
                (cs.fontSize || '16px') + ' ' + (cs.fontFamily || 'serif');
            var size = px(cs.fontSize) || 16;
            document.body.removeChild(holder);
            holder = null;

            canvas = document.createElement('canvas');
            canvas.width = canvas.height = Math.max(24, Math.ceil(size * 2));
            ctx = canvas.getContext && canvas.getContext('2d');
            if (!ctx) return true;                       // 没 Canvas，别误判
            ctx.font = font;
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#000';
            ctx.fillText('x', 2, 2);
            data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            var ink = 0, i;
            for (i = 3; i < data.length; i += 4) {
                if (data[i] > 8) { ink++; }
            }
            ok = ink > 0;
        } catch (e) {
            ok = true;                                   // 任何异常都按「正常」处理，避免误伤
        } finally {
            if (holder && holder.parentNode) holder.parentNode.removeChild(holder);
        }
        return ok ? { ok: true, reason: 'glyphs-ok' } : { ok: false, reason: 'blank-math-glyphs' };
    }

    function probeNative() {
        var layout = probeLayout();
        if (!layout.ok) return layout;
        return probeGlyphs();
    }

    /* 3) 华为/鸿蒙平板专项兜底。
          这类设备的 UA 往往自称 Chrome 100+，MathMLElement 与分式布局检测都可能
          通过，但 <mi> 里的拉丁字母会因为系统 MATH 字体缺字而整段留白。
          Canvas 检测会使用普通字体回退，因此测不出来，只能按设备特征直接降级。 */
    function huaweiTabletRisk() {
        var ua = '';
        try { ua = navigator.userAgent || ''; } catch (e) { }
        if (!/(HarmonyOS|OpenHarmony|HuaweiBrowser|PetalBrowser|ArkWeb|HUAWEI|Huawei|HMSCore)/i.test(ua)) {
            return null;
        }
        var shortSide = 0;
        try {
            shortSide = Math.min(window.screen.width || 0, window.screen.height || 0);
        } catch (e) { }
        var looksLikeTablet = /(MatePad|MediaPad|Tablet|Pad\b)/i.test(ua) || shortSide >= 600;
        return looksLikeTablet ? { ok: false, reason: 'huawei-tablet-mathml-risk' } : null;
    }

    /* =====================================================================
     * 七、批量转换 + 启动
     * ===================================================================== */
    function convertAll() {
        var list = document.getElementsByTagNameNS
            ? document.getElementsByTagNameNS(NS, 'math')
            : document.getElementsByTagName('math');
        var arr = [], i, m, rendered;
        for (i = 0; i < list.length; i++) arr.push(list[i]);

        for (i = 0; i < arr.length; i++) {
            m = arr[i];
            if (!m.parentNode) continue;
            try {
                rendered = renderNode(m);
                if (!rendered) { STATS.failed++; continue; }
                m.parentNode.replaceChild(rendered, m);
                STATS.converted++;
            } catch (err) {
                STATS.failed++;
                if (window.console && console.warn) {
                    console.warn('[mathml-fallback] 公式转换失败，保留原生 MathML：', err, m);
                }
            }
        }
        if (STATS.converted) {
            try { adjustAll(); } catch (e) { }
        }
    }

    function forcedMode() {
        var mode = window.__MATHML_MODE__;
        try {
            var m = /[?&]mathml=(auto|native|fallback)/.exec(window.location.search);
            if (m) mode = m[1];
        } catch (e) { }
        return (mode === 'native' || mode === 'fallback') ? mode : 'auto';
    }

    function markMode(mode, reason) {
        document.documentElement.setAttribute(MODE_ATTR, mode);
        if (reason) document.documentElement.setAttribute(MODE_ATTR + '-reason', reason);
    }

    function boot() {
        if (BOOTED) return;
        BOOTED = true;
        if (!document.body) return;

        injectStyle();

        var mode = forcedMode();
        var info;

        if (mode === 'native') {
            info = { ok: true, reason: 'forced-native' };
        } else if (mode === 'fallback') {
            info = { ok: false, reason: 'forced-fallback' };
        } else {
            try {
                info = huaweiTabletRisk() || probeNative();
            } catch (e) {
                info = { ok: false, reason: 'probe-error' };
            }
        }

        if (info.ok) {
            markMode('native', info.reason);
            if (window.console && console.info) {
                console.info('[mathml-fallback] 原生 MathML 可用（' + info.reason + '），跳过降级。');
            }
        } else {
            var t0 = Date.now();
            convertAll();
            STATS.ms = Date.now() - t0;
            markMode('fallback', info.reason);
            if (window.console && console.info) {
                console.info('[mathml-fallback] 已降级渲染 ' + STATS.converted + ' 个公式（原因：' +
                    info.reason + '，耗时 ' + STATS.ms + 'ms）。');
            }
        }

        window.MathMLFallback = {
            version: VERSION,
            mode: info.ok ? 'native' : 'fallback',
            reason: info.reason,
            stats: STATS,
            refresh: function () {
                if (document.documentElement.getAttribute(MODE_ATTR) === 'fallback') {
                    convertAll();
                }
            }
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})(window, document);
