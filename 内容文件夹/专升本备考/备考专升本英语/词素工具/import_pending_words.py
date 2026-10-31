# -*- coding: utf-8 -*-
"""把答疑页导出的“云端待归档单词” JSON 逐词归档到本地词库。

用法：
    python 词素工具/import_pending_words.py "英语答疑待归档单词-xxxx.json"
    python 词素工具/import_pending_words.py "英语答疑待归档单词-xxxx.json" --write

默认只预览；加 --write 才调用分类并写入 HTML / data.json。
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from word_archiver import ArchiveError, archive_word, normalize_word

WORD_RE = re.compile(r"^[A-Za-z][A-Za-z'-]{1,40}$")


def load_entries(path: Path) -> list[dict]:
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


def main() -> int:
    parser = argparse.ArgumentParser(description="导入云端待归档单词")
    parser.add_argument("file", help="答疑页导出的待归档单词 JSON")
    parser.add_argument("--write", action="store_true", help="真正分类并写入；不加只预览")
    args = parser.parse_args()

    path = Path(args.file).expanduser()
    if not path.is_absolute():
        path = (Path.cwd() / path).resolve()
    if not path.exists():
        print("找不到文件：%s" % path)
        return 1

    try:
        entries = load_entries(path)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print("读取失败：%s" % exc)
        return 1

    words = []
    seen = set()
    skipped = 0
    for item in entries:
        raw = str(item.get("word") or "").strip()
        if not WORD_RE.fullmatch(raw):
            skipped += 1
            continue
        word = normalize_word(raw)
        if word in seen:
            skipped += 1
            continue
        seen.add(word)
        words.append(word)

    print("待归档：%d 个（跳过无效/重复 %d 个）" % (len(words), skipped))
    if not words:
        return 0

    if not args.write:
        print("预览：" + "、".join(words))
        print("加 --write 才会真正分类并写入。")
        return 0

    ok = 0
    existing = 0
    repaired = 0
    failed = 0
    for word in words:
        try:
            result = archive_word(word, "来自生成器云端待归档")
            if result.get("needs_repair"):
                result = archive_word(word, "来自生成器云端待归档", overwrite=True)
                if result.get("overwritten"):
                    repaired += 1
                    print("%s：页面存在、data.json 缺失，已重新分析并补写 data.json" % word)
                else:
                    failed += 1
                    print("%s：页面存在但补写失败" % word)
                continue
            if result.get("exists"):
                existing += 1
                print("%s：已存在，跳过" % word)
            else:
                location = result.get("location") or {}
                schedule = (result.get("data") or {}).get("schedule", "")
                print("%s：写入 %s；额外新增 %s" % (
                    word,
                    location.get("target", ""),
                    schedule,
                ))
                ok += 1
        except (ArchiveError, OSError, ValueError) as exc:
            failed += 1
            print("%s：失败：%s" % (word, exc))

    print("")
    print("完成：新写入 %d，已存在 %d，修复孤儿页面 %d，失败 %d" % (
        ok, existing, repaired, failed
    ))
    return 0 if failed == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
