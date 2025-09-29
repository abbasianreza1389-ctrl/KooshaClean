from django.db import models
from decimal import Decimal

class ProviderContract(models.Model):
    provider = models.CharField(max_length=120)
    service_code = models.CharField(max_length=50)
    kind = models.CharField(max_length=10, choices=(("percent","percent"),("fixed","fixed")))
    value = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    active = models.BooleanField(default=True)

class InsuranceRule(models.Model):
    insurer = models.CharField(max_length=120)
    service_code = models.CharField(max_length=50)
    tariff = models.DecimalField(max_digits=12, decimal_places=2)
    patient_share_percent = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("30.00"))
    monthly_cap = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

class BillingEntry(models.Model):
    patient_name = models.CharField(max_length=120)
    service_code = models.CharField(max_length=50)
    provider = models.CharField(max_length=120, blank=True)
    insurer = models.CharField(max_length=120, blank=True)
    amount_gross = models.DecimalField(max_digits=12, decimal_places=2)
    clinic_share = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    provider_share = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    insurer_share = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    patient_share = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=16, default="open")  # open|closed
    created_at = models.DateTimeField(auto_now_add=True)

class Settlement(models.Model):
    provider = models.CharField(max_length=120)
    period = models.CharField(max_length=7)  # YYYY-MM
    gross_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    clinic_share_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    provider_share_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    status = models.CharField(max_length=10, default="Open")  # Open|Closed
    created_at = models.DateTimeField(auto_now_add=True)
