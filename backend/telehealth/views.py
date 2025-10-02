from __future__ import annotations
import os
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import TeleSession, QoSLog
from .serializers import TeleSessionSer, QoSSer

User = get_user_model()
JITSI_DOMAIN = os.environ.get("JITSI_DOMAIN","meet.jit.si")

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_session(request):
    data = request.data or {}
    ts = TeleSession.objects.create(
        provider=request.user,
        patient_id=data.get("patient"),
        appointment_id=data.get("appointment_id"),
        title=data.get("title") or "Tele-visit",
        starts_at=data.get("starts_at"),
        ends_at=data.get("ends_at"),
        status="scheduled"
    )
    return Response(TeleSessionSer(ts).data, status=201)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_sessions(request):
    qs = TeleSession.objects.filter(provider=request.user).union(
        TeleSession.objects.filter(patient=request.user)
    ).order_by("-created_at")[:100]
    return Response(TeleSessionSer(qs, many=True).data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def join_info(request, pk: int):
    ts = get_object_or_404(TeleSession, pk=pk)
    role = "guest"
    if request.user == ts.provider: role = "provider"
    elif request.user == ts.patient: role = "patient"
    url = f"https://{JITSI_DOMAIN}/{ts.room_slug}#userInfo.displayName={request.user.username}"
    return Response({"room": ts.room_slug, "jitsi_domain": JITSI_DOMAIN, "url": url, "role": role})

@api_view(["POST"])
@permission_classes([AllowAny])
def precall_qos(request):
    ser = QoSSer(data=request.data)
    ser.is_valid(raise_exception=True)
    q = ser.save()
    return Response(QoSSer(q).data, status=201)
