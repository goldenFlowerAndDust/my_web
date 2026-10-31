"""专升本同步启动器：把中文菜单放在 Python 中，避免 BAT 编码/换行把中文拆坏。"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
SYNC = BASE / "共享配置" / "sync_all_subjects.py"
SUPERVISOR = BASE / "共享配置" / "service_supervisor.py"


def run_script(*args: str) -> int:
    if not SYNC.exists():
        print("找不到同步脚本：%s" % SYNC)
        return 1
    return subprocess.call([sys.executable, str(SYNC), *args])


def pause() -> None:
    try:
        input("\n按回车返回菜单…")
    except EOFError:
        pass


def menu() -> None:
    while True:
        os.system("cls")
        print("")
        print("========== 专升本同步与启动 ==========")
        print("  1. 一键同步并启动全部服务（推荐）")
        print("  2. 只同步一次，不启动服务")
        print("  3. 查看上次同步状态")
        print("  4. 打开科目配置")
        print("  5. 配置主线路云端")
        print("  6. 配置备用线路云端（腾讯云 SCF）")
        print("  7. 使用腾讯云 SCF 作为主线路")
        print("  8. 把已保存的备用线路切为主线路")
        print("  0. 退出")
        print("")
        try:
            choice = input("请选择 [1-8/0]：").strip()
        except EOFError:
            return

        if choice == "0":
            return
        if choice == "1":
            os.system("cls")
            print("")
            print("[1/2] 正在同步云端记录到本地…")
            print("")
            code = run_script("--once")
            if code != 0:
                print("")
                print("同步返回错误，但仍会启动服务；请检查上面的同步结果。")
            else:
                print("")
                print("云端记录已同步，归档 JSON 已更新。")
            print("")
            print("[2/2] 正在启动英语 8767 和数学 8768…")
            print("关闭本窗口会同时结束两个服务。")
            print("")
            if not SUPERVISOR.exists():
                print("找不到服务启动器：%s" % SUPERVISOR)
            else:
                subprocess.call([sys.executable, str(SUPERVISOR)])
            print("")
            print("两个服务已停止。")
            pause()
        elif choice == "2":
            os.system("cls")
            code = run_script("--once")
            print("")
            if code == 0:
                print("同步完成。未启动 8767 / 8768。")
            else:
                print("同步结束，但返回了错误。")
            pause()
        elif choice == "3":
            os.system("cls")
            run_script("--status")
            print("")
            pause()
        elif choice == "4":
            os.system("cls")
            run_script("--open-subject-config")
            print("")
            pause()
        elif choice == "5":
            os.system("cls")
            run_script("--configure-primary")
            print("")
            pause()
        elif choice == "6":
            os.system("cls")
            run_script("--configure-fallback")
            print("")
            pause()
        elif choice == "7":
            os.system("cls")
            run_script("--scf-primary")
            print("")
            pause()
        elif choice == "8":
            os.system("cls")
            run_script("--promote-fallback")
            print("")
            pause()
        else:
            print("没有这个选项。")


if __name__ == "__main__":
    menu()
