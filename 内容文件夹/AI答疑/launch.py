# -*- coding: utf-8 -*-
"""按需启动缺失的 AI 服务，并打开指定页面。"""

from __future__ import annotations

import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PYTHON = sys.executable
CREATE_NEW_CONSOLE = 0x00000010

SERVICES = {
    8767: (ROOT / "英语答疑" / "engine" / "词素工具", ["server.py"]),
    8768: (ROOT / "数学答疑" / "engine" / "数学工具", ["server.py", "--port", "8768"]),
    8769: (ROOT / "编程语言AI" / "engine", ["server.py"]),
}

PAGES = {
    "hub": "http://127.0.0.1:8769/AI答疑/",
    "english": "http://127.0.0.1:8769/AI答疑/英语答疑/英语答疑.html",
    "math": "http://127.0.0.1:8769/AI答疑/数学答疑/数学答疑.html",
    "code": "http://127.0.0.1:8769/AI答疑/编程语言AI/index.html",
}


def healthy(port: int) -> bool:
    try:
        with urllib.request.urlopen("http://127.0.0.1:%d/api/health" % port, timeout=1.5) as resp:
            return resp.status == 200
    except Exception:
        return False


def start(port: int) -> None:
    cwd, args = SERVICES[port]
    if healthy(port):
        print("%d 已运行" % port)
        return
    print("正在启动 %d ..." % port)
    subprocess.Popen(
        [PYTHON, *args],
        cwd=str(cwd),
        creationflags=CREATE_NEW_CONSOLE,
    )


def main() -> int:
    key = (sys.argv[1] if len(sys.argv) > 1 else "hub").strip().lower()
    url = PAGES.get(key, PAGES["hub"])
    for port in (8767, 8768, 8769):
        start(port)
    deadline = time.time() + 20
    while time.time() < deadline:
        if healthy(8769):
            break
        time.sleep(0.4)
    webbrowser.open(url, new=2)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
