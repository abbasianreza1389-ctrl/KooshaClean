from django.contrib import admin
from .models import AuditLog
@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display=('id','event','actor','ip_address','created')
    search_fields=('event','actor__username','ip_address')
