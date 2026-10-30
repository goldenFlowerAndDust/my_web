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
BASE = TOOL_DIR.parent
sys.path.insert(0, str(TOOL_DIR))

from math_tutor import (  # noqa: E402
    TutorError,
    ask_tutor,
    health,
    read_tutor_logs,
)

DEFAULT_PORT = 8768


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
        if path == "/api/health":
            self._send_json(200, health())
            return
        if path == "/api/tutor-log":
            from urllib.parse import parse_qs

            query = parse_qs(urlparse(self.path).query)
            category = (query.get("category") or ["all"])[0]
            try:
                limit = int((query.get("limit") or ["20"])[0])
            except ValueError:
                limit = 20
            try:
                self._send_json(200, read_tutor_logs(category, limit))
            except TutorError as exc:
                self._send_json(400, {"ok": False, "error": str(exc)})
            return
        if not self._safe_path():
            return
        super().do_GET()

    def do_POST(self):  # noqa: N802
        if urlparse(self.path).path != "/api/tutor":
            self._send_json(404, {"ok": False, "error": "未知接口。"})
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
            if length > 30000:
                raise ValueError("请求体过大。")
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            if not isinstance(payload, dict):
                raise ValueError("请求体必须是 JSON 对象。")
            result = ask_tutor(payload.get("mode"), payload.get("question"))
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


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    args = parser.parse_args()
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
