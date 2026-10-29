# -*- coding: utf-8 -*-
"""
命令行入口（也是 DSH 技能调用的底层工具）。

用法：
    python 词素工具/auto_archive.py "friendship" --analyze
    python 词素工具/auto_archive.py "friendship" --write
    python 词素工具/auto_archive.py "sunflower" --write --json

--analyze 只调用 API 预览，不写入任何文件。
--write   分析并写入单词页/词素页，同时追加 data.json 的复习条目。
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

TOOL_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(TOOL_DIR))

from word_archiver import ArchiveError, analyze_only, archive_word, check_word  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description="DeepSeek 单词构词分析与自动归档")
    parser.add_argument("word", help="要分析的英文单词")
    parser.add_argument("--hint", default="", help="可选中文提示，帮助 API 判断词义")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--analyze", action="store_true", help="只分析，不写入文件")
    group.add_argument("--write", action="store_true", help="分析并写入；已录入则插队复习")
    group.add_argument("--check", action="store_true", help="只检查是否已录入，不调用 API")
    parser.add_argument("--json", action="store_true", help="输出完整 JSON")
    args = parser.parse_args()

    try:
        if args.check:
            result = check_word(args.word)
        elif args.analyze or not args.write:
            result = analyze_only(args.word, args.hint)
        else:
            result = archive_word(args.word, args.hint)
    except ArchiveError as exc:
        print("错误：" + str(exc), file=sys.stderr)
        return 2
    except Exception as exc:  # 保持 CLI 输出简洁，完整错误交给调用方决定是否打印
        print("未预期错误：%s" % exc, file=sys.stderr)
        return 3

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0

    if result.get("exists") or "analysis" not in result:
        print("单词：%s" % result.get("word", ""))
        print(("已录入" if result.get("exists") else "未录入") + "：" + result.get("message", ""))
        if result.get("data_category"):
            print("分类：%s" % result["data_category"])
        if result.get("page_file"):
            print("页面：%s" % result["page_file"])
        if result.get("review"):
            print("复习日程：%s（%s）" % (
                result["review"].get("schedule", ""),
                "新词" if result["review"].get("mode") == "new" else "复习",
            ))
        if result.get("backup"):
            print("备份：%s" % result["backup"])
        return 0

    analysis = result["analysis"]
    morph = analysis["morphology"]
    target = analysis["target"]
    print("单词：%s" % analysis["word"])
    print("释义：%s（%s，%s）" % (analysis["meaning_zh"], analysis["pos"], analysis["level"]))
    print("分类：%s" % target["label"])
    print("构词：%s" % morph.get("explanation", ""))
    print("词根：%s（%s）" % (morph.get("root", ""), morph.get("root_meaning_zh", "")))
    if result.get("location"):
        loc = result["location"]
        print("写入：%s" % loc.get("file", ""))
        print("目标：%s" % loc.get("target", ""))
    if result.get("data"):
        print("复习日程：%s" % result["data"].get("schedule", ""))
    if result.get("backup"):
        print("备份：%s" % result["backup"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
