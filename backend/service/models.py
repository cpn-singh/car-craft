from django.db import models
from django.conf import settings
from inventory.models import Vehicle


class ServiceAppointment(models.Model):
    class ServiceType(models.TextChoices):
        ANNUAL_MAINTENANCE = 'ANNUAL_MAINTENANCE', 'Periodic Periodic Service (10,000 km / 1 Year)'
        PERFORMANCE_TUNING = 'PERFORMANCE_TUNING', 'ECU Tuning & Performance Calibration'
        BRAKE_TYRE = 'BRAKE_TYRE', 'Brake Pad Replacement & Wheel Alignment'
        DIAGNOSTICS = 'DIAGNOSTICS', 'OBD-II Scanning & Electrical Diagnostics'
        DETAILING = 'DETAILING', 'Ceramic Coating & PPF Paint Protection'
        PRE_PURCHASE = 'PRE_PURCHASE', 'Pre-Owned Car Verification Inspection'

    class Status(models.TextChoices):
        REQUESTED = 'REQUESTED', 'Requested / Pending Confirmation'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='service_appointments',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=30)
    state = models.CharField(max_length=50, default='Maharashtra')
    city = models.CharField(max_length=100, default='Mumbai')
    service_center = models.ForeignKey(
        'dms.Dealer',
        related_name='service_appointments',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    vehicle = models.ForeignKey(
        Vehicle,
        related_name='service_appointments',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    vehicle_details = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text='Make, Model, Year, or Registration Number'
    )
    
    service_type = models.CharField(
        max_length=30,
        choices=ServiceType.choices,
        default=ServiceType.ANNUAL_MAINTENANCE
    )
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    notes = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.REQUESTED
    )
    estimated_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Estimated cost in INR"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-appointment_date', '-appointment_time']

    def __str__(self):
        car_str = self.vehicle.name if self.vehicle else (self.vehicle_details or 'Vehicle')
        return f"{self.get_service_type_display()} for {self.customer_name} ({car_str}) on {self.appointment_date}"
