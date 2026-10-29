# -*- coding: utf-8 -*-
"""把浏览器下载的答疑 JSON 整理到项目的“云端下载”子文件夹。

用法：
    双击 整理云端下载.bat
或：
    python 词素工具/organize_cloud_downloads.py
"""

from __future__ import annotations

import shutil
from datetime import datetime
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
ROOT = BASE / "云端下载"
TARGETS = {
    "英语答疑记录-*.json": ROOT / "答疑归档",
    "英语答疑待归档单词-*.json": ROOT / "待归档单词",
}
SOURCES = [
    Path.home() / "Downloads",
    ROOT,
    BASE,
]


def unique_target(folder: Path, name: str) -> Path:
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / name
    if not target.exists():
        return target
    stem = target.stem
    suffix = target.suffix
    for index in range(1, 1000):
        candidate = folder / f"{stem}-{index}{suffix}"
        if not candidate.exists():
            return candidate
    raise RuntimeError("目标文件重名太多：%s" % target)


def main() -> int:
    for folder in TARGETS.values():
        folder.mkdir(parents=True, exist_ok=True)

    moved = 0
    skipped = 0
    seen = set()

    for pattern, folder in TARGETS.items():
        for source in SOURCES:
            if not source.exists():
                continue
            for path in sorted(source.glob(pattern)):
                if not path.is_file():
                    continue
                resolved = path.resolve()
                if resolved in seen:
                    continue
                seen.add(resolved)
                target = unique_target(folder, path.name)
                try:
                    shutil.move(str(path), str(target))
                    moved += 1
                    print("移动：%s -> %s" % (path, target))
                except OSError as exc:
                    skipped += 1
                    print("跳过：%s（%s）" % (path, exc))

    print("")
    print("完成：移动 %d 个，跳过 %d 个。" % (moved, skipped))
    print("答疑记录目录：%s" % (ROOT / "答疑归档"))
    print("待归档单词目录：%s" % (ROOT / "待归档单词"))
    if moved == 0:
        print("没有找到可整理的 JSON。请确认浏览器下载目录，或先导出。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
