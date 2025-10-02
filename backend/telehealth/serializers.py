from rest_framework import serializers
from .models import TeleSession, QoSLog
class TeleSessionSer(serializers.ModelSerializer):
    class Meta:
        model = TeleSession
        fields = ["id","provider","patient","appointment_id","room_slug","title","starts_at","ends_at","status","created_at"]
class QoSSer(serializers.ModelSerializer):
    class Meta:
        model = QoSLog
        fields = ["id","session","jitter_ms","rtt_ms","bitrate_kbps","created_at"]
