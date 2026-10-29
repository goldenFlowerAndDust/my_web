@echo off
setlocal
cd /d "%~dp0"
title Organize Cloud Downloads

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"

if exist "%BUNDLED%" goto bundled
where py >nul 2>nul
if not errorlevel 1 goto py
where python >nul 2>nul
if not errorlevel 1 goto python
echo Python not found.
goto done

:bundled
"%BUNDLED%" "organize_cloud_downloads.py"
goto done

:py
py -3 "organize_cloud_downloads.py"
goto done

:python
python "organize_cloud_downloads.py"
goto done

:done
echo.
echo Finished. Press any key to close.
pause >nul
