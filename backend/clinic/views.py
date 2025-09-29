from datetime import datetime, timedelta
from django.db.models import Q, Sum
from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Service, Doctor, Post, Patient, Appointment, BillingEntry
from .serializers import (
    ServiceSer, DoctorSer, PostSer, PatientSer, AppointmentSer, BillingEntrySer
)

# ---- Public (بدون نیاز به لاگین)
class AllowAnyReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return request.user and request.user.is_authenticated

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all().order_by("id")
    serializer_class = ServiceSer
    permission_classes = [AllowAnyReadOnly]
    lookup_field = "slug"

class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all().order_by("id")
    serializer_class = DoctorSer
    permission_classes = [AllowAnyReadOnly]

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by("-date")
    serializer_class = PostSer
    permission_classes = [AllowAnyReadOnly]
    lookup_field = "slug"

# ---- Patients & Appointments (CRUD)
class PatientViewSet(viewsets.ModelViewSet):
    serializer_class = PatientSer
    queryset = Patient.objects.all().order_by("-id")
    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q) |
                Q(mobile__icontains=q) |
                Q(national_id__icontains=q)
            )
        return qs

class AppointmentViewSet(viewsets.ModelViewSet):
    serializer_class = AppointmentSer
    queryset = Appointment.objects.select_related("patient","doctor","service").order_by("-date_time")

    # اجازه رزرو از سایت عمومی بدون لاگین
    def get_permissions(self):
        if self.action in ["create"]:
            return [permissions.AllowAny()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        """
        ورودی پیشنهادی از سایت:
        {
          "first_name": "رضا", "last_name":"عباسیان", "mobile":"0912...",
          "service_slug":"physio", "doctor_id":1, "date_time":"2025-09-30T09:30:00Z", "duration_minutes":45
        }
        """
        data = request.data
        patient, _ = Patient.objects.get_or_create(
            mobile=data.get("mobile","").strip(),
            defaults=dict(first_name=data.get("first_name",""), last_name=data.get("last_name",""))
        )
        if data.get("first_name") or data.get("last_name"):
            # بروزرسانی نام در صورت خالی بودن
            patient.first_name = patient.first_name or data.get("first_name","")
            patient.last_name  = patient.last_name or data.get("last_name","")
            patient.save()

        service = None
        if s := data.get("service_slug"):
            try: service = Service.objects.get(slug=s)
            except Service.DoesNotExist: pass

        doctor = None
        if did := data.get("doctor_id"):
            try: doctor = Doctor.objects.get(id=did)
            except Doctor.DoesNotExist: pass

        ap = Appointment.objects.create(
            patient=patient, service=service, doctor=doctor,
            date_time=data.get("date_time"), duration_minutes=data.get("duration_minutes",45)
        )
        return Response(AppointmentSer(ap).data, status=201)

    @action(detail=False, methods=["get"])
    def by_day(self, request):
        """لیست نوبت‌های یک روز برای نمایش تقویم"""
        date = request.query_params.get("date")  # YYYY-MM-DD
        doctor_id = request.query_params.get("doctor")
        qs = self.get_queryset()
        if date:
            dt = datetime.fromisoformat(date)
            qs = qs.filter(date_time__date=dt.date())
        if doctor_id:
            qs = qs.filter(doctor_id=doctor_id)
        return Response(AppointmentSer(qs, many=True).data)

# ---- Billing
class BillingEntryViewSet(viewsets.ModelViewSet):
    serializer_class = BillingEntrySer
    queryset = BillingEntry.objects.select_related("appointment","appointment__patient","appointment__doctor").order_by("-id")

    def get_queryset(self):
        qs = super().get_queryset()
        date_from = self.request.query_params.get("from")
        date_to   = self.request.query_params.get("to")
        if date_from: qs = qs.filter(created__date__gte=date_from)
        if date_to:   qs = qs.filter(created__date__lte=date_to)
        return qs

# ---- Reports / Calendar utility
@api_view(["GET"])
def summary(request):
    """گزارش سریع داشبورد (امروز)"""
    today = datetime.now().date()
    apps = Appointment.objects.filter(date_time__date=today)
    cnt = apps.count()
    billed = BillingEntry.objects.filter(created__date=today).aggregate(s=Sum("patient_paid"))["s"] or 0
    return Response({"appointments_today": cnt, "patient_paid_today": billed})

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def calendar_slots(request):
    """
    خروجی اسلات‌ها برای تقویم ساده:
    ?date=YYYY-MM-DD&doctor=1&start=08:00&end=20:00&step=45
    """
    date = datetime.fromisoformat(request.GET.get("date"))
    start = datetime.fromisoformat(f"{date.date()}T{request.GET.get('start','08:00')}:00")
    end   = datetime.fromisoformat(f"{date.date()}T{request.GET.get('end','20:00')}:00")
    step  = int(request.GET.get("step", 45))
    doctor_id = request.GET.get("doctor")

    taken = set(
        Appointment.objects.filter(date_time__date=date.date(), doctor_id=doctor_id)
        .values_list("date_time", flat=True)
    )
    slots = []
    t = start
    while t < end:
        free = t not in taken
        slots.append({"time": t.isoformat(), "free": free})
        t += timedelta(minutes=step)
    return Response({"date": str(date.date()), "slots": slots})
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from .models import Attachment
from .serializers import AttachmentSer

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all().order_by("-created")
    serializer_class = AttachmentSer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        # فیلتر بر اساس آبجکت مرتبط: ?model=clinic.patient&object_id=1
        model = self.request.query_params.get("model")
        oid   = self.request.query_params.get("object_id")
        public = self.request.query_params.get("public")
        if model and oid:
            try:
                app_label, model_name = model.split(".")
                ct = ContentType.objects.get(app_label=app_label, model=model_name)
                qs = qs.filter(content_type=ct, object_id=oid)
            except Exception:
                pass
        if public == "1":
            qs = qs.filter(public=True)
        return qs

    def perform_create(self, serializer):
        # انتظار ورودی: multipart با فیلدهای kind, file, title (اختیاری) +
        # model=clinic.patient, object_id=ID (اختیاری)
        request = self.request
        model = request.data.get("model")
        object_id = request.data.get("object_id")
        ct = None
        if model and object_id:
            app_label, model_name = model.split(".")
            ct = ContentType.objects.get(app_label=app_label, model=model_name)
        serializer.save(content_type=ct, object_id=object_id or None)
