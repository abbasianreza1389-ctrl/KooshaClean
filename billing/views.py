from rest_framework import viewsets, permissions
from .models import Settlement, BillingEntry
from .serializers import SettlementSerializer, BillingEntrySerializer
class SettlementViewSet(viewsets.ModelViewSet):
    queryset = Settlement.objects.all().order_by('-id')
    serializer_class = SettlementSerializer
    permission_classes = [permissions.IsAuthenticated]
class BillingEntryViewSet(viewsets.ModelViewSet):
    queryset = BillingEntry.objects.all().order_by('-id')
    serializer_class = BillingEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
