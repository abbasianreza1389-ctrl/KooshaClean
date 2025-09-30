from datetime import datetime, timedelta
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

SERVICES = [
  {"id": 1, "name": "ویزیت عمومی", "duration_min": 20},
  {"id": 2, "name": "فیزیوتراپی", "duration_min": 45},
  {"id": 3, "name": "روان‌درمانی", "duration_min": 50},
]
DOCTORS = [
  {"id": 1, "display_name": "دکتر کوشا"},
  {"id": 2, "display_name": "خانم درمانگر"},
]

def _slots(service_id=None, provider_id=None):
  base = datetime.now().replace(minute=0, second=0, microsecond=0)
  out = []
  for i in range(1, 10):
    out.append({"id": i, "service_id": service_id or 1, "provider_id": provider_id or 1,
                "start": (base + timedelta(hours=i)).isoformat(),
                "end": (base + timedelta(hours=i, minutes=30)).isoformat()})
  return out

@api_view(['GET'])
@permission_classes([AllowAny])
def services(_): return Response(SERVICES)

@api_view(['GET'])
@permission_classes([AllowAny])
def doctors(_): return Response(DOCTORS)

@api_view(['GET'])
@permission_classes([AllowAny])
def slots(request):
  try:
    sid = int(request.GET.get('service_id') or 1)
    pid = int(request.GET.get('provider_id') or 1)
  except Exception:
    sid, pid = 1, 1
  return Response(_slots(sid, pid))

@api_view(['POST'])
@permission_classes([AllowAny])
def appointments(request):
  data = request.data or {}
  return Response({"reservation_id": 1001, "status": "ok", "received": data})
