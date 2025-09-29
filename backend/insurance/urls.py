from django.urls import path
from .views import payers, create_claim, submit_claim, mock_eob
urlpatterns = [
  path('insurance/payers/', payers),
  path('insurance/claims/', create_claim),
  path('insurance/claims/<int:pk>/submit/', submit_claim),
  path('insurance/claims/<int:pk>/mock_eob/', mock_eob),
]
