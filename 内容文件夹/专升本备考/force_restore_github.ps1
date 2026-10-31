param(
    [switch]$Yes,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Find-Git {
    $cmd = Get-Command git -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $candidates = Get-ChildItem "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe" -ErrorAction SilentlyContinue |
        Sort-Object FullName -Descending
    if ($candidates) { return $candidates[0].FullName }
    throw "找不到 git.exe。请先安装 Git 或 GitHub Desktop。"
}

$git = Find-Git
Push-Location $PSScriptRoot
try {
    $root = (& $git rev-parse --show-toplevel 2>$null).Trim()
    if ($LASTEXITCODE -ne 0 -or -not $root) {
        throw "当前目录不是 Git 仓库：$PSScriptRoot"
    }
    Set-Location $root

    $branch = (& $git rev-parse --abbrev-ref HEAD).Trim()
    if ($branch -eq "HEAD") { $branch = "main" }

    Write-Host "仓库：$root"
    Write-Host "当前分支：$branch"
    Write-Host "正在获取 GitHub 最新版本…"
    & $git fetch origin --prune
    if ($LASTEXITCODE -ne 0) { throw "git fetch 失败。" }

    $target = "origin/$branch"
    & $git rev-parse --verify --quiet $target > $null
    if ($LASTEXITCODE -ne 0) {
        $target = "origin/main"
    }
    & $git rev-parse --verify --quiet $target > $null
    if ($LASTEXITCODE -ne 0) { throw "找不到远程分支 origin/$branch 或 origin/main。" }

    if ($DryRun) {
        Write-Host ""
        Write-Host "DryRun：将用 $target 覆盖当前工作区；未执行 fetch 之外的任何改动。"
        return
    }

    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $desktop = [Environment]::GetFolderPath("Desktop")
    if (-not $desktop -or -not (Test-Path -LiteralPath $desktop)) { $desktop = $root }
    $backup = Join-Path $desktop ("专升本GitHub恢复备份-" + $stamp)
    New-Item -ItemType Directory -Path $backup -Force | Out-Null

    & $git diff HEAD --binary | Out-File -LiteralPath (Join-Path $backup "uncommitted.patch") -Encoding utf8
    & $git status --short | Out-File -LiteralPath (Join-Path $backup "status.txt") -Encoding utf8
    & $git log -1 --oneline | Out-File -LiteralPath (Join-Path $backup "local-head.txt") -Encoding utf8

    $localHead = (& $git rev-parse HEAD).Trim()
    $remoteHead = (& $git rev-parse $target).Trim()
    $backupBranch = ""
    if ($localHead -ne $remoteHead) {
        $backupBranch = "backup/local-" + $stamp
        & $git branch $backupBranch
        if ($LASTEXITCODE -eq 0) {
            Write-Host "本地提交已备份到分支：$backupBranch"
        }
    }

    Write-Host ""
    Write-Host "即将执行强制恢复："
    Write-Host "  当前本地 → $target"
    Write-Host "  备份目录 → $backup"
    Write-Host ""
    Write-Host "注意："
    Write-Host "  - 已跟踪文件会被 GitHub 版本覆盖"
    Write-Host "  - 未提交修改已备份为 uncommitted.patch"
    Write-Host "  - 本地未跟踪文件不会删除"
    Write-Host "  - 忽略文件（口令、日志、导出记录、部署截图）不会被删除"
    Write-Host "  - 不执行 git clean -fdx"
    Write-Host ""

    if ($DryRun) {
        Write-Host "DryRun：只检查，不执行覆盖。"
        return
    }

    if (-not $Yes) {
        $answer = Read-Host "确认覆盖请输入 YES"
        if ($answer -cne "YES") {
            Write-Host "已取消，没有改动本地仓库。"
            return
        }
    }

    & $git reset --hard $target
    if ($LASTEXITCODE -ne 0) { throw "git reset --hard 失败。" }

    Write-Host ""
    Write-Host "强制恢复完成。"
    Write-Host "当前提交："
    & $git log -1 --oneline
    Write-Host "当前状态："
    & $git status --short
    Write-Host ""
    Write-Host "备份在：$backup"
    if ($backupBranch) {
        Write-Host "本地提交备份分支：$backupBranch"
    }
}
finally {
    Pop-Location
}
