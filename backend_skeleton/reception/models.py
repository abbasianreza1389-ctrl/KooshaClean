from django.db import models
from django.utils import timezone
from contracts.models import ServiceCode

class Patient(models.Model):
    code = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=40, blank=True)
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self): return f"{self.code} - {self.full_name}"

class Appointment(models.Model):
    STATUS = (('REQUESTED','Requested'),('APPROVED','Approved'),('DONE','Done'),('CANCELLED','Cancelled'))
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    provider_name = models.CharField(max_length=120)
    service = models.ForeignKey(ServiceCode, null=True, blank=True, on_delete=models.SET_NULL)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=12, choices=STATUS, default='REQUESTED')
