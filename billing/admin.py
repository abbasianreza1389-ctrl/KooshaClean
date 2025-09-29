from django.contrib import admin
from .models import Settlement, BillingEntry
@admin.register(Settlement)
class SettlementAdmin(admin.ModelAdmin):
    list_display = ('id','title','amount','created')
@admin.register(BillingEntry)
class BillingEntryAdmin(admin.ModelAdmin):
    list_display = ('id','settlement','description','price','created')
