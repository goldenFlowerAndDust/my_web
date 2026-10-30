# -*- coding: utf-8 -*-
"""把数学答疑导出的 JSON 合并到本地数学问答日志。

用法：
    双击 导入数学答疑记录.bat
或：
    python 数学工具/import_math_tutor_logs.py "数学答疑记录-*.json" --write
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from datetime import datetime
from pathlib import Path

TOOL_DIR = Path(__file__).resolve().parent
BASE = TOOL_DIR.parent
sys.path.insert(0, str(TOOL_DIR))

from math_tutor import CATEGORY_FILES, LOG_DIR, TutorError, normalize_mode, normalize_topic  # noqa: E402

BACKUP_DIR = TOOL_DIR / "数学问答日志备份"


def load_entries(path: Path) -> list[dict]:
    raw = json.loads(path.read_text(encoding="utf-8-sig"))
    if isinstance(raw, dict) and isinstance(raw.get("entries"), list):
        entries = raw["entries"]
    elif isinstance(raw, list):
        entries = raw
    elif isinstance(raw, dict) and raw.get("answer"):
        entries = [raw]
    else:
        raise ValueError("JSON 里没有找到 entries 数组。")
    return [item for item in entries if isinstance(item, dict)]


def record_key(item: dict) -> tuple[str, str, str]:
    return (
        str(item.get("created_at", "")),
        str(item.get("time", "")),
        str(item.get("question", "")),
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("json_file")
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()

    path = Path(args.json_file)
    if not path.exists():
        print("找不到文件：%s" % path)
        return 1

    try:
        entries = load_entries(path)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print("读取失败：%s" % exc)
        return 1

    grouped: dict[str, list[dict]] = {}
    skipped = 0
    for item in entries:
        try:
            mode = normalize_mode(item.get("mode"))
        except TutorError:
            skipped += 1
            continue
        if not item.get("time") or not item.get("question") or not item.get("answer"):
            skipped += 1
            continue
        record = dict(item)
        record["mode"] = mode
        record["topic"] = normalize_topic(item.get("topic"))
        record["subject"] = "math"
        grouped.setdefault(mode, []).append(record)

    total_new = 0
    for mode, records in grouped.items():
        log_path = LOG_DIR / CATEGORY_FILES[mode]
        existing: list[dict] = []
        if log_path.exists():
            for line in log_path.read_text(encoding="utf-8-sig").splitlines():
                line = line.strip()
                if not line:
                    continue
                try:
                    item = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if isinstance(item, dict):
                    existing.append(item)

        seen = {record_key(item) for item in existing}
        added = []
        for item in records:
            key = record_key(item)
            if key in seen:
                continue
            seen.add(key)
            added.append(item)

        print("%s：新增 %d 条，重复 %d 条" % (mode, len(added), len(records) - len(added)))
        total_new += len(added)

        if args.write and added:
            LOG_DIR.mkdir(parents=True, exist_ok=True)
            if log_path.exists():
                stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
                backup = BACKUP_DIR / stamp
                backup.mkdir(parents=True, exist_ok=True)
                shutil.copy2(log_path, backup / log_path.name)
            with log_path.open("a", encoding="utf-8", newline="\n") as fh:
                for item in added:
                    fh.write(json.dumps(item, ensure_ascii=False) + "\n")

    print("")
    print("完成：新增 %d 条，跳过 %d 条。" % (total_new, skipped))
    if not args.write:
        print("当前是预览模式；加 --write 才会写入。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
