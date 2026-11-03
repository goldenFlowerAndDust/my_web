@echo off
chcp 65001 >nul
set "PYTHONIOENCODING=utf-8"
set "PYTHONUTF8=1"
setlocal
cd /d "%~dp0"
title Sync Launcher

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"

if exist "%BUNDLED%" goto bundled
where py >nul 2>nul
if not errorlevel 1 goto py
where python >nul 2>nul
if not errorlevel 1 goto python
echo Python not found.
pause
exit /b 1

:bundled
"%BUNDLED%" "sync_launcher.py"
goto done

:py
py -3 "sync_launcher.py"
goto done

:python
python "sync_launcher.py"
goto done

:done
echo.
pause >nul
