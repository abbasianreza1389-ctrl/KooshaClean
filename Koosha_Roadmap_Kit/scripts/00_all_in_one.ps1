param(
  [string]$BackendDir="backend",
  [string]$ProjectName="koosha_api",
  [string]$WebDir="website",
  [int]$ApiPort=8000,
  [int]$NextPort=3000,
  [string]$AdminUser="admin",
  [string]$AdminPass="adminpass"
)
$ErrorActionPreference="Stop"

function Kill-Port([int]$p){ try{ $c=(Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue)|Select -First 1; if($c){ Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } }catch{} }
function Ensure-Dir($p){ if(!(Test-Path $p)){ New-Item -ItemType Directory -Path $p -Force | Out-Null } }

# Python venv
if(!(Test-Path ".\.venv\Scripts\python.exe")){
  python -m venv .venv
}
$py = ".\.venv\Scripts\python.exe"
& $py -m pip install --upgrade pip setuptools wheel | Out-Null

# Backend patch
.\scripts\01_apply_backend_patch.ps1 -BackendDir $BackendDir -ProjectName $ProjectName -PythonPath $py

# Front patch
.\scripts\02_apply_front_patch.ps1 -WebDir $WebDir -NextPort $NextPort -ApiBase ("http://localhost:{0}" -f $ApiPort)

# Seed demo
.\scripts\03_seed_demo.ps1 -BackendDir $BackendDir -ProjectName $ProjectName -PythonPath $py -AdminUser $AdminUser -AdminPass $AdminPass

# Start services
Kill-Port $ApiPort; Kill-Port $NextPort
Start-Process -FilePath $py -WorkingDirectory $BackendDir -ArgumentList "manage.py","runserver","0.0.0.0:$ApiPort" -WindowStyle Minimized | Out-Null
Start-Process "cmd.exe" -WorkingDirectory $WebDir -ArgumentList "/c","npm install && npm run dev -- -H 0.0.0.0 -p $NextPort" -WindowStyle Minimized | Out-Null

"`nAPI:           http://localhost:$ApiPort"
"Admin (Django):  http://localhost:$ApiPort/admin   (user=$AdminUser pass=$AdminPass)"
"Website:         http://localhost:$NextPort"
