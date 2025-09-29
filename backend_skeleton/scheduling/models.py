from django.db import models
from django.utils import timezone

class ScheduleRule(models.Model):
    provider_name = models.CharField(max_length=120)
    weekday = models.IntegerField()  # 0=Mon .. 6=Sun
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_minutes = models.PositiveIntegerField(default=30)

class ScheduleException(models.Model):
    provider_name = models.CharField(max_length=120)
    date = models.DateField()
    closed = models.BooleanField(default=False)
    note = models.CharField(max_length=200, blank=True)

class CapacityWindow(models.Model):
    provider_name = models.CharField(max_length=120)
    start = models.DateTimeField()
    end = models.DateTimeField()
    max_concurrent = models.PositiveIntegerField(default=1)
