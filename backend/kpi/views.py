from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from reception.models import Appointment
from billing.models import BillingEntry
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overview(request):
    return Response({
        'appointments': Appointment.objects.count(),
        'billing_entries': BillingEntry.objects.count(),
    })
