"""把本地英语/数学答疑日志导出成 GitHub 可读取的静态 JSON。

生成文件：
  备考专升本英语/英语答疑/答疑历史.json
  备考专升本数学/数学答疑/答疑历史.json

GitHub Pages 没有本地 Python 服务，只能 fetch 仓库里的静态文件。
页面会把这份归档和云端 KV 的最新记录合并去重，所以：
  - 本地历史：来自这份 JSON
  - 移动端新问题：来自云端 KV

注意：归档会公开在 GitHub 仓库里，生成前请确认问答内容可以公开。
"""

from __future__ import annotations

import argparse
import json
import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any

CATEGORIES = {
    "english": {
        "label": "英语",
        "log_dir": Path("备考专升本英语") / "词素工具" / "英语问答日志",
        "output": Path("备考专升本英语") / "英语答疑" / "答疑历史.json",
        "files": {
            "单词解释": "单词解释.jsonl",
            "作文": "作文.jsonl",
            "句子分析": "句子分析.jsonl",
            "其他": "其他.jsonl",
        },
    },
    "math": {
        "label": "数学",
        "log_dir": Path("备考专升本数学") / "数学工具" / "数学问答日志",
        "output": Path("备考专升本数学") / "数学答疑" / "答疑历史.json",
        "files": {
            "题目讲解": "题目讲解.jsonl",
            "错题诊断": "错题诊断.jsonl",
            "概念公式": "概念公式.jsonl",
            "其他": "其他.jsonl",
        },
    },
}


def normalize_entry(item: dict[str, Any], mode: str) -> dict[str, Any] | None:
    question = str(item.get("question") or "").strip()
    answer = str(item.get("answer") or "").strip()
    if not question or not answer:
        return None
    entry = dict(item)
    entry["mode"] = str(entry.get("mode") or mode)
    entry["question"] = question
    entry["answer"] = answer
    return entry


def entry_key(item: dict[str, Any]) -> str:
    return "\u0001".join([
        str(item.get("created_at") or item.get("time") or ""),
        str(item.get("mode") or ""),
        str(item.get("question") or ""),
    ])


def read_entries(base: Path, subject: dict[str, Any]) -> list[dict[str, Any]]:
    folder = base / subject["log_dir"]
    found: dict[str, dict[str, Any]] = {}
    for mode, filename in subject["files"].items():
        path = folder / filename
        if not path.exists():
            continue
        try:
            lines = path.read_text(encoding="utf-8-sig").splitlines()
        except OSError as exc:
            print("读取失败 %s：%s" % (path, exc))
            continue
        for line in lines:
            line = line.strip()
            if not line:
                continue
            try:
                item = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(item, dict):
                continue
            entry = normalize_entry(item, mode)
            if entry:
                found[entry_key(entry)] = entry
    return sorted(
        found.values(),
        key=lambda item: str(item.get("time") or item.get("created_at") or ""),
        reverse=True,
    )


def read_archive_entries(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError, json.JSONDecodeError):
        return []
    entries = data.get("entries") if isinstance(data, dict) else None
    return [item for item in entries if isinstance(item, dict)] if isinstance(entries, list) else []


def merge_entries(
    existing: list[dict[str, Any]],
    incoming: list[dict[str, Any]],
    key_func,
) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}
    for item in existing + incoming:
        if isinstance(item, dict):
            merged[key_func(item)] = item
    return sorted(
        merged.values(),
        key=lambda item: str(item.get("time") or item.get("created_at") or ""),
        reverse=True,
    )


def write_archive(path: Path, subject_key: str, entries: list[dict[str, Any]]) -> None:
    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "source": "local-jsonl",
        "subject": subject_key,
        "count": len(entries),
        "entries": entries,
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    os.replace(temp, path)


def build_all(base: Path) -> dict[str, int]:
    counts: dict[str, int] = {}
    for key, subject in CATEGORIES.items():
        incoming = read_entries(base, subject)
        output = base / subject["output"]
        existing = read_archive_entries(output)
        if not incoming:
            print("%s：没有本地日志，保留已有归档不动。" % subject["label"])
            counts[key] = len(existing)
            continue
        entries = merge_entries(existing, incoming, entry_key)
        write_archive(output, key, entries)
        if len(entries) > len(incoming):
            print("%s：合并已有归档，共 %d 条（本次日志 %d 条）" % (
                subject["label"], len(entries), len(incoming)
            ))
        else:
            print("%s：已写入 %d 条历史归档：%s" % (subject["label"], len(entries), output))
        counts[key] = len(entries)
    counts["added_log"] = build_added_log(base)
    return counts


def added_log_key(item: dict[str, Any]) -> str:
    return "\u0001".join([
        str(item.get("time") or ""),
        str(item.get("word") or ""),
        str(item.get("type") or ""),
    ])


def build_added_log(base: Path) -> int:
    source = base / "备考专升本英语" / "词素工具" / "归档日志.jsonl"
    output = base / "备考专升本英语" / "添加日志" / "添加日志.json"
    if not source.exists():
        print("添加日志：没有本地 归档日志.jsonl，保留已有归档不动。")
        return 0
    entries: list[dict[str, Any]] = []
    try:
        lines = source.read_text(encoding="utf-8-sig").splitlines()
    except OSError as exc:
        print("添加日志读取失败：%s" % exc)
        return 0
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(item, dict):
            entries.append(item)
    if not entries:
        print("添加日志：本地没有记录，保留已有归档不动。")
        return 0
    entries.reverse()
    existing = read_archive_entries(output)
    entries = merge_entries(existing, entries, added_log_key)
    payload = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "source": "local-archived-log",
        "count": len(entries),
        "entries": entries,
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    temp = output.with_suffix(output.suffix + ".tmp")
    temp.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    os.replace(temp, output)
    print("添加日志：已写入 %d 条静态归档：%s" % (len(entries), output))
    return len(entries)


def main() -> int:
    parser = argparse.ArgumentParser(description="生成本地答疑历史静态 JSON")
    parser.add_argument("--base", default="", help="专升本备考根目录")
    args = parser.parse_args()
    base = Path(args.base).expanduser().resolve() if args.base else Path(__file__).resolve().parent.parent
    build_all(base)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
