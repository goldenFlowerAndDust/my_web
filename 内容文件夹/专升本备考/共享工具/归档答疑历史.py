# -*- coding: utf-8 -*-
"""把本地答疑日志按“知识分类 + 日期”归档成静态 HTML，并更新主页板块。

用法：
    python 共享工具/归档答疑历史.py math
    python 共享工具/归档答疑历史.py english
    python 共享工具/归档答疑历史.py all

数学按 topic 分类，英语按 mode 分类。
"""

from __future__ import annotations

import html
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT.parent
EN_BASE = ROOT / "备考专升本英语"
MATH_BASE = ROOT / "备考专升本数学"
EN_TOOL = EN_BASE / "词素工具"
MATH_TOOL = MATH_BASE / "数学工具"

for path in (EN_TOOL, MATH_TOOL):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from english_tutor import normalize_mode as normalize_english_mode  # noqa: E402
from math_tutor import normalize_topic as normalize_math_topic  # noqa: E402

MATH_CATEGORIES = [
    "极限",
    "导数与微分",
    "积分",
    "三角函数",
    "矩阵",
    "向量与空间几何",
    "微分方程",
    "无穷级数",
    "多元函数",
    "概率统计",
    "其他",
]
EN_CATEGORIES = ["单词解释", "作文", "句子分析", "其他"]

MATH_DAILY_ASSETS = "../../../一些必备脚本/数学公式js/libs"
MATH_BACK = "../../../../../../自建本地网站/导航栏内容/专升本/数学/专升本数学.html"
EN_BACK = "../../../../../../自建本地网站/导航栏内容/专升本/英语/专升本英语.html"

SUBJECTS = {
    "math": {
        "label": "数学",
        "log_dir": MATH_TOOL / "数学问答日志",
        "archive_dir": MATH_BASE / "数学答疑" / "归档",
        "categories": MATH_CATEGORIES,
        "hub": CONTENT / "自建本地网站" / "导航栏内容" / "专升本" / "数学" / "专升本数学.html",
        "hub_prefix": "../../../../专升本备考/备考专升本数学/数学答疑/归档",
        "kind": "math",
        "back": MATH_BACK,
    },
    "english": {
        "label": "英语",
        "log_dir": EN_TOOL / "英语问答日志",
        "archive_dir": EN_BASE / "英语答疑" / "归档",
        "categories": EN_CATEGORIES,
        "hub": CONTENT / "自建本地网站" / "导航栏内容" / "专升本" / "英语" / "专升本英语.html",
        "hub_prefix": "../../../../专升本备考/备考专升本英语/英语答疑/归档",
        "kind": "english",
        "back": EN_BACK,
    },
}


def esc(value) -> str:
    return html.escape(str(value or ""), quote=True)


def wrap_math_question(text: str) -> str:
    """历史原题可能是裸 LaTeX；把它包进 $...$ 再交给 KaTeX。"""
    value = str(text or "")
    if re.search(r"\$|\\\(|\\\[", value):
        return value
    return re.sub(
        r"(\\[A-Za-z]+[\s\S]*?)(?=[\u4e00-\u9fff]|$)",
        lambda m: "$" + m.group(1).strip() + "$" if m.group(1).strip() else m.group(0),
        value,
    )


def load_records(config: dict) -> dict[str, dict[str, list[dict]]]:
    grouped: dict[str, dict[str, list[dict]]] = {}
    if not config["log_dir"].exists():
        return grouped

    for path in sorted(config["log_dir"].glob("*.jsonl")):
        try:
            lines = path.read_text(encoding="utf-8-sig").splitlines()
        except OSError:
            continue
        for line in lines:
            line = line.strip()
            if not line:
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(item, dict) or not item.get("answer"):
                continue

            if config["kind"] == "math":
                try:
                    category = normalize_math_topic(item.get("topic"))
                except Exception:
                    category = "其他"
            else:
                try:
                    category = normalize_english_mode(item.get("mode"))
                except Exception:
                    category = "其他"

            date = str(item.get("time", ""))[:10]
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
                date = str(item.get("created_at", ""))[:10]
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
                continue
            grouped.setdefault(category, {}).setdefault(date, []).append(item)
    return grouped


def daily_html(config: dict, category: str, date: str, records: list[dict]) -> str:
    is_math = config["kind"] == "math"
    cards = []
    for item in records:
        question = str(item.get("question", ""))
        if is_math:
            question = wrap_math_question(question)
        mode = esc(item.get("mode", ""))
        time = esc(item.get("time", ""))
        class_name = "math" if is_math else "english"
        cards.append(
            '<article class="record">'
            f'<div class="record-meta"><span>{mode}</span><time>{time}</time></div>'
            f'<h2>{esc(question)}</h2>'
            f'<div class="answer {class_name}">{esc(item.get("answer", ""))}</div>'
            '</article>'
        )

    math_head = ""
    math_foot = ""
    if is_math:
        math_head = (
            f'    <link rel="stylesheet" href="{MATH_DAILY_ASSETS}/katex.min.css">\n'
            f'    <script defer src="{MATH_DAILY_ASSETS}/katex.min.js"></script>\n'
            f'    <script defer src="{MATH_DAILY_ASSETS}/auto-render.min.js"></script>\n'
        )
        math_foot = """
<script>
document.addEventListener("DOMContentLoaded", function () {
    if (typeof renderMathInElement !== "function") return;
    document.querySelectorAll(".answer, h2").forEach(function (node) {
        try {
            renderMathInElement(node, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "\\\\[", right: "\\\\]", display: true},
                    {left: "$", right: "$", display: false},
                    {left: "\\\\(", right: "\\\\)", display: false}
                ],
                throwOnError: false,
                strict: false
            });
        } catch (e) {}
    });
});
</script>
"""

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{esc(config['label'])} · {esc(category)} · {date}</title>
{math_head}    <style>
        :root {{ --ink:#172033; --muted:#65718a; --line:#e3e7ef; --paper:#fffdf8; --accent:#425fe8; }}
        * {{ box-sizing:border-box; }}
        body {{ margin:0; padding:28px 16px 56px; background:#f3f6fc; color:var(--ink); font-family:"Noto Sans SC","Microsoft YaHei",sans-serif; line-height:1.8; }}
        .shell {{ width:min(960px,100%); margin:0 auto; }}
        .top {{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; margin-bottom:16px; }}
        .back {{ color:var(--accent); text-decoration:none; font-weight:700; font-size:14px; }}
        .tag {{ color:var(--muted); font-size:12px; }}
        h1 {{ margin:0 0 4px; font-family:"Noto Serif SC",serif; font-size:clamp(24px,4vw,38px); }}
        .sub {{ margin:0 0 22px; color:var(--muted); font-size:13px; }}
        .record {{ margin:0 0 16px; padding:18px 20px; background:var(--paper); border:1px solid var(--line); border-radius:12px; box-shadow:0 8px 24px rgba(33,48,88,.05); }}
        .record-meta {{ display:flex; justify-content:space-between; gap:10px; color:var(--muted); font-size:11px; }}
        .record h2 {{ margin:8px 0; font-size:16px; line-height:1.7; overflow-wrap:anywhere; }}
        .answer {{ white-space:pre-wrap; overflow-wrap:anywhere; font-size:14px; }}
        .answer.math {{ line-height:2; }}
        .katex-display {{ overflow-x:auto; overflow-y:hidden; padding:.2rem 0; }}
        @media (max-width:600px) {{ body {{ padding:18px 10px 40px; }} .record {{ padding:14px; }} }}
    </style>
</head>
<body>
<div class="shell">
    <div class="top">
        <a class="back" href="{config['back']}">← 返回{esc(config['label'])}主页</a>
        <span class="tag">AI 答疑归档 · 按日保存</span>
    </div>
    <h1>{esc(category)} · {date}</h1>
    <p class="sub">{esc(config['label'])}答疑记录，共 {len(records)} 条。</p>
    {''.join(cards) if cards else '<p>这一天暂无记录。</p>'}
</div>
{math_foot}
</body>
</html>
"""


ARTICLE_RE = re.compile(r'<article class="record">.*?</article>', re.S)
TIME_RE = re.compile(r'<time>(.*?)</time>')


def merge_daily_page(target: Path, new_html: str) -> None:
    """保留旧页面，只把当前日志里新增的时间记录追加进去。"""
    try:
        old_html = target.read_text(encoding="utf-8")
    except OSError:
        return
    existing_times = set(TIME_RE.findall(old_html))
    blocks = ARTICLE_RE.findall(new_html)
    missing = []
    for block in blocks:
        match = TIME_RE.search(block)
        if not match:
            continue
        if match.group(1) not in existing_times:
            missing.append(block)
    if not missing:
        return
    old_count = len(ARTICLE_RE.findall(old_html))
    new_count = old_count + len(missing)
    old_html = re.sub(
        r"(答疑记录，共 )\d+( 条。)",
        lambda match: match.group(1) + str(new_count) + match.group(2),
        old_html,
        count=1,
    )
    pos = old_html.rfind("</div>")
    if pos < 0:
        return
    old_html = old_html[:pos] + "".join(missing) + old_html[pos:]
    target.write_text(old_html, encoding="utf-8", newline="\n")


def generate_pages(config: dict, grouped: dict[str, dict[str, list[dict]]]) -> None:
    archive_dir = config["archive_dir"]
    archive_dir.mkdir(parents=True, exist_ok=True)
    for category, days in grouped.items():
        folder = archive_dir / category
        folder.mkdir(parents=True, exist_ok=True)
        for date, records in days.items():
            records.sort(key=lambda item: str(item.get("time", "")))
            target = folder / (date + ".html")
            fresh_html = daily_html(config, category, date, records)
            if target.exists():
                # 已归档页面不覆盖、不删除；只追加日志里新增的时间记录。
                merge_daily_page(target, fresh_html)
                continue
            target.write_text(
                fresh_html,
                encoding="utf-8",
                newline="\n",
            )


def merge_archived_dates(config: dict, grouped: dict[str, dict[str, list[dict]]]) -> None:
    """把磁盘上已有的历史归档日期补进 hub，不因日志缺失而删掉历史链接。"""
    archive_dir = config["archive_dir"]
    for category in config["categories"]:
        folder = archive_dir / category
        if not folder.is_dir():
            continue
        bucket = grouped.setdefault(category, {})
        for path in folder.glob("*.html"):
            bucket.setdefault(path.stem, [])


def archive_index_html(config: dict) -> str:
    archive_dir = config["archive_dir"]
    sections = []
    for category in config["categories"]:
        folder = archive_dir / category
        if not folder.is_dir():
            continue
        dates = sorted((p for p in folder.glob("*.html")), reverse=True)
        if not dates:
            continue
        links = "".join(
            f'<li><a href="{quote(category)}/{quote(path.name)}">{esc(path.stem)}</a></li>'
            for path in dates
        )
        sections.append(
            '<section class="group">'
            f"<h2>{esc(category)}</h2><ul class=\"dates\">{links}</ul>"
            "</section>"
        )
    if not sections:
        sections.append('<p class="empty">暂无归档。完成一次答疑后重新运行归档即可生成。</p>')
    back = config["back"]
    if back.startswith("../"):
        back = back[3:]
    style = """
:root{--ink:#172033;--muted:#65718a;--line:#e4e9f2;--paper:#fffdf8;--accent:#2f6f9f;--soft:#f4f7fb}
*{box-sizing:border-box}
body{margin:0;padding:28px 16px 56px;background:#f3f6fc;color:var(--ink);font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;line-height:1.75}
.wrap{max-width:980px;margin:0 auto}
.top{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:18px}
.top a{color:var(--accent);text-decoration:none;font-size:.9rem}
.tag{font-size:.78rem;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:3px 10px;background:#fff}
h1{margin:0 0 8px;font-size:1.65rem;letter-spacing:.02em}
.lead{margin:0 0 22px;color:var(--muted);font-size:.92rem}
.group{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin:12px 0;box-shadow:0 6px 18px rgba(31,45,70,.04)}
.group h2{margin:0 0 10px;font-size:1.05rem;color:var(--accent)}
.dates{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.dates a{display:inline-block;padding:5px 11px;border:1px solid #d9e4ef;border-radius:8px;background:var(--soft);color:#215a80;text-decoration:none;font-size:.88rem}
.dates a:hover{border-color:var(--accent);background:#eaf3fa}
.empty{color:var(--muted);font-size:.9rem}
@media(max-width:600px){body{padding:18px 10px 40px}h1{font-size:1.35rem}.group{padding:14px}.dates a{font-size:.82rem}}
"""
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(config['label'])} · AI 答疑归档</title><style>{style}</style></head>
<body><div class="wrap">
<div class="top"><a href="{back}">← 返回{esc(config['label'])}主页</a><span class="tag">AI 答疑归档 · 按分类 / 日期</span></div>
<h1>{esc(config['label'])} AI 答疑归档</h1>
<p class="lead">点击日期查看当天完整问答。此页面由归档脚本自动生成；新增答疑后重新运行归档即可更新。</p>
{''.join(sections)}
</div></body></html>"""


def write_archive_index(config: dict) -> None:
    target = config["archive_dir"] / "index.html"
    target.write_text(archive_index_html(config), encoding="utf-8", newline="\n")


def math_hub_block(config: dict, grouped: dict[str, dict[str, list[dict]]]) -> str:
    parts = ["<!-- AI_ARCHIVE_START -->", "<h2>AI 答疑历史</h2>",
             "<p>按知识分类和日期归档；点击日期查看当天记录。</p>"]
    has_any = False
    for category in config["categories"]:
        days = grouped.get(category) or {}
        if not days:
            continue
        has_any = True
        parts.append("<h3>" + esc(category) + "</h3><ul>")
        for date in sorted(days, reverse=True):
            href = f"{config['hub_prefix']}/{quote(category)}/{date}.html"
            parts.append(f'<li><a href="{href}">{date}</a></li>')
        parts.append("</ul>")
    if not has_any:
        parts.append("<p>暂无归档。完成一次数学答疑后，重启数学服务即可生成。</p>")
    index_href = config["hub_prefix"] + "/index.html"
    parts.append(
        f'<p><a href="{index_href}" '
        'style="display:inline-block;padding:6px 10px;border:1px solid #d9e4ef;'
        'border-radius:8px;background:#f4f7fb;color:#215a80;text-decoration:none;'
        'font-size:13px;">查看全部 AI 答疑归档 →</a></p>'
    )
    parts.append("<!-- AI_ARCHIVE_END -->")
    return "\n".join(parts)


def english_hub_block(config: dict, grouped: dict[str, dict[str, list[dict]]]) -> str:
    groups = []
    has_any = False
    for category in config["categories"]:
        days = grouped.get(category) or {}
        if not days:
            continue
        has_any = True
        links = "".join(
            f'<li><a href="{config["hub_prefix"]}/{quote(category)}/{date}.html">{date}</a></li>'
            for date in sorted(days, reverse=True)
        )
        groups.append(
            '<article class="ai-archive-group">'
            f"<h3>{esc(category)}</h3><ul>{links}</ul>"
            "</article>"
        )
    body = (
        '<div class="ai-archive-groups">' + "".join(groups) + "</div>"
        if has_any
        else '<p class="ai-archive-empty">暂无归档。完成一次英语答疑后，重启词素服务即可生成。</p>'
    )
    index_href = config["hub_prefix"] + "/index.html"
    return f"""<!-- AI_ARCHIVE_START -->
<section class="hub-section" data-section="ai-history">
    <div class="section-head">
        <div>
            <p class="section-kicker">AI HISTORY</p>
            <h2>AI 答疑历史</h2>
            <p class="section-desc">按分类和日期归档，点击日期查看当时的完整回答。</p>
        </div>
    </div>
    {body}
    <p class="ai-archive-index-link"><a href="{index_href}">查看全部答疑归档 →</a></p>
</section>
<!-- AI_ARCHIVE_END -->"""


def update_hub(config: dict, grouped: dict[str, dict[str, list[dict]]]) -> None:
    hub = config["hub"]
    if not hub.exists():
        return
    text = hub.read_text(encoding="utf-8")
    if "<!-- AI_ARCHIVE_START -->" not in text or "<!-- AI_ARCHIVE_END -->" not in text:
        return
    block = math_hub_block(config, grouped) if config["kind"] == "math" else english_hub_block(config, grouped)
    pattern = re.compile(r"<!-- AI_ARCHIVE_START -->[\s\S]*?<!-- AI_ARCHIVE_END -->")
    new_text = pattern.sub(block, text, count=1)
    if new_text != text:
        hub.write_text(new_text, encoding="utf-8", newline="\n")


def refresh(subject: str = "all") -> None:
    subjects = ["math", "english"] if subject == "all" else [subject]
    for name in subjects:
        config = SUBJECTS.get(name)
        if not config:
            continue
        grouped = load_records(config)
        generate_pages(config, grouped)
        merge_archived_dates(config, grouped)
        write_archive_index(config)
        update_hub(config, grouped)
        file_count = sum(len(days) for days in grouped.values())
        print(f"归档完成：{config['label']}，{file_count} 个日期文件。")


def main() -> int:
    subject = sys.argv[1] if len(sys.argv) > 1 else "all"
    if subject not in ("all", "math", "english"):
        print("用法：python 共享工具/归档答疑历史.py [all|math|english]")
        return 2
    refresh(subject)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
