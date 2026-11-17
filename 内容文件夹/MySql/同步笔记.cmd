@echo off
chcp 65001 >nul
title 同步 SQL 笔记（Navicat → MySql\笔记）

set "SRC=E:\Documents\Navicat\MySQL\Servers\localhost_3306"
set "DST=D:\GitHub\my_web\内容文件夹\MySql\笔记"

if not exist "%SRC%" (
  echo [错误] 找不到 Navicat 查询目录：
  echo         %SRC%
  pause
  exit /b 1
)

echo 源目录：%SRC%
echo 目标：  %DST%
echo.
echo 正在同步 .sql 文件（只复制有更新的）...
robocopy "%SRC%" "%DST%" *.sql /S /XO /NJH /NJS /NDL /NP /R:1 /W:1

if errorlevel 8 (
  echo.
  echo [失败] robocopy 返回错误，请查看上面的输出。
) else (
  echo.
  echo [完成] Navicat 里新增/修改的 .sql 已同步到 笔记\
)

echo.
for /f %%c in ('dir /b /s "%DST%\*.sql" ^| find /c /v ""') do echo 笔记目录现有 %%c 个 .sql 文件
pause
