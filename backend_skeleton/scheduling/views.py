from datetime import date as ddate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .services import slots_for

@api_view(['GET'])
@permission_classes([AllowAny])
def availability(request):
    provider = request.GET.get('provider','default')
    date_str = request.GET.get('date')
    if not date_str:
        return Response({'detail':'date=YYYY-MM-DD required'}, status=400)
    y,m,d = map(int, date_str.split('-'))
    slots = slots_for(provider, ddate(y,m,d))
    return Response({'provider': provider, 'date': date_str, 'slots': slots})
