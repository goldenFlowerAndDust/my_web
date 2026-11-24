@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
set "PYTHONIOENCODING=utf-8"
set "PYTHONUTF8=1"
title AI Answer Sync / Node.js / MySQL
set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"

if exist "%BUNDLED%" goto bundled
where py >nul 2>nul
if not errorlevel 1 goto py
where python >nul 2>nul
if not errorlevel 1 goto python

echo Python not found.
set "CODE=1"
goto done

:bundled
"%BUNDLED%" "sync_archives.py"
set "CODE=%ERRORLEVEL%"
goto done

:py
py -3 "sync_archives.py"
set "CODE=%ERRORLEVEL%"
goto done

:python
python "sync_archives.py"
set "CODE=%ERRORLEVEL%"
goto done

:done
echo.
if /i "%~1"=="--no-pause" exit /b %CODE%
pause
exit /b %CODE%
