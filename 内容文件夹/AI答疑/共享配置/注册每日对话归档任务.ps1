param(
    [string]$Time = "23:55",
    [string]$TaskName = "专升本AI对话历史每日归档",
    [string]$PythonPath = "",
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$script = Join-Path $base "归档对话历史.py"
if (-not (Test-Path $script)) {
    throw "找不到归档脚本：$script"
}

if (-not $PythonPath) {
    $bundled = Join-Path $env:USERPROFILE ".dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
    if (Test-Path $bundled) {
        $PythonPath = $bundled
    } else {
        $cmd = Get-Command python -ErrorAction SilentlyContinue
        if ($cmd) { $PythonPath = $cmd.Source }
    }
}
if (-not $PythonPath -or -not (Test-Path $PythonPath)) {
    throw "找不到 Python，请用 -PythonPath 指定 python.exe。"
}

$action = '"{0}" "{1}"' -f $PythonPath, $script
Write-Host "任务名：$TaskName"
Write-Host "每天：$Time"
Write-Host "命令：$action"

if ($WhatIf) {
    Write-Host "仅预览，未注册。"
    return
}

$taskArgs = @(
    "/Create",
    "/SC", "DAILY",
    "/TN", $TaskName,
    "/TR", $action,
    "/ST", $Time,
    "/F"
)
$process = Start-Process -FilePath "schtasks.exe" -ArgumentList $taskArgs -Wait -PassThru -NoNewWindow
if ($process.ExitCode -ne 0) {
    throw "注册计划任务失败，退出码 $($process.ExitCode)。请用管理员 PowerShell 再试。"
}
Write-Host "已注册：$TaskName"
Write-Host "查看：schtasks /Query /TN `"$TaskName`" /V /FO LIST"
