from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Payer, Policy, Claim, EOB
from .serializers import PayerSer, PolicySer, ClaimSer, EOBSer

@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def payers(request):
    if request.method=='POST':
        ser = PayerSer(data=request.data); ser.is_valid(raise_exception=True); ser.save(); return Response(ser.data,201)
    return Response(PayerSer(Payer.objects.all(), many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_claim(request):
    ser = ClaimSer(data=request.data); ser.is_valid(raise_exception=True); c = ser.save()
    return Response(ClaimSer(c).data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_claim(request, pk:int):
    try: c = Claim.objects.get(pk=pk)
    except Claim.DoesNotExist: return Response(status=404)
    c.status = 'submitted'; c.save(update_fields=['status'])
    return Response({'ok':True,'status':c.status})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mock_eob(request, pk:int):
    try: c = Claim.objects.get(pk=pk)
    except Claim.DoesNotExist: return Response(status=404)
    c.status = 'paid'; c.save(update_fields=['status'])
    eob = EOB.objects.create(claim=c, raw={'note':'mock paid'})
    return Response(EOBSer(eob).data, status=201)
