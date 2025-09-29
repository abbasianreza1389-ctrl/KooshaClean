from rest_framework import serializers
from .models import PublicBookingRequest
class PublicBookingRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicBookingRequest
        fields = '__all__'
