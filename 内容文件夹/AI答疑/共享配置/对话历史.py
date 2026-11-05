"""三科统一的对话历史 JSON 数据层。

每个科目一个文件：
    内容文件夹/AI答疑/对话历史/english.json
    内容文件夹/AI答疑/对话历史/math.json
    内容文件夹/AI答疑/对话历史/code.json

每个问答窗口是 windows 的一个 key。
英语/数学最多 8 轮，编程最多 20 轮。
删除轮次后 rounds 立即下降，可以继续追加。
"""
from __future__ import annotations

import json
import os
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any

AI_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = AI_ROOT / "对话历史"
MAX_ROUNDS = {"english": 8, "math": 8, "code": 20}
SUBJECT_LABELS = {"english": "英语", "math": "数学", "code": "编程"}


class ConversationError(ValueError):
    pass


def now_text() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def path_for(subject: str) -> Path:
    subject = str(subject or "").strip()
    if subject not in MAX_ROUNDS:
        raise ConversationError("未知科目：%s" % subject)
    return DATA_DIR / (subject + ".json")


def empty_document(subject: str) -> dict[str, Any]:
    return {
        "version": 1,
        "subject": subject,
        "subject_label": SUBJECT_LABELS[subject],
        "updated_at": now_text(),
        "max_rounds": MAX_ROUNDS[subject],
        "windows": {},
        "deleted": {},
    }


def normalize_subject(subject: str) -> str:
    subject = str(subject or "").strip()
    if subject not in MAX_ROUNDS:
        raise ConversationError("未知科目：%s" % subject)
    return subject


def ensure_file(subject: str) -> Path:
    subject = normalize_subject(subject)
    path = path_for(subject)
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        write_document(subject, empty_document(subject))
    return path


def read_document(subject: str) -> dict[str, Any]:
    subject = normalize_subject(subject)
    path = path_for(subject)
    if not path.exists():
        return empty_document(subject)
    try:
        data = json.loads(path.read_text(encoding="utf-8-sig"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ConversationError("读取对话历史失败：%s" % exc) from exc
    if not isinstance(data, dict):
        raise ConversationError("对话历史顶层必须是对象。")
    data.setdefault("version", 1)
    data["subject"] = subject
    data["subject_label"] = SUBJECT_LABELS[subject]
    data["max_rounds"] = MAX_ROUNDS[subject]
    windows = data.get("windows")
    if not isinstance(windows, dict):
        windows = {}
    deleted = data.get("deleted")
    if not isinstance(deleted, dict):
        deleted = {}
    data["windows"] = windows
    data["deleted"] = deleted
    return data


def write_document(subject: str, data: dict[str, Any]) -> Path:
    subject = normalize_subject(subject)
    path = path_for(subject)
    path.parent.mkdir(parents=True, exist_ok=True)
    data["version"] = 1
    data["subject"] = subject
    data["subject_label"] = SUBJECT_LABELS[subject]
    data["max_rounds"] = MAX_ROUNDS[subject]
    data["updated_at"] = now_text()
    payload = json.dumps(data, ensure_ascii=False, indent=2, sort_keys=False) + "\n"
    fd, temp_name = tempfile.mkstemp(prefix=path.name + ".", suffix=".tmp", dir=str(path.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(payload)
        os.replace(temp_name, path)
    finally:
        if os.path.exists(temp_name):
            os.unlink(temp_name)
    return path


def window_rounds(window: dict[str, Any]) -> int:
    messages = window.get("messages") if isinstance(window, dict) else []
    if not isinstance(messages, list):
        return 0
    return len(messages) // 2


def normalize_messages(messages: Any) -> list[dict[str, str]]:
    if not isinstance(messages, list):
        return []
    result: list[dict[str, str]] = []
    for item in messages:
        if not isinstance(item, dict):
            continue
        role = str(item.get("role") or "")
        content = str(item.get("content") or "")
        if role not in {"user", "assistant"} or not content:
            continue
        message = {"role": role, "content": content}
        for key in ("html", "mode", "time", "language", "language_name"):
            if item.get(key):
                message[key] = str(item.get(key))
        if isinstance(item.get("usage"), dict):
            message["usage"] = item["usage"]
        result.append(message)
    return result


def upsert_window(
    subject: str,
    window_id: str,
    title: str,
    messages: list[dict[str, Any]],
    *,
    mode: str = "",
    language: str = "",
    language_name: str = "",
    topic: str = "",
) -> dict[str, Any]:
    subject = normalize_subject(subject)
    window_id = str(window_id or "").strip()
    if not window_id:
        raise ConversationError("窗口 ID 不能为空。")
    normalized = normalize_messages(messages)
    rounds = len(normalized) // 2
    if rounds > MAX_ROUNDS[subject]:
        raise ConversationError(
            "%s最多 %d 轮，当前 %d 轮。" % (SUBJECT_LABELS[subject], MAX_ROUNDS[subject], rounds)
        )
    data = read_document(subject)
    windows = data["windows"]
    existing = windows.get(window_id) if isinstance(windows.get(window_id), dict) else {}
    window = {
        "id": window_id,
        "title": str(title or "新对话")[:120],
        "created_at": existing.get("created_at") or now_text(),
        "updated_at": now_text(),
        "mode": str(mode or existing.get("mode") or ""),
        "language": str(language or existing.get("language") or ""),
        "language_name": str(language_name or existing.get("language_name") or ""),
        "topic": str(topic or existing.get("topic") or ""),
        "max_rounds": MAX_ROUNDS[subject],
        "rounds": rounds,
        "messages": normalized,
    }
    deleted = data.setdefault("deleted", {})
    deleted.pop(window_id, None)
    if not normalized:
        windows.pop(window_id, None)
        deleted[window_id] = now_text()
    else:
        windows[window_id] = window
    write_document(subject, data)
    return window


def remove_round(subject: str, window_id: str, round_index: int) -> dict[str, Any]:
    subject = normalize_subject(subject)
    data = read_document(subject)
    windows = data["windows"]
    window = windows.get(str(window_id))
    if not isinstance(window, dict):
        raise ConversationError("窗口不存在。")
    messages = normalize_messages(window.get("messages"))
    start = max(0, int(round_index)) * 2
    if start + 1 >= len(messages):
        raise ConversationError("轮次不存在。")
    messages = messages[:start] + messages[start + 2:]
    if not messages:
        windows.pop(str(window_id), None)
        data.setdefault("deleted", {})[str(window_id)] = now_text()
        write_document(subject, data)
        return {}
    window["messages"] = messages
    window["rounds"] = len(messages) // 2
    window["updated_at"] = now_text()
    first_user = next((m for m in messages if m.get("role") == "user"), None)
    if first_user:
        window["title"] = str(first_user.get("content") or "新对话")[:120]
    windows[str(window_id)] = window
    write_document(subject, data)
    return window


def delete_window(subject: str, window_id: str) -> bool:
    subject = normalize_subject(subject)
    data = read_document(subject)
    windows = data["windows"]
    if str(window_id) not in windows:
        return False
    windows.pop(str(window_id), None)
    data.setdefault("deleted", {})[str(window_id)] = now_text()
    write_document(subject, data)
    return True


def ensure_all() -> list[Path]:
    return [ensure_file(subject) for subject in MAX_ROUNDS]
