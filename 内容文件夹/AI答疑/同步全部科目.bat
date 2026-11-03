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

if exist "%BUNDLED%" goto sync_bundled
goto sync_py

:sync_bundled
"%BUNDLED%" "共享配置\sync_all_subjects.py" --menu
goto start_services

:sync_py
py -3 "共享配置\sync_all_subjects.py" --menu
goto start_services

:start_services
echo.
echo 正在启动 AI 答疑服务...
if exist "%BUNDLED%" goto start_bundled
goto start_py

:start_bundled
pushd "%~dp0英语答疑\engine\词素工具"
start "英语答疑 8767" "%BUNDLED%" server.py
popd
pushd "%~dp0数学答疑\engine\数学工具"
start "数学答疑 8768" "%BUNDLED%" server.py --port 8768
popd
pushd "%~dp0编程语言AI\engine"
start "编程答疑 8769" "%BUNDLED%" server.py
popd
goto open_center

:start_py
pushd "%~dp0英语答疑\engine\词素工具"
start "英语答疑 8767" py -3 server.py
popd
pushd "%~dp0数学答疑\engine\数学工具"
start "数学答疑 8768" py -3 server.py --port 8768
popd
pushd "%~dp0编程语言AI\engine"
start "编程答疑 8769" py -3 server.py
popd
goto open_center

:open_center
ping -n 3 127.0.0.1 >nul
start "" "http://127.0.0.1:8769/AI答疑/"
exit /b 0
