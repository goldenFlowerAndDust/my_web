@echo off
chcp 65001 >nul
set "PYTHONIOENCODING=utf-8"
set "PYTHONUTF8=1"
setlocal
cd /d "%~dp0"
title 专升本全部科目同步

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
"%BUNDLED%" "共享配置\sync_all_subjects.py" --menu
goto done

:py
py -3 "共享配置\sync_all_subjects.py" --menu
goto done

:python
python "共享配置\sync_all_subjects.py" --menu
goto done

:done
echo.
pause >nul
