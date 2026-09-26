// ============================================================
// JavaScript通用a标签跳转指定内容.js
// 正确处理 href 中的 # 锚点，并适配子目录部署（含 GitHub Pages 智能修复）
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
    const hashIndex = url.indexOf('#');
    let filePath = hashIndex > -1 ? url.substring(0, hashIndex) : url;
    const anchor = hashIndex > -1 ? url.substring(hashIndex) : '';

    // 【修复1】去除文件路径末尾的斜杠，防止请求 "xxx.html/" 导致 404
    filePath = filePath.replace(/\/+$/, '');

    // 如果 filePath 为空，说明是一个纯粹的页面内跳转（如 <a href="#目录">）
    if (!filePath) {
        const target = document.querySelector(anchor);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // ---- 3. 构建完整的绝对 URL（含 GitHub Pages 路径智能修复） ----
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        var absoluteUrl = filePath;
    } else {
        let finalPath = filePath;

        // 【修复2】GitHub Pages 环境下的子目录路径处理
        if (window.location.hostname.includes('github.io')) {
            const pathParts = window.location.pathname.split('/');
            if (pathParts.length > 1 && pathParts[1] !== '') {
                const repoName = pathParts[1]; // 自动提取仓库名，例如 my_web

                // 如果是以 ../ 开头，替换为 /仓库名/
                if (finalPath.startsWith('../')) {
                    finalPath = finalPath.replace(/^(\.\.\/)+/, '/' + repoName + '/');
                    console.log(`[loadContent] 检测到 GitHub Pages 环境，路径已自动修复: ${filePath} -> ${finalPath}`);
                }
                // 如果是以 / 开头但缺少仓库名，补全仓库名
                else if (finalPath.startsWith('/') && !finalPath.startsWith(`/${repoName}/`)) {
                    finalPath = `/${repoName}${finalPath}`;
                    console.log(`[loadContent] 检测到根路径开头，路径已自动补全: ${filePath} -> ${finalPath}`);
                }
            }
        }

        const currentDir = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
        try {
            var absoluteUrl = new URL(finalPath, currentDir).href;
        } catch (e) {
            console.error('路径解析失败:', finalPath, e);
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

            // ---- 5. 添加清除按钮 ----
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