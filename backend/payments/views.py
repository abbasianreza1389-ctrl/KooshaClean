import hmac, hashlib, json, secrets
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from common.idempotency import require_idempotency_key
from .models import Payment

@api_view(['POST'])
@permission_classes([AllowAny])
@require_idempotency_key
def create_intent(request):
    key = request.headers.get('Idempotency-Key')
    body = request.data or {}
    amount = int(body.get('amount_minor', 0))
    currency = body.get('currency','IRR')
    metadata = body.get('metadata',{})
    p, created = Payment.objects.get_or_create(idempotency_key=key, defaults={
        'amount_minor': amount, 'currency': currency, 'metadata': metadata
    })
    client_secret = secrets.token_hex(16)
    return Response({'payment_id': p.id, 'client_secret': client_secret, 'status': p.status, 'idempotency_key': key}, status=201 if created else 200)

@api_view(['POST'])
@permission_classes([AllowAny])
def confirm(request):
    # Optional HMAC verification (mock)
    sig = request.headers.get('X-Signature','')
    if settings.PAYMENT_WEBHOOK_SECRET:
        digest = hmac.new(settings.PAYMENT_WEBHOOK_SECRET.encode(), request.body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(digest, sig):
            return Response({'detail':'invalid signature'}, status=400)
    payment_id = request.data.get('payment_id')
    if not payment_id: return Response({'detail':'payment_id required'}, status=400)
    try:
        p = Payment.objects.get(pk=payment_id)
    except Payment.DoesNotExist:
        return Response(status=404)
    p.status = 'settled'
    p.external_id = p.external_id or secrets.token_hex(8)
    p.save(update_fields=['status','external_id'])
    return Response({'ok': True, 'status': p.status, 'external_id': p.external_id})
