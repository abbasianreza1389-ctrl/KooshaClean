from rest_framework import serializers
from scheduling.models import AvailabilityRule, AvailabilityException, Capacity, BookingRequest, Appointment, AuditLog
from billing.models import BillingEntry, Settlement, ProviderContract, InsuranceRule
from ops.models import ShiftClose

class RuleSer(serializers.ModelSerializer):
    class Meta: model = AvailabilityRule; fields = "__all__"

class ExcSer(serializers.ModelSerializer):
    class Meta: model = AvailabilityException; fields = "__all__"

class CapSer(serializers.ModelSerializer):
    class Meta: model = Capacity; fields = "__all__"

class BookingReqSer(serializers.ModelSerializer):
    class Meta: model = BookingRequest; fields = "__all__"

class AppointmentSer(serializers.ModelSerializer):
    class Meta: model = Appointment; fields = "__all__"

class BillingEntrySer(serializers.ModelSerializer):
    class Meta: model = BillingEntry; fields = "__all__"

class SettlementSer(serializers.ModelSerializer):
    class Meta: model = Settlement; fields = "__all__"

class ShiftCloseSer(serializers.ModelSerializer):
    class Meta: model = ShiftClose; fields = "__all__"

class ProviderContractSer(serializers.ModelSerializer):
    class Meta: model = ProviderContract; fields = "__all__"

class InsuranceRuleSer(serializers.ModelSerializer):
    class Meta: model = InsuranceRule; fields = "__all__"

class AuditLogSer(serializers.ModelSerializer):
    class Meta: model = AuditLog; fields = "__all__"
