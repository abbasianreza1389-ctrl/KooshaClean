from rest_framework import serializers
from .models import Attachment

class AttachmentSer(serializers.ModelSerializer):
    file_url  = serializers.SerializerMethodField()
    thumb_url = serializers.SerializerMethodField()

    class Meta:
        model  = Attachment
        fields = ["id","kind","title","file","file_url","thumb","thumb_url",
                  "size","mime","public",
                  "patient","appointment","billing_entry","referral",
                  "created","created_by"]
        read_only_fields = ["size","mime","file_url","thumb_url","created","created_by"]

    def get_file_url(self, obj):
        req = self.context.get("request")
        return req.build_absolute_uri(obj.file.url) if req else obj.file.url

    def get_thumb_url(self, obj):
        if not obj.thumb: return None
        req = self.context.get("request")
        return req.build_absolute_uri(obj.thumb.url) if req else obj.thumb.url
