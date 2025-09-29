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
    path('api/health/', health),
    path('api/me/', me),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include(router.urls)),
]
