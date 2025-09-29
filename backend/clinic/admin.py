from django.contrib import admin
from .models import Service, Doctor, Post, Patient, Appointment, BillingEntry

@admin.register(Service, Doctor, Post, Patient)
class SimpleAdmin(admin.ModelAdmin):
    list_display = ("__str__", "created")
    search_fields = ("title", "name", "mobile", "slug")
    prepopulated_fields = {"slug": ("title",)} if "title" in [f.name for f in Service._meta.fields] else {}

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("patient","doctor","service","date_time","status")
    list_filter  = ("status","doctor","service")
    search_fields = ("patient__first_name","patient__last_name","patient__mobile")

@admin.register(BillingEntry)
class BillingAdmin(admin.ModelAdmin):
    list_display = ("id","total_amount","patient_paid","created")
    list_filter  = ("created",)
from .models import Attachment
@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ("id","kind","title","size","public","created")
    list_filter = ("kind","public","created")
    search_fields = ("title","file")
