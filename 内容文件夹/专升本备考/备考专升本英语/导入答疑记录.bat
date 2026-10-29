@echo off
setlocal
cd /d "%~dp0"
title Import English Tutor Logs

if "%~1"=="" (
    echo Please drag the exported JSON file onto this .bat file.
    echo You can export it from the English Tutor page: History - Export.
    pause
    exit /b 1
)

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"

if exist "%BUNDLED%" goto bundled
where py >nul 2>nul
if not errorlevel 1 goto py
where python >nul 2>nul
if not errorlevel 1 goto python
echo Python not found.
goto done

:bundled
"%BUNDLED%" "import_tutor_logs.py" "%~1" --write
goto done

:py
py -3 "import_tutor_logs.py" "%~1" --write
goto done

:python
python "import_tutor_logs.py" "%~1" --write
goto done

:done
echo.
echo Import finished. Press any key to close.
pause >nul
