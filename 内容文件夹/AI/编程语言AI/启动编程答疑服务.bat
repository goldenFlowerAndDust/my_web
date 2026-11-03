@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
title Programming Tutor Server 8769

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
start "" "http://127.0.0.1:8769/"

if exist "%BUNDLED%" goto bundled
where py >nul 2>nul
if not errorlevel 1 goto py
where python >nul 2>nul
if not errorlevel 1 goto python
echo Python not found. Install Python 3.10+ or use the bundled runtime.
pause
exit /b 1

:bundled
"%BUNDLED%" "server.py"
goto done

:py
py -3 "server.py"
goto done

:python
python "server.py"
goto done

:done
echo.
echo Programming tutor server stopped. Press any key to close.
pause >nul
