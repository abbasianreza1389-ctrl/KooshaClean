from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceViewSet, DoctorViewSet, PostViewSet,
    PatientViewSet, AppointmentViewSet, BillingEntryViewSet,
    summary, calendar_slots
)

r = DefaultRouter()
r.register(r"public/services", ServiceViewSet, basename="services")
r.register(r"public/doctors",  DoctorViewSet, basename="doctors")
r.register(r"public/posts",    PostViewSet,   basename="posts")
r.register(r"patients",        PatientViewSet)
r.register(r"appointments",    AppointmentViewSet)
r.register(r"billing/entries", BillingEntryViewSet)

urlpatterns = [
    path("", include(r.urls)),
    path("reports/summary/", summary),
    path("calendar/slots/",  calendar_slots),
]
from .views import AttachmentViewSet
r.register(r"attachments", AttachmentViewSet)
