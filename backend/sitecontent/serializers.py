from rest_framework import serializers
from .models import Attachment

class AttachmentSer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ['id','title','file','created_at']
