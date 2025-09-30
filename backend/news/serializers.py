from rest_framework import serializers
from .models import Post

class PostSer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id','title','slug','body','published','created_at']
