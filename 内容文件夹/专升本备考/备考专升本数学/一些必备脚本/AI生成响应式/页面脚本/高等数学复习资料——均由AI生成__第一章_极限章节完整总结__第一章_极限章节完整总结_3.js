
    renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false}
      ],
      throwOnError: false,
      errorColor: '#cc0000',
      strict: false
    });

    const jumpToHash = () => {
      if (!location.hash) return;
      try {
        const target = document.getElementById(
          decodeURIComponent(location.hash.slice(1))
        );
        if (target) target.scrollIntoView({block: 'start'});
      } catch (error) {
        /* 忽略无效锚点 */
      }
    };
    requestAnimationFrame(() => requestAnimationFrame(jumpToHash));
    window.addEventListener('hashchange', jumpToHash);

    (() => {
      const bar = document.getElementById('progress-bar');
      const update = () => {
        const doc = document.documentElement;
        const total = doc.scrollHeight - doc.clientHeight;
        const ratio = total > 0 ? doc.scrollTop / total : 0;
        bar.style.width = (ratio * 100).toFixed(2) + '%';
      };
      document.addEventListener('scroll', update, {passive: true});
      update();
    })();
  