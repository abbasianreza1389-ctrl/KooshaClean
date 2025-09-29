from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from common.health import healthz

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/jwt/create/', TokenObtainPairView.as_view()),
    path('api/auth/jwt/refresh/', TokenRefreshView.as_view()),
    path('api/auth/jwt/verify/', TokenVerifyView.as_view()),
    path('api/', include('users.urls')),
    path('api/', include('sitecontent.urls')),
    path('healthz/', healthz),
]
