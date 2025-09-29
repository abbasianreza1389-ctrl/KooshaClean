from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    availability, booking_public,
    kpis, booking_requests, booking_action,
    rules_list_create, rule_update_delete, exceptions_list_create, exception_delete,
    capacity_list, capacity_upsert,
    appointment_done,
    close_shift, approve_shift,
    close_period, settlements,
    export_csv, export_xlsx, export_pdf
)
urlpatterns = [
    # auth
    path("token/", TokenObtainPairView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
    # public
    path("availability/", availability),
    path("booking/public/", booking_public),
    # admin/reception
    path("admin/kpis/", kpis),
    path("admin/booking-requests/", booking_requests),
    path("admin/booking-requests/<int:pk>/<str:action>/", booking_action),
    path("admin/availability/rules/", rules_list_create),
    path("admin/availability/rules/<int:pk>/", rule_update_delete),
    path("admin/availability/exceptions/", exceptions_list_create),
    path("admin/availability/exceptions/<int:pk>/", exception_delete),
    path("admin/availability/capacity/", capacity_list),
    path("admin/availability/capacity/upsert/", capacity_upsert),
    path("appointments/<int:pk>/done/", appointment_done),
    path("cashier/close-shift/", close_shift),
    path("cashier/approve/<int:pk>/", approve_shift),
    path("billing/close-period/", close_period),
    path("billing/settlements/", settlements),
    path("admin/export/csv/", export_csv),
    path("admin/export/xlsx/", export_xlsx),
    path("admin/export/pdf/", export_pdf),
]
