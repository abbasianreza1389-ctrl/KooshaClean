
param(
  [string]$WebDir = "D:\Koosha\website",
  [string]$ZipPath = ""
)
$ErrorActionPreference="Stop"
function Fail($m){ Write-Host ("✗ " + $m) -ForegroundColor Red; exit 1 }
if(-not $ZipPath -or -not (Test-Path $ZipPath)){
  $here = Split-Path -Parent $MyInvocation.MyCommand.Path
  $cand = Join-Path $here "koosha_front_templates_pack.zip"
  if(Test-Path $cand){ $ZipPath = $cand } else { Fail "ZIP یافت نشد؛ -ZipPath بدهید یا ZIP را کنار اسکریپت بگذارید." }
}
if(-not (Test-Path (Join-Path $WebDir "package.json"))){ Fail "package.json در $WebDir نیست." }
$ts=Get-Date -Format yyyyMMdd_HHmmss
$temp = Join-Path $env:TEMP ("koosha_tpl_"+$ts)
Expand-Archive -Path $ZipPath -DestinationPath $temp -Force
$src = Get-ChildItem -Path $temp -Recurse -Directory -Filter src | Select-Object -First 1
if(-not $src){ Fail "src داخل ZIP پیدا نشد." }
robocopy $($src.FullName) (Join-Path $WebDir "src") /E /NFL /NDL /NJH /NJS /NC /NS | Out-Null
Write-Host "✓ الگوها اعمال شد. اجرا: cd `"$WebDir`"; npm run dev" -ForegroundColor Green
