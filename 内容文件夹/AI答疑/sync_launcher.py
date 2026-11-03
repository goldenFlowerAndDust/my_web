"""专升本同步启动器：把中文菜单放在 Python 中，避免 BAT 编码/换行把中文拆坏。"""

from __future__ import annotations

import getpass
import json
import os
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
SYNC = BASE / "共享配置" / "sync_all_subjects.py"
SUPERVISOR = BASE / "共享配置" / "service_supervisor.py"
CONFIG_DIR = BASE / "共享配置"
API_FILE = CONFIG_DIR / "API.txt"
CLOUD_FILE = CONFIG_DIR / "云端同步.json"


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


def ask_secret(prompt: str) -> str:
    """优先隐藏输入；没有控制台时退回普通输入。"""
    try:
        return getpass.getpass(prompt).strip()
    except (EOFError, OSError):
        try:
            return input(prompt).strip()
        except EOFError:
            return ""


def mask_secret(value: object, keep: int = 4) -> str:
    text = str(value or "").strip()
    if not text:
        return "(未设置)"
    if len(text) <= keep * 2:
        return text[:2] + "***"
    return text[:keep] + "..." + text[-keep:]


def read_api_key() -> str:
    if not API_FILE.exists():
        return ""
    for line in API_FILE.read_text(encoding="utf-8-sig").splitlines():
        line = line.strip()
        if line and not line.startswith("#"):
            return line
    return ""


def write_api_key(value: str) -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    tmp = API_FILE.with_name("API.txt.tmp")
    tmp.write_text((value.strip() + "\n") if value.strip() else "", encoding="utf-8")
    tmp.replace(API_FILE)


def show_config() -> None:
    print("")
    print("配置文件位置：")
    print("  API Key：%s" % API_FILE)
    print("  云端令牌：%s" % CLOUD_FILE)
    print("")
    print("DeepSeek API Key：%s" % mask_secret(read_api_key()))

    if not CLOUD_FILE.exists():
        print("云端线路：尚未配置")
        return
    try:
        data = json.loads(CLOUD_FILE.read_text(encoding="utf-8-sig"))
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print("云端配置读取失败：%s" % exc)
        return

    print("主线路：%s" % (data.get("url") or "(未设置)"))
    print("主线路令牌：%s" % mask_secret(data.get("token")))
    print("备用线路：%s" % (data.get("fallback_url") or "(未设置)"))
    print("备用令牌：%s" % mask_secret(data.get("fallback_token")))


def edit_api_key() -> None:
    current = read_api_key()
    print("")
    print("当前 DeepSeek API Key：%s" % mask_secret(current))
    print("直接回车 = 不修改；输入 - = 清除。")
    new_value = ask_secret("新的 DeepSeek API Key（输入时不显示）：")
    if not new_value:
        print("未修改。")
        return
    if new_value == "-":
        write_api_key("")
        print("已清除本地 API Key。")
        return
    if not new_value.startswith("sk-") or len(new_value) < 20:
        print("格式不像 DeepSeek Key：应以 sk- 开头，且长度不少于 20。")
        print("未修改。")
        return
    write_api_key(new_value)
    print("已保存到：%s" % API_FILE)
    print("新 Key：%s" % mask_secret(new_value))
    print("注意：Cloudflare Worker 的 DEEPSEEK_API_KEY 不会自动更新，")
    print("      云端使用同一个 Key 时，请到 Cloudflare 控制台同步修改 Secret。")


def open_config_folder() -> None:
    print("")
    print("配置目录：%s" % CONFIG_DIR)
    opener = getattr(os, "startfile", None)
    try:
        if opener is not None:
            opener(str(CONFIG_DIR))
        else:
            subprocess.Popen(["explorer", str(CONFIG_DIR)])
        print("已尝试打开文件夹。")
    except Exception as exc:
        print("自动打开失败：%s" % exc)
        print("请手动复制上面的路径到资源管理器。")


def config_menu() -> None:
    while True:
        os.system("cls")
        print("")
        print("========== 修改 API / 云端令牌 ==========")
        print("  1. 修改 DeepSeek API Key（本地 API.txt）")
        print("  2. 修改主线路地址与令牌")
        print("  3. 修改备用线路地址与令牌")
        print("  4. 查看当前配置（脱敏）")
        print("  5. 打开配置文件夹")
        print("  0. 返回主菜单")
        print("")
        print("说明：这里只改本地配置；Cloudflare / SCF 的 Secret 需到控制台同步更新。")
        print("")
        try:
            choice = input("请选择 [1-5/0]：").strip()
        except EOFError:
            return

        if choice == "0":
            return
        if choice == "1":
            edit_api_key()
            pause()
        elif choice == "2":
            os.system("cls")
            print("")
            print("修改主线路地址与令牌（保存在本地云端同步.json）")
            print("注意：Cloudflare Worker 的 TUTOR_ACCESS_TOKEN 也要同步更新。")
            print("")
            run_script("--configure-primary")
            pause()
        elif choice == "3":
            os.system("cls")
            print("")
            print("修改备用线路地址与令牌（通常为腾讯云 SCF）")
            print("注意：SCF 环境变量 PROXY_TOKEN 也要同步更新。")
            print("")
            run_script("--configure-fallback")
            pause()
        elif choice == "4":
            os.system("cls")
            show_config()
            pause()
        elif choice == "5":
            os.system("cls")
            open_config_folder()
            pause()
        else:
            print("没有这个选项。")


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
        print("  9. 修改 API Key / 云端令牌")
        print("  0. 退出")
        print("")
        try:
            choice = input("请选择 [1-9/0]：").strip()
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
            print("[2/2] 正在启动英语 8767、数学 8768、编程 8769…")
            print("关闭本窗口会同时结束三个服务。")
            print("")
            if not SUPERVISOR.exists():
                print("找不到服务启动器：%s" % SUPERVISOR)
            else:
                subprocess.call([sys.executable, str(SUPERVISOR)])
            print("")
            print("三个服务已停止。")
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
        elif choice == "9":
            config_menu()
        else:
            print("没有这个选项。")


if __name__ == "__main__":
    menu()
