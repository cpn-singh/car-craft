from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceAppointmentViewSet

router = DefaultRouter()
router.register(r'appointments', ServiceAppointmentViewSet, basename='service-appointment')

urlpatterns = [
    path('', include(router.urls)),
]
