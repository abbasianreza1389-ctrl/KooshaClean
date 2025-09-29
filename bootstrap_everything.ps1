param(
  [string]$BaseDir='D:\Koosha',
  [string]$WebName='website',
  [string]$BackendDirName='backend',
  [int]$ApiPort=8000,
  [int]$NextPort=3000,
  [string]$AdminUser='admin',
  [string]$AdminPass='adminpass',
  [string]$AdminEmail='you@example.com',
  [string]$ZipPath=''
)
$ErrorActionPreference='Stop'
function Ensure-Dir([string]$p){ if(-not (Test-Path $p)){ New-Item -ItemType Directory -Path $p -Force | Out-Null } (Resolve-Path $p).Path }
function Kill-Port([int]$p){ try{ $c=Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue|Select-Object -First 1; if($c){ Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } }catch{} }
function Write-TempPy([string]$content){ $tmp=[IO.Path]::GetTempFileName().Replace('.tmp','.py'); Set-Content -Encoding UTF8 $tmp $content; $tmp }

$BaseDir=Ensure-Dir $BaseDir
$backend=Ensure-Dir (Join-Path $BaseDir $BackendDirName)
$webDir=Ensure-Dir (Join-Path $BaseDir $WebName)

if(-not (Get-Command python -ErrorAction SilentlyContinue)){ throw 'Python not installed' }
$venv=Join-Path $BaseDir '.venv'
if(-not (Test-Path $venv)){ python -m venv $venv | Out-Null }
$py=Join-Path $venv 'Scripts\python.exe'
& $py -m pip install --upgrade pip setuptools wheel | Out-Null
& $py -m pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter | Out-Null

if(-not (Test-Path (Join-Path $backend 'manage.py'))){
  Push-Location $BaseDir; & $py -m django startproject koosha_api $backend; Pop-Location
}

$settingsPath = Join-Path $backend 'koosha_api\settings.py'
$s = Get-Content $settingsPath -Raw
if($s -notmatch "rest_framework"){
  $s = $s -replace "INSTALLED_APPS\s*=\s*\[","INSTALLED_APPS = [`n    'rest_framework',`n    'rest_framework_simplejwt',`n    'corsheaders',`n    'django_filters',`n"
}
if($s -notmatch "corsheaders\.middleware\.CorsMiddleware"){
  $s = $s -replace "MIDDLEWARE\s*=\s*\[","MIDDLEWARE = [`n    'corsheaders.middleware.CorsMiddleware',`n"
}
if($s -notmatch "ALLOWED_HOSTS"){
  $s += "`nALLOWED_HOSTS = ['localhost','127.0.0.1']"
}
if($s -notmatch "CORS_ALLOWED_ORIGINS"){
  $s += "`nCORS_ALLOW_CREDENTIALS = True"
  $s += "`nCORS_ALLOWED_ORIGINS = ['http://localhost:$NextPort','http://127.0.0.1:$NextPort']"
  $s += "`nCSRF_TRUSTED_ORIGINS = ['http://localhost:$NextPort','http://127.0.0.1:$NextPort']"
}
if($s -notmatch "REST_FRAMEWORK"){
  $s += @"
REST_FRAMEWORK = {
  'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',),
  'DEFAULT_FILTER_BACKENDS': ('django_filters.rest_framework.DjangoFilterBackend',),
}
"@
}
Set-Content -Encoding UTF8 $settingsPath $s

$urlsPath = Join-Path $backend 'koosha_api\urls.py'
$urls = @"
from django.contrib import admin
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response({'id': u.id, 'username': u.username, 'email': u.email})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', me, name='me'),
]
"@
Set-Content -Encoding UTF8 $urlsPath $urls

Push-Location $backend
& $py manage.py makemigrations | Out-Null
& $py manage.py migrate | Out-Null
$mk = @"
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','koosha_api.settings'); django.setup()
from django.contrib.auth import get_user_model
U=get_user_model()
if not U.objects.filter(username='$AdminUser').exists():
    U.objects.create_superuser('$AdminUser','$AdminEmail','$AdminPass')
"@
$tmp = Write-TempPy $mk; & $py $tmp | Out-Null; Remove-Item $tmp -ErrorAction SilentlyContinue
Pop-Location

Kill-Port $ApiPort
Start-Process -FilePath $py -WorkingDirectory $backend -ArgumentList 'manage.py','runserver',("0.0.0.0:{0}" -f $ApiPort) -WindowStyle Minimized | Out-Null

if(Get-Command npm -ErrorAction SilentlyContinue){
  if($ZipPath -and (Test-Path $ZipPath)){ try{ Expand-Archive -Path $ZipPath -DestinationPath $webDir -Force }catch{} }
  if(Test-Path (Join-Path $webDir 'package.json')){
    Push-Location $webDir
    npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/typography | Out-Null
    $tw = @"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx,mdx}','./app/**/*.{ts,tsx,js,jsx,mdx}'],
  theme: { extend: {} },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
"@
    Set-Content -Encoding UTF8 (Join-Path $webDir 'tailwind.config.js') $tw
    $pc = "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }"
    Set-Content -Encoding UTF8 (Join-Path $webDir 'postcss.config.js') $pc
    $cssDir = Ensure-Dir (Join-Path $webDir 'src\app')
    $gcss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

:root{ color-scheme: light dark }
html[dir='rtl']{ direction: rtl }
body{ margin:0 }
.container{ max-width:72rem; margin-inline:auto; padding-inline:1rem }
.card{ border:1px solid rgba(0,0,0,.05); border-radius:.75rem; background:#fff; padding:1.25rem }
@media (prefers-color-scheme: dark){ .card{ background:#0b1220 } }
"@
    Set-Content -Encoding UTF8 (Join-Path $cssDir 'globals.css') $gcss
    $page = @"
export default function Home() {
  return (
    <main dir='rtl' className='container py-6'>
      <h1 className='text-2xl font-bold mb-4'>به کوشا خوش آمدید</h1>
      <div className='card'>
        <p>این یک کارت نمونه است تا مطمئن شویم Tailwind کار می‌کند.</p>
      </div>
    </main>
  )
}
"@
    Set-Content -Encoding UTF8 (Join-Path $cssDir 'page.tsx') $page
    Kill-Port $NextPort
    Start-Process cmd.exe -WorkingDirectory $webDir -ArgumentList '/c','npm run dev -- -H 0.0.0.0 -p',"$NextPort" -WindowStyle Minimized | Out-Null
    Pop-Location
  } else {
    Write-Host 'package.json not found in website; skipped frontend.' -ForegroundColor Yellow
  }
} else {
  Write-Host 'npm/Node not found; skipped frontend.' -ForegroundColor Yellow
}

$lan = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike 'vEthernet*' -and $_.IPAddress -notlike '169.*' } | Select-Object -First 1 -ExpandProperty IPAddress)
if(-not $lan){ $lan = '127.0.0.1' }
Write-Host ("API:            http://localhost:{0}" -f $ApiPort) -ForegroundColor Green
Write-Host ("Admin (Django): http://localhost:{0}/admin   (user={1}  pass={2})" -f $ApiPort,$AdminUser,$AdminPass) -ForegroundColor Green
Write-Host ("Website (LAN):  http://{0}:{1}" -f $lan,$NextPort) -ForegroundColor Cyan
