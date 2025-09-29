from django.db import models

class ServiceCode(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=120)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self): return f"{self.code} - {self.name}"

class ProviderContract(models.Model):
    TYPE_CHOICES = (('percent','Percent'),('fixed','Fixed'))
    provider_name = models.CharField(max_length=120)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='percent')
    percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # e.g., 30 => 30%
    fixed_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    service = models.ForeignKey(ServiceCode, null=True, blank=True, on_delete=models.SET_NULL)  # per-service override
