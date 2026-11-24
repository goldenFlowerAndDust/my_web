/* ==========================================================================
   Node.js · 笔记归档构建
   用法：node 共享配置/tools/build.mjs   （或双击 构建笔记.bat）
   作用：扫描 node.js 下全部 .md → 生成 html/ 目录、逐篇 HTML、index.html 与 view.html
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");

/* 静态资源版本号：取共享样式/脚本的最新修改时间。
   链接带 ?v=<版本> 后，改完 css/js 刷新即可生效，不会被浏览器旧缓存顶掉。 */
const SHARED_DIR = path.join(ROOT, "共享配置");
const CFG = JSON.parse(fs.readFileSync(path.join(SHARED_DIR, "配置.json"), "utf8"));
const OUTPUT_DIR = path.join(ROOT, CFG.output || "html");
const ASSET_VERSION = (() => {
  const files = [
    path.join(SHARED_DIR, "css", "notes.css"),
    path.join(SHARED_DIR, "js", "index.js"),
    path.join(SHARED_DIR, "js", "reader.js"),
  ];
  let latest = 0;
  for (const file of files) {
    try {
      latest = Math.max(latest, fs.statSync(file).mtimeMs);
    } catch {
      /* 文件缺失时忽略 */
    }
  }
  return String(Math.floor(latest));
})();

const SUBJECTS = [
  {
    dir: ".",
    name: CFG.name || "Node.js",
    kicker: "NODE.JS · NOTES",
    home: CFG.home,
    description: CFG.description,
  },
];

const CATEGORY_ORDER = ["模块总览", "课堂", "作业", "课件", "其他", "未分类"];

/* 中文节次/次数转数字：第二 → 2，第十一 → 11。 */
const CN_DIGIT = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
const cnNumber = (text) => {
  const s = String(text || "");
  if (s === "十") return 10;
  const at = s.indexOf("十");
  if (at < 0) return CN_DIGIT[s] ?? 99;
  const left = at === 0 ? 1 : (CN_DIGIT[s.slice(0, at)] ?? 0);
  const right = at === s.length - 1 ? 0 : (CN_DIGIT[s.slice(at + 1)] ?? 0);
  return left * 10 + right;
};
const naturalLessonRank = (doc) => {
  const m = String(doc.slug || "").match(/第([零一二两三四五六七八九十]+)[节课次]/);
  return m ? cnNumber(m[1]) : 999;
};

/* --------------------------------------------------------------------------
   1. Markdown → HTML
   -------------------------------------------------------------------------- */

const escapeHtml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]/;

const inline = (text) => {
  const codes = [];
  let s = text.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(escapeHtml(code));
    return "\u0000" + (codes.length - 1) + "\u0000";
  });

  /* 行内公式先抽出来，避免被转义或误伤成斜体 */
  const maths = [];
  s = s.replace(/\$([^$\n]+)\$/g, (_, inner) => {
    maths.push("$" + inner + "$");
    return "\u0001" + (maths.length - 1) + "\u0001";
  });

  s = escapeHtml(s);

  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${src}" alt="${alt}" loading="lazy">`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => `<a href="${href}" target="_blank" rel="noopener">${label}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");

  s = s.replace(/\u0000(\d+)\u0000/g, (_, index) => `<code>${codes[Number(index)]}</code>`);
  return s.replace(/\u0001(\d+)\u0001/g, (_, index) => maths[Number(index)]);
};

const stripInline = (text) =>
  text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .trim();

const joinLines = (parts) => {
  let out = "";
  for (const part of parts) {
    if (!part) continue;
    if (!out) {
      out = part;
      continue;
    }
    const last = out.slice(-1);
    const first = part.slice(0, 1);
    /* 中文之间不插空格；涉及公式 $ 时补一个空格，避免“例如lim”糊在一起 */
    const addSpace = CJK.test(last) || CJK.test(first) ? first === "$" || last === "$" : true;
    out += addSpace ? " " + part : part;
  }
  return out;
};

const LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

const parseList = (lines) => {
  const items = [];
  for (const raw of lines) {
    const match = LIST_RE.exec(raw);
    if (!match) {
      if (items.length) items[items.length - 1].text += " " + raw.trim();
      continue;
    }
    const indent = match[1].replace(/\t/g, "  ").length;
    items.push({
      level: Math.max(0, Math.floor(indent / 2)),
      ordered: /\d/.test(match[2]),
      text: match[3].trim(),
    });
  }

  const root = { children: [] };
  const stack = [{ level: -1, container: root }];

  for (const item of items) {
    while (stack.length > 1 && stack[stack.length - 1].level >= item.level) stack.pop();
    const parent = stack[stack.length - 1];

    let list = parent.container.children[parent.container.children.length - 1];
    if (!list || list.type !== "list" || list.ordered !== item.ordered) {
      list = { type: "list", ordered: item.ordered, children: [] };
      parent.container.children.push(list);
    }

    const node = { type: "item", children: [], text: item.text };
    list.children.push(node);
    stack.push({ level: item.level, container: node });
  }

  const renderNode = (node) => {
    if (node.type === "list") {
      const tag = node.ordered ? "ol" : "ul";
      const inner = node.children.map(renderNode).join("");
      return `<${tag}>${inner}</${tag}>`;
    }
    const nested = node.children.map(renderNode).join("");
    return `<li>${inline(node.text)}${nested}</li>`;
  };

  return root.children.map(renderNode).join("");
};

/* --------------------------------------------------------------------------
   公式规范化：把各种非常规写法统一成 KaTeX 能直接渲染的形式
   （假乘方符号、全角标点、Unicode 运算符、\(...\) 定界符、单行 $$ 块等）
   -------------------------------------------------------------------------- */
const MATH_CHAR_ALIASES = {
  "＾": "^", "︿": "^", "ˆ": "^", "⌃": "^", "˄": "^", "ᵔ": "^",
  "∧": "^", "⋀": "^", "⋏": "^", "Λ": "^", "＿": "_",
  "′": "'", "″": "''",
  "—": "-", "–": "-", "−": "-", "－": "-",
  "×": "\\times ", "÷": "\\div ", "·": "\\cdot ", "±": "\\pm ",
  "≤": "\\le ", "≥": "\\ge ", "≠": "\\ne ", "≈": "\\approx ",
  "∞": "\\infty ", "→": "\\to ", "⇒": "\\Rightarrow ",
  "∫": "\\int ", "∑": "\\sum ", "√": "\\sqrt ",
  "１": "1", "２": "2", "３": "3", "４": "4", "５": "5",
  "６": "6", "７": "7", "８": "8", "９": "9", "０": "0",
  "＋": "+", "＝": "=", "／": "/",
};

const MATH_EDGE_PUNCT = "：，；！？。、（）";

const normalizeMathBody = (body) => {
  let s = String(body || "");
  // \text{…} 里的中文原样保留
  const parts = s.split(/(\\text\{[^}]*\})/);
  for (let i = 0; i < parts.length; i += 2) {
    let seg = parts[i];
    for (const [bad, good] of Object.entries(MATH_CHAR_ALIASES)) {
      if (seg.includes(bad)) seg = seg.split(bad).join(good);
    }
    // ^' 不是合法 TeX
    seg = seg.replace(/\^('+)/g, (_, p) => "^{" + "\\prime".repeat(p.length) + "}");
    // 裸中文包进 \text{}
    seg = seg.replace(/[\u4e00-\u9fff]+/g, (m) => "\\text{" + m + "}");
    parts[i] = seg;
  }
  s = parts.join("");
  return s
    .replace(/：/g, ":").replace(/，/g, ", ").replace(/；/g, "; ")
    .replace(/！/g, "!").replace(/？/g, "?").replace(/。/g, ".");
};

const normalizeMathInMarkdown = (markdown) => {
  let text = String(markdown || "").replace(/\r\n?/g, "\n");

  // 1) \[ \] / \( \) → $$ / $（用函数替换，避免 $ 在替换串里有特殊含义）
  text = text.replace(/(?<!\\)\\\[/g, () => "$$").replace(/(?<!\\)\\\]/g, () => "$$");
  text = text.replace(/(?<!\\)\\\(/g, () => "$").replace(/(?<!\\)\\\)/g, () => "$");

  // 2) 先把块级 $$…$$ 整段抽出，用占位符保护，避免和行内公式互相干扰
  const blocks = [];
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, body) => {
    const inner = normalizeMathBody(body.trim());
    if (!inner) return "";
    blocks.push(inner);
    return "\u0000B" + (blocks.length - 1) + "\u0000";
  });

  // 3) 行内 $…$：首尾全角标点移到公式外，内部规范化
  text = text.replace(/(?<!\\)\$(?!\$)([^$\n]+?)(?<!\\)\$(?!\$)/g, (_, body) => {
    let inner = String(body || "");
    let lead = "";
    let trail = "";
    while (inner && MATH_EDGE_PUNCT.includes(inner[0])) {
      lead += inner[0];
      inner = inner.slice(1);
    }
    while (inner && MATH_EDGE_PUNCT.includes(inner[inner.length - 1])) {
      trail = inner[inner.length - 1] + trail;
      inner = inner.slice(0, -1);
    }
    inner = inner.trim();
    if (!inner) return lead + trail;
    return lead + "$" + normalizeMathBody(inner) + "$" + trail;
  });

  // 4) 兜底：某行行内 $ 落单就整行转义（此时文本里已无 $$）
  text = text
    .split("\n")
    .map((line) => {
      const singles = line.match(/(?<!\\)\$(?!\$)/g) || [];
      return singles.length % 2 === 1 ? line.replace(/(?<!\\)\$(?!\$)/g, () => "\\$") : line;
    })
    .join("\n");

  // 5) 还原块级公式：统一成独占三行的写法
  return text.replace(/\u0000B(\d+)\u0000/g, (_, index) => "\n$$\n" + blocks[Number(index)] + "\n$$\n");
};

const renderMarkdown = (markdown) => {
  const lines = normalizeMathInMarkdown(markdown).split("\n");
  const html = [];
  const toc = [];
  let title = "";
  let headingIndex = 0;
  let i = 0;

  const isTableStart = (index) =>
    lines[index].includes("|") &&
    index + 1 < lines.length &&
    /^\s*\|?\s*:?-{2,}[-\s|:]*$/.test(lines[index + 1] || "");

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) {
      i += 1;
      continue;
    }

    /* 代码块 */
    const fence = /^```\s*([\w-]*)\s*$/.exec(line);
    if (fence) {
      const lang = fence[1];
      const buffer = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buffer.push(lines[i]);
        i += 1;
      }
      i += 1;
      const cls = lang ? ` class="language-${lang}"` : "";
      html.push(`<pre><code${cls}>${escapeHtml(buffer.join("\n"))}</code></pre>`);
      continue;
    }

    /* 标题 */
    const heading = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const plain = stripInline(text);

      if (level === 1 && !title) {
        title = plain;
        i += 1;
        continue;
      }

      /* 跳过文内自带的「目录」清单：阅读页左侧已有导航，避免重复 */
      if (level === 2 && /^目\s*录$/.test(plain)) {
        i += 1;
        while (i < lines.length && !/^##\s/.test(lines[i])) i += 1;
        continue;
      }

      if (level === 2 || level === 3) {
        headingIndex += 1;
        const id = `sec-${headingIndex}`;
        toc.push({ id, text: plain, level });
        html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      } else {
        html.push(`<h${level}>${inline(text)}</h${level}>`);
      }
      i += 1;
      continue;
    }

    /* 分隔线 */
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      html.push("<hr>");
      i += 1;
      continue;
    }

    /* 独立公式 $$ ... $$：整块原样保留，交给 KaTeX */
    if (/^\s*\$\$/.test(line)) {
      const buffer = [lines[i].trim()];
      i += 1;
      while (i < lines.length) {
        const isClose = /^\s*\$\$/.test(lines[i]);
        buffer.push(lines[i]);
        i += 1;
        if (isClose) break;
      }
      html.push(`<div class="math-display">\n${buffer.join("\n")}\n</div>`);
      continue;
    }

    /* 引用块 */
    if (/^\s*>/.test(line)) {
      const buffer = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buffer.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      const inner = renderMarkdown(buffer.join("\n")).html;
      html.push(`<blockquote>${inner}</blockquote>`);
      continue;
    }

    /* 表格 */
    if (isTableStart(i)) {
      const readRow = (row) =>
        row
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((cell) => cell.trim());

      const head = readRow(lines[i]);
      i += 2;
      const body = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim()) {
        body.push(readRow(lines[i]));
        i += 1;
      }

      const thead = head.map((cell) => `<th>${inline(cell)}</th>`).join("");
      const tbody = body
        .map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`)
        .join("");
      html.push(`<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`);
      continue;
    }

    /* 列表 */
    if (LIST_RE.test(line)) {
      const buffer = [];
      while (i < lines.length && (LIST_RE.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && lines[i].trim()))) {
        buffer.push(lines[i]);
        i += 1;
      }
      html.push(parseList(buffer));
      continue;
    }

    /* 段落 */
    const buffer = [];
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^#{1,6}\s/.test(lines[i]) &&
      !/^\s*>/.test(lines[i]) &&
      !/^```/.test(lines[i]) &&
      !/^\s*\$\$/.test(lines[i]) &&
      !LIST_RE.test(lines[i]) &&
      !/^\s*([-*_])(\s*\1){2,}\s*$/.test(lines[i])
    ) {
      buffer.push(lines[i]);
      i += 1;
    }
    html.push(`<p>${inline(joinLines(buffer))}</p>`);
  }

  return { html: html.join("\n"), toc, title };
};

/* --------------------------------------------------------------------------
   2. 扫描文件
   -------------------------------------------------------------------------- */

const EXCLUDES = new Set((CFG.exclude || []).map((name) => String(name)));
const walk = (dir, base = dir, list = []) => {
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDES.has(entry.name)) continue;
      walk(full, base, list);
    } else if (/\.(md|sql)$/i.test(entry.name) && !EXCLUDES.has(entry.name)) {
      list.push(path.relative(base, full));
    }
  }
  return list;
};

const categoryRank = (name) => {
  const index = CATEGORY_ORDER.indexOf(name);
  return index === -1 ? CATEGORY_ORDER.length : index;
};

const summarize = (markdown) => {
  const lines = markdown.split(/\r?\n/);
  for (const line of lines) {
    const text = line.trim();
    if (!text) continue;
    if (/^#/.test(text)) continue;
    if (/^[-*+]\s/.test(text)) continue;
    if (/^\d+[.)]\s/.test(text)) continue;
    if (/^```/.test(text)) continue;
    const cleaned = stripInline(text.replace(/^>\s?/, ""));
    if (cleaned.length < 6) continue;
    return cleaned.length > 96 ? cleaned.slice(0, 96) + "…" : cleaned;
  }
  return "";
};

/* 生成的 HTML 都放在 node.js/html/ 根下；把 Markdown 里相对源文件的
   图片/附件路径重写成“从 html 目录到源目录”的相对路径。 */
const rebaseHtml = (html, sourceDir) => html.replace(/\b(src|href)="([^"]+)"/g, (whole, attr, url) => {
  if (!url || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/)/i.test(url)) return whole;
  const hashAt = url.indexOf("#");
  const suffix = hashAt >= 0 ? url.slice(hashAt) : "";
  const clean = hashAt >= 0 ? url.slice(0, hashAt) : url;
  let relative;
  try {
    relative = path.relative(OUTPUT_DIR, path.resolve(sourceDir, clean)).split(path.sep).join("/");
  } catch {
    return whole;
  }
  return `${attr}="${relative}${suffix}"`;
});

/* 代码块里的注释单独上色：不改原文，只在渲染后的 code 内包一层 span。 */
const highlightCodeComments = (html) => html.replace(/(<pre><code\b[^>]*>)([\s\S]*?)(<\/code><\/pre>)/g, (whole, open, body, close) => {
  const lines = body.split("\n").map((line) => {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("*") || trimmed.startsWith("*/")) {
      const at = line.indexOf(trimmed);
      return line.slice(0, at) + `<span class="code-comment">${line.slice(at)}</span>`;
    }
    const blockAt = line.indexOf("/*");
    if (blockAt >= 0) {
      const end = line.indexOf("*/", blockAt + 2);
      if (end >= 0) {
        return line.slice(0, blockAt)
          + `<span class="code-comment">${line.slice(blockAt, end + 2)}</span>`
          + line.slice(end + 2);
      }
      return line.slice(0, blockAt) + `<span class="code-comment">${line.slice(blockAt)}</span>`;
    }
    let cut = -1;
    for (let i = 0; i < line.length - 1; i += 1) {
      if (line[i] === ":" && line[i + 1] === "/") continue;
      if (line[i] === "/" && line[i + 1] === "/") { cut = i; break; }
    }
    if (cut < 0) return line;
    return line.slice(0, cut) + `<span class="code-comment">${line.slice(cut)}</span>`;
  });
  return open + lines.join("\n") + close;
});

const SQL_KEYWORDS = new Set("select from where group by having order limit offset insert into values update set delete create table alter drop truncate database index view partition primary key foreign references unique not null default auto_increment check constraint join inner left right full outer cross on as and or in like between is exists union all distinct case when then else end asc desc show use describe explain begin commit rollback transaction start grant revoke if".split(/\s+/));
const SQL_FUNCTIONS = new Set("count sum avg min max round concat length substr substring trim upper lower now date year month day coalesce ifnull nullif cast convert group_concat row_number over dense_rank rank lag lead".split(/\s+/));
const escapeSql = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const sqlLine = (line, state) => {
  let out = "";
  let i = 0;
  while (i < line.length) {
    if (state.block) {
      const end = line.indexOf("*/", i);
      if (end < 0) return out + `<span class="sql-comment">${escapeSql(line.slice(i))}</span>`;
      out += `<span class="sql-comment">${escapeSql(line.slice(i, end + 2))}</span>`;
      i = end + 2; state.block = false; continue;
    }
    if (line.startsWith("/*", i)) { state.block = true; continue; }
    if (line.startsWith("--", i) || line[i] === "#") return out + `<span class="sql-comment">${escapeSql(line.slice(i))}</span>`;
    const ch = line[i];
    if (ch === "'" || ch === '"' || ch === "`") {
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === "\\" && j + 1 < line.length) { j += 2; continue; }
        if (line[j] === ch) { j += 1; break; }
        j += 1;
      }
      out += `<span class="sql-string">${escapeSql(line.slice(i, j))}</span>`; i = j; continue;
    }
    if (/\d/.test(ch)) {
      const m = line.slice(i).match(/^\d+(?:\.\d+)?/);
      out += `<span class="sql-number">${escapeSql(m[0])}</span>`; i += m[0].length; continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      const m = line.slice(i).match(/^[A-Za-z_][A-Za-z0-9_$]*/);
      const word = m[0], lower = word.toLowerCase();
      if (SQL_KEYWORDS.has(lower)) out += `<span class="sql-keyword">${escapeSql(word)}</span>`;
      else if (SQL_FUNCTIONS.has(lower)) out += `<span class="sql-function">${escapeSql(word)}</span>`;
      else out += `<span class="sql-ident">${escapeSql(word)}</span>`;
      i += word.length; continue;
    }
    if (/[=<>!+\-*/%|&^~]/.test(ch)) { out += `<span class="sql-operator">${escapeSql(ch)}</span>`; i += 1; continue; }
    out += escapeSql(ch); i += 1;
  }
  return out;
};
const renderSql = (sql) => {
  const state = { block: false };
  return `<pre class="node-sql"><code>${sql.replace(/\r\n/g, "\n").split("\n").map((line) => sqlLine(line, state)).join("\n")}</code></pre>`;
};
const sqlSummary = (sql) => {
  const lines = sql.replace(/\r\n/g, "\n").split("\n").map((x) => x.trim()).filter(Boolean);
  for (const line of lines) {
    if (line.startsWith("--") || line.startsWith("#")) {
      const text = line.replace(/^--\s?|^#\s?/g, "").trim();
      if (text.length >= 4) return text.length > 96 ? text.slice(0, 96) + "…" : text;
    }
  }
  return lines.find((line) => !line.startsWith("/*") && !line.startsWith("*") && !line.startsWith("*/")) || "SQL 文件";
};

const collectSubject = (subject) => {
  const dir = path.join(ROOT, subject.dir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const docs = walk(dir).map((relative) => {
    const full = path.join(dir, relative);
    const rawText = fs.readFileSync(full, "utf8");
    const isSql = /\.sql$/i.test(relative);
    const parts = relative.split(path.sep);
    const category = (parts.length > 1 ? parts[0] : "未分类") + (isSql ? " · SQL" : "");
    const slug = relative.replace(/\\/g, "/").replace(/\.(md|sql)$/i, "");
    const stat = fs.statSync(full);
    const rendered = isSql
      ? { html: renderSql(rawText), toc: [], title: path.basename(relative, ".sql"), summary: sqlSummary(rawText) }
      : (() => { const r = renderMarkdown(rawText); return { ...r, summary: summarize(rawText) }; })();

    return {
      slug,
      source: relative.split(path.sep).join("/"),
      title: rendered.title || path.basename(relative, path.extname(relative)),
      category,
      summary: rendered.summary,
      html: isSql ? rendered.html : rebaseHtml(highlightCodeComments(rendered.html), path.dirname(full)),
      toc: rendered.toc,
      chars: rawText.replace(/\s/g, "").length,
      updated: stat.mtime.toISOString().slice(0, 10),
      kind: isSql ? "SQL" : "笔记",
      order: 0,
    };
  });

  docs.sort((a, b) => {
    // 总览永远第一页；否则课堂会按标题字典序把“第八节课”排到最前。
    if (a.slug === "README-板块总览" || b.slug === "README-板块总览") {
      return a.slug === "README-板块总览" ? -1 : 1;
    }
    const rank = categoryRank(a.category) - categoryRank(b.category);
    if (rank !== 0) return rank;
    if (a.category !== b.category) return a.category.localeCompare(b.category, "zh-CN");
    const na = naturalLessonRank(a);
    const nb = naturalLessonRank(b);
    if (na !== nb) return na - nb;
    return a.title.localeCompare(b.title, "zh-CN");
  });

  docs.forEach((doc, index) => {
    doc.order = index;
  });

  return docs;
};

/* --------------------------------------------------------------------------
   3. 页面模板
   -------------------------------------------------------------------------- */

const now = () => {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const head = (title, extra = "") => `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light" data-size="m">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#425fe8">
<title>${title}</title>
<link rel="stylesheet" href="../共享配置/vendor/katex/katex.min.css?v=${ASSET_VERSION}">
<link rel="stylesheet" href="../共享配置/css/notes.css?v=${ASSET_VERSION}">
${extra}</head>`;

const buildIndex = (subject, docs, generatedAt) => `${head(`${subject.name} · DSH 笔记`)}
<body class="index-page">
<div class="index-shell">
  <header class="hero">
    <a class="hero-back" href="${subject.home}">← 返回${subject.name}主页</a>
    <span class="hero-kicker">${subject.kicker}</span>
    <h1 id="hero-title">${subject.name}</h1>
    <p id="hero-desc">${subject.description}</p>
    <div class="hero-stats" id="hero-stats">
      <div class="stat"><strong>${docs.length}</strong><span>篇笔记</span></div>
      <div class="stat"><strong>${generatedAt}</strong><span>最近构建</span></div>
    </div>
  </header>

  <section class="toolbar" aria-label="搜索与筛选">
    <label class="search-box" for="q">
      <span aria-hidden="true">⌕</span>
      <input id="q" type="search" autocomplete="off" placeholder="搜索标题、摘要、分类…" aria-label="搜索笔记">
      <kbd>/</kbd>
    </label>
    <div class="chips" id="chips" role="group" aria-label="按分类筛选"></div>
    <button class="icon-btn" id="theme" type="button" aria-label="切换深色模式">☾</button>
  </section>

  <main id="groups"></main>

  <div class="empty" id="empty">
    <strong>没有找到匹配内容</strong>
    <span>换个关键词，或点“全部”清除分类筛选。</span>
  </div>
</div>

<button class="back-top" type="button" aria-label="返回顶部">↑</button>
<footer class="page-footer">
  <span>Node.js · ${subject.name}</span>
  <span>生成于 ${generatedAt}</span>
</footer>

<script src="./data.js"></script>
<script src="../共享配置/js/index.js?v=${ASSET_VERSION}"></script>
</body>
</html>
`;

const buildView = (subject) => `${head(`阅读 · ${subject.name} · DSH 笔记`)}
<body class="reader-page">
<div class="progress" aria-hidden="true"><span></span></div>

<header class="topbar">
  <a class="topbar-back" href="index.html">← 目录</a>
  <span class="topbar-title" id="bar-title">${subject.name}笔记</span>
  <div class="topbar-actions">
    <button class="icon-btn" id="toc-toggle" type="button" aria-label="展开目录">目录</button>
    <button class="icon-btn" id="font" type="button" aria-label="切换字号">AM</button>
    <button class="icon-btn" id="print" type="button" aria-label="打印">打印</button>
    <button class="icon-btn" id="theme" type="button" aria-label="切换深色模式">☾</button>
  </div>
</header>

<main class="reader-shell">
  <aside class="toc" id="toc-panel">
    <p class="toc-title">本页目录</p>
    <nav id="toc" aria-label="页内导航"></nav>
  </aside>

  <div class="doc-wrap">
    <header class="doc-head">
      <span class="card-tag" id="doc-cat">笔记</span>
      <h1 id="doc-title">加载中…</h1>
      <div class="doc-meta" id="doc-meta"></div>
    </header>
    <article class="doc" id="doc"></article>
    <nav class="pager" id="pager" aria-label="上下一篇"></nav>
  </div>
</main>

<button class="back-top" type="button" aria-label="返回顶部">↑</button>
<footer class="page-footer">
  <span>Node.js · ${subject.name}</span>
  <span>← → 翻页 · Esc 返回目录</span>
</footer>

<script src="./data.js"></script>
<script src="../共享配置/vendor/katex/katex.min.js?v=${ASSET_VERSION}"></script>
<script src="../共享配置/vendor/katex/auto-render.min.js?v=${ASSET_VERSION}"></script>
<script src="../共享配置/js/reader.js?v=${ASSET_VERSION}"></script>
</body>
</html>
`;

/* --------------------------------------------------------------------------
   4. 主流程
   -------------------------------------------------------------------------- */

const generatedAt = now();
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const contentDir = path.join(OUTPUT_DIR, "content");
fs.mkdirSync(contentDir, { recursive: true });

/* 清理上一轮生成物，不碰用户放进去的其他文件 */
for (const name of fs.readdirSync(contentDir)) {
  if (name.endsWith(".js")) fs.unlinkSync(path.join(contentDir, name));
}
for (const name of fs.readdirSync(OUTPUT_DIR)) {
  if (/^(?:doc-[a-f0-9]+\.html|index\.html|view\.html|data\.json|data\.js)$/i.test(name)) {
    fs.unlinkSync(path.join(OUTPUT_DIR, name));
  }
}

const subject = SUBJECTS[0];
const docs = collectSubject(subject);
docs.forEach((doc, index) => { doc.order = index; });

/* 每篇正文单独成文件，文件名用 slug 的短哈希，新增/改名不互相覆盖 */
const docId = (slug) => crypto.createHash("sha1").update(slug, "utf8").digest("hex").slice(0, 10);
const withSource = (html, source) => `<!-- source: ${source} -->\n<!-- source-root: node.js -->\n${html}`;
const sourceComment = (source) => `<!-- source: ${source} -->\n<!-- source-root: node.js -->\n`;

const indexDocs = docs.map((doc) => {
  const id = docId(doc.slug);
  const htmlFile = `doc-${id}.html`;
  const contentFile = `content/${id}.js`;
  const payload = {
    slug: doc.slug,
    source: doc.source,
    title: doc.title,
    category: doc.category,
    html: doc.html,
    toc: doc.toc,
    chars: doc.chars,
    updated: doc.updated,
  };
  fs.writeFileSync(
    path.join(contentDir, `${id}.js`),
    `// source: ${doc.source}\n// source-root: node.js\nwindow.__DSH_DOC = ${JSON.stringify(payload)};\n`,
    "utf8"
  );

  const page = `${sourceComment(doc.source)}${head(`${doc.title} · Node.js 笔记`)}
<body class="reader-page">
<main class="reader-shell">
  <div class="doc-wrap">
    <header class="doc-head">
      <span class="card-tag">${escapeHtml(doc.category)}</span>
      <h1>${escapeHtml(doc.title)}</h1>
      <div class="doc-meta">数据来源：${escapeHtml(doc.source)} · 更新于 ${doc.updated}</div>
    </header>
    <article class="doc">${doc.html}</article>
  </div>
</main>
<footer class="page-footer"><span>Node.js · 笔记归档</span><span>数据来源：${escapeHtml(doc.source)}</span></footer>
<script src="../共享配置/vendor/katex/katex.min.js?v=${ASSET_VERSION}"></script>
<script src="../共享配置/vendor/katex/auto-render.min.js?v=${ASSET_VERSION}"></script>
<script>
try { renderMathInElement(document.body, { delimiters: [{left:"$$",right:"$$",display:true},{left:"$",right:"$",display:false}], throwOnError:false }); } catch (e) {}
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, htmlFile), page, "utf8");

  return {
    slug: doc.slug,
    source: doc.source,
    title: doc.title,
    category: doc.category,
    summary: doc.summary,
    chars: doc.chars,
    updated: doc.updated,
    kind: doc.kind,
    file: contentFile,
    htmlFile,
  };
});

const data = {
  sourceRoot: CFG.sourceRoot || ".",
  generatedFrom: "共享配置/配置.json",
  subject: "node",
  subjectName: CFG.name || "Node.js",
  description: CFG.description,
  generatedAt,
  docs: indexDocs,
};
fs.writeFileSync(path.join(OUTPUT_DIR, "data.json"), JSON.stringify(data, null, 2), "utf8");
fs.writeFileSync(path.join(OUTPUT_DIR, "data.js"), "// source: 共享配置/配置.json\n// source-root: node.js\nwindow.DSH_INDEX = " + JSON.stringify(data) + ";\n", "utf8");
fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), withSource(buildIndex(subject, docs, generatedAt), "共享配置/配置.json"), "utf8");
const viewHtml = buildView(subject).replace("</head>", '<script>if (!location.hash.startsWith("#doc=")) location.replace("index.html");</script></head>');
fs.writeFileSync(path.join(OUTPUT_DIR, "view.html"), withSource(viewHtml, "共享配置/配置.json"), "utf8");

console.log(`✓ Node.js：${docs.length} 篇，输出 ${path.relative(ROOT, OUTPUT_DIR)}/，索引 ${(fs.statSync(path.join(OUTPUT_DIR, "data.js")).size / 1024).toFixed(1)} KB`);