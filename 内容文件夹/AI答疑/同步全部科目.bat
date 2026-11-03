@echo off
chcp 65001 >nul
set "PYTHONIOENCODING=utf-8"
set "PYTHONUTF8=1"
setlocal
cd /d "%~dp0"
title Sync All Subjects

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"

echo ==========================================
echo   同步全部科目
echo ==========================================
echo.

if exist "%BUNDLED%" (
  "%BUNDLED%" "共享配置\sync_all_subjects.py" --menu
) else (
  py -3 "共享配置\sync_all_subjects.py" --menu
)

echo.
echo 正在启动 AI 答疑服务...
if exist "%BUNDLED%" (
  start "英语答疑 8767" /D "%~dp0英语答疑\engine\词素工具" "%BUNDLED%" server.py
  start "数学答疑 8768" /D "%~dp0数学答疑\engine\数学工具" "%BUNDLED%" server.py --port 8768
  start "编程答疑 8769" /D "%~dp0编程语言AI\engine" "%BUNDLED%" server.py
) else (
  start "英语答疑 8767" /D "%~dp0英语答疑\engine\词素工具" py -3 server.py
  start "数学答疑 8768" /D "%~dp0数学答疑\engine\数学工具" py -3 server.py --port 8768
  start "编程答疑 8769" /D "%~dp0编程语言AI\engine" py -3 server.py
)

timeout /t 2 >nul
start "" "http://127.0.0.1:8769/AI答疑/"
