"""每日答疑归档（唯一归档入口）。

数据来源（合并去重）：
  1) 答疑日志  英语/数学 的 *_问答日志/*.jsonl —— 每条带 时间/知识分类(topic)/题目类型(mode)
  2) 对话历史  历史记录/对话/<科目>.json —— 按窗口记录的多轮问答（11 月起的云端对话）

存储：AI答疑/答疑归档/<科目>/<年>/<月>/<日>.md        ← md 是唯一数据源
生成：data.js / data.json（索引）、content/<日期>.js（正文）、
      index.html（卡片目录）、view.html（阅读页，侧边栏只列知识分类）

每次同步全量重建：只覆盖、不追加。
"""

from __future__ import annotations

import hashlib
import html as html_mod
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

AI = Path(__file__).resolve().parent.parent.parent
BASE = AI / "答疑归档"
HIST = AI / "历史记录" / "对话"

DSH = "../../../专升本备考/DSH-woker/共享配置"

SUBJECTS = {
    "english": {
        "dir": "英语",
        "label": "英语",
        "name": "英语答疑归档",
        "kicker": "ENGLISH · DAILY ARCHIVE",
        "description": "按 年/月/日 汇总当天全部答疑；点开卡片阅读全文。",
        "home": "../../../自建本地网站/导航栏内容/专升本/英语/专升本英语.html",
        "logs": AI / "英语答疑" / "engine" / "词素工具" / "英语问答日志",
    },
    "math": {
        "dir": "数学",
        "label": "数学",
        "name": "数学答疑归档",
        "kicker": "MATH · DAILY ARCHIVE",
        "description": "按 年/月/日 汇总当天全部答疑；公式本地渲染。",
        "home": "../../../自建本地网站/导航栏内容/专升本/数学/专升本数学.html",
        "logs": AI / "数学答疑" / "engine" / "数学工具" / "数学问答日志",
    },
    "code": {
        "dir": "编程",
        "label": "编程",
        "name": "编程答疑归档",
        "kicker": "CODE · DAILY ARCHIVE",
        "description": "按 年/月/日 汇总当天全部答疑。",
        "home": "../../../自建本地网站/导航栏内容/专升本/数学/专升本数学.html",
        "logs": None,
    },
}


def norm(text: str) -> str:
    return re.sub(r"\s+", "", str(text or ""))


# ---------------- 数据收集 ----------------

def make_conversation(time: str, mode: str, topic: str, rounds: list[tuple[str, str]], source: str) -> dict:
    return {
        "time": time or "",
        "mode": mode or "",
        "topic": topic or "",
        "rounds": [{"q": q, "a": a} for q, a in rounds if q],
        "source": source,
        "first_q": rounds[0][0] if rounds else "",
    }


def log_records(subject: str, cfg: dict) -> list[dict]:
    """从答疑日志读：每条日志是一个单轮问答，视为一个单轮对话。"""
    out = []
    logs = cfg.get("logs")
    if not logs or not logs.exists():
        return out
    for f in sorted(logs.glob("*.jsonl")):
        fallback_mode = f.stem
        for line in f.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                o = json.loads(line)
            except Exception:
                continue
            q = str(o.get("question") or "").strip()
            a = str(o.get("answer") or "").strip()
            if not q:
                continue
            out.append(make_conversation(
                str(o.get("time") or o.get("created_at") or "")[:19],
                str(o.get("mode") or fallback_mode or "").strip(),
                str(o.get("topic") or "").strip(),
                [(q, a)],
                "答疑日志",
            ))
    return out


def conversation_records(subject: str) -> list[dict]:
    """从对话历史读：一个窗口 = 一个多轮对话，完整保留轮次顺序。"""
    f = HIST / f"{subject}.json"
    if not f.exists():
        return []
    data = json.loads(f.read_text(encoding="utf-8"))
    out = []
    for wid, w in (data.get("windows") or {}).items():
        if not isinstance(w, dict):
            continue
        rounds = []
        pending = None
        for m in (w.get("messages") or []):
            role, content = m.get("role"), str(m.get("content") or "").strip()
            if not content:
                continue
            if role == "user":
                pending = content
            elif role == "assistant" and pending is not None:
                rounds.append((pending, content))
                pending = None
        if not rounds:
            continue
        out.append(make_conversation(
            str(w.get("updated_at") or w.get("created_at") or ""),
            str(w.get("mode") or "").strip(),
            str(w.get("topic") or "").strip(),
            rounds,
            "对话记录",
        ))
    return out


def normalize_math(text: str) -> str:
    """把旧归档里的 LaTeX 定界符统一成 $ / $$，否则 KaTeX 不渲染。"""
    t = str(text or "")
    t = t.replace("\\[", "$$").replace("\\]", "$$")
    t = t.replace("\\(", "$").replace("\\)", "$")
    return t


def legacy_records(subject: str, cfg: dict) -> list[dict]:
    """旧版归档（答疑/归档/<分类>/<日期>.html）里的记录。

    这些日期早于答疑日志，只存在于旧页面。首次解析后固化成快照，
    之后一律读快照——这样删掉旧目录也不会丢数据。
    """
    import html as _html

    snapshot = AI / "共享配置" / "历史归档" / "遗留归档快照.json"
    if snapshot.exists():
        try:
            data = json.loads(snapshot.read_text(encoding="utf-8"))
            out = []
            for r in (data.get(subject) or []):
                if not isinstance(r, dict):
                    continue
                out.append(make_conversation(
                    str(r.get("time") or "")[:19],
                    str(r.get("mode") or ""),
                    str(r.get("topic") or ""),
                    [(str(r.get("question") or ""), str(r.get("answer") or ""))],
                    "旧版归档",
                ))
            return out
        except Exception:
            return []

    roots = {
        "english": AI / "英语答疑" / "归档",
        "math": AI / "数学答疑" / "归档",
    }
    root = roots.get(subject)
    if not root or not root.exists():
        return []

    out = []
    rec_re = re.compile(r'<article class="record">([\s\S]*?)</article>', re.I)
    meta_re = re.compile(r'<div class="record-meta">\s*<span>(.*?)</span>\s*<time>(.*?)</time>', re.I | re.S)
    q_re = re.compile(r"<h2>([\s\S]*?)</h2>", re.I)
    a_re = re.compile(r'<div class="answer[^"]*">([\s\S]*?)</div>', re.I)

    for page in sorted(root.rglob("*.html")):
        if page.name == "index.html":
            continue
        topic = page.parent.name if page.parent != root else ""
        text = page.read_text(encoding="utf-8", errors="replace")
        for block in rec_re.findall(text):
            m = meta_re.search(block)
            qm = q_re.search(block)
            am = a_re.search(block)
            if not qm:
                continue
            mode = _html.unescape(m.group(1)).strip() if m else ""
            tm = _html.unescape(m.group(2)).strip() if m else ""
            question = normalize_math(_html.unescape(re.sub(r"<[^>]+>", "", qm.group(1))).strip())
            answer = normalize_math(_html.unescape(am.group(1))) if am else ""
            if not question:
                continue
            out.append(make_conversation(tm[:19], mode, topic, [(question, answer.strip())], "旧版归档"))
    return out


def freeze_legacy() -> None:
    """把仍存在的旧归档目录解析成快照，之后即可安全删除旧目录。"""
    snapshot = AI / "共享配置" / "历史归档" / "遗留归档快照.json"
    payload = {}
    for subject in ("english", "math"):
        payload[subject] = legacy_records(subject, SUBJECTS[subject])
    if any(payload.values()):
        snapshot.write_text(json.dumps(payload, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print("已固化旧归档快照：%d 条 -> %s" % (sum(len(v) for v in payload.values()), snapshot.name))
    else:
        print("没有可固化的旧归档（目录可能已删除，或已有快照）")


def records_by_date(subject: str, cfg: dict) -> dict[str, list[dict]]:
    """合并三个来源，按日期分组。

    原则：**对话（含多轮）优先**。日志/旧版归档里已经出现在某个对话轮次里的问题，
    不再单独成条，避免同一个问题既在多轮对话里、又单独出现一次。
    """
    convs = conversation_records(subject)
    covered: set[str] = set()
    for c in convs:
        for r in c["rounds"]:
            covered.add(norm(r["q"])[:120])

    extras = []
    for c in log_records(subject, cfg) + legacy_records(subject, cfg):
        key = norm(c["first_q"])[:120]
        if key in covered:
            continue
        covered.add(key)
        extras.append(c)

    merged: dict[str, list[dict]] = defaultdict(list)
    for c in convs + extras:
        date = c["time"][:10]
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
            continue
        merged[date].append(c)

    result = {}
    for date, items in merged.items():
        result[date] = sorted(items, key=lambda r: r["time"] or "")
    return result


# ---------------- md 生成 ----------------

def brief(rec: dict) -> str:
    parts = [p for p in (rec.get("topic"), rec.get("mode")) if p]
    return " · ".join(parts) if parts else "未分类"


def demote_headings(text: str) -> str:
    """答案正文里的 markdown 标题压到 h4 以下。

    侧边栏两级：h2 = 对话，h3 = 问N/答N。正文标题必须低于 h3，否则会混进目录。
    """
    out = []
    for line in str(text or "").splitlines():
        m = re.match(r"^(#{1,6})\s", line)
        if m:
            level = max(min(len(m.group(1)) + 2, 6), 4)
            line = "#" * level + line[len(m.group(1)):]
        out.append(line)
    return "\n".join(out)


def build_markdown(label: str, date: str, conversations: list[dict]) -> str:
    lines = [f"# {date} · {label}答疑归档", ""]
    lines.append("> 自动生成，每次同步整篇覆盖，请勿手工修改。")
    lines.append("")
    for idx, conv in enumerate(conversations, 1):
        rounds = conv["rounds"]
        lines.append(f"## {idx}. {brief(conv)}")
        lines.append("")
        lines.append(f"- 时间：{conv['time'] or '未知'}")
        lines.append(f"- 轮次：{len(rounds)}")
        lines.append(f"- 来源：{conv['source']}")
        lines.append("")
        for r, item in enumerate(rounds, 1):
            lines.append(f"### 问 {r}")
            lines.append("")
            lines.append(item["q"])
            lines.append("")
            lines.append(f"### 答 {r}")
            lines.append("")
            lines.append(demote_headings(item["a"]) or "（无回答记录）")
            lines.append("")
        lines.append("---")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


# ---------------- md → html ----------------

INLINE_CODE = re.compile(r"`([^`]+)`")
BOLD = re.compile(r"\*\*([^*]+)\*\*")
ITALIC = re.compile(r"(?<!\*)\*([^*]+)\*(?!\*)")


def inline(text: str) -> str:
    out = html_mod.escape(text, quote=False)
    out = INLINE_CODE.sub(lambda m: "<code>" + m.group(1) + "</code>", out)
    out = BOLD.sub(lambda m: "<strong>" + m.group(1) + "</strong>", out)
    out = ITALIC.sub(lambda m: "<em>" + m.group(1) + "</em>", out)
    return out


def md_to_html(md: str) -> tuple[str, list[dict]]:
    """转换；目录只收 h1/h2（知识分类），不收 h3（问/答），侧边栏因此更简洁。"""
    lines = md.splitlines()
    out: list[str] = []
    toc: list[dict] = []
    i = 0
    in_code = False
    code_buf: list[str] = []
    list_open = None
    para: list[str] = []
    seq = 0

    def flush_para() -> None:
        nonlocal para
        if para:
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            para = []

    def close_list() -> None:
        nonlocal list_open
        if list_open:
            out.append(f"</{list_open}>")
            list_open = None

    while i < len(lines):
        raw, line = lines[i], lines[i].rstrip()
        if line.startswith("```"):
            flush_para(); close_list()
            if in_code:
                out.append("<pre><code>" + html_mod.escape("\n".join(code_buf), quote=False) + "</code></pre>")
                code_buf, in_code = [], False
            else:
                in_code = True
            i += 1
            continue
        if in_code:
            code_buf.append(raw); i += 1; continue
        if not line.strip():
            flush_para(); close_list(); i += 1; continue

        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            flush_para(); close_list()
            level, text = len(m.group(1)), m.group(2).strip()
            if level == 1 and not toc:          # 首个 H1 = 文档标题，正文不重复
                i += 1
                continue
            seq += 1
            hid = f"sec-{seq}"
            if level == 2:                       # 一级：一个对话体系
                toc.append({"id": hid, "text": text, "level": 2})
                out.append(f'<h2 id="{hid}" class="topic-head">{inline(text)}</h2>')
            elif level == 3:                     # 二级：问N / 答N
                toc.append({"id": hid, "text": text, "level": 3})
                out.append(f'<h3 id="{hid}" class="round-head">{inline(text)}</h3>')
            else:                                # 正文内部标题，不进目录
                out.append(f'<h{level} id="{hid}">{inline(text)}</h{level}>')
            i += 1
            continue

        if re.match(r"^---+$", line.strip()):
            flush_para(); close_list(); out.append("<hr>"); i += 1; continue

        if line.startswith(">"):
            flush_para(); close_list()
            out.append("<blockquote><p>" + inline(line.lstrip("> ").strip()) + "</p></blockquote>")
            i += 1
            continue

        m = re.match(r"^(\d+)\.\s+(.*)$", line)
        if m:
            flush_para()
            if list_open != "ol":
                close_list(); out.append("<ol>"); list_open = "ol"
            out.append("<li>" + inline(m.group(2).strip()) + "</li>")
            i += 1
            continue

        m = re.match(r"^[-*]\s+(.*)$", line)
        if m:
            flush_para()
            if list_open != "ul":
                close_list(); out.append("<ul>"); list_open = "ul"
            out.append("<li>" + inline(m.group(1).strip()) + "</li>")
            i += 1
            continue

        para.append(line.strip()); i += 1

    flush_para(); close_list()
    if in_code and code_buf:
        out.append("<pre><code>" + html_mod.escape("\n".join(code_buf), quote=False) + "</code></pre>")
    return "\n".join(out), toc


# ---------------- 页面 ----------------

EXTRA_CSS = """
/* 正文：对话标题高亮，问/答标题弱化 */
.doc h2.topic-head{border-left:4px solid var(--primary,#425fe8);padding-left:.6em;background:linear-gradient(90deg,rgba(66,95,232,.10),transparent);border-radius:0 8px 8px 0}
.doc h3.round-head{font-size:.98rem;color:var(--muted,#5b6b82);margin:20px 0 6px;letter-spacing:.02em}
/* 侧边栏两级：对话 = 粗体，问N/答N = 缩进并带竖线 */
.toc a:not(.lv3){font-weight:700}
.toc a.lv3{padding-left:26px;position:relative;font-size:12.8px;opacity:.9}
.toc a.lv3::before{content:"";position:absolute;left:12px;top:2px;bottom:2px;width:1px;background:currentColor;opacity:.22}
.toc a.lv3.is-active{opacity:1}
"""


def head(title: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="zh-CN" data-theme="light" data-size="m">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#425fe8">
<title>{html_mod.escape(title)}</title>
<link rel="stylesheet" href="{DSH}/vendor/katex/katex.min.css">
<link rel="stylesheet" href="{DSH}/css/notes.css">
<style>{EXTRA_CSS}</style>
</head>"""


def build_index(cfg: dict, total: int, generated_at: str) -> str:
    return f"""{head(cfg['name'] + ' · 每日答疑归档')}
<body class="index-page">
<div class="index-shell">
  <header class="hero">
    <a class="hero-back" href="{cfg['home']}">← 返回{cfg['label']}主页</a>
    <span class="hero-kicker">{cfg['kicker']}</span>
    <h1 id="hero-title">{html_mod.escape(cfg['name'])}</h1>
    <p id="hero-desc">{html_mod.escape(cfg['description'])}</p>
    <div class="hero-stats" id="hero-stats">
      <div class="stat"><strong>{total}</strong><span>天归档</span></div>
      <div class="stat"><strong>{generated_at}</strong><span>最近同步</span></div>
    </div>
  </header>

  <section class="toolbar" aria-label="搜索与筛选">
    <label class="search-box" for="q">
      <span aria-hidden="true">⌕</span>
      <input id="q" type="search" autocomplete="off" placeholder="搜索日期、知识分类、题目…" aria-label="搜索归档">
      <kbd>/</kbd>
    </label>
    <div class="chips" id="chips" role="group" aria-label="按月份筛选"></div>
    <button class="icon-btn" id="theme" type="button" aria-label="切换深色模式">☾</button>
  </section>

  <main id="groups"></main>

  <div class="empty" id="empty">
    <strong>没有找到匹配内容</strong>
    <span>换个关键词，或点“全部”清除筛选。</span>
  </div>
</div>

<button class="back-top" type="button" aria-label="返回顶部">↑</button>
<footer class="page-footer">
  <span>每日答疑归档 · {html_mod.escape(cfg['label'])}</span>
  <span>生成于 {generated_at}</span>
</footer>

<script src="./data.js"></script>
<script src="{DSH}/js/index.js"></script>
</body>
</html>
"""


def build_view(cfg: dict) -> str:
    return f"""{head('阅读 · ' + cfg['name'])}
<body class="reader-page">
<div class="progress" aria-hidden="true"><span></span></div>

<header class="topbar">
  <a class="topbar-back" href="index.html">← 目录</a>
  <span class="topbar-title" id="bar-title">{html_mod.escape(cfg['name'])}</span>
  <div class="topbar-actions">
    <button class="icon-btn" id="toc-toggle" type="button" aria-label="展开目录">目录</button>
    <button class="icon-btn" id="font" type="button" aria-label="切换字号">AM</button>
    <button class="icon-btn" id="print" type="button" aria-label="打印">打印</button>
    <button class="icon-btn" id="theme" type="button" aria-label="切换深色模式">☾</button>
  </div>
</header>

<main class="reader-shell">
  <aside class="toc" id="toc-panel">
    <p class="toc-title">当天分类</p>
    <nav id="toc" aria-label="页内导航"></nav>
  </aside>

  <div class="doc-wrap">
    <header class="doc-head">
      <span class="card-tag" id="doc-cat">归档</span>
      <h1 id="doc-title">加载中…</h1>
      <div class="doc-meta" id="doc-meta"></div>
    </header>
    <article class="doc" id="doc"></article>
    <nav class="pager" id="pager" aria-label="上一天/下一天"></nav>
  </div>
</main>

<button class="back-top" type="button" aria-label="返回顶部">↑</button>
<footer class="page-footer">
  <span>每日答疑归档 · {html_mod.escape(cfg['label'])}</span>
  <span>← → 翻页 · Esc 返回目录</span>
</footer>

<script src="./data.js"></script>
<script src="{DSH}/vendor/katex/katex.min.js"></script>
<script src="{DSH}/vendor/katex/auto-render.min.js"></script>
<script src="{DSH}/js/reader.js"></script>
</body>
</html>
"""


# ---------------- 构建 ----------------

def js_safe(text: str) -> str:
    return text.replace("</", "<\\/")


def now_text() -> str:
    from datetime import datetime
    return datetime.now().strftime("%Y-%m-%d %H:%M")


def archive_subject(subject: str, cfg: dict) -> dict:
    root = BASE / cfg["dir"]
    root.mkdir(parents=True, exist_ok=True)
    by_date = records_by_date(subject, cfg)

    content_dir = root / "content"
    content_dir.mkdir(exist_ok=True)

    docs = []
    keep = set()
    for date in sorted(by_date, reverse=True):
        y, m, d = date.split("-")
        day_dir = root / y / m
        day_dir.mkdir(parents=True, exist_ok=True)

        md_text = build_markdown(cfg["label"], date, by_date[date])
        (day_dir / f"{d}.md").write_text(md_text, encoding="utf-8")

        body_html, toc = md_to_html(md_text)
        slug = f"{y}/{m}/{d}"

        topics = sorted({(c.get("topic") or c.get("mode") or "未分类") for c in by_date[date]})
        first_q = (by_date[date][0].get("first_q") or "") if by_date[date] else ""
        summary = "【%s】%s" % (" / ".join(topics[:3]), re.sub(r"\s+", " ", first_q)[:80])

        payload = {
            "slug": slug,
            "title": f"{date} · {cfg['label']}答疑归档",
            "category": f"{y} 年 {m} 月",
            "html": body_html,
            "toc": toc,
            "chars": len(re.sub(r"\s+", "", md_text)),
            "updated": date,
            "topics": topics,
            "count": len(by_date[date]),
        }
        (root / "content" / f"{date}.js").write_text(
            "window.__DSH_DOC = " + js_safe(json.dumps(payload, ensure_ascii=False)) + ";\n",
            encoding="utf-8",
        )
        keep.add(f"{date}.js")
        docs.append({
            "slug": slug,
            "title": payload["title"],
            "category": payload["category"],
            "summary": summary,
            "chars": payload["chars"],
            "updated": date,
            "file": f"content/{date}.js",
        })

    removed = 0
    for f in content_dir.glob("*.js"):
        if f.name not in keep:
            f.unlink(); removed += 1
    for f in root.rglob("*.html"):
        if f.name in ("index.html", "view.html"):
            continue
        f.unlink(); removed += 1

    generated_at = now_text()
    index_data = {
        "subject": cfg["dir"],
        "subjectName": cfg["name"],
        "description": cfg["description"],
        "generatedAt": generated_at,
        "docs": docs,
    }
    (root / "data.js").write_text(
        "window.DSH_INDEX = " + js_safe(json.dumps(index_data, ensure_ascii=False)) + ";\n", encoding="utf-8")
    (root / "data.json").write_text(json.dumps(index_data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    (root / "index.html").write_text(build_index(cfg, len(docs), generated_at), encoding="utf-8")
    (root / "view.html").write_text(build_view(cfg), encoding="utf-8")
    return {"subject": subject, "days": len(docs), "removed": removed,
            "records": sum(len(v) for v in by_date.values())}


def refresh() -> dict:
    return {"ok": True, "results": [archive_subject(s, c) for s, c in SUBJECTS.items()]}


def main() -> int:
    for item in refresh()["results"]:
        print("%-8s 归档 %2d 天 / %3d 条，清理 %d 个" % (
            item["subject"], item["days"], item["records"], item["removed"]))
    print("输出目录：", BASE)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
