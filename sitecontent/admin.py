from django.contrib import admin
from .models import PublicBookingRequest
@admin.register(PublicBookingRequest)
class PublicBookingRequestAdmin(admin.ModelAdmin):
    list_display = ('id','full_name','phone','created')
