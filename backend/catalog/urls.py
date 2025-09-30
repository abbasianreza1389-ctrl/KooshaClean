from django.urls import path
from .views import services, doctors, slots, appointments
urlpatterns = [
  path('services/', services),
  path('doctors/', doctors),
  path('slots/', slots),
  path('appointments/', appointments),
]
