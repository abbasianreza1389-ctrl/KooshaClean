from django.db import models
class ScheduleRule(models.Model):
    provider_name = models.CharField(max_length=120)
    weekday = models.IntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_minutes = models.PositiveIntegerField(default=30)
class ScheduleException(models.Model):
    provider_name = models.CharField(max_length=120)
    date = models.DateField()
    closed = models.BooleanField(default=False)
class CapacityWindow(models.Model):
    provider_name = models.CharField(max_length=120)
    start = models.DateTimeField()
    end = models.DateTimeField()
    max_concurrent = models.PositiveIntegerField(default=1)
