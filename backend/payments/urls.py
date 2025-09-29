from django.urls import path
from .views import create_intent, confirm
urlpatterns = [
    path('payments/create_intent/', create_intent),
    path('payments/confirm/', confirm),
]
