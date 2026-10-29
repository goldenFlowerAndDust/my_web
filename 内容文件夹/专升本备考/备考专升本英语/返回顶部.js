/* 返回顶部：所有页面共用；滚动超过 420px 后出现 */
(function () {
    'use strict';

    if (document.getElementById('backTop')) return;

    var style = document.createElement('style');
    style.textContent = [
        '.back-top {',
        '  position: fixed;',
        '  right: 18px;',
        '  bottom: 18px;',
        '  z-index: 9999;',
        '  display: inline-flex;',
        '  align-items: center;',
        '  justify-content: center;',
        '  gap: 0.25rem;',
        '  width: auto;',
        '  height: auto;',
        '  min-height: 2.3rem;',
        '  padding: 0.45rem 0.8rem;',
        '  border: 1px solid rgba(255, 255, 255, 0.18);',
        '  border-radius: 999px;',
        '  background: #5D6D7E;',
        '  color: #FFFFFF;',
        '  box-shadow: 0 8px 22px rgba(44, 62, 80, 0.26);',
        '  font-family: inherit;',
        '  font-size: 0.78rem;',
        '  font-weight: 700;',
        '  line-height: 1;',
        '  cursor: pointer;',
        '  opacity: 0;',
        '  visibility: hidden;',
        '  transform: translateY(8px);',
        '  pointer-events: none;',
        '  transition: opacity 0.18s ease, transform 0.18s ease, background 0.18s ease;',
        '}',
        '.back-top.is-show {',
        '  opacity: 1;',
        '  visibility: visible;',
        '  transform: translateY(0);',
        '  pointer-events: auto;',
        '}',
        '.back-top:hover { background: #B7950B; color: #FFFFFF; }',
        '@media (max-width: 600px) {',
        '  .back-top { right: 12px; bottom: 12px; min-height: 2.1rem; padding: 0.4rem 0.65rem; font-size: 0.72rem; }',
        '}',
        '@media print { .back-top { display: none !important; } }',
        '@media (prefers-reduced-motion: reduce) { .back-top { transition: none; } }'
    ].join('\n');
    document.head.appendChild(style);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'backTop';
    btn.className = 'back-top';
    btn.setAttribute('aria-label', '返回页面顶部');
    btn.setAttribute('title', '返回顶部');
    btn.innerHTML = '↑ <span>顶部</span>';
    document.body.appendChild(btn);

    function update() {
        btn.classList.toggle('is-show', window.scrollY > 420);
    }

    btn.addEventListener('click', function () {
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    window.addEventListener('scroll', update, { passive: true });
    update();
})();
