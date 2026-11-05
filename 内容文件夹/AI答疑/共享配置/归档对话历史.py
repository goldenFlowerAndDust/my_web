"""每天归档一次三科对话历史 JSON。

只归档有内容的文件；同一日期再次运行不会覆盖已有归档。
"""
from __future__ import annotations

import json
import shutil
from datetime import datetime
from pathlib import Path

AI_ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = AI_ROOT / "对话历史"
ARCHIVE_ROOT = AI_ROOT / "历史归档" / "对话历史"


def archive_once() -> list[Path]:
    day = datetime.now().strftime("%Y-%m-%d")
    target = ARCHIVE_ROOT / day
    target.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []
    for source in sorted(SOURCE_DIR.glob("*.json")):
        try:
            data = json.loads(source.read_text(encoding="utf-8-sig"))
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(data, dict) or not data.get("windows"):
            continue
        destination = target / source.name
        if destination.exists():
            try:
                if destination.read_bytes() == source.read_bytes():
                    continue
            except OSError:
                pass
        shutil.copyfile(source, destination)
        written.append(destination)
    return written


if __name__ == "__main__":
    paths = archive_once()
    if paths:
        for path in paths:
            print("归档：%s" % path)
    else:
        print("没有需要归档的对话历史。")
