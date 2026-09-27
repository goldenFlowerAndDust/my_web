// ============================================================
// JavaScript通用a标签跳转指定内容.js (嵌套 fetch 优化版)
// 兼容：本地 / Vercel / GitHub Pages
// 支持：递归加载（A 页面内 fetch B，B 页面内 fetch C）
// ============================================================

function loadContent(url, id, selector) {
    // ============ 1. 提取参数与 baseUrl ============
    let baseUrl = null;
    if (typeof url !== 'string') {
        const el = url;
        // 【关键】优先读原始 href 属性，避免被浏览器解析成绝对 URL
        const rawHref = el.getAttribute && el.getAttribute('href');
        url = rawHref || el.href || '';
        // 读取之前注入时打上的 baseUrl（用于嵌套 fetch）
        baseUrl = el.dataset ? el.dataset.baseUrl : null;
    }

    const container = document.getElementById(id);
    if (!container) {
        console.error(`容器 #${id} 不存在`);
        return;
    }

    // ============ 2. 分离文件路径与锚点 ============
    const hashIndex = url.indexOf('#');
    let filePath = hashIndex > -1 ? url.substring(0, hashIndex) : url;
    const anchor = hashIndex > -1 ? url.substring(hashIndex) : '';

    // 【修复1】去掉末尾的斜杠（.html/ → .html）
    filePath = filePath.replace(/\/+$/, '');

    // 纯锚点跳转
    if (!filePath) {
        const target = document.querySelector(anchor);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // ============ 3. 构建绝对 URL ============
    let absoluteUrl;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        absoluteUrl = filePath;
    } else {
        let finalPath = filePath;

        // GitHub Pages 环境下把 ../ 序列替换为 /仓库名/
        if (window.location.hostname.includes('github.io')) {
            const pathParts = window.location.pathname.split('/');
            if (pathParts.length > 1 && pathParts[1] !== '') {
                const repoName = pathParts[1];
                if (finalPath.startsWith('../')) {
                    // 智能判断：原始路径里有没有"内容文件夹"？
                    // 有 → 替换为 /仓库名/
                    // 没有 → 替换为 /仓库名/内容文件夹/（自动补上）
                    const hasContentFolder = filePath.includes('内容文件夹');
                    const replacement = hasContentFolder
                        ? '/' + repoName + '/'
                        : '/' + repoName + '/内容文件夹/';
                    finalPath = finalPath.replace(/^(\.\.\/)+/, replacement);
                    console.log(`[loadContent] GitHub 路径修复: ${filePath} → ${finalPath}`);
                }
            }
        }

        // 【核心】有 baseUrl 用它作为起点，否则用当前页面目录
        const baseForResolve = baseUrl
            ? baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1)
            : window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);

        try {
            absoluteUrl = new URL(finalPath, baseForResolve).href;
        } catch (e) {
            console.error('路径解析失败:', finalPath, e);
            container.innerHTML = '<p style="color: red;">无效的路径。</p>';
            return;
        }
    }

    console.log('[loadContent] 请求 URL:', absoluteUrl);
    console.log('[loadContent] 锚点:', anchor);

    // ============ 4. fetch 并注入 ============
    fetch(absoluteUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const content = doc.querySelector(selector);

            if (!content) {
                container.innerHTML = `<p style="color: red;">未找到选择器 "${selector}" 的内容。</p>`;
                return;
            }

            container.innerHTML = content.innerHTML;

            // 【核心】给注入内容里所有 loadContent 链接打上 baseUrl
            // 这样下次点击它们时，会以"被 fetch 的页面"为起点解析相对路径
            container.querySelectorAll('[onclick*="loadContent"]').forEach(el => {
                el.dataset.baseUrl = absoluteUrl;
            });

            // 如果目标有锚点，滚动到锚点位置
            if (anchor) {
                const targetInContainer = container.querySelector(anchor);
                if (targetInContainer) {
                    targetInContainer.scrollIntoView({ behavior: 'smooth' });
                }
            }

            // 添加清除按钮
            const clearBtn = document.createElement('button');
            clearBtn.textContent = '清除内容';
            clearBtn.style.cssText = 'margin-top:10px;padding:5px 15px;cursor:pointer;';
            clearBtn.onclick = () => { container.innerHTML = ''; };
            container.appendChild(clearBtn);

            // 提取目标页面里的内联样式
            doc.querySelectorAll('style').forEach(style => {
                if (!document.querySelector('style[data-origin="target"]')) {
                    const s = document.createElement('style');
                    s.setAttribute('data-origin', 'target');
                    s.textContent = style.textContent;
                    document.head.appendChild(s);
                }
            });
        })
        .catch(error => {
            console.error('加载失败:', error);
            container.innerHTML = `<p style="color: red;">加载失败: ${error.message}</p>`;
        });
}