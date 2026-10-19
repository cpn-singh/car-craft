from rest_framework import viewsets, permissions, filters
from .models import ServiceAppointment
from .serializers import ServiceAppointmentSerializer


class ServiceAppointmentViewSet(viewsets.ModelViewSet):
    queryset = ServiceAppointment.objects.all()
    serializer_class = ServiceAppointmentSerializer
    permission_classes = [permissions.AllowAny]  # Allow customers to book appointments
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['customer_name', 'customer_email', 'customer_phone', 'vehicle_details']
    ordering_fields = ['appointment_date', 'appointment_time', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            return ServiceAppointment.objects.filter(customer=user)
        return ServiceAppointment.objects.all()

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(customer=self.request.user)
        else:
            serializer.save()
