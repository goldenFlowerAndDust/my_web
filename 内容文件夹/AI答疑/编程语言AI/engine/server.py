# -*- coding: utf-8 -*-
"""编程语言 AI 答疑：本地 8769 服务。"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, quote, urlparse

TOOL_DIR = Path(__file__).resolve().parent.parent
CONTENT_DIR = TOOL_DIR.parent.parent
SKILL_DIR = TOOL_DIR / "skills"
HISTORY_DIR = TOOL_DIR / "history"
API_URL = "https://api.deepseek.com/chat/completions"
MODEL = "deepseek-chat"
PORT = 8769

LANGUAGES = [
    {
        "id": "python",
        "name": "Python",
        "skill": "python.md",
        "blog": [("Python 博客", "../../自建本地网站/导航栏内容/博客/python博客.html")],
    },
    {
        "id": "javascript",
        "name": "JavaScript",
        "skill": "javascript.md",
        "blog": [("JavaScript 博客", "../../自建本地网站/导航栏内容/博客/JavaScript博客.html")],
    },
    {
        "id": "web",
        "name": "HTML + CSS",
        "skill": "web.md",
        "blog": [
            ("HTML 博客", "../../自建本地网站/导航栏内容/博客/HTML博客.html"),
            ("CSS 博客", "../../自建本地网站/导航栏内容/博客/CSS博客.html"),
        ],
    },
    {
        "id": "mysql",
        "name": "MySQL",
        "skill": "mysql.md",
        "blog": [("MySQL 博客", "../../自建本地网站/导航栏内容/博客/MySQL博客.html")],
    },
    {
        "id": "node",
        "name": "Node.js",
        "skill": "node.md",
        "blog": [("Node.js 博客", "../../自建本地网站/导航栏内容/博客/Node.js博客.html")],
    },
]
BY_ID = {item["id"]: item for item in LANGUAGES}


def read_api_key() -> str:
    env_key = str(os.environ.get("DEEPSEEK_API_KEY", "")).strip()
    if env_key:
        return env_key
    candidates = [
        TOOL_DIR / "API.txt",
        CONTENT_DIR / "AI答疑" / "共享配置" / "API.txt",
        CONTENT_DIR / "专升本备考" / "共享配置" / "API.txt",
        Path.home() / ".dsh" / "deepseek_api_key.txt",
    ]
    for path in candidates:
        try:
            key = path.read_text(encoding="utf-8-sig").strip()
        except OSError:
            continue
        if key:
            return key
    return ""


def read_skill(language: str) -> str:
    item = BY_ID.get(language)
    if not item:
        raise ValueError("未知语言")
    path = SKILL_DIR / item["skill"]
    if not path.exists():
        raise FileNotFoundError("找不到技能预设：%s" % path.name)
    return path.read_text(encoding="utf-8")


def build_prompt(language: str, question: str) -> tuple[str, str]:
    item = BY_ID[language]
    skill = read_skill(language)
    system = (
        "你是一位严谨、耐心的编程导师，当前答疑语言/技术栈：%s。\n"
        "请严格遵循下面的技能预设。\n\n"
        "通用规则：\n"
        "1. 用中文回答，代码和专有名词保持原样。\n"
        "2. 只输出 Markdown 正文，不要输出 HTML 页面、JSON 包裹或系统说明。\n"
        "3. 先判断问题类型，再给结论/步骤；代码必须完整可运行，不能省略关键部分。\n"
        "4. 不确定的 API、版本或行为要明确说明，不要编造。\n"
        "5. 代码块使用 ```语言 围栏，并标注语言。\n"
        "6. 最后指出最容易出错的一步或一个常见误区。\n\n"
        "===== 技能预设 =====\n%s\n===== 技能预设结束 ====="
    ) % (item["name"], skill)
    user = "请回答下面的 %s 问题：\n\n%s" % (item["name"], question)
    return system, user


def normalize_usage(raw: object) -> dict[str, int]:
    if not isinstance(raw, dict):
        return {}
    keys = (
        "prompt_tokens", "completion_tokens", "total_tokens",
        "prompt_cache_hit_tokens", "prompt_cache_miss_tokens",
    )
    usage: dict[str, int] = {}
    for key in keys:
        try:
            usage[key] = int(raw.get(key) or 0)
        except (TypeError, ValueError):
            usage[key] = 0
    usage["total_tokens"] = usage.get("total_tokens") or (
        usage.get("prompt_tokens", 0) + usage.get("completion_tokens", 0)
    )
    return usage


def clean_history(history: object, max_messages: int = 40) -> list[dict[str, str]]:
    if not isinstance(history, list):
        return []
    result: list[dict[str, str]] = []
    for item in history[-max_messages:]:
        if not isinstance(item, dict):
            continue
        role = str(item.get("role") or "").strip()
        content = str(item.get("content") or "").strip()
        if role not in {"user", "assistant"} or not content:
            continue
        result.append({"role": role, "content": content[:12000]})
    return result


def call_deepseek(system: str, user: str, history: object = None) -> tuple[str, dict[str, int]]:
    key = read_api_key()
    if not key:
        raise ValueError(
            "缺少 DeepSeek API Key。请写入 内容文件夹/AI答疑/共享配置/API.txt，"
            "或设置环境变量 DEEPSEEK_API_KEY。"
        )
    messages = [{"role": "system", "content": system}]
    messages.extend(clean_history(history))
    messages.append({"role": "user", "content": user})
    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": 0.3,
        "max_tokens": 3200,
    }
    request = urllib.request.Request(
        API_URL,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Bearer " + key,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            raw = response.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:500]
        raise RuntimeError("DeepSeek API 返回 HTTP %s：%s" % (exc.code, detail)) from exc
    except urllib.error.URLError as exc:
        raise RuntimeError("无法连接 DeepSeek API：%s" % exc.reason) from exc
    except TimeoutError as exc:
        raise RuntimeError("DeepSeek API 请求超时。") from exc
    try:
        data = json.loads(raw)
        answer = str(data["choices"][0]["message"]["content"]).strip()
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise RuntimeError("DeepSeek API 响应格式异常。") from exc
    if not answer:
        raise RuntimeError("AI 没有返回内容，请换一种问法。")
    return answer, normalize_usage(data.get("usage"))


def append_history(language: str, question: str, answer: str, conversation_id: str = "", usage: object = None) -> None:
    now = datetime.now()
    day = now.strftime("%Y-%m-%d")
    record = {
        "time": now.strftime("%Y-%m-%d %H:%M:%S"),
        "date": day,
        "language": language,
        "language_name": BY_ID[language]["name"],
        "conversation_id": str(conversation_id or "").strip()[:64],
        "question": question,
        "answer": answer,
        "usage": normalize_usage(usage),
    }
    folder = HISTORY_DIR / language
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / (day + ".jsonl")
    with path.open("a", encoding="utf-8", newline="\n") as fh:
        fh.write(json.dumps(record, ensure_ascii=False) + "\n")


def read_history(language: str = "", limit: int = 30) -> list[dict[str, Any]]:
    if not HISTORY_DIR.exists():
        return []
    root = HISTORY_DIR / language if language else HISTORY_DIR
    if not root.exists():
        return []
    records: list[dict[str, Any]] = []
    for path in sorted(root.rglob("*.jsonl")):
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            try:
                item = json.loads(line)
            except json.JSONDecodeError:
                continue
            if not isinstance(item, dict):
                continue
            if language and item.get("language") != language:
                continue
            records.append(item)
    records.sort(key=lambda item: str(item.get("time") or ""))
    return records[-max(1, min(limit, 100)):][::-1]


def ask(language: str, question: str, history: object = None, conversation_id: str = "") -> dict[str, Any]:
    language = str(language or "").strip()
    question = str(question or "").strip()
    if language not in BY_ID:
        raise ValueError("请选择有效语言。")
    if not question:
        raise ValueError("请输入问题。")
    if len(question) > 20000:
        raise ValueError("问题太长，请精简到 20000 字以内。")
    system, user = build_prompt(language, question)
    answer, usage = call_deepseek(system, user, history)
    append_history(language, question, answer, conversation_id, usage)
    return {
        "ok": True,
        "language": language,
        "language_name": BY_ID[language]["name"],
        "answer": answer,
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "usage": usage,
        "conversation_id": str(conversation_id or "").strip()[:64],
    }


def json_response(handler, status: int, payload: dict[str, Any]) -> None:
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    handler.end_headers()
    handler.wfile.write(body)


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(CONTENT_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_OPTIONS(self):  # noqa: N802
        json_response(self, 200, {"ok": True})

    def do_GET(self):  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/api/health":
            skills = {item["id"]: (SKILL_DIR / item["skill"]).exists() for item in LANGUAGES}
            json_response(self, 200, {
                "ok": True,
                "service": "programming-tutor",
                "port": PORT,
                "api_key": bool(read_api_key()),
                "skills": skills,
                "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            })
            return
        if path == "/api/meta":
            json_response(self, 200, {"ok": True, "languages": LANGUAGES})
            return
        if path == "/api/history":
            query = parse_qs(parsed.query)
            language = (query.get("language") or [""])[0]
            try:
                limit = int((query.get("limit") or ["30"])[0])
            except ValueError:
                limit = 30
            json_response(self, 200, {"ok": True, "records": read_history(language, limit)})
            return
        if path == "/":
            self.send_response(302)
            self.send_header("Location", quote("/AI答疑/", safe="/"))
            self.end_headers()
            return
        return super().do_GET()

    def do_POST(self):  # noqa: N802
        path = urlparse(self.path).path
        if path != "/api/ask":
            json_response(self, 404, {"ok": False, "error": "未知接口。"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, json.JSONDecodeError):
            json_response(self, 400, {"ok": False, "error": "请求 JSON 格式不正确。"})
            return
        try:
            result = ask(payload.get("language"), payload.get("question"), payload.get("history"), payload.get("conversation_id"))
            json_response(self, 200, result)
        except ValueError as exc:
            json_response(self, 400, {"ok": False, "error": str(exc)})
        except Exception as exc:  # noqa: BLE001
            json_response(self, 500, {"ok": False, "error": str(exc)})

    def log_message(self, fmt, *args):
        sys.stderr.write("[%s] %s\n" % (datetime.now().strftime("%H:%M:%S"), fmt % args))


def main() -> None:
    global PORT
    if len(sys.argv) > 1:
        try:
            PORT = int(sys.argv[1])
        except ValueError:
            print("端口必须是数字。")
            return
    print("=" * 54)
    print("编程语言 AI 答疑")
    print("  地址: http://127.0.0.1:%d/" % PORT)
    print("  端口: %d（英语 8767 / 数学 8768 独立）" % PORT)
    print("  技能: %s" % SKILL_DIR)
    print("  按 Ctrl+C 停止")
    print("=" * 54)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止。")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
