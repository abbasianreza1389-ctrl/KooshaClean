from django.urls import path
from .views import status_json, status_html
urlpatterns = [ path("status.json", status_json), path("status.html", status_html) ]
