param(
    [string]$Target
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

$probe = ToUri "D:\GitHub\my_web\.tmp-mathml\overflow.html"
$url = $probe + "?src=" + [uri]::EscapeDataString((ToUri $Target))

$args = @(
    "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-breakpad",
    "--disable-crash-reporter", "--no-first-run", "--hide-scrollbars",
    "--allow-file-access-from-files", "--force-device-scale-factor=1",
    "--virtual-time-budget=12000", "--user-data-dir=$out\p-ovf",
    "--window-size=460,900", "--screenshot=$out\70-overflow.png", $url
)
$p = Start-Process -FilePath $chrome -ArgumentList $args -PassThru -Wait `
    -RedirectStandardError "$out\err-ovf.txt" -RedirectStandardOutput "$out\out-ovf.txt"
if (Test-Path -LiteralPath "$out\70-overflow.png") { "OK" } else { "FAIL exit=" + $p.ExitCode }
