from django.db import models
from contracts.models import ServiceCode

class InsuranceRule(models.Model):
    KIND = (('base','Base'),('supp','Supplementary'))
    kind = models.CharField(max_length=4, choices=KIND)
    insurer = models.CharField(max_length=120)
    service = models.ForeignKey(ServiceCode, on_delete=models.CASCADE)
    tariff = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    patient_share = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cap_monthly = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
