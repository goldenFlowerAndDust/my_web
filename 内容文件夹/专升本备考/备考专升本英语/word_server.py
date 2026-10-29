# -*- coding: utf-8 -*-
"""ASCII-path launcher for 词素工具/server.py (used by 启动词素服务.bat)."""
from pathlib import Path
import runpy

BASE = Path(__file__).resolve().parent
SERVER = BASE / "词素工具" / "server.py"

if not SERVER.exists():
    raise SystemExit("找不到 词素工具/server.py")

runpy.run_path(str(SERVER), run_name="__main__")
