from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from django.http import HttpResponse
from billing.models import BillingEntry

def export_billing_pdf(request):
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    y = height - 40
    c.setFont('Helvetica-Bold', 12)
    c.drawString(40, y, 'Koosha - Billing Summary'); y -= 20
    c.setFont('Helvetica', 10)
    total = 0
    for b in BillingEntry.objects.all().order_by('id')[:1000]:
        line = f"#{b.id} {b.description} | svc={b.service_code} | prov={b.provider_name} | price={b.price} | patient={b.patient_share} | base={b.base_ins_share} | supp={b.supp_ins_share} | clinic={b.clinic_share}"
        c.drawString(40, y, line[:110])
        y -= 14
        total += float(b.price or 0)
        if y < 60:
            c.showPage(); y = height - 40; c.setFont('Helvetica', 10)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(40, y-10, f"TOTAL: {total:,.0f}")
    c.showPage(); c.save()
    pdf = buf.getvalue(); buf.close()
    resp = HttpResponse(pdf, content_type='application/pdf')
    resp['Content-Disposition'] = 'attachment; filename="billing.pdf"'
    return resp
