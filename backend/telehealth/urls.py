from django.urls import path
from .views import create_session, my_sessions, join_info, precall_qos
urlpatterns = [
    path("telehealth/session/", create_session),
    path("telehealth/sessions/", my_sessions),
    path("telehealth/session/<int:pk>/join/", join_info),
    path("telehealth/precall/", precall_qos),
]
