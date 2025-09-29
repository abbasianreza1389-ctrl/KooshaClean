from .models import AuditLog
def audit_middleware(get_response):
    def middleware(request):
        response = get_response(request)
        try:
            user = request.user if getattr(request,'user',None) and request.user.is_authenticated else None
            AuditLog.objects.create(
                event=f"{request.method} {request.path}",
                actor=user,
                ip_address=request.META.get('REMOTE_ADDR'),
                payload={'status_code': response.status_code}
            )
        except Exception:
            pass
        return response
    return middleware
