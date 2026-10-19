from django.contrib.auth.models import AbstractUser
from django.db import models


INDIAN_STATES = [
    ('Maharashtra', 'Maharashtra'),
    ('Delhi NCR', 'Delhi NCR'),
    ('Karnataka', 'Karnataka'),
    ('Tamil Nadu', 'Tamil Nadu'),
    ('Telangana', 'Telangana'),
    ('Gujarat', 'Gujarat'),
    ('West Bengal', 'West Bengal'),
    ('Punjab', 'Punjab'),
    ('Rajasthan', 'Rajasthan'),
    ('Kerala', 'Kerala'),
    ('Uttar Pradesh', 'Uttar Pradesh'),
    ('Haryana', 'Haryana'),
]


class User(AbstractUser):
    class Role(models.TextChoices):
        CUSTOMER = 'CUSTOMER', 'Customer'
        SALES = 'SALES', 'Sales Representative'
        ADMIN = 'ADMIN', 'Dealership Administrator'
        MECHANIC = 'MECHANIC', 'Service Specialist'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    phone = models.CharField(max_length=30, blank=True, null=True)
    state = models.CharField(max_length=50, choices=INDIAN_STATES, default='Maharashtra')
    city = models.CharField(max_length=100, default='Mumbai')
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Dealer(models.Model):
    name = models.CharField(max_length=200)
    brand_focus = models.CharField(max_length=100, help_text="e.g. Mahindra, Tata, Hyundai, Luxury Multi-brand")
    state = models.CharField(max_length=50, choices=INDIAN_STATES)
    city = models.CharField(max_length=100)
    address = models.CharField(max_length=300)
    pincode = models.CharField(max_length=10)
    phone = models.CharField(max_length=30)
    email = models.EmailField()
    website = models.URLField(blank=True, default='')
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.8)
    reviews_count = models.PositiveIntegerField(default=120)
    is_verified = models.BooleanField(default=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-rating', 'name']

    def __str__(self):
        return f"{self.name} - {self.city}, {self.state} ({self.rating}★)"


class Lead(models.Model):
    class Status(models.TextChoices):
        NEW = 'NEW', 'New Inquiry'
        CONTACTED = 'CONTACTED', 'Contacted'
        QUALIFIED = 'QUALIFIED', 'Qualified'
        CLOSED = 'CLOSED', 'Converted / Closed'
        LOST = 'LOST', 'Lost'

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True, default='')
    state = models.CharField(max_length=50, choices=INDIAN_STATES, default='Maharashtra')
    city = models.CharField(max_length=100, default='Mumbai')
    vehicle_interest = models.CharField(max_length=200, blank=True, default='')
    preferred_dealer = models.ForeignKey(Dealer, null=True, blank=True, on_delete=models.SET_NULL, related_name='leads')
    message = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    preferred_contact_method = models.CharField(max_length=50, blank=True, default='Phone / WhatsApp')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Lead: {self.name} - {self.vehicle_interest or 'General'} ({self.city}, {self.state})"
