from rest_framework import serializers
from .models import Settlement, BillingEntry
class SettlementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settlement
        fields = '__all__'
class BillingEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingEntry
        fields = '__all__'
