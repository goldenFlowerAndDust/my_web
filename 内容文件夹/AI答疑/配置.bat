@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title AI Tutor Config

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
if exist "%BUNDLED%" (
  "%BUNDLED%" "sync_launcher.py" --config
) else (
  py -3 "sync_launcher.py" --config
)
if errorlevel 1 pause
