
param(
  [string]$BackendDir = "backend",
  [string]$WebDir = "website",
  [int]$ApiPort = 8000,
  [int]$NextPort = 3000
)

$ErrorActionPreference = "Stop"

function Kill-Port([int]$p){
  try {
    $c = (Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue) | Select-Object -First 1
    if ($c) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue }
  } catch {}
}

# ---------- 1) Ensure venv & deps (add reportlab for PDF) ----------
if (!(Test-Path ".\.venv\Scripts\python.exe")) { python -m venv .venv }
$py = ".\.venv\Scripts\python.exe"
& $py -m pip install --upgrade pip setuptools wheel | Out-Null
& $py -m pip install reportlab | Out-Null

# ---------- 2) Patch backend files (RBAC, Insurance caps, Availability, PDF) ----------
function Write-FileUtf8($Path, $Content) {
  $dir = Split-Path -Parent $Path
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  Set-Content -Encoding UTF8 -Path $Path -Value $Content
}

# 2.1 RBAC seed command
$rbacCmd = @"
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

ROLES = {
    'admin': ['add', 'change', 'delete', 'view'],
    'reception': ['add', 'change', 'view'],
    'accounting': ['add', 'change', 'view'],
    'provider': ['view', 'change'],
    'supervisor': ['view'],
}

class Command(BaseCommand):
    help = "Seed default RBAC groups with model permissions"

    def handle(self, *args, **kwargs):
        for role, ops in ROLES.items():
            g, _ = Group.objects.get_or_create(name=role)
            # Grant view/change to all models by default based on ops
            for ct in ContentType.objects.all():
                for op in ops:
                    try:
                        p = Permission.objects.get(codename=f"{op}_{ct.model}", content_type=ct)
                        g.permissions.add(p)
                    except Permission.DoesNotExist:
                        pass
            self.stdout.write(self.style.SUCCESS(f"role {role} updated"))
"@
Write-FileUtf8 (Join-Path $BackendDir "core\management\commands\seed_roles.py") $rbacCmd

# 2.2 Insurance caps + supplementary
$insuranceModels = @"
from django.db import models
from contracts.models import ServiceCode

class InsuranceRule(models.Model):
    KIND = (('base','Base'),('supp','Supplementary'))
    kind = models.CharField(max_length=4, choices=KIND)
    insurer = models.CharField(max_length=120)
    service = models.ForeignKey(ServiceCode, on_delete=models.CASCADE)
    tariff = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    patient_share = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    cap_daily = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    cap_monthly = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        indexes = [models.Index(fields=['insurer','service','kind'])]
"@
Write-FileUtf8 (Join-Path $BackendDir "insurance\models.py") $insuranceModels

$insuranceUtils = @"
from decimal import Decimal

def compute_shares(base_tariff: Decimal, patient_share: Decimal, supp_cover: Decimal = Decimal('0'), discount: Decimal = Decimal('0')):
    """
    Returns a dict of patient/base_ins/supp_ins/clinic after applying discount and supplementary coverage.
    """
    patient = max(Decimal('0'), patient_share - discount)
    if supp_cover > 0:
        # supplementary reduces patient's part first
        use = min(patient, supp_cover)
        patient -= use
        supp_ins = use
    else:
        supp_ins = Decimal('0')
    base_ins = max(Decimal('0'), base_tariff - (patient + supp_ins))
    clinic = Decimal('0')
    return {'patient': patient, 'base_ins': base_ins, 'supp_ins': supp_ins, 'clinic': clinic}
"@
Write-FileUtf8 (Join-Path $BackendDir "insurance\utils.py") $insuranceUtils

# 2.3 AvailabilityService with CapacityWindow + edge guards
$schedulingModels = @"
from django.db import models

class ScheduleRule(models.Model):
    provider_name = models.CharField(max_length=120)
    weekday = models.IntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_minutes = models.PositiveIntegerField(default=30)

class ScheduleException(models.Model):
    provider_name = models.CharField(max_length=120)
    date = models.DateField()
    closed = models.BooleanField(default=False)

class CapacityWindow(models.Model):
    provider_name = models.CharField(max_length=120)
    start = models.DateTimeField()
    end = models.DateTimeField()
    max_concurrent = models.PositiveIntegerField(default=1)
"@
Write-FileUtf8 (Join-Path $BackendDir "scheduling\models.py") $schedulingModels

$schedulingService = @"
from datetime import datetime, timedelta
from django.db.models import Q, Count
from .models import ScheduleRule, ScheduleException, CapacityWindow
from reception.models import Appointment

def slots_for(provider_name, date):
    # Closed days
    if ScheduleException.objects.filter(provider_name=provider_name, date=date, closed=True).exists():
        return []

    rules = ScheduleRule.objects.filter(provider_name=provider_name, weekday=date.weekday())
    out = []
    for r in rules:
        t = datetime.combine(date, r.start_time); end = datetime.combine(date, r.end_time)
        slot = timedelta(minutes=r.slot_minutes)
        while t < end:
            t2 = t + slot
            # check concurrency
            maxc = CapacityWindow.objects.filter(provider_name=provider_name, start__lte=t, end__gte=t2).order_by('-max_concurrent').values_list('max_concurrent', flat=True).first() or 1
            overlaps = Appointment.objects.filter(provider_name=provider_name, status__in=['APPROVED','DONE'], start_time__lt=t2, end_time__gt=t).count()
            if overlaps < maxc:
                out.append({'start': t.isoformat(), 'end': t2.isoformat(), 'cap': maxc, 'used': overlaps})
            t = t2
    return out
"@
Write-FileUtf8 (Join-Path $BackendDir "scheduling\services.py") $schedulingService

# 2.4 Reports: CSV (exists) + PDF (reportlab)
$reportsPdf = @"
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from django.http import HttpResponse
from billing.models import BillingEntry

def export_billing_pdf(request):
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    y = height - 40
    c.setFont('Helvetica-Bold', 12)
    c.drawString(40, y, 'Koosha - Billing Summary'); y -= 20
    c.setFont('Helvetica', 10)
    total = 0
    for b in BillingEntry.objects.all().order_by('id')[:1000]:
        line = f"#{b.id} {b.description} | svc={b.service_code} | prov={b.provider_name} | price={b.price} | patient={b.patient_share} | base={b.base_ins_share} | clinic={b.clinic_share}"
        c.drawString(40, y, line[:110])
        y -= 14
        total += float(b.price or 0)
        if y < 60:
            c.showPage(); y = height - 40; c.setFont('Helvetica', 10)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(40, y-10, f"TOTAL: {total:,.0f}")
    c.showPage(); c.save()
    pdf = buf.getvalue(); buf.close()
    resp = HttpResponse(pdf, content_type='application/pdf')
    resp['Content-Disposition'] = 'attachment; filename=\"billing.pdf\"'
    return resp
"@
Write-FileUtf8 (Join-Path $BackendDir "reports\pdf.py") $reportsPdf

# 2.5 Append URLs for PDF export if not present
$urlsPath = Join-Path $BackendDir "koosha_api\urls.py"
$urls = Get-Content -Encoding UTF8 $urlsPath -Raw
if ($urls -notmatch "export_billing_pdf"):
  $urls = $urls.Replace("from reports.views import export_billing_csv","from reports.views import export_billing_csv`nfrom reports.pdf import export_billing_pdf")
  $urls = $urls.Replace("path('api/reports/billing.csv', export_billing_csv),","path('api/reports/billing.csv', export_billing_csv),`n    path('api/reports/billing.pdf', export_billing_pdf),")
  Set-Content -Encoding UTF8 $urlsPath $urls

# ---------- 3) Migrate & seed roles ----------
& $py (Join-Path $BackendDir "manage.py") makemigrations | Out-Null
& $py (Join-Path $BackendDir "manage.py") migrate | Out-Null
& $py (Join-Path $BackendDir "manage.py") seed_roles | Out-Null

# ---------- 4) Upgrade front: richer admin dashboard with charts ----------
$dashboard = @"
'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
const API = process.env.NEXT_PUBLIC_API || 'http://localhost:8000';
export default function AdminDashboard(){
  const [kpi,setKpi] = useState<any>({});
  const [err,setErr] = useState<string>('');
  useEffect(()=>{
    const t = localStorage.getItem('access')||'';
    fetch(`${API}/api/kpi/overview/`, { headers: { Authorization: `Bearer ${t}` } })
      .then(r=>r.json()).then(setKpi).catch(e=>setErr(String(e)));
  },[]);
  const data = Array.from({length:7}).map((_,i)=>({name:`روز ${i+1}`, income: Math.round(Math.random()*10)+i, appts: Math.round(Math.random()*7)}));
  return (<main dir="rtl" className="container py-6">
    <h1 className="text-2xl font-bold mb-4">داشبورد مدیریتی</h1>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card"><b>KPI</b><pre className="mt-2">{JSON.stringify(kpi,null,2)}</pre></div>
      <div className="card"><b>روند درآمد تخمینی</b><div style={{width:'100%',height:240}}>
        <ResponsiveContainer><LineChart data={data}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Line type="monotone" dataKey="income" /></LineChart></ResponsiveContainer>
      </div></div>
      <div className="card md:col-span-2"><b>تعداد نوبت‌ها</b><div style={{width:'100%',height:240}}>
        <ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="appts" /></BarChart></ResponsiveContainer>
      </div></div>
    </div>
    {err && <p className="text-red-600 mt-4">{err}</p>}
  </main>);
}
"@
Write-FileUtf8 (Join-Path $WebDir "src\app\admin-dashboard\page.tsx") $dashboard

# ---------- 5) Restart dev servers ----------
Kill-Port $ApiPort; Kill-Port $NextPort
Start-Process -FilePath $py -WorkingDirectory $BackendDir -ArgumentList "manage.py","runserver","0.0.0.0:$ApiPort" -WindowStyle Minimized | Out-Null
Start-Process "cmd.exe" -WorkingDirectory $WebDir -ArgumentList "/c","npm run dev -- -H 0.0.0.0 -p $NextPort" -WindowStyle Minimized | Out-Null

"✓ Injection applied."
"API:  http://localhost:$ApiPort"
"CSV:  http://localhost:$ApiPort/api/reports/billing.csv"
"PDF:  http://localhost:$ApiPort/api/reports/billing.pdf"
"WEB:  http://localhost:$NextPort  → داشبورد جدید /admin-dashboard"
