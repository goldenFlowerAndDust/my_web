@echo off
chcp 65001 >nul
set "PYTHONIOENCODING=utf-8"
set "PYTHONUTF8=1"
setlocal
cd /d "%~dp0"
title Sync All Subjects

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
if exist "%BUNDLED%" (
  "%BUNDLED%" "共享配置\sync_all_subjects.py" --menu
) else (
  py -3 "共享配置\sync_all_subjects.py" --menu
)
pause >nul
