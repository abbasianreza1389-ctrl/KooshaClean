import csv, io
from decimal import Decimal
from datetime import datetime, timedelta
from dateutil import parser as dtp
from django.http import HttpResponse
from django.utils.timezone import now, make_aware, get_default_timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import Group
from scheduling.models import AvailabilityRule, AvailabilityException, Capacity, BookingRequest, Appointment, AuditLog
from billing.models import BillingEntry, Settlement, ProviderContract, InsuranceRule
from ops.models import ShiftClose
from .serializers import (
    RuleSer, ExcSer, CapSer, BookingReqSer, AppointmentSer, BillingEntrySer, SettlementSer,
    ShiftCloseSer, ProviderContractSer, InsuranceRuleSer, AuditLogSer
)
from scheduling.availability_service import free_slots

def in_group(user, names): 
    try:
        return user.is_superuser or Group.objects.filter(user=user, name__in=names).exists()
    except: 
        return False

def log(user, action, objtype, objid, message=""):
    AuditLog.objects.create(user=getattr(user,"username",""), action=action, object_type=objtype, object_id=str(objid), message=message)

# ---- PUBLIC endpoints ----
@api_view(["GET"])
@permission_classes([AllowAny])
def availability(request):
    date = request.GET.get("date")
    if not date: return Response({"error":"date_required"}, status=400)
    dept = request.GET.get("dept",""); provider = request.GET.get("provider","")
    return Response(free_slots(date, dept, provider))

@api_view(["POST"])
@permission_classes([AllowAny])
def booking_public(request):
    data = request.data or {}
    br = BookingRequest.objects.create(
        name=data.get("name","").strip(),
        phone=data.get("phone","").strip(),
        service=data.get("service","").strip(),
        service_code=data.get("service_code","").strip(),
        insurer=data.get("insurer","").strip(),
        slot=data.get("slot","").strip(),
        note=data.get("note","").strip(),
    )
    return Response({"ok":True, "id":br.id}, status=201)

# ---- ADMIN / RECEPTION ----
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def kpis(request):
    if not in_group(request.user, ["manager","accountant"]): return Response(status=403)
    # نمونه ساده: جمع از BillingEntry ماه جاری
    today = now().date().replace(day=1)
    qs = BillingEntry.objects.filter(created_at__date__gte=today)
    revenue = sum((b.amount_gross or 0) for b in qs)
    sessions = Appointment.objects.filter(status="done", start__date__gte=today).count()
    occ = 75  # می‌توان از ظرفیت واقعی محاسبه کرد
    newp = 0
    return Response({"revenue_month": revenue, "sessions_done": sessions, "occupancy": occ, "new_patients": newp, "trend":[12,14,18,22,25,27,30]})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def booking_requests(request):
    if not in_group(request.user, ["manager","reception"]): return Response(status=403)
    qs = BookingRequest.objects.filter(status="pending").order_by("-id")
    return Response(BookingReqSer(qs, many=True).data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def booking_action(request, pk:int, action:str):
    if not in_group(request.user, ["manager","reception"]): return Response(status=403)
    try: br = BookingRequest.objects.get(pk=pk)
    except BookingRequest.DoesNotExist: return Response({"error":"not_found"}, status=404)

    if action == "approve":
        # تلاش برای ساخت Appointment دقیق از req_date/req_time یا slot
        tz = get_default_timezone()
        dt = now() + timedelta(hours=1)
        try:
            if br.req_date and br.req_time:
                dt = make_aware(datetime.combine(br.req_date, br.req_time), tz)
            elif br.slot:
                dt = make_aware(dtp.parse(br.slot), tz)
        except: pass
        ap = Appointment.objects.create(
            dept="", provider="", patient_name=br.name, phone=br.phone,
            service=br.service, service_code=br.service_code, insurer=br.insurer,
            start=dt, end=dt + timedelta(minutes=30), status="scheduled"
        )
        br.status = "approved"; br.save()
        log(request.user,"APPROVE_REQUEST","BookingRequest", br.id, f"appt={ap.id}")
        return Response({"ok":True, "appointment_id": ap.id})
    elif action == "reject":
        br.status="rejected"; br.save()
        log(request.user,"REJECT_REQUEST","BookingRequest", br.id, "")
        return Response({"ok":True})
    return Response({"error":"bad_action"}, status=400)

# Availability CRUD
@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
def rules_list_create(request):
    if not in_group(request.user, ["manager","reception"]): return Response(status=403)
    if request.method=="GET":
        return Response(RuleSer(AvailabilityRule.objects.all().order_by("-id"), many=True).data)
    ser = RuleSer(data=request.data); 
    if ser.is_valid(): obj=ser.save(); log(request.user,"RULE_CREATE","AvailabilityRule",obj.id,""); return Response(ser.data, 201)
    return Response(ser.errors, 400)

@api_view(["PUT","DELETE"])
@permission_classes([IsAuthenticated])
def rule_update_delete(request, pk:int):
    if not in_group(request.user, ["manager","reception"]): return Response(status=403)
    try: obj = AvailabilityRule.objects.get(pk=pk)
    except AvailabilityRule.DoesNotExist: return Response(status=404)
    if request.method=="DELETE": 
        obj.delete(); log(request.user,"RULE_DELETE","AvailabilityRule",pk,""); return Response(status=204)
    ser = RuleSer(obj, data=request.data, partial=True)
    if ser.is_valid(): obj=ser.save(); log(request.user,"RULE_UPDATE","AvailabilityRule",obj.id,""); return Response(ser.data)
    return Response(ser.errors, 400)

@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
def exceptions_list_create(request):
    if not in_group(request.user, ["manager","reception"]): return Response(status=403)
    if request.method=="GET": 
        return Response(ExcSer(AvailabilityException.objects.all().order_by("-date"), many=True).data)
    ser = ExcSer(data=request.data)
    if ser.is_valid(): obj=ser.save(); log(request.user,"EXC_CREATE","AvailabilityException",obj.id,""); return Response(ser.data,201)
    return Response(ser.errors, 400)

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def exception_delete(request, pk:int):
    if not in_group(request.user, ["manager","reception"]): return Response(status=403)
    try: obj = AvailabilityException.objects.get(pk=pk)
    except AvailabilityException.DoesNotExist: return Response(status=404)
    obj.delete(); log(request.user,"EXC_DELETE","AvailabilityException",pk,"")
    return Response(status=204)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def capacity_list(request):
    if not in_group(request.user, ["manager","reception"]): return Response(status=403)
    return Response(CapSer(Capacity.objects.all().order_by("-id"), many=True).data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def capacity_upsert(request):
    if not in_group(request.user, ["manager","reception"]): return Response(status=403)
    dept = request.data.get("dept",""); provider = request.data.get("provider","")
    obj, _ = Capacity.objects.get_or_create(dept=dept, provider=provider, defaults={"max_concurrent":request.data.get("max_concurrent",1)})
    obj.max_concurrent = int(request.data.get("max_concurrent", obj.max_concurrent)); obj.save()
    log(request.user,"CAP_UPSERT","Capacity",obj.id,"")
    return Response(CapSer(obj).data)

# Appointment → DONE (ایجاد BillingEntry)
def _compute_billing(ap: Appointment):
    gross = Decimal("0")
    insurer_share = patient_share = Decimal("0")
    try:
        rule = InsuranceRule.objects.filter(insurer=ap.insurer, service_code=ap.service_code).first()
        if rule:
            gross = rule.tariff
            patient_share = (gross * (rule.patient_share_percent / Decimal("100"))).quantize(Decimal("1."))
            insurer_share = (gross - patient_share).quantize(Decimal("1."))
    except: pass
    provider_share = Decimal("0")
    try:
        pc = ProviderContract.objects.filter(provider=ap.provider, service_code=ap.service_code, active=True).first()
        if pc:
            if pc.kind=="percent":
                provider_share = (gross * (pc.value/Decimal("100"))).quantize(Decimal("1."))
            else:
                provider_share = pc.value
    except: pass
    clinic_share = (gross - provider_share - insurer_share - patient_share)
    if clinic_share < 0: clinic_share = Decimal("0")
    be = BillingEntry.objects.create(
        patient_name=ap.patient_name, service_code=ap.service_code, provider=ap.provider, insurer=ap.insurer,
        amount_gross=gross, clinic_share=clinic_share, provider_share=provider_share,
        insurer_share=insurer_share, patient_share=patient_share, status="open"
    )
    return be

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def appointment_done(request, pk:int):
    if not in_group(request.user, ["manager","reception","doctor"]): return Response(status=403)
    try: ap = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist: return Response(status=404)
    ap.status = "done"; ap.save()
    be = _compute_billing(ap)
    log(request.user,"APPT_DONE","Appointment", ap.id, f"billing={be.id}")
    return Response({"ok":True, "billing_id": be.id})

# Cashier Close / Approve
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def close_shift(request):
    if not in_group(request.user, ["reception","manager","accountant"]): return Response(status=403)
    data = request.data.copy(); data["user"] = getattr(request.user,"username","reception")
    ser = ShiftCloseSer(data=data)
    if ser.is_valid(): obj=ser.save(); log(request.user,"CASHIER_CLOSE","ShiftClose", obj.id,""); return Response({"ok":True}, 201)
    return Response(ser.errors, 400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_shift(request, pk:int):
    if not in_group(request.user, ["manager","accountant"]): return Response(status=403)
    try: s = ShiftClose.objects.get(pk=pk)
    except ShiftClose.DoesNotExist: return Response(status=404)
    s.approved_by = getattr(request.user,"username",""); s.approved_at = now(); s.save()
    log(request.user,"CASHIER_APPROVE","ShiftClose", pk,"")
    return Response({"ok":True})

# Billing Close Period / Settlements
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def close_period(request):
    if not in_group(request.user, ["manager","accountant"]): return Response(status=403)
    period = request.data.get("period")
    if not period: return Response({"error":"period_required"}, 400)
    # قفل کردن: بستن همهٔ BillingEntry های دوره
    qs = BillingEntry.objects.all()  # TODO: فیلتر واقعی بر اساس تاریخ/دوره
    gross = Decimal("0"); clinic = Decimal("0"); prov = Decimal("0")
    for b in qs:
        b.status = "closed"; b.save()
        gross += b.amount_gross; clinic += b.clinic_share; prov += b.provider_share
    st = Settlement.objects.create(provider="ALL", period=period, gross_total=gross, clinic_share_total=clinic, provider_share_total=prov, status="Closed")
    log(request.user,"CLOSE_PERIOD","Settlement", st.id, f"period={period}")
    return Response({"ok":True, "id":st.id})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def settlements(request):
    if not in_group(request.user, ["manager","accountant"]): return Response(status=403)
    qs = Settlement.objects.all().order_by("-created_at")[:200]
    return Response(SettlementSer(qs, many=True).data)

# Export samples
def _entries():
    return BillingEntry.objects.all()

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_csv(request):
    if not in_group(request.user, ["manager","accountant"]): return Response(status=403)
    resp = HttpResponse(content_type="text/csv; charset=utf-8")
    resp["Content-Disposition"] = 'attachment; filename="report.csv"'
    w = csv.writer(resp); w.writerow(["patient","service","gross","clinic","provider","insurer","patient_share","created_at"])
    for b in _entries():
        w.writerow([b.patient_name,b.service_code,b.amount_gross,b.clinic_share,b.provider_share,b.insurer_share,b.patient_share,b.created_at.strftime("%Y-%m-%d")])
    return resp

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_xlsx(request):
    if not in_group(request.user, ["manager","accountant"]): return Response(status=403)
    import xlsxwriter
    out = io.BytesIO(); wb = xlsxwriter.Workbook(out, {"in_memory": True}); ws = wb.add_worksheet("Report")
    headers = ["patient","service","gross","clinic","provider","insurer","patient_share","created_at"]
    for i,h in enumerate(headers): ws.write(0,i,h)
    r=1
    for b in _entries():
        ws.write_row(r,0,[b.patient_name,b.service_code,float(b.amount_gross),float(b.clinic_share),float(b.provider_share),float(b.insurer_share),float(b.patient_share),b.created_at.strftime("%Y-%m-%d")]); r+=1
    wb.close()
    resp = HttpResponse(out.getvalue(), content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    resp["Content-Disposition"] = 'attachment; filename="report.xlsx"'
    return resp

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_pdf(request):
    if not in_group(request.user, ["manager","accountant"]): return Response(status=403)
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    buff = io.BytesIO(); c = canvas.Canvas(buff, pagesize=A4)
    c.setFont("Helvetica", 12); c.drawString(40, 800, "Koosha Financial Report")
    c.drawString(40, 780, now().strftime("%Y-%m-%d %H:%M"))
    c.showPage(); c.save()
    resp = HttpResponse(buff.getvalue(), content_type="application/pdf")
    resp["Content-Disposition"] = 'attachment; filename="report.pdf"'
    return resp
