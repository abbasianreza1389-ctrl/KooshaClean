from datetime import datetime, timedelta
from django.utils.dateparse import parse_date
from django.db.models import Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Service, Provider, Slot, Appointment
from .serializers import ServiceSer, ProviderSer, SlotSer, AppointmentCreateSer

@api_view(['GET'])
@permission_classes([AllowAny])
def services(_):
    return Response(ServiceSer(Service.objects.all(), many=True).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def providers(_):
    return Response(ProviderSer(Provider.objects.all(), many=True).data)

@api_view(['GET'])
@permission_classes([AllowAny])
def slots(request):
    service_id = request.GET.get('service_id')
    provider_id = request.GET.get('provider_id')
    date_str = request.GET.get('date')
    qs = Slot.objects.all()
    if service_id: qs = qs.filter(service_id=service_id)
    if provider_id: qs = qs.filter(provider_id=provider_id)
    if date_str:
        d = parse_date(date_str)
        if d: qs = qs.filter(start__date=d)
    # Exclude full slots (capacity reached)
    qs = qs.annotate(booked=Count('appointments')).filter(booked__lt=models.F('capacity')) if qs.exists() else qs
    return Response(SlotSer(qs, many=True).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def create_appointment(request):
    ser = AppointmentCreateSer(data=request.data)
    ser.is_valid(raise_exception=True)
    slot = Slot.objects.select_for_update().get(id=ser.validated_data['slot'].id) if False else ser.validated_data['slot']
    # Simple capacity check
    booked = Appointment.objects.filter(slot=slot).exclude(status='canceled').count()
    if booked >= slot.capacity:
        return Response({'detail':'Slot is full'}, status=400)
    appt = ser.save(status='pending')
    return Response({'id': appt.id, 'status': appt.status}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, pk:int):
    try:
        appt = Appointment.objects.get(pk=pk)
    except Appointment.DoesNotExist:
        return Response(status=404)
    appt.status = 'canceled'
    appt.save(update_fields=['status'])
    return Response({'ok': True})
