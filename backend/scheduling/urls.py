from django.urls import path
from .views import services, providers, slots, create_appointment, cancel_appointment

urlpatterns = [
    path('services/', services),
    path('doctors/', providers),
    path('slots/', slots),
    path('appointments/', create_appointment),
    path('appointments/<int:pk>/cancel/', cancel_appointment),
]
