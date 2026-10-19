from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PartCategoryViewSet, PartViewSet, DealerPartPriceViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'categories', PartCategoryViewSet, basename='part-category')
router.register(r'parts', PartViewSet, basename='part')
router.register(r'dealer-prices', DealerPartPriceViewSet, basename='part-dealer-price')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
