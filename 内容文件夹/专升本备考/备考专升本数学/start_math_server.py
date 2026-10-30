# -*- coding: utf-8 -*-
"""ASCII-path launcher for 数学工具/server.py."""
from pathlib import Path
import runpy
import sys

BASE = Path(__file__).resolve().parent
TARGET = BASE / "数学工具" / "server.py"

if not TARGET.exists():
    raise SystemExit("找不到 数学工具/server.py")

sys.path.insert(0, str(TARGET.parent))
sys.argv[0] = str(TARGET)
runpy.run_path(str(TARGET), run_name="__main__")
