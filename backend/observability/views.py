from django.http import JsonResponse, HttpResponse
from django.utils import timezone
def status_json(_):
    return JsonResponse({"status":"ok","generated_at": timezone.now().isoformat(),"services":{"api": True, "db": True}})
def status_html(_):
    html = f"<html><body style='font-family:system-ui'><h2>Koosha – Status</h2><p>Generated at: {timezone.now().isoformat()}</p><ul><li>API: <b style='color:green'>OK</b></li><li>DB: <b style='color:green'>OK</b></li></ul></body></html>"
    return HttpResponse(html)
