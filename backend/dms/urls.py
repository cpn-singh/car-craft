from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import DealerViewSet, LeadViewSet, RegisterView, CustomLoginView, CurrentUserView

router = DefaultRouter()
router.register(r'dealers', DealerViewSet, basename='dealer')
router.register(r'leads', LeadViewSet, basename='lead')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomLoginView.as_view(), name='custom_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),
    path('', include(router.urls)),
]
