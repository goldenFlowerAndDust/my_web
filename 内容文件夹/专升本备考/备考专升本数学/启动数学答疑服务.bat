@echo off
setlocal
cd /d "%~dp0"
title Math Tutor Server

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"

if exist "%BUNDLED%" goto bundled
where py >nul 2>nul
if not errorlevel 1 goto py
where python >nul 2>nul
if not errorlevel 1 goto python
echo Python not found.
goto done

:bundled
"%BUNDLED%" "start_math_server.py"
goto done

:py
py -3 "start_math_server.py"
goto done

:python
python "start_math_server.py"
goto done

:done
echo.
echo Math server stopped. Press any key to close.
pause >nul
