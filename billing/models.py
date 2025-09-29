from django.db import models

class Settlement(models.Model):
    title = models.CharField(max_length=120)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.amount})"

class BillingEntry(models.Model):
    settlement = models.ForeignKey(Settlement, related_name='entries', on_delete=models.CASCADE, null=True, blank=True)
    description = models.CharField(max_length=200, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.description or f"Entry #{self.pk}"
