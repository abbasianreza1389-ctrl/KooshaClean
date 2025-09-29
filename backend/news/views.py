from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Post
from .serializers import PostSer

@api_view(['GET'])
@permission_classes([AllowAny])
def posts(_):
    qs = Post.objects.filter(published=True).order_by('-created_at')[:50]
    return Response(PostSer(qs, many=True).data)
