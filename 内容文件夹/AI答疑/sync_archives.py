from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
SYNC = BASE / "共享配置" / "同步" / "sync_all_subjects.py"
NODE_BUILD = BASE.parent / "node.js" / "共享配置" / "tools" / "build.mjs"
MYSQL_BUILD = BASE.parent / "MySql" / "共享配置" / "tools" / "build.mjs"
FISH_ARCHIVE = BASE / "答疑归档" / "大肥鱼" / "data.json"
FISH_TOOL = Path(r"D:\大肥鱼\MyDSH\答疑系统\tools\fish-archive.ps1")


def say(text: str = "") -> None:
    print(text, flush=True)


def run(cmd: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd,
        cwd=str(BASE),
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
    )


def sync_summary(output: str) -> None:
    """只显示科目进度标题和最终同步总结，隐藏逐条明细。"""
    lines = output.replace("\r\n", "\n").split("\n")
    final = False
    printed = False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("=== ") and stripped.endswith(" ==="):
            say(line)
            printed = True
        if stripped.startswith("========== 同步结果"):
            final = True
        if final:
            say(line)
            printed = True
    if not printed and output.strip():
        say(output.strip()[-2500:])


def build_fish_archive() -> tuple[bool, str]:
    say()
    say("[2/4] 归档大肥鱼 API 答疑...")
    if not FISH_TOOL.exists():
        say(f"[跳过] 找不到鱼答疑归档脚本：{FISH_TOOL}")
        return False, "未找到脚本"
    powershell = shutil.which("powershell") or "powershell.exe"
    result = run([powershell, "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(FISH_TOOL), "-NoPause"])
    if result.returncode != 0:
        say("[警告] 大肥鱼归档构建失败，保留旧页面。")
        return False, "失败，保留旧页面"
    count = read_count(FISH_ARCHIVE, "docs")
    suffix = f"（{count} 篇）" if count else ""
    say(f"[完成] 大肥鱼归档已更新{suffix}")
    return True, f"完成{suffix}"


def read_count(path: Path, key: str) -> str:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
        value = data.get(key)
        return str(len(value)) if isinstance(value, list) else str(value or "")
    except Exception:
        return ""


def build_archive(step: int, label: str, script: Path, json_path: Path, json_key: str) -> tuple[bool, str]:
    say()
    say(f"[{step}/4] 构建 {label} 笔记归档...")
    node = shutil.which("node")
    if not script.exists():
        say(f"[警告] 找不到 {label} 构建脚本：{script}")
        return False, "找不到构建脚本"
    if not node:
        say("[警告] 没有找到 node，跳过归档构建。")
        return False, "没有 node"
    result = run([node, str(script)])
    if result.returncode != 0:
        say(f"[警告] {label} 归档构建失败，保留旧页面。")
        return False, "失败，保留旧页面"
    count = read_count(json_path, json_key)
    suffix = f"（{count} 篇）" if count else ""
    say(f"[完成] {label} 归档已更新{suffix}")
    return True, f"完成{suffix}"


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    say("==========================================")
    say("  AI答疑 / Node.js / MySQL 一键更新")
    say("==========================================")
    say()
    say("[1/4] 同步全部答疑科目...")
    say()

    sync_ok = False
    if not SYNC.exists():
        say(f"[错误] 找不到同步脚本：{SYNC}")
    else:
        result = run([sys.executable, str(SYNC), "--once"])
        sync_summary(result.stdout or "")
        if result.stderr:
            # 只保留真正的错误信息，避免把进度日志刷满屏。
            for line in result.stderr.replace("\r\n", "\n").split("\n"):
                if line.strip() and ("Error" in line or "Traceback" in line or "错误" in line):
                    say(line)
        sync_ok = result.returncode == 0
        if not sync_ok:
            say()
            say(f"[提示] 同步返回错误码 {result.returncode}，仍继续更新本地归档。")

    fish_ok, fish_status = build_fish_archive()
    node_ok, node_status = build_archive(
        3, "Node.js", NODE_BUILD, BASE.parent / "node.js" / "html" / "data.json", "docs"
    )
    mysql_ok, mysql_status = build_archive(
        4, "MySQL", MYSQL_BUILD, BASE.parent / "MySql" / "html" / "data.json", "docs"
    )

    say()
    say("==========================================")
    if sync_ok:
        say("  [完成] 同步完成")
    else:
        say("  [提示] 同步有错误，但归档仍已更新")
    say(f"  大肥鱼: {fish_status}")
    say(f"  Node.js: {node_status}")
    say(f"  MySQL:   {mysql_status}")
    say("==========================================")
    say()
    return 0 if (sync_ok and fish_ok and node_ok and mysql_ok) else 1


if __name__ == "__main__":
    raise SystemExit(main())
