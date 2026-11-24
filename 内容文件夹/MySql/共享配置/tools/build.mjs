import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, "..", "..");
const CFG = JSON.parse(fs.readFileSync(path.join(ROOT, "共享配置", "配置.json"), "utf8"));
const OUT = path.join(ROOT, CFG.output || "html");
const SOURCE_ROOT = CFG.sourceRoot || ".";
const EXCLUDES = new Set(CFG.exclude || []);

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;");

const SQL_KEYWORDS = new Set(`
select from where group by having order limit offset insert into values update set delete
create table alter drop truncate database index view partition primary key foreign references
unique not null default auto_increment check constraint join inner left right full outer cross
on as and or in like between is exists union all distinct case when then else end asc desc
show use describe explain begin commit rollback transaction start grant revoke if
`.trim().split(/\s+/));

const SQL_FUNCTIONS = new Set(`
count sum avg min max round concat length substr substring trim upper lower now date year month day
coalesce ifnull nullif cast convert group_concat row_number over dense_rank rank lag lead
`.trim().split(/\s+/));

const highlightLine = (line, state) => {
  let out = "";
  let i = 0;
  while (i < line.length) {
    if (state.block) {
      const end = line.indexOf("*/", i);
      if (end < 0) {
        out += `<span class="sql-comment">${escapeHtml(line.slice(i))}</span>`;
        return out;
      }
      out += `<span class="sql-comment">${escapeHtml(line.slice(i, end + 2))}</span>`;
      i = end + 2;
      state.block = false;
      continue;
    }
    if (line.startsWith("/*", i)) {
      state.block = true;
      continue;
    }
    if (line.startsWith("--", i) || line[i] === "#") {
      out += `<span class="sql-comment">${escapeHtml(line.slice(i))}</span>`;
      return out;
    }
    const ch = line[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === "\\" && j + 1 < line.length) { j += 2; continue; }
        if (line[j] === ch) { j += 1; break; }
        j += 1;
      }
      out += `<span class="sql-string">${escapeHtml(line.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    if (/\d/.test(ch)) {
      const m = line.slice(i).match(/^\d+(?:\.\d+)?/);
      out += `<span class="sql-number">${escapeHtml(m[0])}</span>`;
      i += m[0].length;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      const m = line.slice(i).match(/^[A-Za-z_][A-Za-z0-9_$]*/);
      const word = m[0];
      const lower = word.toLowerCase();
      if (SQL_KEYWORDS.has(lower)) out += `<span class="sql-keyword">${escapeHtml(word)}</span>`;
      else if (SQL_FUNCTIONS.has(lower)) out += `<span class="sql-function">${escapeHtml(word)}</span>`;
      else out += `<span class="sql-ident">${escapeHtml(word)}</span>`;
      i += word.length;
      continue;
    }
    if (/[=<>!+\-*/%|&^~]/.test(ch)) {
      out += `<span class="sql-operator">${escapeHtml(ch)}</span>`;
      i += 1;
      continue;
    }
    out += escapeHtml(ch);
    i += 1;
  }
  return out;
};

const highlightSql = (sql) => {
  const state = { block: false };
  return sql.replace(/\r\n/g, "\n").split("\n").map((line, index) => (
    `<div class="sql-line"><span class="ln">${index + 1}</span><code>${highlightLine(line, state)}</code></div>`
  )).join("\n");
};

const walk = (dir, base = dir, list = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, list);
    else if (/\.sql$/i.test(entry.name)) list.push(path.relative(base, full));
  }
  return list;
};

const groupOf = (relative) => {
  const rel = relative.split(path.sep).join("/");
  if (rel.startsWith("笔记/学习笔记存放地/")) return { section: "笔记", group: "学习笔记" };
  if (rel.startsWith("笔记/回顾数据库/")) return { section: "笔记", group: "回顾数据库" };
  if (rel.startsWith("笔记/dudainfo/")) return { section: "笔记", group: "dudainfo" };
  if (rel.startsWith("查询/")) return { section: "查询练习", group: "查询练习" };
  return { section: "其他", group: "其他" };
};

const sectionRank = { 笔记: 0, 查询练习: 1, 其他: 2 };
const groupRank = { 学习笔记: 0, 回顾数据库: 1, dudainfo: 2, 查询练习: 0, 其他: 9 };
const noteOrder = new Map((CFG.noteOrder || []).map((name, index) => [name, index]));

const summarize = (sql) => {
  const lines = sql.replace(/\r\n/g, "\n").split("\n").map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("/*") || line.startsWith("*/") || line.startsWith("*")) continue;
    if (line.startsWith("--") || line.startsWith("#")) {
      const text = line.replace(/^--\s?|^#\s?/g, "").trim();
      if (text.length >= 4) return text.length > 110 ? text.slice(0, 110) + "…" : text;
    }
  }
  const first = lines.find((line) => !/^[#]/.test(line) && !line.startsWith("/*") && !line.startsWith("*/") && !line.startsWith("*")) || "";
  return first.length > 110 ? first.slice(0, 110) + "…" : first || "SQL 学习笔记";
};

const docs = walk(ROOT)
  .map((relative) => {
    const full = path.join(ROOT, relative);
    const sql = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
    const source = relative.split(path.sep).join("/");
    const { section, group } = groupOf(relative);
    const base = path.basename(relative, path.extname(relative));
    const stat = fs.statSync(full);
    return {
      slug: source.replace(/\.sql$/i, ""),
      source,
      section,
      group,
      title: base,
      summary: summarize(sql),
      lines: sql.replace(/\r\n/g, "\n").split("\n").length,
      chars: sql.replace(/\s/g, "").length,
      updated: stat.mtime.toISOString().slice(0, 10),
      raw: sql,
      id: crypto.createHash("sha1").update(source, "utf8").digest("hex").slice(0, 10),
    };
  })
  .sort((a, b) => {
    const sr = (sectionRank[a.section] ?? 9) - (sectionRank[b.section] ?? 9);
    if (sr) return sr;
    const gr = (groupRank[a.group] ?? 9) - (groupRank[b.group] ?? 9);
    if (gr) return gr;
    const na = noteOrder.get(path.basename(a.source, ".sql")) ?? 999;
    const nb = noteOrder.get(path.basename(b.source, ".sql")) ?? 999;
    if (na !== nb) return na - nb;
    return a.title.localeCompare(b.title, "zh-CN");
  });

docs.forEach((doc, index) => { doc.order = index; });

const nowText = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

const sourceComment = (source) => `<!-- source: ${source} -->\n<!-- source-root: MySql -->\n`;
const htmlHead = (title) => `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="../共享配置/css/mysql-notes.css?v=20261124-3">
<script>try{document.documentElement.dataset.theme=localStorage.getItem("programmingTutor.theme")||"dark"}catch(e){}</script>
</head>`;

const themeButton = `<button class="icon-btn" type="button" data-theme-toggle>亮色</button>`;
const themeScript = `<script>
(() => {
  const root = document.documentElement, KEY = "programmingTutor.theme";
  const apply = (theme) => {
    root.dataset.theme = theme === "light" ? "light" : "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => { b.textContent = root.dataset.theme === "dark" ? "亮色" : "暗色"; });
  };
  apply(localStorage.getItem(KEY) || root.dataset.theme || "dark");
  document.querySelectorAll("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem(KEY, next); apply(next);
  }));
})();
</script>`;

const renderDoc = (doc, prev, next) => `${sourceComment(doc.source)}${htmlHead(`${doc.title} · MySQL 笔记`)}
<body class="doc-page">
<script>if (location.search.includes("embed=1")) document.body.classList.add("is-embed");</script>
<nav class="topbar">
  <a class="topbar-back" href="index.html">← 目录</a>
  <span class="topbar-title">${escapeHtml(doc.title)}</span>
  <div class="topbar-actions">${themeButton}</div>
</nav>
<main class="doc-page">
  <header class="doc-head">
    <div>
      <span class="hero-kicker">${escapeHtml(doc.section)} · ${escapeHtml(doc.group)}</span>
      <h1>${escapeHtml(doc.title)}</h1>
      <div class="doc-meta">
        <span>来源：${escapeHtml(doc.source)}</span>
        <span>${doc.lines} 行</span>
        <span>更新 ${doc.updated}</span>
      </div>
    </div>
  </header>
  <section class="sql-card">
    <div class="sql-toolbar">
      <span class="sql-file">${escapeHtml(doc.source)}</span>
      <button class="copy-btn" type="button" id="copy-sql">复制 SQL</button>
    </div>
    <pre class="sql-code" id="sql-code">${highlightSql(doc.raw)}</pre>
    <textarea id="sql-raw" hidden>${escapeHtml(doc.raw)}</textarea>
  </section>
  <footer class="doc-foot">
    <span>${prev ? `<a href="doc-${prev.id}.html">← ${escapeHtml(prev.title)}</a>` : ""}</span>
    <span>${next ? `<a href="doc-${next.id}.html">${escapeHtml(next.title)} →</a>` : ""}</span>
  </footer>
</main>
${themeScript}
<script>
document.getElementById("copy-sql")?.addEventListener("click", async () => {
  const raw = document.getElementById("sql-raw").value;
  try { await navigator.clipboard.writeText(raw); document.getElementById("copy-sql").textContent = "已复制"; setTimeout(() => document.getElementById("copy-sql").textContent = "复制 SQL", 1300); }
  catch (e) { document.getElementById("copy-sql").textContent = "复制失败"; }
});
</script>
</body>
</html>`;

const renderIndex = (docs, generatedAt) => {
  const data = {
    sourceRoot: SOURCE_ROOT,
    generatedFrom: "共享配置/配置.json",
    name: CFG.name,
    generatedAt,
    docs: docs.map(({ raw, ...doc }) => doc),
  };
  const notes = docs.filter((doc) => doc.section === "笔记").length;
  const queries = docs.filter((doc) => doc.section === "查询练习").length;
  return `${sourceComment("共享配置/配置.json")}${htmlHead("MySQL 笔记归档")}
<body class="index-page">
<main class="index-shell">
  <header class="hero">
    <a class="hero-back" href="../../../自建本地网站/导航栏内容/博客/MySQL博客.html">← 返回 MySQL 主页</a>
    <span class="hero-kicker">MYSQL · NOTES ARCHIVE</span>
    <h1>MySQL 笔记归档</h1>
    <p>${escapeHtml(CFG.description)}</p>
    <div class="hero-stats">
      <div class="stat"><strong>${docs.length}</strong><span>篇 SQL</span></div>
      <div class="stat"><strong>${notes}</strong><span>笔记</span></div>
      <div class="stat"><strong>${queries}</strong><span>查询练习</span></div>
      <div class="stat"><strong>${generatedAt}</strong><span>最近构建</span></div>
    </div>
  </header>

  <div class="toolbar">
    <label class="search-box"><span>⌕</span><input id="q" type="search" placeholder="搜索标题、来源、注释…"><kbd>/</kbd></label>
    <div class="chips" id="chips"></div>
    ${themeButton}
  </div>
  <main id="groups"></main>
  <div class="empty" id="empty">没有匹配的 SQL 笔记。</div>
</main>
<script>window.MYSQL_INDEX = ${JSON.stringify(data)};</script>
<script src="data.js"></script>
<script>
(() => {
  const data = window.MYSQL_INDEX;
  const groups = document.getElementById("groups");
  const chips = document.getElementById("chips");
  const empty = document.getElementById("empty");
  const q = document.getElementById("q");
  let section = "全部";
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const sections = ["全部", ...new Set(data.docs.map((d) => d.section))];
  sections.forEach((name) => {
    const b = document.createElement("button");
    b.className = "chip"; b.textContent = name; b.dataset.section = name;
    b.addEventListener("click", () => { section = name; render(); });
    chips.appendChild(b);
  });
  const groupKey = (d) => d.section + " · " + d.group;
  const render = () => {
    [...chips.children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.section === section)));
    const query = q.value.trim().toLowerCase();
    const visible = data.docs.filter((d) => (section === "全部" || d.section === section) && (!query || [d.title,d.source,d.group,d.summary].join(" ").toLowerCase().includes(query)));
    groups.innerHTML = "";
    const map = new Map();
    visible.forEach((d) => { const k = groupKey(d); if (!map.has(k)) map.set(k, []); map.get(k).push(d); });
    map.forEach((list, key) => {
      const sec = document.createElement("section"); sec.className = "group";
      const head = document.createElement("div"); head.className = "group-head";
      head.innerHTML = '<h2>' + esc(key) + '</h2><span class="group-count">' + list.length + ' 篇</span><span class="group-line"></span>';
      const grid = document.createElement("div"); grid.className = "grid";
      list.forEach((d) => {
        const a = document.createElement("a"); a.className = "card"; a.href = "view.html#doc=" + encodeURIComponent(d.slug);
        a.innerHTML = '<span class="card-tag">' + esc(d.group) + '</span><h3>' + esc(d.title) + '</h3><p>' + esc(d.summary) + '</p><span class="card-meta"><span>' + esc(d.source) + '</span><span>' + d.lines + ' 行</span></span>';
        grid.appendChild(a);
      });
      sec.append(head, grid); groups.appendChild(sec);
    });
    empty.classList.toggle("is-visible", visible.length === 0);
  };
  q.addEventListener("input", render);
  document.addEventListener("keydown", (e) => { if (e.key === "/" && document.activeElement !== q) { e.preventDefault(); q.focus(); } });
  render();
})();
</script>
${themeScript}
</body>
</html>`;
};

const renderView = (docs, generatedAt) => {
  const data = {
    sourceRoot: SOURCE_ROOT,
    generatedFrom: "共享配置/配置.json",
    name: CFG.name,
    generatedAt,
    docs: docs.map(({ raw, ...doc }) => doc),
  };
  return `${sourceComment("共享配置/配置.json")}${htmlHead("阅读 · MySQL 笔记")}
<body class="view-page">
<nav class="topbar">
  <a class="topbar-back" href="index.html">← 目录</a>
  <span class="topbar-title" id="bar-title">MySQL 笔记</span>
  <div class="topbar-actions">${themeButton}</div>
</nav>
<div class="reader-shell">
  <aside class="side">
    <div class="side-head"><strong>SQL 笔记</strong><span id="side-count">${docs.length} 篇</span></div>
    <label class="search-box"><span>⌕</span><input id="q" type="search" placeholder="搜索笔记…"></label>
    <nav class="doc-list" id="doc-list"></nav>
  </aside>
  <div class="frame-wrap">
    <iframe id="doc-frame" title="SQL 笔记正文"></iframe>
  </div>
</div>
<script>window.MYSQL_INDEX = ${JSON.stringify(data)};</script>
<script src="data.js"></script>
<script>
(() => {
  const data = window.MYSQL_INDEX;
  const list = document.getElementById("doc-list");
  const q = document.getElementById("q");
  const frame = document.getElementById("doc-frame");
  const bar = document.getElementById("bar-title");
  const count = document.getElementById("side-count");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const bySlug = new Map(data.docs.map((d) => [d.slug, d]));
  const groupKey = (d) => d.section + (d.section === "笔记" ? " · " + d.group : "");
  const slugFromHash = () => { const h = location.hash; if (!h.startsWith("#doc=")) return ""; try { return decodeURIComponent(h.slice(5)); } catch (e) { return ""; } };
  const choose = (slug) => {
    const doc = bySlug.get(slug) || data.docs[0];
    if (!doc) return;
    frame.src = doc.file + "?embed=1";
    bar.textContent = doc.title;
    document.title = doc.title + " · MySQL 笔记";
    document.querySelectorAll(".doc-link").forEach((a) => a.classList.toggle("is-active", a.dataset.slug === doc.slug));
    if (location.hash !== "#doc=" + encodeURIComponent(doc.slug)) history.replaceState(null, "", "#doc=" + encodeURIComponent(doc.slug));
  };
  const render = () => {
    const query = q.value.trim().toLowerCase();
    const visible = data.docs.filter((d) => !query || [d.title,d.source,d.group,d.summary].join(" ").toLowerCase().includes(query));
    count.textContent = visible.length + " 篇";
    list.innerHTML = "";
    let last = "";
    visible.forEach((d) => {
      const key = groupKey(d);
      if (key !== last) { const h = document.createElement("div"); h.className = "doc-group"; h.textContent = key; list.appendChild(h); last = key; }
      const a = document.createElement("a"); a.className = "doc-link"; a.href = "#doc=" + encodeURIComponent(d.slug); a.dataset.slug = d.slug; a.textContent = d.title;
      a.addEventListener("click", (e) => { e.preventDefault(); choose(d.slug); });
      list.appendChild(a);
    });
    choose(slugFromHash());
  };
  q.addEventListener("input", render);
  window.addEventListener("hashchange", () => choose(slugFromHash()));
  render();
})();
</script>
${themeScript}
</body>
</html>`;
};

const generatedAt = nowText();
fs.mkdirSync(OUT, { recursive: true });
for (const name of fs.readdirSync(OUT)) {
  if (/^(?:data\.js|data\.json|index\.html|view\.html|doc-[a-f0-9]+\.html)$/i.test(name)) fs.unlinkSync(path.join(OUT, name));
}

const pages = docs.map((doc) => ({ ...doc, file: `doc-${doc.id}.html` }));
pages.forEach((doc, index) => {
  fs.writeFileSync(path.join(OUT, `doc-${doc.id}.html`), renderDoc(doc, pages[index - 1], pages[index + 1]), "utf8");
});
const indexData = {
  sourceRoot: SOURCE_ROOT,
  generatedFrom: "共享配置/配置.json",
  name: CFG.name,
  generatedAt,
  docs: pages.map(({ raw, ...doc }) => doc),
};
fs.writeFileSync(path.join(OUT, "data.json"), JSON.stringify(indexData, null, 2), "utf8");
fs.writeFileSync(path.join(OUT, "data.js"), "// source: 共享配置/配置.json\n// source-root: MySql\nwindow.MYSQL_INDEX = " + JSON.stringify(indexData) + ";\n", "utf8");
fs.writeFileSync(path.join(OUT, "index.html"), renderIndex(pages, generatedAt), "utf8");
fs.writeFileSync(path.join(OUT, "view.html"), renderView(pages, generatedAt), "utf8");

console.log(JSON.stringify({
  ok: true,
  sql: pages.length,
  notes: pages.filter((d) => d.section === "笔记").length,
  queries: pages.filter((d) => d.section === "查询练习").length,
  output: path.relative(ROOT, OUT),
  first: pages[0]?.source,
}, null, 2));
