// ============================================================
// 动态a标签加载（隔离版）
// 兼容：本地 / VSCode / GitHub Pages
// 特性：
//   1. new URL 标准解析，无需 GitHub 特判
//   2. baseUrl 逐层传递，支持无限嵌套
//   3. 注入内容修正 href / src
//   4. 注入容器标记 data-isolated，与主内容隔离
// ============================================================

function loadContent(url, id, selector) {
    // ============ 1. 提取参数 ============
    let baseUrl = null;
    if (typeof url !== 'string') {
        const el = url;
        url = (el.getAttribute && el.getAttribute('href')) || el.href || '';
        baseUrl = (el.dataset && el.dataset.baseUrl) || null;
    }

    const container = document.getElementById(id);
    if (!container) {
        console.error(`容器 #${id} 不存在`);
        return;
    }

    // ============ 2. 分离路径和锚点 ============
    const hashIndex = url.indexOf('#');
    let filePath = hashIndex > -1 ? url.substring(0, hashIndex) : url;
    const anchor = hashIndex > -1 ? url.substring(hashIndex) : '';
    filePath = filePath.replace(/\/+$/, '');

    if (!filePath) {
        const target = document.querySelector(anchor);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // ============ 3. 解析成绝对 URL ============
    const baseForResolve = baseUrl || window.location.href;
    let absoluteUrl;
    try {
        absoluteUrl = new URL(filePath, baseForResolve).href;
    } catch (e) {
        console.error('[loadContent] 路径解析失败:', filePath, e);
        container.innerHTML = '<p style="color: red;">无效的路径。</p>';
        return;
    }

    console.log('[loadContent] 请求 URL:', absoluteUrl);

    // ============ 4. fetch 并注入 ============
    fetch(absoluteUrl)
        .then(resp => {
            if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
            return resp.text();
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

            // ⭐ 标记为隔离边界，CSS 会重置这里的隐藏变量
            container.setAttribute('data-isolated', '');

            // ========== 5. 修正注入内容里的相对链接 ==========
            container.querySelectorAll('a[href]').forEach(a => {
                const raw = a.getAttribute('href');
                if (!raw) return;
                if (raw.startsWith('#') || raw.startsWith('/') || /^[a-z]+:/i.test(raw)) return;
                try {
                    a.setAttribute('href', new URL(raw, absoluteUrl).href);
                } catch (e) {}
            });

            container.querySelectorAll('img[src]').forEach(img => {
                const raw = img.getAttribute('src');
                if (!raw) return;
                if (raw.startsWith('data:') || /^[a-z]+:/i.test(raw)) return;
                try {
                    img.setAttribute('src', new URL(raw, absoluteUrl).href);
                } catch (e) {}
            });

            // ========== 6. 嵌套 loadContent 链接打 baseUrl ==========
            container.querySelectorAll('[onclick*="loadContent"]').forEach(el => {
                el.dataset.baseUrl = absoluteUrl;
            });

            // ========== 7. 注入内容里的按钮 → 绑定到当前容器 ==========
            container.querySelectorAll('#btn, .toggle-btn').forEach(b => {
                b.dataset.target = container.id;
                b.classList.add('toggle-btn-local');
            });

            // ========== 8. 锚点滚动 ==========
            if (anchor) {
                const targetInContainer = container.querySelector(anchor);
                if (targetInContainer) {
                    targetInContainer.scrollIntoView({ behavior: 'smooth' });
                }
            }

            // ========== 9. 清除按钮 ==========
            const clearBtn = document.createElement('button');
            clearBtn.textContent = '清除内容';
            clearBtn.className = 'clear-content-btn';
            clearBtn.onclick = () => {
                container.innerHTML = '';
                container.removeAttribute('data-isolated');
            };
            container.appendChild(clearBtn);

            // ========== 10. 提取内联样式 ==========
            doc.querySelectorAll('style').forEach(style => {
                const key = 'loadContentStyle_' + absoluteUrl;
                if (document.querySelector(`style[data-origin="${key}"]`)) return;
                const s = document.createElement('style');
                s.setAttribute('data-origin', key);
                s.textContent = style.textContent;
                document.head.appendChild(s);
            });
        })
        .catch(error => {
            console.error('加载失败:', error);
            container.innerHTML = `<p style="color: red;">加载失败: ${error.message}</p>`;
        });
}