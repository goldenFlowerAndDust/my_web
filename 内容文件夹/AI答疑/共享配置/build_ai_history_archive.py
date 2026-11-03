# -*- coding: utf-8 -*-
"""构建 AI 历史归档：按 AI/分类/年月/5MB 分片，并生成兼容聚合文件。"""

from __future__ import annotations

import hashlib
import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Iterable

BASE = Path(__file__).resolve().parents[2]
AI_ROOT = BASE / "AI答疑"
def write_json_stable(path: Path, payload: dict[str, Any]) -> None:
    """内容未变化时不重写文件，避免 generated_at 无意义地变化。"""
    if path.exists():
        try:
            old = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError, json.JSONDecodeError):
            old = None
        if isinstance(old, dict):
            old_cmp = dict(old)
            new_cmp = dict(payload)
            old_cmp.pop("generated_at", None)
            new_cmp.pop("generated_at", None)
            if old_cmp == new_cmp:
                return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


ARCHIVE = AI_ROOT / "历史归档"
MAX_BYTES = 5 * 1024 * 1024
MAX_ANSWER = 500_000

ENGLISH = BASE / "专升本备考" / "备考专升本英语"
MATH = BASE / "专升本备考" / "备考专升本数学"
PROGRAMMING = BASE / "AI" / "编程语言AI"


def read_jsonl(path: Path) -> Iterable[dict[str, Any]]:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(item, dict):
            yield item


def load_aggregate(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError):
        return []
    entries = data.get("entries") if isinstance(data, dict) else data
    return [item for item in entries if isinstance(item, dict)] if isinstance(entries, list) else []


def date_of(item: dict[str, Any]) -> str:
    value = str(item.get("date") or item.get("time") or "")
    return value[:10] if len(value) >= 10 else ""


def month_of(item: dict[str, Any]) -> str:
    day = date_of(item)
    return day[:7] if len(day) >= 7 else ""


def month_label(month: str) -> str:
    if len(month) != 7:
        return "未知月份"
    return "%s年%s月" % (month[:4], month[5:7])


def safe(name: str) -> str:
    return str(name).replace("\\", "-").replace("/", "-").replace(":", "-").strip() or "其他"


def normalize(item: dict[str, Any], subject: str, category: str) -> dict[str, Any] | None:
    question = str(item.get("question") or "").strip()
    answer = str(item.get("answer") or "").strip()
    day = date_of(item)
    if not question or not day:
        return None
    if len(answer) > MAX_ANSWER:
        answer = answer[:MAX_ANSWER] + "\n\n[回答过长，已截断]"
    record = {
        "id": hashlib.sha1(("%s|%s|%s|%s" % (subject, category, day, question)).encode("utf-8")).hexdigest()[:16],
        "date": day,
        "time": str(item.get("time") or day).strip(),
        "subject": subject,
        "category": safe(category or "其他"),
        "question": question,
        "answer": answer,
    }
    if subject == "编程":
        names = {"python": "Python", "javascript": "JavaScript", "web": "HTML + CSS", "mysql": "MySQL", "node": "Node.js"}
        record["language"] = category
        record["language_name"] = names.get(category, category)
        record["mode"] = category
    else:
        record["mode"] = category
    for key in ("topic", "model", "duration_ms"):
        if item.get(key) not in (None, ""):
            record[key] = item[key]
    return record


def collect() -> dict[tuple[str, str], list[dict[str, Any]]]:
    grouped: dict[tuple[str, str], dict[str, dict[str, Any]]] = defaultdict(dict)

    def add(subject: str, category: str, item: dict[str, Any]) -> None:
        record = normalize(item, subject, category)
        if not record:
            return
        key = record["id"]
        bucket = grouped[(subject, record["category"])]
        old = bucket.get(key)
        if old is None or len(record.get("answer") or "") > len(old.get("answer") or ""):
            bucket[key] = record

    # 英语：聚合文件 + 原始分类日志
    for item in load_aggregate(AI_ROOT / "英语答疑" / "答疑历史.json"):
        add("英语", str(item.get("mode") or "其他"), item)
    for base in (ENGLISH / "词素工具" / "英语问答日志", AI_ROOT / "英语答疑" / "engine" / "词素工具" / "英语问答日志"):
        for path in sorted(base.glob("*.jsonl")):
            for item in read_jsonl(path):
                add("英语", path.stem, item)

    # 数学：聚合文件 + 原始分类日志
    for item in load_aggregate(AI_ROOT / "数学答疑" / "答疑历史.json"):
        add("数学", str(item.get("mode") or "其他"), item)
    for base in (MATH / "数学工具" / "数学问答日志", AI_ROOT / "数学答疑" / "engine" / "数学工具" / "数学问答日志"):
        for path in sorted(base.glob("*.jsonl")):
            for item in read_jsonl(path):
                add("数学", path.stem, item)

    # 已生成的历史分片也作为来源，避免兼容文件被覆盖后丢失旧记录。
    if ARCHIVE.exists():
        for path in sorted(ARCHIVE.rglob("*.json")):
            if path.name == "manifest.json":
                continue
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue
            entries = data.get("entries") if isinstance(data, dict) else None
            if not isinstance(entries, list):
                continue
            subject = str(data.get("subject") or "")
            category = str(data.get("category") or "其他")
            if subject:
                for item in entries:
                    if isinstance(item, dict):
                        add(subject, category, item)

    # 编程：原始按语言 JSONL（新旧两处都读）
    for base in (PROGRAMMING / "history", AI_ROOT / "编程语言AI" / "history"):
        for path in sorted(base.glob("*/*.jsonl")):
            language = path.parent.name
            for item in read_jsonl(path):
                add("编程", language, item)

    return {key: sorted(value.values(), key=lambda x: str(x.get("time") or ""), reverse=True)
            for key, value in grouped.items()}


def write_parts(grouped: dict[tuple[str, str], list[dict[str, Any]]]) -> dict[str, Any]:
    old_manifest: dict[str, Any] = {}
    if (ARCHIVE / "manifest.json").exists():
        try:
            loaded = json.loads((ARCHIVE / "manifest.json").read_text(encoding="utf-8"))
            if isinstance(loaded, dict):
                old_manifest = loaded
        except (OSError, ValueError, json.JSONDecodeError):
            old_manifest = {}
    if ARCHIVE.exists():
        # 只重建生成目录，不删除其他用户文件。
        for path in sorted(ARCHIVE.rglob("*"), reverse=True):
            if path.is_file() and (path.name == "manifest.json" or path.name.startswith("第") and path.suffix == ".json"):
                path.unlink()
            elif path.is_dir() and not any(path.iterdir()):
                path.rmdir()

    manifest: dict[str, Any] = {"version": 1, "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "months": {}}
    for (subject, category), records in sorted(grouped.items()):
        by_month: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for record in records:
            by_month[month_of(record)].append(record)

        for month, month_records in sorted(by_month.items()):
            if not month:
                continue
            label = month_label(month)
            folder = ARCHIVE / label / subject / category
            folder.mkdir(parents=True, exist_ok=True)
            parts: list[dict[str, Any]] = []
            current: list[dict[str, Any]] = []
            current_size = 0
            index = 1

            def flush() -> None:
                nonlocal current, current_size, index
                if not current:
                    return
                payload = {
                    "month": label,
                    "subject": subject,
                    "category": category,
                    "part": index,
                    "count": len(current),
                    "entries": current,
                }
                body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
                path = folder / ("第%02d个.json" % index)
                path.write_text(body + "\n", encoding="utf-8")
                parts.append({
                    "part": index,
                    "file": str(path.relative_to(ARCHIVE)).replace("\\", "/"),
                    "count": len(current),
                    "bytes": path.stat().st_size,
                })
                index += 1
                current = []
                current_size = 0

            for record in month_records:
                record_size = len(json.dumps(record, ensure_ascii=False, separators=(",", ":"))) + 1
                if current and (current_size + record_size > MAX_BYTES or len(current) >= 1000):
                    flush()
                current.append(record)
                current_size += record_size
            flush()

            month_item = manifest["months"].setdefault(label, {"month": month, "subjects": {}})
            month_item["subjects"].setdefault(subject, {}).setdefault(category, []).extend(parts)

    # 根 manifest
    if old_manifest.get("months") == manifest.get("months") and old_manifest.get("generated_at"):
        manifest["generated_at"] = old_manifest["generated_at"]
    ARCHIVE.mkdir(parents=True, exist_ok=True)
    write_json_stable(ARCHIVE / "manifest.json", manifest)

    # 每个月份再放一份小 manifest，页面按月份加载。
    for label, month_item in manifest["months"].items():
        folder = ARCHIVE / label
        folder.mkdir(parents=True, exist_ok=True)
        write_json_stable(folder / "manifest.json", month_item)
    return manifest


def write_compatibility(grouped: dict[tuple[str, str], list[dict[str, Any]]]) -> None:
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    for subject, folder, filename in (
        ("英语", AI_ROOT / "英语答疑", "答疑历史.json"),
        ("数学", AI_ROOT / "数学答疑", "答疑历史.json"),
    ):
        entries = [item for (s, _), rows in grouped.items() if s == subject for item in rows]
        entries.sort(key=lambda x: str(x.get("time") or ""), reverse=True)
        payload = {"generated_at": now, "source": "历史归档兼容视图", "subject": subject, "count": len(entries), "entries": entries}
        folder.mkdir(parents=True, exist_ok=True)
        write_json_stable(folder / filename, payload)

    entries = [item for (s, _), rows in grouped.items() if s == "编程" for item in rows]
    entries.sort(key=lambda x: str(x.get("time") or ""), reverse=True)
    payload = {"generated_at": now, "count": len(entries), "records": entries}
    folder = AI_ROOT / "编程语言AI" / "history"
    folder.mkdir(parents=True, exist_ok=True)
    write_json_stable(folder / "index.json", payload)


if __name__ == "__main__":
    data = collect()
    manifest = write_parts(data)
    write_compatibility(data)
    print("groups:", len(data))
    print("months:", len(manifest.get("months") or {}))
    for (subject, category), rows in sorted(data.items()):
        print("%s / %s: %d" % (subject, category, len(rows)))
