from django.contrib import admin
from django.urls import path, include
from common.health import health
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    path('api/', include('opd.urls')),
    path('api/v1/', include('opd.urls_real')),
    path("admin/", admin.site.urls),
    path("api/auth/jwt/create/",  TokenObtainPairView.as_view()),
    path("api/auth/jwt/refresh/", TokenRefreshView.as_view()),
    path("api/auth/jwt/verify/",  TokenVerifyView.as_view()),
    path("api/health/", health),
    path("api/users/", include("users.urls")),
]



