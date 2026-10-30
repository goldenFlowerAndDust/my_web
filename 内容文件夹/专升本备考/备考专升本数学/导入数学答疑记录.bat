@echo off
setlocal
cd /d "%~dp0"
title Import Math Tutor Logs

set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"

if "%~1"=="" (
    echo Drag a Math Tutor JSON file onto this BAT.
    goto done
)

if exist "%BUNDLED%" goto bundled
where py >nul 2>nul
if not errorlevel 1 goto py
where python >nul 2>nul
if not errorlevel 1 goto python
echo Python not found.
goto done

:bundled
"%BUNDLED%" "import_math_tutor_logs.py" "%~1" --write
goto done

:py
py -3 "import_math_tutor_logs.py" "%~1" --write
goto done

:python
python "import_math_tutor_logs.py" "%~1" --write
goto done

:done
echo.
echo Finished. Press any key to close.
pause >nul
