from rest_framework.routers import DefaultRouter
from .views import AttachmentViewSet

r = DefaultRouter()
r.register(r"attachments", AttachmentViewSet, basename="attachments")
urlpatterns = r.urls
