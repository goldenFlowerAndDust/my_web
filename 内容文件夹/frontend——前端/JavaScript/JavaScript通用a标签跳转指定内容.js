function loadContent(url, id,selector) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 1. 提取目标内容
            const content = doc.querySelector(selector);
            const container = document.getElementById(id);
            container.innerHTML = content.innerHTML;

            // 2. 添加清除按钮
            const clearBtn = document.createElement('button');
            clearBtn.textContent = '清除内容';
            clearBtn.style.marginTop = '10px';
            clearBtn.onclick = function() {
                container.innerHTML = ''; // 清空容器，同时按钮也会消失
            };
            container.appendChild(clearBtn);

            // 3. 提取目标页面的内联样式（如果有）
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
            document.getElementById(id).innerHTML = '<p>内容加载失败，请刷新重试。</p>';
        });
}