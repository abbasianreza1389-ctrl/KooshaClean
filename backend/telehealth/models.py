from __future__ import annotations
from django.db import models
from django.conf import settings
from django.utils import timezone
from secrets import token_urlsafe

User = settings.AUTH_USER_MODEL

class TeleSession(models.Model):
    STATUS = [("scheduled","scheduled"),("active","active"),("ended","ended"),("canceled","canceled")]
    provider = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="tele_sessions_as_provider")
    patient  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="tele_sessions_as_patient")
    appointment_id = models.IntegerField(null=True, blank=True)
    room_slug = models.SlugField(max_length=64, unique=True, default="", blank=True)
    title = models.CharField(max_length=200, default="Tele-visit")
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS, default="scheduled")
    created_at = models.DateTimeField(auto_now_add=True)
    def save(self, *args, **kwargs):
        if not self.room_slug:
            self.room_slug = token_urlsafe(10).replace("_","-")
        return super().save(*args, **kwargs)

class QoSLog(models.Model):
    session = models.ForeignKey(TeleSession, on_delete=models.CASCADE, related_name="qos_logs")
    jitter_ms = models.FloatField(default=0)
    rtt_ms = models.FloatField(default=0)
    bitrate_kbps = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
