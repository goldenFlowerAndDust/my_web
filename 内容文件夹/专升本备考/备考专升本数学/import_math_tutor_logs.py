# -*- coding: utf-8 -*-
"""ASCII-path launcher for 数学工具/import_math_tutor_logs.py."""
from pathlib import Path
import runpy
import sys

BASE = Path(__file__).resolve().parent
TOOL_DIR = BASE / "数学工具"
TARGET = TOOL_DIR / "import_math_tutor_logs.py"

if not TARGET.exists():
    raise SystemExit("找不到 数学工具/import_math_tutor_logs.py")

sys.path.insert(0, str(TOOL_DIR))
sys.argv[0] = str(TARGET)
runpy.run_path(str(TARGET), run_name="__main__")
