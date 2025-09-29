from rest_framework import serializers
from .models import Referral, ReferralItem
class ReferralItemSerializer(serializers.ModelSerializer):
    class Meta: model=ReferralItem; fields='__all__'
class ReferralSerializer(serializers.ModelSerializer):
    items=ReferralItemSerializer(many=True, read_only=True)
    class Meta: model=Referral; fields='__all__'
