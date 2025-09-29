from django.db import models
class PublicBookingRequest(models.Model):
    full_name = models.CharField(max_length=120)
    phone = models.CharField(max_length=40, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.full_name
