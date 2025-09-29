from decimal import Decimal
from django.db.models import Sum
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Settlement, BillingEntry
from .serializers import SettlementSerializer, BillingEntrySerializer

class SettlementViewSet(viewsets.ModelViewSet):
    queryset=Settlement.objects.all().order_by('-id')
    serializer_class=SettlementSerializer
    permission_classes=[permissions.IsAuthenticated]

class BillingEntryViewSet(viewsets.ModelViewSet):
    queryset=BillingEntry.objects.all().order_by('-id')
    serializer_class=BillingEntrySerializer
    permission_classes=[permissions.IsAuthenticated]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def close_period(request):
    provider = request.data.get('provider_name','ALL')
    qs = BillingEntry.objects.all()
    if provider != 'ALL': qs = qs.filter(provider_name=provider)
    total = qs.aggregate(Sum('price'))['price__sum'] or Decimal('0')
    st = Settlement.objects.create(title="Period Close", provider_name=provider, amount=total)
    return Response({'ok': True, 'settlement_id': st.id, 'amount': str(total)})
