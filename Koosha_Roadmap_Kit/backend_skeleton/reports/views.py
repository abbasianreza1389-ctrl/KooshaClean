import csv
from django.http import HttpResponse
from billing.models import BillingEntry
def export_billing_csv(request):
    resp = HttpResponse(content_type='text/csv')
    resp['Content-Disposition'] = 'attachment; filename="billing.csv"'
    w = csv.writer(resp); w.writerow(['id','desc','price','created'])
    for b in BillingEntry.objects.all().order_by('id'):
        w.writerow([b.id, getattr(b,'description',''), getattr(b,'price',''), getattr(b,'created','')])
    return resp
