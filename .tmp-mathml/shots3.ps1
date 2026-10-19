param(
    [string]$SelfPage,
    [string]$Module2,
    [string]$Module3
)
$ErrorActionPreference = 'Continue'
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$out = "D:\GitHub\my_web\.tmp-mathml"

function ToUri([string]$p) {
    $full = (Resolve-Path -LiteralPath $p).Path.Replace('\', '/')
    $bytes = [Text.Encoding]::UTF8.GetBytes($full)
    $sb = New-Object System.Text.StringBuilder
    foreach ($b in $bytes) {
        $isSafe = ($b -ge 48 -and $b -le 57) -or ($b -ge 65 -and $b -le 90) -or
                  ($b -ge 97 -and $b -le 122) -or $b -eq 47 -or $b -eq 58 -or $b -eq 46 -or
                  $b -eq 95 -or $b -eq 45
        if ($isSafe) { [void]$sb.Append([char]$b) } else { [void]$sb.Append('%' + $b.ToString('X2')) }
    }
    return 'file:///' + $sb.ToString().TrimStart('/')
}

function Shot([string]$name, [string]$url, [string]$w, [string]$h, [string]$profile) {
    $args = @(
        "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-breakpad",
        "--disable-crash-reporter", "--no-first-run", "--hide-scrollbars",
        "--force-device-scale-factor=1", "--virtual-time-budget=9000",
        "--user-data-dir=$out\p-$profile", "--window-size=$w,$h",
        "--screenshot=$out\$name", $url
    )
    $p = Start-Process -FilePath $chrome -ArgumentList $args -PassThru -Wait `
        -RedirectStandardError "$out\err-$profile.txt" -RedirectStandardOutput "$out\out-$profile.txt"
    if (Test-Path -LiteralPath "$out\$name") { Write-Output ("OK   " + $name) }
    else { Write-Output ("FAIL " + $name + " exit=" + $p.ExitCode); Get-Content "$out\err-$profile.txt" -TotalCount 4 }
}

$selfUri = ToUri $SelfPage
Write-Output $selfUri
Shot "50-selfcheck.png" $selfUri "900" "1400" s1
Shot "51-module2.png"   ((ToUri $Module2) + "?mathml=fallback") "1180" "1400" s2
Shot "52-module3.png"   ((ToUri $Module3) + "?mathml=fallback") "1180" "1400" s3
