# 修复专升本备考目录下所有 .bat 的换行符为 Windows CRLF。
# 右键“使用 PowerShell 运行”，或在 PowerShell 中执行：
#   powershell -ExecutionPolicy Bypass -File "共享工具\修复BAT换行.ps1"

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$fixed = 0
Get-ChildItem -LiteralPath $root -Recurse -File -Filter *.bat | ForEach-Object {
    $path = $_.FullName
    $text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $text = $text -replace "`r`n", "`n"
    $text = $text -replace "`n", "`r`n"
    [System.IO.File]::WriteAllText(
        $path,
        $text,
        (New-Object System.Text.UTF8Encoding($false))
    )
    Write-Host ("已修复：" + $path)
    $fixed += 1
}
Write-Host ("完成，共处理 " + $fixed + " 个 .bat。")
