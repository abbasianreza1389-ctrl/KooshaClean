<#  run_all.ps1  |  Koosha one-click bootstrap
    اجرا:  pwsh -NoProfile -ExecutionPolicy Bypass -File .\run_all.ps1
#>

param(
  [string]$BackendDir = "backend",
  [string]$WebDir     = "website",
  [int]$ApiPort       = 8000,
  [int]$NextPort      = 3000,
  [string]$AdminUser  = "koosha",
  [string]$AdminPass  = "reza5040",
  [string]$ProjectName= "koosha_api",
  [string]$AdminEmail = "you@example.com"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

function Kill-Port([int]$p){
  try{
    $c = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -First 1
    if($c){ Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue }
  }catch{}
}

function Ensure-Command([string]$name){ return [bool](Get-Command $name -ErrorAction SilentlyContinue) }

function Ensure-Dir([string]$p){ if(!(Test-Path $p)){ New-Item -ItemType Directory -Path $p -Force | Out-Null } (Resolve-Path $p) }

function Write-TempPy([string]$code){
  $tmp = [IO.Path]::GetTempFileName().Replace(".tmp",".py")
  Set-Content -Encoding UTF8 $tmp $code
  return $tmp
}

# مسیرها
$backend = (Ensure-Dir $BackendDir)
$web     = (Ensure-Dir $WebDir)

# 1) پایتون و venv
if(!(Test-Path ".venv\Scripts\python.exe")){
  if(!(Ensure-Command python)){ throw "Python نصب نیست یا در PATH نیست." }
  python -m venv .venv
}
$py = Resolve-Path ".venv\Scripts\python.exe"
& $py -m pip install --upgrade pip setuptools wheel | Out-Null
& $py -m pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter | Out-Null

# 2) اگر پروژه‌ی Django نبود، بساز
if(!(Test-Path (Join-Path $backend 'manage.py'))){
  Push-Location $backend
  & $py -m django startproject $ProjectName . | Out-Null
  Pop-Location
}

# 3) تنظیم env فرانت برای اتصال به API
$envFile = Join-Path $web ".env.local"
"NEXT_PUBLIC_API=http://localhost:$ApiPort" | Set-Content -Encoding UTF8 $envFile

# 4) آزاد کردن پورت‌ها و اجرای سرورها
Kill-Port $ApiPort
Kill-Port $NextPort

# مهاجرت‌ها
Push-Location $backend
& $py manage.py makemigrations | Out-Null
& $py manage.py migrate | Out-Null

# ساخت/به‌روزرسانی سوپریوزر
$seed = @"
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', '$ProjectName.settings')
django.setup()
from django.contrib.auth import get_user_model
U = get_user_model()
u, created = U.objects.get_or_create(username='$AdminUser', defaults={'email':'$AdminEmail','is_staff':True,'is_superuser':True})
u.set_password('$AdminPass'); u.is_staff=True; u.is_superuser=True; u.save()
print('created' if created else 'exists')
"@
$tmpPy = Write-TempPy $seed
# توجه: ورودی را به shell می‌دهیم
Get-Content $tmpPy | & $py manage.py shell | Out-Null
Remove-Item $tmpPy -ErrorAction SilentlyContinue

# اجرای بک‌اند
Start-Process -FilePath $py -WorkingDirectory $backend -ArgumentList "manage.py","runserver","0.0.0.0:$ApiPort" -WindowStyle Minimized | Out-Null
Pop-Location

# 5) فرانت (Next.js): npm i و dev
if(Test-Path (Join-Path $web "package.json")){
  if(!(Ensure-Command npm)){ Write-Host "هشدار: npm/Node پیدا نشد؛ فرانت را اجرا نکردم." -ForegroundColor Yellow }
  else{
    # نصب پکیج‌ها اگر node_modules نیست
    if(!(Test-Path (Join-Path $web "node_modules"))){
      Start-Process cmd.exe -WorkingDirectory $web -ArgumentList '/c','npm install' -WindowStyle Minimized -Wait | Out-Null
    }
    # dev server
    Start-Process cmd.exe -WorkingDirectory $web -ArgumentList '/c',("npm run dev -- -H 0.0.0.0 -p {0}" -f $NextPort) -WindowStyle Minimized | Out-Null
  }
}else{
  Write-Host "package.json در $WebDir پیدا نشد؛ بخش فرانت را رد کردم." -ForegroundColor Yellow
}

# 6) اگر اسکریپت‌های جانبی موجود بود، با Bypass اجراشان کن
$maybe = @("apply_backend_patch.ps1","apply_front_patch.ps1","inject_pro_pack.ps1","oneclick.ps1")
foreach($name in $maybe){
  $sp = Join-Path $Root $name
  if(Test-Path $sp){
    try{
      powershell -NoProfile -ExecutionPolicy Bypass -File $sp -BackendDir $BackendDir -WebDir $WebDir -ApiPort $ApiPort -NextPort $NextPort -AdminUser $AdminUser -AdminPass $AdminPass
    }catch{ Write-Host "خطا در اجرای  `$($name): $($_.Exception.Message)" -ForegroundColor Yellow }
  }
}

# 7) چاپ آدرس‌ها
$lan = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike '*vEthernet*' -and $_.IPAddress -notlike '169.*'} | Select-Object -First 1 -ExpandProperty IPAddress)
if(!$lan){ $lan = '127.0.0.1' }

Write-Host ""
Write-Host "API:           http://localhost:$ApiPort" -ForegroundColor Green
Write-Host "Admin (Django): http://localhost:$ApiPort/admin    (user=$AdminUser  pass=$AdminPass)" -ForegroundColor Green
Write-Host "Website (LAN):  http://`$($lan):$NextPort" -ForegroundColor Cyan
Write-Host ""
Write-Host "تمام! پنجره‌های سرور بک‌اند و فرانت به صورت Minimized اجرا شدند." -ForegroundColor Magenta

