// ================= 1. 动态创建全局悬浮按钮 =================
const btn = document.createElement('button');
btn.className = 'toggle-btn';
btn.textContent = '隐藏中文 (开始测试)';
document.body.appendChild(btn);

// 只选“顶层卡片 li”
const wordItems = document.querySelectorAll('.word_div > li');

// ================= 2. 全局按钮点击逻辑 =================
btn.addEventListener('click', () => {
    document.body.classList.toggle('hide-zh');

    if (document.body.classList.contains('hide-zh')) {
        btn.textContent = '显示中文 (核对答案)';
        btn.style.backgroundColor = '#E67E22';
    } else {
        btn.textContent = '隐藏中文 (开始测试)';
        btn.style.backgroundColor = '#5D6D7E';

        // 切回“显示”状态时，清空所有局部展开
        wordItems.forEach(li => {
            li.querySelectorAll('.zh.show-zh').forEach(z => z.classList.remove('show-zh'));
            li.querySelectorAll('.note.show-note').forEach(n => n.classList.remove('show-note'));
        });
    }
});

// ================= 3. 工具函数 =================

// 从某个 zh 向后查找“归属于它的 note”
// 兼容两种结构：① note 嵌套在 zh 里面；② note 在 zh 所在的 en 后面
function findOwnerNote(zhEl) {
    // 情况①：note 直接嵌套在这个 zh 里（如 fishing 的 "fish的现在分词"）
    const innerNote = zhEl.querySelector('.note');
    if (innerNote) return innerNote;

    // 情况②：note 在 zh 所在的 en（或 zh 自己）的后面
    let startEl = zhEl.closest('.en') || zhEl;
    let node = startEl;
    while ((node = node.nextSibling)) {
        if (node.nodeType === 1) {
            if (node.classList.contains('en') || node.classList.contains('zh')) break;
            if (node.classList.contains('note')) return node;
        }
    }
    return null;
}

// ================= 4. 卡片交互 =================
wordItems.forEach(li => {
    const ens = Array.from(li.querySelectorAll('.en'));
    const zhs = Array.from(li.querySelectorAll('.zh'));

    // 特例：这张卡片里既没有 en 也没有 zh，只有 note
    const onlyNoteCard = ens.length === 0 && zhs.length === 0;

    li.addEventListener('click', function(event) {
        if (!document.body.classList.contains('hide-zh')) return;

        // ========== 特例：只有 note 的卡片 → 点击切换显示 ==========
        if (onlyNoteCard) {
            const noteEl = this.querySelector('.note');
            if (noteEl) noteEl.classList.toggle('show-note');
            return;
        }

        // ========== 第三级：点卡片最外层 note → 重置整张卡片 ==========
        const directNote = event.target.closest('.note');
        if (directNote && directNote.parentElement === this) {
            zhs.forEach(z => z.classList.remove('show-zh'));
            this.querySelectorAll('.note.show-note').forEach(n => n.classList.remove('show-note'));
            return;
        }

        // ========== 第二级：点 ZH → 显示它归属的 note ==========
        const zhEl = event.target.closest('.zh');
        if (zhEl) {
            const targetNote = findOwnerNote(zhEl);
            if (targetNote) targetNote.classList.toggle('show-note');
            return;
        }

        // ========== 第一级：点 EN → 切换对应的 zh（并让 note 同生共死） ==========
        const enEl = event.target.closest('.en');
        if (enEl) {
            const idx = ens.indexOf(enEl);
            if (idx >= 0 && zhs[idx]) {
                const thisZh = zhs[idx];
                const willHide = thisZh.classList.contains('show-zh');

                // 切换 zh 显示状态
                thisZh.classList.toggle('show-zh');

                // 如果这次是“收起 zh”，则它归属的 note 一起收起
                if (willHide) {
                    const ownerNote = findOwnerNote(thisZh);
                    if (ownerNote) ownerNote.classList.remove('show-note');
                }
            }
        }
    });
});