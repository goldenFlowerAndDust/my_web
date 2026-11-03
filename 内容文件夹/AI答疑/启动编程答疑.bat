@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0编程语言AI\engine"
title Programming Tutor 8769

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
start "" "http://127.0.0.1:8769/AI答疑/"
if exist "%BUNDLED%" (
  "%BUNDLED%" "server.py"
) else (
  py -3 "server.py"
)
pause >nul
