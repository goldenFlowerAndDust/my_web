@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==========================================
echo   DSH-woker 笔记站 · 重新构建
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo [错误] 没有找到 Node.js，请先安装 Node 后重试。
    echo.
    pause
    exit /b 1
)

node build.mjs
set CODE=%errorlevel%

echo.
if %CODE%==0 (
    echo [完成] 可以打开对应科目的 index.html 查看了。
) else (
    echo [失败] 构建出错，错误码 %CODE%，请把上面的红字发给 AI。
)
echo.
pause
exit /b %CODE%
