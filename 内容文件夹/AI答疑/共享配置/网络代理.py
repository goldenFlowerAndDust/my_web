"""让 Python 的 urllib 使用 Windows 系统代理。

DeepSeek 请求在本机直连时偶发 SSL EOF；系统代理可用时优先走代理。
只设置环境变量，不写任何配置，代理不存在时保持直连。
"""
from __future__ import annotations

import os


def configure() -> None:
    if os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy"):
        return
    try:
        import winreg
        with winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            r"Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings",
        ) as key:
            enabled, _ = winreg.QueryValueEx(key, "ProxyEnable")
            server, _ = winreg.QueryValueEx(key, "ProxyServer")
    except OSError:
        return
    if not enabled or not server:
        return
    server = str(server).strip()
    if "=" in server:
        parts = {}
        for item in server.split(";"):
            if "=" in item:
                name, value = item.split("=", 1)
                parts[name.strip().lower()] = value.strip()
        server = parts.get("https") or parts.get("http") or ""
    if not server:
        return
    if not server.startswith(("http://", "https://")):
        server = "http://" + server
    os.environ.setdefault("HTTPS_PROXY", server)
    os.environ.setdefault("HTTP_PROXY", server)
