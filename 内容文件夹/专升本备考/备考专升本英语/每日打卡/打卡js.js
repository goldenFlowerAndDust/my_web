// ========== 1. 恢复已保存的状态 ==========
document.querySelectorAll('.check-cell').forEach(cell => {
    const key = 'checkin-' + cell.dataset.key;
    if (localStorage.getItem(key) === '1') {
        cell.textContent = '☑';
        cell.classList.add('done');
    }
});

// ========== 2. 点击切换并保存 ==========
document.addEventListener('click', function (e) {
    const cell = e.target.closest('.check-cell');
    if (!cell) return;

    const key = 'checkin-' + cell.dataset.key;
    const isDone = cell.classList.contains('done');

    if (isDone) {
        cell.textContent = '☐';
        cell.classList.remove('done');
        localStorage.removeItem(key);
    } else {
        cell.textContent = '☑';
        cell.classList.add('done');
        localStorage.setItem(key, '1');
    }
});