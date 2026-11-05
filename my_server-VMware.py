# -*- coding: utf-8 -*-
"""本机 HTTP 预览服务：用 http://127.0.0.1:8000 打开主页，而不是 file://。"""
from __future__ import annotations

import os
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("PORT", "8000"))
NO_STORE = {".html", ".htm", ".js", ".css", ".json", ".jsonl"}


class SmartHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        path = self.path.split("?", 1)[0]
        extension = os.path.splitext(path)[1].lower()
        if path in {"", "/"} or extension in NO_STORE:
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
            self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args))


def main() -> None:
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("0.0.0.0", PORT), SmartHandler)
    url = "http://127.0.0.1:%d/" % PORT
    print("服务器已启动：%s" % url)
    print("按 Ctrl+C 停止服务器")
    threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
