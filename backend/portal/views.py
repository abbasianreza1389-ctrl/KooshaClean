from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_patient(_):
    return Response({'sections':['appointments','payments','documents']})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_reception(_):
    return Response({'sections':['calendar','waitlist','reports']})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_therapist(_):
    return Response({'sections':['schedule','notes','patients']})
