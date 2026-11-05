@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"

if exist "%BUNDLED%" (
  "%BUNDLED%" "launch.py" hub
) else (
  py -3 "launch.py" hub
)

timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:8769/AI答疑/清理浏览器历史缓存.html"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:8767/AI答疑/清理浏览器历史缓存.html"
timeout /t 1 /nobreak >nul
start "" "http://127.0.0.1:8768/AI答疑/清理浏览器历史缓存.html"
echo.
echo 已在浏览器打开三个端口的清理页：
echo   8769 / 8767 / 8768
echo 每个页面会自动清理一次，请关闭页面后回到 AI 页面按 Ctrl + F5。
pause
