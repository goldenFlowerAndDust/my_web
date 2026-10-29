@echo off
setlocal
cd /d "%~dp0"
title Import Pending Words

if "%~1"=="" (
    echo Please drag the exported pending-words JSON file onto this .bat file.
    echo Export it from the English Tutor page: History - Export pending words.
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
"%BUNDLED%" "import_pending_words.py" "%~1" --write
goto done

:py
py -3 "import_pending_words.py" "%~1" --write
goto done

:python
python "import_pending_words.py" "%~1" --write
goto done

:done
echo.
echo Import finished. Press any key to close.
pause >nul
