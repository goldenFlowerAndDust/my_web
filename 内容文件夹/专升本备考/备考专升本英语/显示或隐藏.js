// ================= 0. 确保页面至少有一个按钮 =================
function hasToggleBtn() {
    return document.querySelector('#btn, .toggle-btn');
}

if (!hasToggleBtn()) {
    const b = document.createElement('button');
    b.className = 'toggle-btn';
    b.textContent = '隐藏中文 (开始测试)';
    document.body.appendChild(b);
}

// ================= 1. 工具函数 =================
function findOwnerNote(zhEl) {
    const innerNote = zhEl.querySelector('.note');
    if (innerNote) return innerNote;

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

// 找按钮的作用范围
// 优先级：data-target > 最近的"包含 word_div 的祖先" > body
function getScope(btn) {
    // 1. data-target 显式指定
    const sel = btn.dataset.target;
    if (sel) {
        const el = document.querySelector(sel);
        if (el) return el;
    }

    // 2. 从按钮往上找：第一个包含 .word_div 的祖先
    let p = btn.parentElement;
    while (p && p !== document.documentElement) {
        if (p.querySelector && p.querySelector('.word_div')) {
            return p;
        }
        p = p.parentElement;
    }

    // 3. 兜底
    return document.body;
}

// 更新一个按钮的文案和颜色
function refreshBtn(btn) {
    const scope = getScope(btn);
    const isHidden = scope.classList.contains('hide-zh');
    btn.textContent = isHidden ? '显示中文 (核对答案)' : '隐藏中文 (开始测试)';
    btn.style.backgroundColor = isHidden ? '#E67E22' : '#5D6D7E';
}

// ================= 2. 事件委托 =================
document.addEventListener('click', function (event) {

    // ========== A. 按钮 ==========
    const btnEl = event.target.closest('#btn, .toggle-btn');
    if (btnEl) {
        const scope = getScope(btnEl);
        scope.classList.toggle('hide-zh');
        refreshBtn(btnEl);

        // 收起时清空该范围内的局部展开
        if (!scope.classList.contains('hide-zh')) {
            scope.querySelectorAll('.word_div > li').forEach(li => {
                li.querySelectorAll('.zh.show-zh').forEach(z => z.classList.remove('show-zh'));
                li.querySelectorAll('.note.show-note').forEach(n => n.classList.remove('show-note'));
            });
        }
        return;
    }

    // ========== B. 卡片 ==========
    const li = event.target.closest('.word_div > li');
    if (!li) return;

    // 卡片是否处于某个 hide-zh 范围内
    const scope = li.closest('.hide-zh');
    if (!scope) return;

    const ens = Array.from(li.querySelectorAll('.en'));
    const zhs = Array.from(li.querySelectorAll('.zh'));
    const onlyNoteCard = ens.length === 0 && zhs.length === 0;

    // 只有 note 的卡片 → 点它自己切换
    if (onlyNoteCard) {
        const noteEl = li.querySelector('.note');
        if (noteEl) noteEl.classList.toggle('show-note');
        return;
    }

    // 点最外层 note → 切换它自己
    const directNote = event.target.closest('.note');
    if (directNote && directNote.parentElement === li) {
        directNote.classList.toggle('show-note');
        return;
    }

    // 点 ZH → 显示它归属的 note
    const zhEl = event.target.closest('.zh');
    if (zhEl) {
        const targetNote = findOwnerNote(zhEl);
        if (targetNote) targetNote.classList.toggle('show-note');
        return;
    }

    // 点 EN → 切换对应的 zh
    const enEl = event.target.closest('.en');
    if (enEl) {
        const idx = ens.indexOf(enEl);
        if (idx >= 0 && zhs[idx]) {
            const thisZh = zhs[idx];
            const willHide = thisZh.classList.contains('show-zh');

            thisZh.classList.toggle('show-zh');

            if (willHide) {
                const ownerNote = findOwnerNote(thisZh);
                if (ownerNote) ownerNote.classList.remove('show-note');
            } else {
                // 刚显示：有 note 就加 has-note，没有就清掉
                const ownerNote = findOwnerNote(thisZh);
                if (ownerNote) {
                    thisZh.classList.add('has-note');
                } else {
                    thisZh.classList.remove('has-note');
                }
            }
        }
    }
});

console.log('[显示或隐藏] 脚本已加载');