from django.db import models
from reception.models import Patient
from contracts.models import ServiceCode
class Referral(models.Model):
    patient=models.ForeignKey(Patient, on_delete=models.CASCADE)
    referrer=models.CharField(max_length=120, blank=True, default='')
    note=models.TextField(blank=True, default='')
    created=models.DateTimeField(auto_now_add=True)
class ReferralItem(models.Model):
    referral=models.ForeignKey(Referral, related_name='items', on_delete=models.CASCADE)
    service=models.ForeignKey(ServiceCode, on_delete=models.CASCADE)
    qty=models.PositiveIntegerField(default=1)
