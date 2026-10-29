@echo off
setlocal
cd /d "%~dp0"
title Vocabulary Server

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"

if exist "%BUNDLED%" goto bundled
where py >nul 2>nul
if not errorlevel 1 goto py
where python >nul 2>nul
if not errorlevel 1 goto python
echo.
echo Python not found.
echo Install Python 3.10+ and enable "Add python.exe to PATH", or use the bundled runtime.
goto done

:bundled
echo Using bundled Python...
"%BUNDLED%" "word_server.py"
goto done

:py
echo Using py -3...
py -3 "word_server.py"
goto done

:python
echo Using python...
python "word_server.py"
goto done

:done
echo.
echo Server stopped. Press any key to close.
pause >nul
