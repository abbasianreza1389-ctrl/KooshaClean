from rest_framework import viewsets, permissions
from .models import PublicBookingRequest
from .serializers import PublicBookingRequestSerializer
class PublicBookingRequestViewSet(viewsets.ModelViewSet):
    queryset = PublicBookingRequest.objects.all().order_by('-id')
    serializer_class = PublicBookingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
