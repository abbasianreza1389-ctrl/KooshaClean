from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Attachment
from .serializers import AttachmentSer

class AttachmentViewSet(ModelViewSet):
    queryset = Attachment.objects.all().order_by('-id')
    serializer_class = AttachmentSer
    permission_classes = [IsAuthenticatedOrReadOnly]
