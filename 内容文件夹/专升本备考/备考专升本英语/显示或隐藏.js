// ================= 0. 确保主按钮存在且挂在 body 下 =================
function ensureMainButton() {
    // 找 body 直接子级的按钮
    let mainBtn = Array.from(document.body.children).find(
        el => el.matches && el.matches('#btn, .toggle-btn')
    );

    if (mainBtn) return;

    // 页面里有没有非注入的按钮？
    const anyBtn = Array.from(document.querySelectorAll('#btn, .toggle-btn'))
        .find(b => !b.closest('[id^="container"]'));

    if (anyBtn) {
        document.body.appendChild(anyBtn);
        return;
    }

    // 完全没有 → 创建一个
    const b = document.createElement('button');
    b.className = 'toggle-btn';
    b.textContent = '隐藏中文 (开始测试)';
    document.body.appendChild(b);
}

ensureMainButton();

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
// 优先级：data-target > 注入容器 > 最近的 word_div 祖先 > main > body
function getScope(btn) {
    // 1. data-target：值是 id（不带 #）
    const targetId = btn.dataset.target;
    if (targetId) {
        const el = document.getElementById(targetId);
        if (el) return el;
    }

    // 2. 按钮在注入容器里 → 用容器作范围
    const container = btn.closest('[id^="container"]');
    if (container) return container;

    // 3. 往上找最近的、包含 .word_div 的祖先（不含 body）
    let p = btn.parentElement;
    while (p && p !== document.body) {
        if (p.querySelector && p.querySelector('.word_div')) {
            return p;
        }
        p = p.parentElement;
    }

    // 4. 主按钮 → 用 main
    const main = btn.closest('main');
    if (main) return main;

    return document.body;
}

function refreshBtn(btn) {
    const scope = getScope(btn);
    if (!scope) return;
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
        if (!scope) return;
        scope.classList.toggle('hide-zh');
        refreshBtn(btnEl);

        // 收起时清空该范围内所有局部展开
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

// ================= 3. 默认隐藏 =================
(function defaultHide() {
    const mainBtn = Array.from(document.body.children).find(
        el => el.matches && el.matches('#btn, .toggle-btn')
    );
    if (!mainBtn) return;
    const scope = getScope(mainBtn);
    if (!scope) return;
    scope.classList.add('hide-zh');
    refreshBtn(mainBtn);
})();

console.log('[显示或隐藏] 脚本已加载');