from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Appointment

class AppointmentPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ["id","full_name","phone","service","slot","note"]
    # اگر نام فیلدهای مدل متفاوت است، این ۴ اسم را با فیلدهای واقعی مچ کن.

@api_view(["POST"])
@permission_classes([AllowAny])
def public_create(request):
    """
    ساخت نوبت عمومی بدون نیاز به احراز هویت (برای سایت).
    توصیه: بعداً Recaptcha/RateLimit اضافه کنید.
    """
    data = {
        "full_name": request.data.get("name"),
        "phone": request.data.get("phone"),
        "service": request.data.get("service"),
        "slot": request.data.get("slot"),
        "note": request.data.get("note",""),
    }
    ser = AppointmentPublicSerializer(data=data)
    if ser.is_valid():
        obj = ser.save()
        return Response({"ok": True, "id": obj.id}, status=status.HTTP_201_CREATED)
    return Response({"ok": False, "errors": ser.errors}, status=400)
