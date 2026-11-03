@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0数学答疑\engine\数学工具"
title Math Tutor 8768

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
start "" "http://127.0.0.1:8769/AI答疑/"
if exist "%BUNDLED%" (
  "%BUNDLED%" "server.py" --port 8768
) else (
  py -3 "server.py" --port 8768
)
pause >nul
