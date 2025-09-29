from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import CashSession
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def close_session(request):
    cs = CashSession.objects.order_by('-id').first()
    if not cs or cs.closed_at:
        return Response({'detail':'no open session'}, status=400)
    cs.closed_at = timezone.now()
    cs.closed_by = request.user
    cs.totals = {'sample':'totals'}
    cs.save()
    return Response({'ok':True,'closed_at': cs.closed_at})
