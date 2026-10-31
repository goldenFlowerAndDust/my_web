@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0force_restore_github.ps1"
echo.
pause >nul
