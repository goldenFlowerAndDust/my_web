"""把三科本地对话 JSON 生成为按月索引和详情分片。

输出：
    历史/<subject>/index.json
    历史/<subject>/YYYY-MM/index.json
    历史/<subject>/YYYY-MM/chunk-0001.json

浏览器先加载月份摘要，点击某个对话后再加载详情 chunk。
"""
from __future__ import annotations

import json
import os
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parents[1]
if str(BASE_DIR / "共享配置") not in sys.path:
    sys.path.insert(0, str(BASE_DIR / "共享配置"))
from 对话历史 import MAX_ROUNDS, SUBJECT_LABELS, read_history_document  # noqa: E402

OUTPUT_ROOT = BASE_DIR / "历史"
MONTH_RE = re.compile(r"^(\d{4}-\d{2})")
MAX_WINDOWS_PER_CHUNK = 100
MAX_CHUNK_BYTES = 2 * 1024 * 1024
HARD_CHUNK_BYTES = 5 * 1024 * 1024


def now_text() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def window_month(window: dict[str, Any]) -> str:
    for key in ("updated_at", "created_at"):
        value = window.get(key)
        if isinstance(value, (int, float)):
            try:
                value = datetime.fromtimestamp(float(value) / (1000 if float(value) > 100000000000 else 1)).strftime("%Y-%m-%d %H:%M:%S")
            except (ValueError, OSError, OverflowError):
                value = ""
        value = str(value or "")
        match = MONTH_RE.match(value)
        if match:
            return match.group(1)
    return "unknown"


def json_bytes(data: Any) -> bytes:
    return json.dumps(data, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def usage_cost(window: dict[str, Any]) -> tuple[int, float, list[int], list[float]]:
    total = 0
    cost = 0.0
    round_tokens: list[int] = []
    round_costs: list[float] = []
    for message in window.get("messages") or []:
        if message.get("role") != "assistant":
            continue
        usage = message.get("usage") if isinstance(message.get("usage"), dict) else {}
        prompt = int(usage.get("prompt_tokens") or 0)
        completion = int(usage.get("completion_tokens") or 0)
        count = int(usage.get("total_tokens") or 0) or prompt + completion
        hit = int(usage.get("prompt_cache_hit_tokens") or 0)
        miss = int(usage.get("prompt_cache_miss_tokens") or 0)
        if not hit and not miss:
            miss = prompt
        round_cost = (hit / 1000000.0) * 0.5 + (miss / 1000000.0) * 2.0 + (completion / 1000000.0) * 8.0
        round_tokens.append(count)
        round_costs.append(round_cost)
        total += count
        cost += round_cost
    return total, cost, round_tokens, round_costs


def format_money(value: float) -> str:
    if value < 0.01:
        return "¥%.6f" % value
    if value < 1:
        return "¥%.4f" % value
    return "¥%.2f" % value


def build_subject(subject: str) -> dict[str, Any]:
    document = read_history_document(subject)
    windows = document.get("windows") or {}
    deleted = document.get("deleted") or {}
    buckets: dict[str, list[dict[str, Any]]] = {}
    for window_id, window in windows.items():
        if not isinstance(window, dict):
            continue
        stamp = str(deleted.get(window_id) or "")
        updated = str(window.get("updated_at") or "")
        if stamp and stamp >= updated:
            continue
        window = dict(window)
        window["id"] = window.get("id") or window_id
        window["rounds"] = len(window.get("messages") or []) // 2
        window["max_rounds"] = MAX_ROUNDS[subject]
        buckets.setdefault(window_month(window), []).append(window)

    subject_tmp = OUTPUT_ROOT / (subject + ".tmp")
    if subject_tmp.exists():
        shutil.rmtree(subject_tmp)
    subject_tmp.mkdir(parents=True)

    months: list[dict[str, Any]] = []
    warnings: list[str] = []
    for month in sorted(buckets.keys()):
        items = sorted(buckets[month], key=lambda item: str(item.get("updated_at") or ""), reverse=True)
        month_dir = subject_tmp / month
        month_dir.mkdir(parents=True)
        chunks: list[dict[str, Any]] = []
        summaries: list[dict[str, Any]] = []
        current: dict[str, Any] = {}
        current_bytes = 2
        chunk_no = 1

        def flush() -> None:
            nonlocal current, current_bytes, chunk_no
            if not current:
                return
            name = "chunk-%04d.json" % chunk_no
            payload = {"version": 1, "month": month, "chunk": name, "windows": current}
            raw = json_bytes(payload)
            (month_dir / name).write_bytes(raw)
            chunks.append({"file": name, "count": len(current)})
            if len(raw) > HARD_CHUNK_BYTES:
                warnings.append("%s/%s 超过 5MB（%d 字节），已单独保留" % (subject, month, len(raw)))
            elif len(raw) > MAX_CHUNK_BYTES:
                warnings.append("%s/%s 超过 2MB（%d 字节），已按单窗口保留" % (subject, month, len(raw)))
            current = {}
            current_bytes = 2
            chunk_no += 1

        for window in items:
            token_total, token_cost, round_tokens, round_costs = usage_cost(window)
            window_raw = json_bytes(window)
            estimated = current_bytes + len(window_raw) + 2
            if current and (len(current) >= MAX_WINDOWS_PER_CHUNK or estimated > MAX_CHUNK_BYTES):
                flush()
            window_id = str(window.get("id"))
            current[window_id] = window
            summaries.append({
                "id": window_id,
                "title": str(window.get("title") or "新对话"),
                "created_at": str(window.get("created_at") or ""),
                "updated_at": str(window.get("updated_at") or ""),
                "rounds": int(window.get("rounds") or 0),
                "questions": [str(m.get("content") or "") for m in (window.get("messages") or []) if m.get("role") == "user"],
                "tokens": token_total,
                "cost": round(token_cost, 8),
                "cost_text": "≈RMB " + format_money(token_cost).lstrip("¥"),
                "round_tokens": round_tokens,
                "round_cost_texts": ["≈RMB " + format_money(value).lstrip("¥") for value in round_costs],
                "subject": subject,
                "language": str(window.get("language") or ""),
                "language_name": str(window.get("language_name") or ""),
                "mode": str(window.get("mode") or ""),
                "chunk": "chunk-%04d.json" % chunk_no,
            })
            current_bytes += len(window_raw) + 2
        flush()

        month_index = {
            "version": 1,
            "subject": subject,
            "month": month,
            "count": len(summaries),
            "updated_at": now_text(),
            "chunks": chunks,
            "windows": summaries,
        }
        (month_dir / "index.json").write_bytes(json_bytes(month_index))
        months.append({
            "month": month,
            "count": len(summaries),
            "chunks": [item["file"] for item in chunks],
            "updated_at": month_index["updated_at"],
        })

    index = {
        "version": 1,
        "subject": subject,
        "subject_label": SUBJECT_LABELS[subject],
        "updated_at": now_text(),
        "months": months,
    }
    (subject_tmp / "index.json").write_bytes(json_bytes(index))

    target = OUTPUT_ROOT / subject
    backup = OUTPUT_ROOT / (subject + ".old")
    if backup.exists():
        shutil.rmtree(backup)
    if target.exists():
        target.rename(backup)
    subject_tmp.rename(target)
    if backup.exists():
        shutil.rmtree(backup)
    return {"subject": subject, "months": months, "warnings": warnings}


def build_all() -> dict[str, Any]:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    results = {}
    for subject in ("english", "math", "code"):
        results[subject] = build_subject(subject)
    return {"ok": True, "updated_at": now_text(), "subjects": results}


if __name__ == "__main__":
    print(json.dumps(build_all(), ensure_ascii=False, indent=2))
