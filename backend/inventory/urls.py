from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehicleViewSet, VehicleImageViewSet, DealerVehiclePriceViewSet

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'images', VehicleImageViewSet, basename='vehicle-image')
router.register(r'dealer-prices', DealerVehiclePriceViewSet, basename='dealer-price')

urlpatterns = [
    path('', include(router.urls)),
]
