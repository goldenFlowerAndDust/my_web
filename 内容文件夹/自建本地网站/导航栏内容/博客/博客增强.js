(() => {
  "use strict";

  const INTRO = {
    "python博客.html": "Python 课程笔记索引。按“启航 → 核心语法 → 面向对象”的顺序整理，每一节都保留原笔记入口。",
    "JavaScript博客.html": "JavaScript 学习索引。按基础、DOM、事件、异步和进阶主题归档，适合从浏览器脚本一路查到工程实践。",
    "HTML博客.html": "HTML 标签与页面结构笔记。按课程顺序整理，从基础骨架到表单、语义化和页面结构。",
    "CSS博客.html": "CSS 样式与布局笔记。包含选择器、盒模型、字体、背景、Flex、Grid 和响应式相关章节。"
  };

  function clean(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function init() {
    if (document.body.dataset.enhanced === "1") return;
    const body = document.body;
    const header = body.querySelector(":scope > header");
    const list = body.querySelector(":scope > ol");
    if (!header || !list) return;
    body.dataset.enhanced = "1";

    const fileName = location.pathname.split("/").pop() || "";
    const intro = document.createElement("p");
    intro.className = "blog-intro";
    intro.textContent = INTRO[fileName] || "按主题整理的课程笔记索引，点击章节进入原笔记。";
    header.insertAdjacentElement("afterend", intro);

    const layout = document.createElement("div");
    layout.className = "blog-layout";

    const aside = document.createElement("aside");
    aside.className = "blog-toc";
    aside.innerHTML = '<div class="blog-toc-card"><div class="blog-toc-head"><span>目录</span><b class="toc-count">0</b></div>' +
      '<label class="blog-search"><span>⌕</span><input type="search" placeholder="搜索章节或链接…" aria-label="搜索博客内容"></label>' +
      '<nav class="toc-links" aria-label="博客目录"></nav></div>';

    const content = document.createElement("div");
    content.className = "blog-content";

    const sections = Array.from(list.children).filter((node) => node.tagName === "LI");
    const tocLinks = aside.querySelector(".toc-links");
    const tocCount = aside.querySelector(".toc-count");
    tocCount.textContent = String(sections.length);

    sections.forEach((li, index) => {
      if (!li.id) li.id = "blog-section-" + (index + 1);
      li.classList.add("blog-section");
      const heading = li.querySelector("h2, h3");
      const firstLink = li.querySelector("a");
      let label = clean(heading ? heading.textContent : (firstLink ? firstLink.textContent : ""));
      if (!label || label === "基础") label = "第 " + (index + 1) + " 节";
      const a = document.createElement("a");
      a.href = "#" + li.id;
      a.textContent = label;
      a.title = label;
      tocLinks.appendChild(a);
    });

    const search = aside.querySelector("input[type=search]");
    const empty = document.createElement("p");
    empty.className = "toc-empty";
    empty.textContent = "没有匹配的章节。";
    empty.hidden = true;
    tocLinks.appendChild(empty);

    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      sections.forEach((li) => {
        const match = !query || li.textContent.toLowerCase().includes(query);
        li.hidden = !match;
        if (match) visible += 1;
      });
      tocCount.textContent = String(visible);
      empty.hidden = visible !== 0;
    });

    body.insertBefore(layout, list);
    content.appendChild(list);
    layout.appendChild(aside);
    layout.appendChild(content);

    const top = document.createElement("a");
    top.className = "blog-backtop";
    top.href = "#";
    top.textContent = "↑ 顶部";
    body.appendChild(top);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
