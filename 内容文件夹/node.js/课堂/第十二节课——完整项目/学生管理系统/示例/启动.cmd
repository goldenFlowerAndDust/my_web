@echo off
chcp 65001 >nul
title 学生管理系统
rem 本脚本放在 示例\ 里，所以先回到项目根目录
cd /d "%~dp0.."

if not exist ".env" (
  echo [提示] 没找到 .env，正在从 示例\.env.example 复制 ...
  copy "示例\.env.example" ".env" >nul
  echo 请先填好 .env 里的 DB_PASSWORD，然后重新运行本脚本。
  notepad ".env"
  pause
  exit /b 1
)

echo 正在启动（端口见 .env 的 PORT）...
node --env-file=.env server.js
echo.
echo 服务已退出（如果是报错，看上面的信息）
pause
