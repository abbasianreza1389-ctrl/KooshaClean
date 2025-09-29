from django.db import models
from django.contrib.auth import get_user_model
class AuditLog(models.Model):
    event = models.CharField(max_length=120)
    actor = models.ForeignKey(get_user_model(), null=True, blank=True, on_delete=models.SET_NULL)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ('-id',)
