from rest_framework import serializers
from .models import ServiceAppointment
from inventory.serializers import VehicleSerializer


class ServiceAppointmentSerializer(serializers.ModelSerializer):
    service_type_display = serializers.CharField(source='get_service_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    vehicle_info = VehicleSerializer(source='vehicle', read_only=True)

    class Meta:
        model = ServiceAppointment
        fields = [
            'id', 'customer', 'customer_name', 'customer_email', 'customer_phone',
            'vehicle', 'vehicle_info', 'vehicle_details', 'service_type',
            'service_type_display', 'appointment_date', 'appointment_time',
            'notes', 'status', 'status_display', 'estimated_cost',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']
