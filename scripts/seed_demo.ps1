param([string]$BackendDir="backend")
$ErrorActionPreference="Stop"
$py = ".\.venv\Scripts\python.exe"
if(!(Test-Path $py)){ throw "Python venv not found. First run .\scripts\oneclick_pro.ps1" }
$code = @"
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','koosha_api.settings'); django.setup()
from decimal import Decimal
from contracts.models import ServiceCode, ProviderContract
from insurance.models import InsuranceRule
from scheduling.models import ScheduleRule, CapacityWindow
from reception.models import Patient
from django.contrib.auth import get_user_model

U = get_user_model()
for uname,pwd,is_staff in [('reception','reception123',True), ('accounting','accounting123',True)]:
    if not U.objects.filter(username=uname).exists():
        U.objects.create_user(uname, password=pwd, is_staff=is_staff)

pt,_=ServiceCode.objects.get_or_create(code='PT001', defaults={'name':'فیزیوتراپی ۳۰ دقیقه','base_price':Decimal('600000')})
ot,_=ServiceCode.objects.get_or_create(code='OT001', defaults={'name':'کاردرمانی ۳۰ دقیقه','base_price':Decimal('650000')})

ProviderContract.objects.get_or_create(provider_name='Dr-Rehab', service=pt, defaults={'type':'percent','percent':Decimal('40')})
ProviderContract.objects.get_or_create(provider_name='PT-Provider', service=None, defaults={'type':'percent','percent':Decimal('35')})

InsuranceRule.objects.get_or_create(kind='base', insurer='TaminEjtemaei', service=pt, defaults={'tariff':Decimal('600000'),'patient_share':Decimal('180000')})
InsuranceRule.objects.get_or_create(kind='base', insurer='ArmedForces', service=ot, defaults={'tariff':Decimal('650000'),'patient_share':Decimal('200000')})
InsuranceRule.objects.get_or_create(kind='supp', insurer='SupplementalX', service=pt, defaults={'tariff':Decimal('200000'),'patient_share':Decimal('0'),'cap_monthly':Decimal('1000000')})

import datetime
for wd in [0,2,4]:
    ScheduleRule.objects.get_or_create(provider_name='Dr-Rehab', weekday=wd, start_time=datetime.time(9,0), end_time=datetime.time(13,0), slot_minutes=30)

from datetime import datetime, timedelta
CapacityWindow.objects.get_or_create(provider_name='Dr-Rehab', start=datetime(2099,1,1,0,0), end=datetime(2099,12,31,23,59), max_concurrent=2)

Patient.objects.get_or_create(code='PB1', defaults={'full_name':'بیمار نمونه','phone':'09120000000','credit_limit':Decimal('5000000')})

print("Seed completed.")
"@
$tmp = Join-Path $env:TEMP "koosha_seed.py"
Set-Content -Encoding UTF8 $tmp $code
& $py (Join-Path $BackendDir "manage.py") shell < $tmp
Remove-Item $tmp -ErrorAction SilentlyContinue
Write-Host "✓ داده‌های نمونه اعمال شد."
