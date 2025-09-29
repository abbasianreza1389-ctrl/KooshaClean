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

# If no project, create
if(!(Test-Path (Join-Path $BackendDir "manage.py"))){
  & $PythonPath -m django startproject $ProjectName $BackendDir
}

# Copy skeleton
Copy-Item -Recurse -Force (Join-Path $PSScriptRoot "..\backend_skeleton\*") $BackendDir

# Patch settings.py
$settings = Join-Path $BackendDir "$ProjectName\settings.py"
if(!(Test-Path $settings)){ throw "settings.py not found: $settings" }
$s = Get-Content $settings -Raw
$appList = @('corsheaders','rest_framework','django_filters','billing','sitecontent','core','scheduling','reception','contracts','insurance','cashbox','kpi','reports')
foreach($a in $appList){ if($s -notmatch "'$a'"){ $s = [regex]::Replace($s,'(?s)(INSTALLED_APPS\s*=\s*\[)(.*?)(\])',{"$($args[0].Groups[1].Value)$($args[0].Groups[2].Value)`n    '$a',$($args[0].Groups[3].Value)"}) } }
if($s -notmatch "REST_FRAMEWORK"){ $s += "`nREST_FRAMEWORK={'DEFAULT_AUTHENTICATION_CLASSES':('rest_framework_simplejwt.authentication.JWTAuthentication',),'DEFAULT_FILTER_BACKENDS':('django_filters.rest_framework.DjangoFilterBackend',)}`n" }
if($s -notmatch "CORS_ALLOW_CREDENTIALS"){ $s += "`nCORS_ALLOW_CREDENTIALS=True`nCORS_ALLOWED_ORIGINS=['http://localhost:3000']`nCSRF_TRUSTED_ORIGINS=['http://localhost:3000']`n" }
Set-Content -Encoding UTF8 $settings $s

# Install deps
& $PythonPath -m pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter | Out-Null

# Migrate
& $PythonPath (Join-Path $BackendDir "manage.py") makemigrations | Out-Null
& $PythonPath (Join-Path $BackendDir "manage.py") migrate | Out-Null

Write-Host "✅ Backend skeleton applied." -ForegroundColor Green
