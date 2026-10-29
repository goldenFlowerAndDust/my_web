# -*- coding: utf-8 -*-
"""ASCII-path launcher for 词素工具/organize_cloud_downloads.py."""
from pathlib import Path
import runpy
import sys

BASE = Path(__file__).resolve().parent
TOOL_DIR = BASE / "词素工具"
TARGET = TOOL_DIR / "organize_cloud_downloads.py"

if not TARGET.exists():
    raise SystemExit("找不到 词素工具/organize_cloud_downloads.py")

sys.path.insert(0, str(TOOL_DIR))
sys.argv[0] = str(TARGET)
runpy.run_path(str(TARGET), run_name="__main__")
