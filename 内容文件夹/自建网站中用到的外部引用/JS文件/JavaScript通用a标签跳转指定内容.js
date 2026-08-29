// ============================================================
// JavaScript通用a标签跳转指定内容.js
// 功能：通过 fetch 动态加载目标 HTML 中的指定内容，并插入到当前页面
// 增强：自动将相对路径转为绝对路径，兼容本地、Vercel、GitHub Pages
// ============================================================

function loadContent(url, id, selector) {
    // ---- 1. 处理 url 参数（可能直接传入字符串，也可能传入 DOM 元素 this） ----
    if (typeof url !== 'string') {
        // 如果 url 是 DOM 元素（如 a 标签），取它的 href 或 getAttribute('href')
        url = url.href || url.getAttribute('href') || '';
    }

    // ---- 2. 获取容器元素 ----
    const container = document.getElementById(id);
    if (!container) {
        console.error(`容器元素 #${id} 不存在`);
        return;
    }

    // ---- 3. 将相对路径转为绝对路径（关键修复） ----
    // 使用 new URL() 基于当前页面的 URL 解析，确保在任何部署环境下都能正确访问
    let absoluteUrl;
    try {
        absoluteUrl = new URL(url, window.location.href).href;
        console.log('[loadContent] 解析后的绝对路径:', absoluteUrl);
    } catch (e) {
        console.error('[loadContent] URL 解析失败:', url, e);
        container.innerHTML = '<p style="color: red;">无效的链接地址。</p>';
        return;
    }

    // ---- 4. 发起 fetch 请求 ----
    fetch(absoluteUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            // ---- 5. 解析 HTML，提取目标内容 ----
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const content = doc.querySelector(selector);

            if (!content) {
                container.innerHTML = `<p style="color: red;">未找到指定选择器 "${selector}" 的内容。</p>`;
                return;
            }

            // ---- 6. 插入内容到容器 ----
            container.innerHTML = content.innerHTML;

            // ---- 7. 添加“清除内容”按钮（原有功能） ----
            const clearBtn = document.createElement('button');
            clearBtn.textContent = '清除内容';
            clearBtn.style.marginTop = '10px';
            clearBtn.style.padding = '5px 15px';
            clearBtn.style.cursor = 'pointer';
            clearBtn.onclick = function() {
                container.innerHTML = '';
            };
            container.appendChild(clearBtn);

            // ---- 8. 提取目标页面的内联样式（如果有） ----
            // 避免重复注入相同样式，使用 data-origin 标记
            const styles = doc.querySelectorAll('style');
            styles.forEach(style => {
                if (!document.querySelector(`style[data-origin="target"]`)) {
                    const newStyle = document.createElement('style');
                    newStyle.setAttribute('data-origin', 'target');
                    newStyle.textContent = style.textContent;
                    document.head.appendChild(newStyle);
                }
            });
        })
        .catch(error => {
            // ---- 9. 错误处理 ----
            console.error('[loadContent] 加载失败:', error);
            container.innerHTML = `<p style="color: red;">内容加载失败，请刷新重试。<br>错误信息：${error.message}</p>`;
        });
}