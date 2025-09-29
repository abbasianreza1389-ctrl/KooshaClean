from django.contrib import admin
from django.utils.html import format_html
from .models import Attachment

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ("id","kind","title","size","public","patient","appointment","billing_entry","referral","created","preview")
    list_filter  = ("kind","public","created")
    search_fields = ("title","file")
    autocomplete_fields = ("patient","appointment","billing_entry","referral",)

    def preview(self, obj):
        if obj.thumb:
            return format_html('<img src="{}" style="height:36px;border-radius:4px;" />', obj.thumb.url)
        return "-"
