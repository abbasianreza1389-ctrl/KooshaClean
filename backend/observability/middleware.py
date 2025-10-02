import time, logging
from django.utils.deprecation import MiddlewareMixin
log = logging.getLogger("observability")
class ObservabilityMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request._t0 = time.perf_counter()
    def process_response(self, request, response):
        try:
            dt = (time.perf_counter() - getattr(request, "_t0", time.perf_counter()))*1000.0
            log.info("req metric path=%s status=%s dt_ms=%.1f", getattr(request,"path","?"), getattr(response,"status_code","?"), dt)
            response["Server-Timing"] = f"app;dur={dt:.1f}"
        except Exception: pass
        return response
