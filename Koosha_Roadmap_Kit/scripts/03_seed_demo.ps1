param(
  [string]$BackendDir="backend",
  [string]$ProjectName="koosha_api",
  [string]$PythonPath=".\.venv\Scripts\python.exe",
  [string]$AdminUser="admin",
  [string]$AdminPass="adminpass"
)
$ErrorActionPreference="Stop"
# Create superuser or ensure
$py = @"
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', '{PROJECT}.settings')
django.setup()
from django.contrib.auth import get_user_model
U=get_user_model()
u,created=U.objects.get_or_create(username='{USER}', defaults={{'email':'you@example.com','is_staff':True,'is_superuser':True}})
u.set_password('{PASS}'); u.save()
print('created' if created else 'exists')
"@ -replace '{PROJECT}',$ProjectName -replace '{USER}',$AdminUser -replace '{PASS}',$AdminPass
$tmp = Join-Path $env:TEMP "koosha_seed_admin.py"
Set-Content -Encoding UTF8 $tmp $py
& $PythonPath $tmp | Out-Null
Remove-Item $tmp -ErrorAction SilentlyContinue

# Seed basic data via shell
$seed = @"
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','{PROJECT}.settings'); django.setup()
from contracts.models import ServiceCode, ProviderContract
from reception.models import Patient, Appointment
from django.utils import timezone
from datetime import timedelta

s,_=ServiceCode.objects.get_or_create(code='T1001', defaults={{'name':'فیزیوتراپی','base_price':250000}})
p,_=Patient.objects.get_or_create(code='P001', defaults={{'full_name':'علی رضایی','phone':'09...'}})
# یک نوبت DONE
from datetime import datetime
start = timezone.now()
ap,_=Appointment.objects.get_or_create(patient=p, provider_name='Dr.A', service=s, start_time=start, end_time=start+timedelta(minutes=30), defaults={{'status':'DONE'}})
print('seed ok')
"@ -replace '{PROJECT}',$ProjectName
$tmp2 = Join-Path $env:TEMP "koosha_seed_data.py"
Set-Content -Encoding UTF8 $tmp2 $seed
& $PythonPath (Join-Path $BackendDir "manage.py") shell < $tmp2 | Out-Null
Remove-Item $tmp2 -ErrorAction SilentlyContinue
Write-Host "✅ Seed demo inserted." -ForegroundColor Green
