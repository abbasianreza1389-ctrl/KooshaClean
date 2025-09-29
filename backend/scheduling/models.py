from django.db import models
from django.conf import settings

class Location(models.Model):
    name = models.CharField(max_length=120)
    timezone = models.CharField(max_length=60, default='Asia/Tehran')
    address = models.CharField(max_length=255, blank=True)
    def __str__(self): return self.name

class Service(models.Model):
    name = models.CharField(max_length=120)
    duration_min = models.PositiveIntegerField(default=30)
    price_minor = models.PositiveIntegerField(default=0)  # e.g., Rials/Tomans minor unit
    currency = models.CharField(max_length=10, default='IRR')
    requires_payment = models.BooleanField(default=False)
    def __str__(self): return self.name

class Provider(models.Model):
    display_name = models.CharField(max_length=120)
    active = models.BooleanField(default=True)
    def __str__(self): return self.display_name

class Slot(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='slots')
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE, related_name='slots')
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='slots')
    start = models.DateTimeField()
    end = models.DateTimeField()
    capacity = models.PositiveIntegerField(default=1)
    def __str__(self): return f"{self.start} - {self.service} ({self.provider})"

class Appointment(models.Model):
    STATUS = [('pending','در انتظار پرداخت/تایید'),('confirmed','تایید شده'),('completed','تکمیل'),('canceled','لغو'),('no_show','غیبت')]
    slot = models.ForeignKey(Slot, on_delete=models.PROTECT, related_name='appointments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    guest_name = models.CharField(max_length=120, blank=True)
    guest_phone = models.CharField(max_length=40, blank=True)
    guest_email = models.EmailField(blank=True)
    status = models.CharField(max_length=12, choices=STATUS, default='pending')
    amount_minor = models.PositiveIntegerField(default=0)
    currency = models.CharField(max_length=10, default='IRR')
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f"Appt[{self.id}] {self.slot} - {self.status}"

class Waitlist(models.Model):
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE)
    contact_phone = models.CharField(max_length=40)
    desired_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
