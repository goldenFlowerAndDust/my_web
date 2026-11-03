@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动 AI 答疑中心...
echo.
echo 英语答疑需要 8767 服务，数学答疑需要 8768 服务，编程答疑需要 8769 服务。
echo 如果对应服务没有启动，请先分别运行原来的启动脚本。
echo.
start "" "http://127.0.0.1:8769/AI答疑/"
