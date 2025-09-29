from rest_framework import viewsets, permissions
from .models import Referral
from .serializers import ReferralSerializer
class ReferralViewSet(viewsets.ModelViewSet):
    queryset=Referral.objects.all().order_by('-id')
    serializer_class=ReferralSerializer
    permission_classes=[permissions.IsAuthenticated]
