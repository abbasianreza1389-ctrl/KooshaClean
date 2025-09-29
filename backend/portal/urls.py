from django.urls import path
from .views import dashboard_patient, dashboard_reception, dashboard_therapist
urlpatterns = [
  path('portal/patient/dashboard/', dashboard_patient),
  path('portal/reception/dashboard/', dashboard_reception),
  path('portal/therapist/dashboard/', dashboard_therapist),
]
