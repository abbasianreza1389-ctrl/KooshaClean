from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from billing.views import SettlementViewSet, BillingEntryViewSet
from sitecontent.views import PublicBookingRequestViewSet

router = routers.DefaultRouter()
router.register(r'settlements', SettlementViewSet)
router.register(r'billing-entries', BillingEntryViewSet)
router.register(r'public-booking-requests', PublicBookingRequestViewSet)

@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    return Response({'ok': True})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response({'id': u.id, 'username': u.username, 'email': u.email})

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/jwt/create/',  TokenObtainPairView.as_view()),
    path('api/auth/jwt/refresh/', TokenRefreshView.as_view()),
    path('api/auth/jwt/verify/',  TokenVerifyView.as_view()),

    path('api/', include('users.urls')),
    path('api/', include('sitecontent.urls')),

    path('healthz/', healthz),

    path('api/', include('portal.urls')),
    path('api/', include('news.urls')),   # ← اپ جدید
]

