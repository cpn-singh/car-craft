from django.contrib import admin
from .models import ServiceAppointment


@admin.register(ServiceAppointment)
class ServiceAppointmentAdmin(admin.ModelAdmin):
    list_display = (
        'customer_name', 'customer_phone', 'service_type', 
        'appointment_date', 'appointment_time', 'vehicle', 'status', 'estimated_cost'
    )
    list_filter = ('service_type', 'status', 'appointment_date')
    search_fields = ('customer_name', 'customer_email', 'customer_phone', 'vehicle_details')
    readonly_fields = ('created_at', 'updated_at')
