from django.db import models
from django.contrib.auth import get_user_model

class CashSession(models.Model):
    opened_by = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, related_name='cash_opened')
    closed_by = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True, related_name='cash_closed')
    opened_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    totals = models.JSONField(default=dict, blank=True)

class Payment(models.Model):
    TYPE = (('cash','Cash'),('pos','POS'),('transfer','Transfer'),('cheque','Cheque'))
    type = models.CharField(max_length=10, choices=TYPE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created = models.DateTimeField(auto_now_add=True)
