$ErrorActionPreference = 'Continue'
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$out = "D:\GitHub\my_web\.tmp-mathml"
$base = "file:///D:/GitHub/my_web/%E5%86%85%E5%AE%B9%E6%96%87%E4%BB%B6%E5%A4%B9/%E4%B8%93%E5%8D%87%E6%9C%AC%E5%A4%87%E8%80%83/%E5%A4%87%E8%80%83%E4%B8%93%E5%8D%87%E6%9C%AC%E6%95%B0%E5%AD%A6/%E5%88%9D%E9%AB%98%E4%B8%AD%E7%9F%A5%E8%AF%86%E8%A1%94%E6%8E%A5/%E6%A8%A1%E5%9D%97%E4%B8%80_%E6%95%B0%E4%B8%8E%E5%BC%8F%E7%9A%84%E6%A0%B8%E5%BF%83%E5%8F%98%E5%BD%A2/%E6%A8%A1%E5%9D%97%E4%B8%80_%E6%95%B0%E4%B8%8E%E5%BC%8F%E7%9A%84%E6%A0%B8%E5%BF%83%E5%8F%98%E5%BD%A2.html"

function Shot([string]$name, [string]$url, [string]$w, [string]$h, [string]$profile) {
    $args = @(
        "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-breakpad",
        "--disable-crash-reporter", "--no-first-run", "--no-default-browser-check",
        "--hide-scrollbars", "--force-device-scale-factor=1", "--virtual-time-budget=8000",
        "--user-data-dir=$out\p-$profile", "--window-size=$w,$h",
        "--screenshot=$out\$name", $url
    )
    $p = Start-Process -FilePath $chrome -ArgumentList $args -PassThru -Wait `
        -RedirectStandardError "$out\err-$profile.txt" -RedirectStandardOutput "$out\out-$profile.txt"
    if (Test-Path -LiteralPath "$out\$name") {
        Write-Output ("OK   {0} {1} bytes (exit {2})" -f $name, (Get-Item -LiteralPath "$out\$name").Length, $p.ExitCode)
    } else {
        Write-Output ("FAIL {0} (exit {1})" -f $name, $p.ExitCode)
    }
}

Shot "10-native.png"        $base                         "1180" "1400" n1
Shot "11-fallback.png"      "$base`?mathml=fallback"      "1180" "1400" f1
Shot "12-fallback-box.png"  "$base`?mathml=fallback#%E4%B8%89%E5%9B%A0%E5%BC%8F%E5%88%86%E8%A7%A3" "1180" "1400" f2
Shot "13-fallback-sqrt.png" "$base`?mathml=fallback#%E4%BA%94%E6%A0%B9%E5%BC%8F%E5%8C%96%E7%AE%80" "1180" "1400" f3
Shot "14-fallback-lim.png"  "$base`?mathml=fallback#%E5%85%AD%E9%AB%98%E6%95%B0%E5%85%B3%E8%81%94%E5%BA%A6" "1180" "1400" f4
Shot "15-fallback-mobile.png" "$base`?mathml=fallback"    "420"  "1400" f5
Shot "16-native-mobile.png"   $base                       "420"  "1400" n2
