// ================= 1. 动态创建全局悬浮按钮 =================
const btn = document.createElement('button');
btn.className = 'toggle-btn';
btn.textContent = '隐藏中文 (开始测试)';
document.body.appendChild(btn);

// 获取所有单词列表项
const wordItems = document.querySelectorAll('.word_div li');

// ================= 2. 全局按钮点击逻辑 =================
btn.addEventListener('click', () => {
    document.body.classList.toggle('hide-zh');

    if (document.body.classList.contains('hide-zh')) {
        btn.textContent = '显示中文 (核对答案)';
        btn.style.backgroundColor = '#E67E22';
    } else {
        btn.textContent = '隐藏中文 (开始测试)';
        btn.style.backgroundColor = '#5D6D7E';

        // 关键优化：当切回“显示”状态时，清除所有单词的“局部展开”标记，恢复初始状态
        wordItems.forEach(item => item.classList.remove('show-zh', 'show-note'));
    }
});

// ================= 3. 单词点击逻辑（加强版，兼容独立注释） =================
wordItems.forEach(li => {
    li.addEventListener('click', function(event) {
        // 仅在全局隐藏测试状态下生效
        if (!document.body.classList.contains('hide-zh')) return;

        const hasZh = this.querySelector('.zh') !== null; // 判断这行有没有中文
        const hasNote = this.querySelector('.note') !== null; // 判断这行有没有注释

        // 【特例拦截】：如果这一行只有注释、没有中文
        if (!hasZh && hasNote) {
            if (this.classList.contains('show-note')) {
                // 已展开 -> 收起
                this.classList.remove('show-zh', 'show-note');
            } else {
                // 未展开 -> 展开（同时加 show-zh 是为了适配你的 CSS 规则）
                this.classList.add('show-zh', 'show-note');
            }
            return; // 结束，不走后面的普通逻辑
        }

        // 【普通逻辑】
        const isClickingZh = event.target.classList.contains('zh');
        if (isClickingZh) {
            // 点击了中文 -> 切换注释
            this.classList.toggle('show-note');
        } else {
            // 点击了其他区域 -> 展开/折叠中文
            if (this.classList.contains('show-zh')) {
                this.classList.remove('show-zh', 'show-note'); // 已展开就收起
            } else {
                this.classList.add('show-zh'); // 未展开就展开
            }
        }
    });
});