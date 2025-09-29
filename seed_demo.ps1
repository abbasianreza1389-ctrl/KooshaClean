
param([string]$BackendDir="backend")
$ErrorActionPreference = "Stop"
$py = ".\.venv\Scripts\python.exe"
if (!(Test-Path $py)) { throw "Python venv not found. First run .\scripts\oneclick.ps1" }
$code = @"
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','koosha_api.settings'); django.setup()
from decimal import Decimal
from contracts.models import ServiceCode, ProviderContract
from insurance.models import InsuranceRule
from scheduling.models import ScheduleRule, ScheduleException
from reception.models import Patient
from django.contrib.auth import get_user_model

# Users
U = get_user_model()
if not U.objects.filter(username='reception').exists():
    U.objects.create_user('reception', password='reception123', is_staff=True)
if not U.objects.filter(username='accounting').exists():
    U.objects.create_user('accounting', password='accounting123', is_staff=True)

# Services
pt, _ = ServiceCode.objects.get_or_create(code='PT001', defaults={'name':'جلسه فیزیوتراپی ۳۰ دقیقه‌ای','base_price':Decimal('600000')})
ot, _ = ServiceCode.objects.get_or_create(code='OT001', defaults={'name':'کاردرمانی ۳۰ دقیقه‌ای','base_price':Decimal('650000')})

# Provider contracts
ProviderContract.objects.get_or_create(provider_name='Dr-Rehab', service=pt, defaults={'type':'percent','percent':Decimal('40.0')})
ProviderContract.objects.get_or_create(provider_name='PT-Provider', service=None, defaults={'type':'percent','percent':Decimal('35.0')})

# Insurance rules (base)
InsuranceRule.objects.get_or_create(kind='base', insurer='TaminEjtemaei', service=pt, defaults={'tariff':Decimal('600000'),'patient_share':Decimal('180000')})
InsuranceRule.objects.get_or_create(kind='base', insurer='ArmedForces', service=ot, defaults={'tariff':Decimal('650000'),'patient_share':Decimal('200000')})

# Schedule rules
import datetime
for wd in [0,2,4]:  # شنبه/دوشنبه/چهارشنبه (با توجه به تنظیمات محلی شما ممکن است متفاوت باشد)
    ScheduleRule.objects.get_or_create(provider_name='Dr-Rehab', weekday=wd, start_time=datetime.time(9,0), end_time=datetime.time(13,0), slot_minutes=30)

# Sample patient
Patient.objects.get_or_create(code='PB1', defaults={'full_name':'بیمار نمونه','phone':'09120000000'})

print("Seed completed.")
"@
$tmp = Join-Path $env:TEMP "koosha_seed.py"
Set-Content -Encoding UTF8 $tmp $code
& $py (Join-Path $BackendDir "manage.py") shell < $tmp
Remove-Item $tmp -ErrorAction SilentlyContinue
Write-Host "✓ داده‌های نمونه اعمال شد."
