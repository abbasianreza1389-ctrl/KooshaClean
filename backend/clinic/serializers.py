from rest_framework import serializers
from .models import Service, Doctor, Post, Patient, Appointment, BillingEntry

class ServiceSer(serializers.ModelSerializer):
    class Meta: model = Service; fields = "__all__"

class DoctorSer(serializers.ModelSerializer):
    class Meta: model = Doctor; fields = "__all__"

class PostSer(serializers.ModelSerializer):
    class Meta: model = Post; fields = "__all__"

class PatientSer(serializers.ModelSerializer):
    class Meta: model = Patient; fields = "__all__"

class AppointmentSer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField(read_only=True)
    service_title = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = Appointment
        fields = "__all__"
    def get_patient_name(self, obj): return str(obj.patient)
    def get_service_title(self, obj): return obj.service.title if obj.service else None

class BillingEntrySer(serializers.ModelSerializer):
    appointment_obj = AppointmentSer(source="appointment", read_only=True)
    class Meta: model = BillingEntry; fields = "__all__"
from .models import Attachment
from rest_framework import serializers

class AttachmentSer(serializers.ModelSerializer):
    file_url  = serializers.SerializerMethodField()
    thumb_url = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ["id","kind","title","file","file_url","thumb","thumb_url",
                  "size","mime","public","content_type","object_id","created"]
        read_only_fields = ["size","mime","file_url","thumb_url","created"]

    def get_file_url(self, obj):
        r = self.context.get("request")
        return r.build_absolute_uri(obj.file.url) if obj.file and r else obj.file.url

    def get_thumb_url(self, obj):
        if not obj.thumb: return None
        r = self.context.get("request")
        return r.build_absolute_uri(obj.thumb.url) if r else obj.thumb.url
