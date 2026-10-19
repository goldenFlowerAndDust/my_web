$ErrorActionPreference = 'Continue'
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$out = "D:\GitHub\my_web\.tmp-mathml"
$base = "file:///D:/GitHub/my_web/%E5%86%85%E5%AE%B9%E6%96%87%E4%BB%B6%E5%A4%B9/%E4%B8%93%E5%8D%87%E6%9C%AC%E5%A4%87%E8%80%83/%E5%A4%87%E8%80%83%E4%B8%93%E5%8D%87%E6%9C%AC%E6%95%B0%E5%AD%A6/%E5%88%9D%E9%AB%98%E4%B8%AD%E7%9F%A5%E8%AF%86%E8%A1%94%E6%8E%A5/%E6%A8%A1%E5%9D%97%E4%B8%80_%E6%95%B0%E4%B8%8E%E5%BC%8F%E7%9A%84%E6%A0%B8%E5%BF%83%E5%8F%98%E5%BD%A2/%E6%A8%A1%E5%9D%97%E4%B8%80_%E6%95%B0%E4%B8%8E%E5%BC%8F%E7%9A%84%E6%A0%B8%E5%BF%83%E5%8F%98%E5%BD%A2.html"

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
    if (Test-Path -LiteralPath "$out\$name") {
        Write-Output ("OK   {0} (exit {1})" -f $name, $p.ExitCode)
    } else {
        Write-Output ("FAIL {0} (exit {1})" -f $name, $p.ExitCode)
    }
}

Shot "30-fallback-full.png" "$base`?mathml=fallback" "1180" "16000" r1
Shot "31-native-full.png"   $base                     "1180" "16000" r2
