"""启动英语/数学服务，并在主控制台关闭时一起结束。

由 同步全部科目.bat 在同步完成后调用。
使用 Windows Job Object：主进程退出（包括直接关闭控制台）时，
Windows 会结束这个 Job 下的两个服务进程。
"""

from __future__ import annotations

import argparse
import ctypes
import json
import subprocess
import sys
import time
import urllib.request
import webbrowser
from ctypes import wintypes
from pathlib import Path

CREATE_NEW_CONSOLE = 0x00000010
JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE = 0x00002000
JOB_OBJECT_EXTENDED_LIMIT_INFORMATION_CLASS = 9
PROCESS_ALL_ACCESS = 0x1F0FFF


class JOBOBJECT_BASIC_LIMIT_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("PerProcessUserTimeLimit", ctypes.c_longlong),
        ("PerJobUserTimeLimit", ctypes.c_longlong),
        ("LimitFlags", wintypes.DWORD),
        ("MinimumWorkingSetSize", ctypes.c_size_t),
        ("MaximumWorkingSetSize", ctypes.c_size_t),
        ("ActiveProcessLimit", wintypes.DWORD),
        ("Affinity", ctypes.c_size_t),
        ("PriorityClass", wintypes.DWORD),
        ("SchedulingClass", wintypes.DWORD),
    ]


class IO_COUNTERS(ctypes.Structure):
    _fields_ = [
        ("ReadOperationCount", ctypes.c_ulonglong),
        ("WriteOperationCount", ctypes.c_ulonglong),
        ("OtherOperationCount", ctypes.c_ulonglong),
        ("ReadTransferCount", ctypes.c_ulonglong),
        ("WriteTransferCount", ctypes.c_ulonglong),
        ("OtherTransferCount", ctypes.c_ulonglong),
    ]


class JOBOBJECT_EXTENDED_LIMIT_INFORMATION(ctypes.Structure):
    _fields_ = [
        ("BasicLimitInformation", JOBOBJECT_BASIC_LIMIT_INFORMATION),
        ("IoInfo", IO_COUNTERS),
        ("ProcessMemoryLimit", ctypes.c_size_t),
        ("JobMemoryLimit", ctypes.c_size_t),
        ("PeakProcessMemoryUsed", ctypes.c_size_t),
        ("PeakJobMemoryUsed", ctypes.c_size_t),
    ]


def create_kill_on_close_job():
    if sys.platform != "win32":
        return None
    kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel32.CreateJobObjectW.restype = wintypes.HANDLE
    kernel32.SetInformationJobObject.argtypes = [
        wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD
    ]
    kernel32.AssignProcessToJobObject.argtypes = [wintypes.HANDLE, wintypes.HANDLE]
    job = kernel32.CreateJobObjectW(None, None)
    if not job:
        return None
    info = JOBOBJECT_EXTENDED_LIMIT_INFORMATION()
    info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
    ok = kernel32.SetInformationJobObject(
        job,
        JOB_OBJECT_EXTENDED_LIMIT_INFORMATION_CLASS,
        ctypes.byref(info),
        ctypes.sizeof(info),
    )
    if not ok:
        kernel32.CloseHandle(job)
        return None
    return job


def assign_to_job(job, pid: int) -> bool:
    if not job or sys.platform != "win32":
        return False
    kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
    kernel32.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
    kernel32.OpenProcess.restype = wintypes.HANDLE
    kernel32.AssignProcessToJobObject.argtypes = [wintypes.HANDLE, wintypes.HANDLE]
    process = kernel32.OpenProcess(PROCESS_ALL_ACCESS, False, pid)
    if not process:
        return False
    try:
        return bool(kernel32.AssignProcessToJobObject(job, process))
    finally:
        kernel32.CloseHandle(process)


def start_service(base: Path, python: str, title: str, script: str, cwd: Path):
    startup = subprocess.STARTUPINFO()
    startup.lpTitle = title
    env = dict(__import__("os").environ)
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    process = subprocess.Popen(
        [python, script],
        cwd=str(cwd),
        env=env,
        creationflags=CREATE_NEW_CONSOLE,
        startupinfo=startup,
    )
    return process


def wait_health(port: int, timeout: float = 20.0) -> bool:
    deadline = time.time() + timeout
    url = "http://127.0.0.1:%d/api/health" % port
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as response:
                data = json.loads(response.read().decode("utf-8", "replace"))
            if isinstance(data, dict) and data.get("ok"):
                return True
        except Exception:
            pass
        time.sleep(0.5)
    return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-browser", action="store_true", help="不自动打开浏览器")
    args = parser.parse_args()

    base = Path(__file__).resolve().parent.parent
    python = sys.executable
    english_dir = base / "备考专升本英语"
    math_dir = base / "备考专升本数学"

    job = create_kill_on_close_job()
    if not job:
        print("警告：无法创建 Windows Job Object；关闭主窗口时可能无法自动结束后台服务。")

    children = []
    try:
        print("正在启动英语答疑 8767…")
        english = start_service(
            base, python, "英语答疑 8767", "word_server.py", english_dir
        )
        children.append(english)
        if job and not assign_to_job(job, english.pid):
            print("警告：英语服务未能加入自动关闭组。")

        print("正在启动数学答疑 8768…")
        math = start_service(
            base, python, "数学答疑 8768", "start_math_server.py", math_dir
        )
        children.append(math)
        if job and not assign_to_job(job, math.pid):
            print("警告：数学服务未能加入自动关闭组。")

        english_ok = wait_health(8767)
        math_ok = wait_health(8768)
        print("英语 8767：%s" % ("已就绪" if english_ok else "未就绪"))
        print("数学 8768：%s" % ("已就绪" if math_ok else "未就绪"))

        if not args.no_browser:
            if english_ok:
                webbrowser.open("http://127.0.0.1:8767/英语答疑/英语答疑.html", new=2)
            if math_ok:
                webbrowser.open("http://127.0.0.1:8768/数学答疑/数学答疑.html", new=2)

        print("")
        print("服务运行中。关闭这个同步窗口，会同时结束英语 8767 和数学 8768。")
        print("按 Ctrl+C 也可以结束全部服务。")
        print("")

        while True:
            time.sleep(1)
            alive = [child for child in children if child.poll() is None]
            if not alive:
                print("两个服务都已退出。")
                break
    except KeyboardInterrupt:
        print("\n收到 Ctrl+C，正在停止服务…")
    finally:
        for child in children:
            if child.poll() is None:
                try:
                    child.terminate()
                except OSError:
                    pass
        time.sleep(0.8)
        for child in children:
            if child.poll() is None:
                try:
                    child.kill()
                except OSError:
                    pass
        if job:
            # KILL_ON_JOB_CLOSE 会一并结束服务；显式关闭句柄也会触发。
            kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
            kernel32.CloseHandle(job)
        print("服务已全部停止。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
