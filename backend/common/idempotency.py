from django.db import transaction
from django.http import JsonResponse
from functools import wraps

# Simple in-DB idempotency via Payment.idempotency_key (enforced unique).
def require_idempotency_key(view):
    @wraps(view)
    def wrapper(request, *args, **kwargs):
        if request.method in ('POST','PUT','PATCH'):
            key = request.headers.get('Idempotency-Key')
            if not key:
                return JsonResponse({'detail':'Missing Idempotency-Key header'}, status=400)
        return view(request, *args, **kwargs)
    return wrapper
