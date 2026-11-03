@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title AI Tutor Center

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"

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
