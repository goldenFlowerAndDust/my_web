window.addEventListener('load', function () {
        if (typeof renderMathInElement !== 'function') {
            console.error('❌ auto-render.min.js 未加载，公式无法渲染。请确认 ./数学公式js/libs/auto-render.min.js 存在。');
            return;
        }
        renderMathInElement(document.body, {
            delimiters: [
                { left: '$$', right: '$$', display: true  },
                { left: '$',  right: '$',  display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true  }
            ],
            throwOnError: false,
            ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
        });
    });