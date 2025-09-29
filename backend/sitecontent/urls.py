from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttachmentViewSet

router = DefaultRouter()
router.register('attachments', AttachmentViewSet)
urlpatterns = [ path('', include(router.urls)) ]
