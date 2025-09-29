param(
  [string]$BackendDir   = "backend",
  [string]$ProjectName  = "koosha_api",
  [string]$PythonPath   = ".\.venv\Scripts\python.exe"
)
$ErrorActionPreference="Stop"
function Ensure-App([string]$app){
  $appDir = Join-Path $BackendDir $app
  if(!(Test-Path $appDir)){
    & $PythonPath (Join-Path $BackendDir "manage.py") startapp $app | Out-Null
  }
}

# 1) اطمینان از وجود اپ‌ها
$appList = @("core","scheduling","reception","contracts","insurance","cashbox","kpi","reports","billing","sitecontent")
foreach($a in $appList){ Ensure-App $a }

# 2) کپی فایل‌ها از این بسته به مسیر backend
$src = Join-Path $PSScriptRoot "backend_skeleton"
Copy-Item -Recurse -Force (Join-Path $src "*") $BackendDir

# 3) Patch settings.py → INSTALLED_APPS
$settings = Join-Path $BackendDir "$ProjectName\settings.py"
if(!(Test-Path $settings)){ throw "settings.py not found: $settings" }
$s = Get-Content $settings -Raw
foreach($a in $appList){
  if($s -notmatch "'$a'"){
    $s = [regex]::Replace($s,'(?s)(INSTALLED_APPS\s*=\s*\[)(.*?)(\])',{"$($args[0].Groups[1].Value)$($args[0].Groups[2].Value)`n    '$a',$($args[0].Groups[3].Value)"})
  }
}
if($s -notmatch "rest_framework_simplejwt"){
  $s = $s -replace "'rest_framework'", "'rest_framework','rest_framework_simplejwt'"
}
if($s -notmatch "django_filters"){
  $s = $s -replace "'corsheaders'", "'corsheaders','django_filters'"
}
if($s -notmatch "CORS_ALLOW_CREDENTIALS"){
  $s += "`nCORS_ALLOW_CREDENTIALS=True`nCORS_ALLOWED_ORIGINS=['http://localhost:3000']`nCSRF_TRUSTED_ORIGINS=['http://localhost:3000']`n"
}
if($s -notmatch "REST_FRAMEWORK"){
  $s += "`nREST_FRAMEWORK={'DEFAULT_AUTHENTICATION_CLASSES':('rest_framework_simplejwt.authentication.JWTAuthentication',),'DEFAULT_FILTER_BACKENDS':('django_filters.rest_framework.DjangoFilterBackend',)}`n"
}
Set-Content -Encoding UTF8 $settings $s

# 4) نصب پکیج‌های لازم
& $PythonPath -m pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter | Out-Null

# 5) makemigrations/migrate
& $PythonPath (Join-Path $BackendDir "manage.py") makemigrations | Out-Null
& $PythonPath (Join-Path $BackendDir "manage.py") migrate | Out-Null

Write-Host "✅ Backend skeletons applied. Runserver can start now." -ForegroundColor Green
