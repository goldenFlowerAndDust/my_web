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
echo.
echo 已打开清理页：http://127.0.0.1:8769/AI答疑/清理浏览器历史缓存.html
echo 页面会自动清理；完成后关闭所有旧 AI 页面，再重新打开并 Ctrl + F5。
pause
