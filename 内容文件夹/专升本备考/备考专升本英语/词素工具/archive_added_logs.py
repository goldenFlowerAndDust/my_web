# -*- coding: utf-8 -*-
"""把“归档日志.jsonl”按天归档为静态 HTML。

实时页面（添加日志.html）仍只读最近 500 条；
这里保留完整历史，按天生成：
    添加日志/index.html
    添加日志/YYYY-MM-DD.html

每次 append_log 后自动刷新；服务启动时也会刷新。
"""

from __future__ import annotations

import html
import json
import re
import shutil
from datetime import datetime
from pathlib import Path

TOOL_DIR = Path(__file__).resolve().parent
BASE = TOOL_DIR.parent
LOG_FILE = TOOL_DIR / "归档日志.jsonl"
ARCHIVE_DIR = BASE / "添加日志"

TYPE_LABELS = {
    "suffix": "后缀派生",
    "prefix": "前缀派生",
    "root_family": "词根 / 本体",
    "compound": "复合词",
    "atom": "原子词",
    "existing-priority": "已录入，插队复习",
    "review-sync": "复习打卡写回",
}


def esc(value) -> str:
    return html.escape(str(value or ""), quote=True)


def load_entries() -> list[dict]:
    if not LOG_FILE.exists():
        return []
    entries: list[dict] = []
    for line in LOG_FILE.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(item, dict):
            entries.append(item)
    entries.sort(key=lambda item: str(item.get("time", "")), reverse=True)
    return entries


def date_of(item: dict) -> str:
    value = str(item.get("time", ""))
    return value[:10] if re.fullmatch(r"\d{4}-\d{2}-\d{2}", value[:10]) else ""


def type_label(value: str) -> str:
    return TYPE_LABELS.get(value, value or "记录")


def file_href(file_value: str) -> str:
    if not file_value:
        return ""
    return "../" + str(file_value).replace("\\", "/").lstrip("/")


def rows_html(entries: list[dict]) -> str:
    if not entries:
        return '<tr><td colspan="7" class="empty">这一天没有添加记录。</td></tr>'
    rows = []
    for item in entries:
        file_value = str(item.get("file", ""))
        link = (
            f'<a href="{esc(file_href(file_value))}" target="_blank" rel="noopener">{esc(file_value)}</a>'
            if file_value else "—"
        )
        rows.append(
            "<tr>"
            f'<td class="time">{esc(item.get("time", ""))}</td>'
            f'<td class="word">{esc(item.get("word", ""))}</td>'
            f'<td>{esc(type_label(str(item.get("type", ""))))}</td>'
            f'<td>{esc(item.get("target", ""))}</td>'
            f"<td>{link}</td>"
            f'<td>{esc(item.get("schedule", "—"))}</td>'
            f'<td>{esc(item.get("status", ""))}</td>'
            "</tr>"
        )
    return "".join(rows)


def page_shell(title: str, subtitle: str, body: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{esc(title)}</title>
    <style>
        :root {{ --ink:#172033; --muted:#66738a; --line:#dfe5ef; --paper:#fffdf8; --accent:#3f5fd6; }}
        * {{ box-sizing:border-box; }}
        body {{ margin:0; padding:26px 16px 50px; background:#f4f7fc; color:var(--ink); font-family:"Noto Sans SC","Microsoft YaHei",sans-serif; line-height:1.7; }}
        .wrap {{ width:min(1180px,100%); margin:0 auto; }}
        .top {{ display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; margin-bottom:12px; }}
        .top a {{ color:var(--accent); text-decoration:none; font-weight:700; font-size:13px; }}
        .kicker {{ margin:0; color:var(--accent); font:700 10px/1.4 ui-monospace,Consolas,monospace; letter-spacing:.12em; }}
        h1 {{ margin:4px 0 4px; font-family:"Noto Serif SC",serif; font-size:clamp(24px,4vw,36px); }}
        .sub {{ margin:0 0 18px; color:var(--muted); font-size:12px; }}
        .stats {{ display:flex; flex-wrap:wrap; gap:8px; margin:0 0 16px; }}
        .stat {{ padding:8px 12px; background:var(--paper); border:1px solid var(--line); border-radius:8px; font-size:12px; }}
        .stat strong {{ color:var(--accent); }}
        .table-wrap {{ overflow-x:auto; background:var(--paper); border:1px solid var(--line); border-radius:10px; }}
        table {{ width:100%; border-collapse:collapse; font-size:12px; }}
        th {{ text-align:left; padding:10px; color:var(--muted); border-bottom:1px solid var(--line); white-space:nowrap; }}
        td {{ padding:9px 10px; border-bottom:1px solid #edf0f6; vertical-align:top; }}
        tr:last-child td {{ border-bottom:0; }}
        .time {{ white-space:nowrap; font-family:ui-monospace,Consolas,monospace; color:var(--muted); }}
        .word {{ font-weight:700; }}
        td a {{ color:var(--accent); word-break:break-all; }}
        .empty {{ padding:20px; text-align:center; color:var(--muted); }}
        .day-list {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:10px; }}
        .day {{ display:flex; justify-content:space-between; gap:10px; padding:12px 14px; background:var(--paper); border:1px solid var(--line); border-radius:9px; text-decoration:none; color:var(--ink); }}
        .day:hover {{ border-color:var(--accent); }}
        .day span {{ color:var(--muted); font-size:11px; }}
        .note {{ margin:14px 0 0; color:var(--muted); font-size:11px; }}
        @media (max-width:620px) {{ body {{ padding:18px 10px 36px; }} th,td {{ padding:7px; }} }}
    </style>
</head>
<body>
<div class="wrap">
    <div class="top">
        <a href="../添加日志.html">← 返回实时添加日志</a>
        <a href="../使用指南.html">使用指南</a>
    </div>
    <p class="kicker">VOCABULARY ADD LOG</p>
    <h1>{esc(title)}</h1>
    <p class="sub">{esc(subtitle)}</p>
    {body}
</div>
</body>
</html>
"""


def daily_html(date: str, entries: list[dict]) -> str:
    body = f"""
    <div class="stats">
        <div class="stat">日期 <strong>{esc(date)}</strong></div>
        <div class="stat">记录 <strong>{len(entries)}</strong> 条</div>
    </div>
    <div class="table-wrap"><table>
        <thead><tr><th>添加时间</th><th>单词</th><th>类型</th><th>分类 / 目标</th><th>文件</th><th>复习日程</th><th>状态</th></tr></thead>
        <tbody>{rows_html(entries)}</tbody>
    </table></div>
    <p class="note">这里记录的是“什么时候添加”，不是“排到哪一天复习”。</p>
    """
    return page_shell(f"添加日志 · {date}", f"{date} 的全部添加记录，共 {len(entries)} 条。", body)


def index_html(entries: list[dict]) -> str:
    grouped: dict[str, list[dict]] = {}
    for item in entries:
        day = date_of(item)
        if day:
            grouped.setdefault(day, []).append(item)

    days = sorted(grouped, reverse=True)
    if days:
        cards = "".join(
            f'<a class="day" href="{day}.html"><strong>{day}</strong><span>{len(grouped[day])} 条 →</span></a>'
            for day in days
        )
        body = f"""
        <div class="stats">
            <div class="stat">总记录 <strong>{len(entries)}</strong> 条</div>
            <div class="stat">有记录天数 <strong>{len(days)}</strong> 天</div>
            <div class="stat">最近添加 <strong>{esc(entries[0].get("time", "—")) if entries else "—"}</strong></div>
        </div>
        <div class="day-list">{cards}</div>
        <p class="note">实时页面最多显示最近 500 条；这里保留全部历史，按天打开。</p>
        """
    else:
        body = '<div class="table-wrap"><div class="empty">还没有添加记录。</div></div>'

    return page_shell("添加日志归档", "按天保存的完整添加记录；实时页面最多显示最近 500 条。", body)


def refresh() -> None:
    entries = load_entries()
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    grouped: dict[str, list[dict]] = {}
    for item in entries:
        day = date_of(item)
        if day:
            grouped.setdefault(day, []).append(item)

    expected: set[Path] = {ARCHIVE_DIR / "index.html"}
    for day, day_entries in grouped.items():
        target = ARCHIVE_DIR / (day + ".html")
        target.write_text(daily_html(day, day_entries), encoding="utf-8", newline="\n")
        expected.add(target)
    (ARCHIVE_DIR / "index.html").write_text(index_html(entries), encoding="utf-8", newline="\n")

    # 删除已经不存在日期对应的旧归档，保留 index.html。
    for old in ARCHIVE_DIR.glob("*.html"):
        if old.name != "index.html" and old not in expected:
            try:
                old.unlink()
            except OSError:
                pass


def _type_from_category(category: str) -> str:
    if "原子词" in category:
        return "atom"
    if "复合词" in category:
        return "compound"
    if "词根" in category or "本体" in category:
        return "root_family"
    return "root_family"


def recover_missing_extra_entries() -> list[dict]:
    """从 data.json + 单词文件创建时间，补回漏写的额外新增日志。

    只恢复 extra: true 的条目，不碰正常核心词排期。
    日志已有同名词时跳过，因此可以重复执行。
    """
    data_file = BASE / "复习清单" / "data.json"
    if not LOG_FILE.exists() or not data_file.exists():
        return []
    try:
        data = json.loads(data_file.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError):
        return []

    existing: set[str] = set()
    for line in LOG_FILE.read_text(encoding="utf-8-sig").splitlines():
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(item, dict) and item.get("word"):
            existing.add(str(item["word"]).strip().lower())

    recovered: list[dict] = []
    for category, items in data.items():
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict) or item.get("extra") is not True:
                continue
            word = str(item.get("name") or "").strip()
            if not word or word.lower() in existing:
                continue
            path_text = str(item.get("path") or "").split("#")[0]
            relative = path_text[3:] if path_text.startswith("../") else path_text
            word_file = BASE / relative
            if not word_file.exists():
                continue
            created_at = datetime.fromtimestamp(word_file.stat().st_ctime).strftime("%Y-%m-%d %H:%M:%S")
            entry = {
                "time": created_at,
                "word": word,
                "type": _type_from_category(category),
                "target": category,
                "file": str(relative),
                "schedule": str(item.get("nextDate") or ""),
                "status": "ok",
                "recovered": True,
                "source": "recovered-from-data",
            }
            recovered.append(entry)
            existing.add(word.lower())

    if not recovered:
        return []

    backup = LOG_FILE.with_name(LOG_FILE.name + ".recover-bak")
    try:
        shutil.copy2(LOG_FILE, backup)
    except OSError:
        pass
    with LOG_FILE.open("a", encoding="utf-8", newline="\n") as fh:
        for entry in recovered:
            fh.write(json.dumps(entry, ensure_ascii=False) + "\n")
    refresh()
    return recovered


if __name__ == "__main__":
    recovered = recover_missing_extra_entries()
    if recovered:
        print("补回添加日志 %d 条：" % len(recovered))
        for item in recovered:
            print("  %s  %s" % (item["time"], item["word"]))
    refresh()
    print("添加日志归档完成。")
