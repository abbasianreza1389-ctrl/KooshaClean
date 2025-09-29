from django.db import models

class Payment(models.Model):
    STATUS = [('created','ایجاد'),('authorized','مجوز'),('settled','تسویه'),('failed','ناموفق'),('refunded','بازگشت')]
    amount_minor = models.PositiveIntegerField()
    currency = models.CharField(max_length=10, default='IRR')
    status = models.CharField(max_length=10, choices=STATUS, default='created')
    provider = models.CharField(max_length=20, default='mock')
    idempotency_key = models.CharField(max_length=80, unique=True)
    external_id = models.CharField(max_length=80, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f"Pay[{self.id}] {self.amount_minor} {self.currency} {self.status}"
