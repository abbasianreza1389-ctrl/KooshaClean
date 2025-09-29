from rest_framework import serializers
from .models import Service, Provider, Slot, Appointment

class ServiceSer(serializers.ModelSerializer):
    class Meta: model = Service; fields = '__all__'

class ProviderSer(serializers.ModelSerializer):
    class Meta: model = Provider; fields = '__all__'

class SlotSer(serializers.ModelSerializer):
    service = ServiceSer(read_only=True)
    provider = ProviderSer(read_only=True)
    class Meta: model = Slot; fields = ['id','service','provider','location','start','end','capacity']

class AppointmentCreateSer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['slot','guest_name','guest_phone','guest_email','amount_minor','currency']
