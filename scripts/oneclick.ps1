param([string]$BackendDir="backend",[string]$WebDir="website",[int]$ApiPort=8000,[int]$NextPort=3000,[string]$AdminUser="admin",[string]$AdminPass="adminpass")
$ErrorActionPreference="Stop"
function Kill-Port([int]$p){ try{ $c=(Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue)|Select-Object -First 1; if($c){ Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } }catch{} }
if(!(Test-Path ".\.venv\Scripts\python.exe")){ python -m venv .venv }
$py=".\.venv\Scripts\python.exe"
& $py -m pip install --upgrade pip setuptools wheel | Out-Null
& $py -m pip install -r (Join-Path $BackendDir "requirements.txt") | Out-Null
& $py (Join-Path $BackendDir "manage.py") makemigrations | Out-Null
& $py (Join-Path $BackendDir "manage.py") migrate | Out-Null
$pycode="import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE','koosha_api.settings'); django.setup(); from django.contrib.auth import get_user_model; U=get_user_model(); u,created=U.objects.get_or_create(username='%s', defaults={'is_staff':True,'is_superuser':True}); u.set_password('%s'); u.save(); print('ok')" -f $AdminUser,$AdminPass
$tmp=Join-Path $env:TEMP "koosha_admin.py"; Set-Content -Encoding UTF8 $tmp $pycode; & $py $tmp | Out-Null; Remove-Item $tmp -ErrorAction SilentlyContinue
Push-Location $WebDir; if(Test-Path "package.json"){ cmd /c "npm install" } ; Pop-Location
Kill-Port $ApiPort; Kill-Port $NextPort
Start-Process -FilePath $py -WorkingDirectory $BackendDir -ArgumentList "manage.py","runserver","0.0.0.0:$ApiPort" -WindowStyle Minimized | Out-Null
Start-Process "cmd.exe" -WorkingDirectory $WebDir -ArgumentList "/c","npm run dev -- -H 0.0.0.0 -p $NextPort" -WindowStyle Minimized | Out-Null
"API: http://localhost:$ApiPort"; "Admin: http://localhost:$ApiPort/admin (user=$AdminUser pass=$AdminPass)"; "Web: http://localhost:$NextPort"
