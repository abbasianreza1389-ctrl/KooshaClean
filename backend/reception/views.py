from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Patient, Appointment
from .serializers import PatientSerializer, AppointmentSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-id')
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all().order_by('-id')
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        ap = self.get_object()
        ap.status = 'DONE'; ap.save()
        try:
            from billing.models import BillingEntry, Settlement
            from decimal import Decimal
            BillingEntry.objects.create(description=f"Appointment #{ap.id}", price=Decimal('0'))
        except Exception:
            pass
        return Response({'ok': True})
