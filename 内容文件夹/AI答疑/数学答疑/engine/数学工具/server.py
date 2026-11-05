# -*- coding: utf-8 -*-
"""本地 HTTP 服务：数学答疑页 + 数学答疑 API。

运行：
    python 数学工具/server.py
然后打开：
    http://127.0.0.1:8768/数学答疑/数学答疑.html
"""

from __future__ import annotations

import json
import posixpath
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

TOOL_DIR = Path(__file__).resolve().parent
CONTENT_ROOT = Path(__file__).resolve().parents[4]
AI_ROOT = CONTENT_ROOT / "AI答疑"
CONVERSATION_DIR = AI_ROOT / "共享配置"
sys.path.insert(0, str(TOOL_DIR))
sys.path.insert(0, str(CONVERSATION_DIR))
BASE = CONTENT_ROOT / "专升本备考" / "备考专升本数学"

from math_tutor import (  # noqa: E402
    TutorError,
    ask_tutor,
    delete_tutor_log,
    health,
    read_tutor_logs,
)
from 对话历史 import ConversationError, delete_window, read_document, remove_round, upsert_window  # noqa: E402

DEFAULT_PORT = 8768
SHARED_DIR = Path(__file__).resolve().parent.parent.parent.parent / "共享工具"
if str(SHARED_DIR) not in sys.path:
    sys.path.insert(0, str(SHARED_DIR))


def _conversation_action(payload: dict) -> dict:
    action = str(payload.get("action") or "upsert")
    if action == "upsert":
        window = upsert_window(
            "math",
            payload.get("window_id"),
            payload.get("title") or "新对话",
            payload.get("messages") or [],
            mode=str(payload.get("mode") or ""),
            language=str(payload.get("language") or ""),
            language_name=str(payload.get("language_name") or ""),
            topic=str(payload.get("topic") or ""),
        )
        return {"ok": True, "window": window, "document": read_document("math")}
    if action == "remove_round":
        window = remove_round("math", payload.get("window_id"), int(payload.get("round") or 0))
        return {"ok": True, "window": window, "document": read_document("math")}
    if action == "delete_window":
        deleted = delete_window("math", payload.get("window_id"))
        return {"ok": True, "deleted": deleted, "document": read_document("math")}
    raise ConversationError("未知对话历史操作：%s" % action)


def refresh_archive() -> None:
    try:
        from 归档答疑历史 import refresh
        refresh("math")
    except Exception as exc:  # noqa: BLE001
        print("答疑归档更新失败（不影响服务）：%s" % exc)


class Handler(SimpleHTTPRequestHandler):
    server_version = "MathTutor/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE), **kwargs)

    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _safe_path(self) -> bool:
        raw = unquote(urlparse(self.path).path)
        path = posixpath.normpath(raw)
        # 不通过静态服务暴露 API Key、日志和工具目录。
        if path.startswith("/数学工具") or "/数学工具/" in path:
            self.send_error(403, "Forbidden")
            return False
        if path.startswith("/.git") or path.startswith("/.dsh"):
            self.send_error(403, "Forbidden")
            return False
        return True

    def do_GET(self):  # noqa: N802
        path = unquote(urlparse(self.path).path)
        if path == "/api/conversations":
            try:
                self._send_json(200, {"ok": True, "document": read_document("math")})
            except ConversationError as exc:
                self._send_json(400, {"ok": False, "error": str(exc)})
            return
        if path == "/api/health":
            self._send_json(200, health())
            return
        if path == "/api/tutor-log":
            from urllib.parse import parse_qs

            query = parse_qs(urlparse(self.path).query)
            category = (query.get("category") or ["all"])[0]
            topic = (query.get("topic") or ["all"])[0]
            try:
                limit = int((query.get("limit") or ["20"])[0])
            except ValueError:
                limit = 20
            try:
                self._send_json(200, read_tutor_logs(category, limit, topic))
            except TutorError as exc:
                self._send_json(400, {"ok": False, "error": str(exc)})
            return
        if not self._safe_path():
            return
        super().do_GET()

    def do_POST(self):  # noqa: N802
        path = urlparse(self.path).path
        if path not in {"/api/tutor", "/api/tutor-log-delete", "/api/conversations"}:
            self._send_json(404, {"ok": False, "error": "未知接口。"})
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
            if length > 30000:
                raise ValueError("请求体过大。")
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            if not isinstance(payload, dict):
                raise ValueError("请求体必须是 JSON 对象。")
            if path == "/api/conversations":
                result = _conversation_action(payload)
                self._send_json(200, result)
                return

            if path == "/api/tutor":
                result = ask_tutor(
                    payload.get("mode"),
                    payload.get("question"),
                    payload.get("topic"),
                    payload.get("history"),
                    payload.get("conversation_id"),
                )
            else:
                result = delete_tutor_log(
                    payload.get("mode"),
                    payload.get("created_at"),
                    payload.get("time"),
                )
            refresh_archive()
            self._send_json(200, result)
        except ValueError as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})
        except TutorError as exc:
            self._send_json(400, {"ok": False, "error": str(exc)})
        except Exception as exc:  # noqa: BLE001
            self._send_json(500, {"ok": False, "error": "服务内部错误：%s" % exc})

    def do_OPTIONS(self):  # noqa: N802
        self.send_response(204)
        self.end_headers()

    def end_headers(self):
        self._cors()
        super().end_headers()


def archive_conversation_history() -> None:
    try:
        from 归档对话历史 import archive_once
        files = archive_once()
        if files:
            print("对话历史已归档：%d 个文件" % len(files))
    except Exception as exc:  # noqa: BLE001
        print("对话历史归档失败（不影响服务）：%s" % exc)


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    args = parser.parse_args()
    archive_conversation_history()
    refresh_archive()
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print("数学答疑服务已启动：http://127.0.0.1:%d/数学答疑/数学答疑.html" % args.port)
    print("健康检查：http://127.0.0.1:%d/api/health" % args.port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
