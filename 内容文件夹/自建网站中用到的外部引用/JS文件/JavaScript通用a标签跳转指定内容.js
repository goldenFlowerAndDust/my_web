// ============================================================
// JavaScript通用a标签跳转指定内容.js
// 正确处理 href 中的 # 锚点，并适配子目录部署
// ============================================================

function loadContent(url, id, selector) {
    // ---- 1. 处理 url ----
    if (typeof url !== 'string') {
        url = url.href || url.getAttribute('href') || '';
    }

    const container = document.getElementById(id);
    if (!container) {
        console.error(`容器 #${id} 不存在`);
        return;
    }

    // ---- 2. 分离文件路径和锚点 ----
    // 如果 url 包含 #，取出 # 之前的部分作为文件路径
    const hashIndex = url.indexOf('#');
    const filePath = hashIndex > -1 ? url.substring(0, hashIndex) : url;
    const anchor = hashIndex > -1 ? url.substring(hashIndex) : '';

    // 如果 filePath 为空，说明是一个纯粹的页面内跳转（如 <a href="#目录">）
    if (!filePath) {
        // 直接滚动到锚点，不加载内容
        const target = document.querySelector(anchor);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // ---- 3. 构建完整的绝对 URL ----
    // 如果已经是完整 URL，直接使用
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        var absoluteUrl = filePath;
    } else {
        // 获取当前页面的目录（不包含文件名）
        const currentDir = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        // 使用 new URL() 基于当前目录解析相对路径
        try {
            var absoluteUrl = new URL(filePath, currentDir).href;
        } catch (e) {
            console.error('路径解析失败:', filePath, e);
            container.innerHTML = '<p style="color: red;">无效的路径。</p>';
            return;
        }
    }

    console.log('[loadContent] 文件路径:', filePath);
    console.log('[loadContent] 锚点:', anchor);
    console.log('[loadContent] 最终请求 URL:', absoluteUrl);

    // ---- 4. 发起 fetch ----
    fetch(absoluteUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const content = doc.querySelector(selector);

            if (!content) {
                container.innerHTML = `<p style="color: red;">未找到指定选择器 "${selector}" 的内容。</p>`;
                return;
            }

            container.innerHTML = content.innerHTML;

            // ---- 5. 清除按钮 ----
            const clearBtn = document.createElement('button');
            clearBtn.textContent = '清除内容';
            clearBtn.style.marginTop = '10px';
            clearBtn.style.padding = '5px 15px';
            clearBtn.style.cursor = 'pointer';
            clearBtn.onclick = function() {
                container.innerHTML = '';
            };
            container.appendChild(clearBtn);

            // ---- 6. 提取目标页面的内联样式 ----
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
            console.error('加载失败:', error);
            container.innerHTML = `<p style="color: red;">加载失败: ${error.message}</p>`;
        });
}