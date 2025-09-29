from django.urls import path
from .api import public_create

urlpatterns = [
    path("appointment/public/", public_create),
]
