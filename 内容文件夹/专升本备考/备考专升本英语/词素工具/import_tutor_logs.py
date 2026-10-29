# -*- coding: utf-8 -*-
"""把英语答疑页面导出的 JSON 记录合并到本地 JSONL 日志。

用法：
    python 词素工具/import_tutor_logs.py "英语答疑记录-2026-10-30-0315.json"
    python 词素工具/import_tutor_logs.py "英语答疑记录-2026-10-30-0315.json" --write

默认只预览，不写文件；加 --write 才真正写入。
"""

from __future__ import annotations

import argparse
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

from english_tutor import LOG_DIR, TUTOR_CATEGORIES

BACKUP_ROOT = LOG_DIR.parent / "英语问答日志备份"


def load_entries(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if isinstance(data, list):
        entries = data
    elif isinstance(data, dict):
        entries = data.get("entries") or []
    else:
        raise ValueError("文件格式不对：需要数组或包含 entries 的 JSON 对象。")
    if not isinstance(entries, list):
        raise ValueError("entries 不是数组。")
    return [item for item in entries if isinstance(item, dict)]


def normalize_entry(item: dict[str, Any]) -> dict[str, Any] | None:
    mode = str(item.get("mode") or "").strip()
    question = str(item.get("question") or "").strip()
    answer = str(item.get("answer") or "").strip()
    when = str(item.get("time") or "").strip()
    if mode not in TUTOR_CATEGORIES or not question or not answer or not when:
        return None
    result = {
        "time": when,
        "mode": mode,
        "question": question,
        "answer": answer,
        "model": str(item.get("model") or "deepseek-chat"),
        "duration_ms": item.get("duration_ms"),
        "status": "ok",
        "source": "imported",
    }
    return result


def dedupe_key(item: dict[str, Any]) -> str:
    return "|".join(
        [
            str(item.get("time", "")),
            str(item.get("mode", "")),
            str(item.get("question", "")),
        ]
    )


def read_existing(category: str) -> list[dict[str, Any]]:
    path = LOG_DIR / (category + ".jsonl")
    if not path.exists():
        return []
    result = []
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(item, dict):
            result.append(item)
    return result


def backup_logs() -> Path | None:
    if not LOG_DIR.exists():
        return None
    BACKUP_ROOT.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")
    target = BACKUP_ROOT / stamp
    shutil.copytree(LOG_DIR, target)
    return target


def write_category(category: str, entries: list[dict[str, Any]]) -> int:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    path = LOG_DIR / (category + ".jsonl")
    tmp = path.with_suffix(".jsonl.tmp")
    with tmp.open("w", encoding="utf-8", newline="\n") as fh:
        for item in entries:
            fh.write(json.dumps(item, ensure_ascii=False) + "\n")
    tmp.replace(path)
    return len(entries)


def main() -> int:
    parser = argparse.ArgumentParser(description="把英语答疑导出 JSON 合并到本地日志")
    parser.add_argument("file", help="页面导出的 JSON 文件")
    parser.add_argument("--write", action="store_true", help="真正写入；不加只预览")
    args = parser.parse_args()

    path = Path(args.file).expanduser()
    if not path.is_absolute():
        path = (Path.cwd() / path).resolve()
    if not path.exists():
        print("找不到文件：%s" % path)
        return 1

    try:
        raw_entries = load_entries(path)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print("读取失败：%s" % exc)
        return 1

    by_category: dict[str, list[dict[str, Any]]] = {name: [] for name in TUTOR_CATEGORIES}
    skipped = 0
    for item in raw_entries:
        normalized = normalize_entry(item)
        if not normalized:
            skipped += 1
            continue
        by_category[normalized["mode"]].append(normalized)

    total_new = 0
    total_duplicate = 0
    plans: dict[str, list[dict[str, Any]]] = {}

    for category, incoming in by_category.items():
        existing = read_existing(category)
        seen = {dedupe_key(item) for item in existing}
        merged = list(existing)
        added = 0
        duplicate = 0
        for item in incoming:
            key = dedupe_key(item)
            if key in seen:
                duplicate += 1
                continue
            seen.add(key)
            merged.append(item)
            added += 1
        plans[category] = merged
        total_new += added
        total_duplicate += duplicate
        print("%s：新增 %d，重复 %d，原文件 %d 条" % (category, added, duplicate, len(existing)))

    print("")
    print("合计：新增 %d，重复 %d，跳过无效 %d" % (total_new, total_duplicate, skipped))

    if not args.write:
        print("当前是预览，没有写入。加 --write 才会写入本地日志。")
        return 0

    if total_new == 0:
        print("没有需要写入的新记录。")
        return 0

    backup = backup_logs()
    if backup:
        print("已备份原日志：%s" % backup)

    for category, merged in plans.items():
        if merged:
            write_category(category, merged)
    print("已写入本地日志：%s" % LOG_DIR)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
