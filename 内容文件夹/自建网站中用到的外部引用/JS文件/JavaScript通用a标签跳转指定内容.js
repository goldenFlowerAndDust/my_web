// ============================================================
// JavaScript通用a标签跳转指定内容.js (终极完整版)
// 兼容：本地 Live Server / Vercel / GitHub Pages
// 支持：无限嵌套 fetch + 路径智能修复
// ============================================================

function loadContent(url, id, selector) {
    // ============ 1. 提取参数与 baseUrl ============
    let baseUrl = null;
    if (typeof url !== 'string') {
        const el = url;
        const rawHref = el.getAttribute && el.getAttribute('href');
        url = rawHref || el.href || '';
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

    // 去掉末尾斜杠，防 "xxx.html/" 导致 404
    filePath = filePath.replace(/\/+$/, '');

    // 纯锚点跳转（如 <a href="#目录">）
    if (!filePath) {
        const target = document.querySelector(anchor);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // ============ 3. 路径标准化（核心） ============
    let absoluteUrl;

    // 情况 A：完整 URL，直接使用
    if (/^https?:\/\//i.test(filePath)) {
        absoluteUrl = filePath;
    } else {
        let finalPath = filePath;

        // ---- 3.1 判断是否在 GitHub Pages ----
        const isGitHubPages = window.location.hostname.includes('github.io');
        let repoName = '';
        if (isGitHubPages) {
            const parts = window.location.pathname.split('/').filter(Boolean);
            if (parts.length > 0) repoName = parts[0]; // 第一个路径段就是仓库名
        }

        // ---- 3.2 路径标准化 ----
        // 统一处理三种原始路径写法：
        //   ① ../ 开头（相对路径）
        //   ② / 开头（绝对路径，可能缺仓库名）
        //   ③ 其他（裸相对路径）

        if (isGitHubPages && repoName) {
            const rootPrefix = '/' + repoName + '/';
            const contentMarker = '内容文件夹';

            if (finalPath.startsWith('../')) {
                // ① 相对路径 → 计算它在 my_web/ 下的真实位置
                // 先数 ../ 的数量，再配合 baseUrl 推算
                // 但因为不知道当前文件在仓库的深度，改用"内容文件夹"锚定法：
                // 只要路径里出现"内容文件夹"，就保留它后面的部分；
                // 否则，假设它应该在"内容文件夹"下。
                const idx = finalPath.indexOf(contentMarker);
                if (idx > -1) {
                    finalPath = rootPrefix + finalPath.substring(idx);
                } else {
                    // 没有"内容文件夹"，自动补上
                    const cleaned = finalPath.replace(/^(\.\.\/)+/, '');
                    finalPath = rootPrefix + contentMarker + '/' + cleaned;
                }
            } else if (finalPath.startsWith('/')) {
                // ② 绝对路径（/开头）→ 补上仓库名
                if (!finalPath.startsWith(rootPrefix)) {
                    // 如果路径里已有"内容文件夹"，就只补仓库名
                    if (finalPath.includes(contentMarker)) {
                        finalPath = rootPrefix + finalPath.substring(finalPath.indexOf(contentMarker));
                    } else {
                        finalPath = rootPrefix + contentMarker + finalPath;
                    }
                }
            } else {
                // ③ 裸相对路径：交给 new URL 处理
                // 但同样要补"内容文件夹"（如果缺）
                if (!finalPath.includes(contentMarker) && !finalPath.startsWith('http')) {
                    // 注意：这种情况很少，一般裸路径是相对当前文件的，不补
                }
            }
        }

        // ---- 3.3 用 baseUrl 或当前页面目录解析 ----
        const baseForResolve = baseUrl
            ? baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1)
            : window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);

        try {
            absoluteUrl = new URL(finalPath, baseForResolve).href;
        } catch (e) {
            console.error('[loadContent] 路径解析失败:', finalPath, e);
            container.innerHTML = '<p style="color: red;">无效的路径。</p>';
            return;
        }
    }

    console.log('[loadContent] 请求 URL:', absoluteUrl);

    // ============ 4. fetch 并注入 ============
    fetch(absoluteUrl)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
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
            container.querySelectorAll('[onclick*="loadContent"]').forEach(el => {
                el.dataset.baseUrl = absoluteUrl;
            });

            // 锚点滚动
            if (anchor) {
                const targetInContainer = container.querySelector(anchor);
                if (targetInContainer) {
                    targetInContainer.scrollIntoView({ behavior: 'smooth' });
                }
            }

            // 清除按钮
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