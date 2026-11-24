@echo off
chcp 65001 >nul
cd /d "%~dp0..\.."
node "共享配置\tools\build.mjs"
echo.
pause