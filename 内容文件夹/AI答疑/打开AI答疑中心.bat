@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set "BUNDLED=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
if exist "%BUNDLED%" (
  "%BUNDLED%" "launch.py" hub
) else (
  py -3 "launch.py" hub
)
if errorlevel 1 pause
