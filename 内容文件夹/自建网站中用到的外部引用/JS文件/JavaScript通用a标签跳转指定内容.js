// ============================================================
// JavaScript通用a标签跳转指定内容.js
// 自动适配本地、Vercel、GitHub Pages（子目录）
// ============================================================

function loadContent(url, id, selector) {
    // ---- 处理 url 参数 ----
    if (typeof url !== 'string') {
        url = url.href || url.getAttribute('href') || '';
    }

    const container = document.getElementById(id);
    if (!container) {
        console.error(`容器 #${id} 不存在`);
        return;
    }

    // ---- 自动获取项目根路径（关键逻辑） ----
    // 从 window.location.pathname 中提取第一个目录作为项目根
    // 例如：/my_web/自建本地网站/.../ -> 项目根为 /my_web/
    const pathname = window.location.pathname;
    const match = pathname.match(/^\/[^\/]+\//);
    const projectRoot = match ? match[0] : '/';
    // 得到类似 /my_web/ 或 / （如果部署在根目录）

    // ---- 将相对路径转换为绝对路径 ----
    let absoluteUrl;
    if (url.startsWith('/')) {
        // 如果用户写了以 / 开头的绝对路径，我们自动加上项目根
        absoluteUrl = window.location.origin + projectRoot + url.substring(1);
    } else {
        // 相对路径：基于当前页面所在目录拼接
        const currentDir = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        // 但这样拼接出来的路径可能包含多余的子目录，需要简化
        // 最好的办法是：如果 url 不包含项目根目录，则自动基于项目根拼接
        // 但我们使用 new URL(url, currentDir) 也能工作，但可能出现多级目录问题
        // 我们可以先尝试 new URL，如果结果包含 projectRoot 则保留，否则重新拼接
        const tempUrl = new URL(url, currentDir).href;
        // 检查 tempUrl 是否包含 projectRoot（排除域名部分）
        const pathAfterOrigin = tempUrl.replace(window.location.origin, '');
        if (pathAfterOrigin.startsWith(projectRoot)) {
            absoluteUrl = tempUrl;
        } else {
            // 如果 tempUrl 没有包含项目根，则手动拼接
            absoluteUrl = window.location.origin + projectRoot + url;
        }
    }

    // 修正：如果 url 本身是绝对路径（完整 URL），直接使用
    if (url.startsWith('http://') || url.startsWith('https://')) {
        absoluteUrl = url;
    }

    console.log('[loadContent] 解析后的绝对路径:', absoluteUrl);

    // ---- 发起请求 ----
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

            // ---- 清除按钮 ----
            const clearBtn = document.createElement('button');
            clearBtn.textContent = '清除内容';
            clearBtn.style.marginTop = '10px';
            clearBtn.style.padding = '5px 15px';
            clearBtn.style.cursor = 'pointer';
            clearBtn.onclick = function() {
                container.innerHTML = '';
            };
            container.appendChild(clearBtn);

            // ---- 提取目标页面内联样式（避免重复） ----
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