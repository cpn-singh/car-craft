from django.db import models


class Vehicle(models.Model):
    class Category(models.TextChoices):
        SPORT = 'sport', 'Performance & Sports'
        GRAND = 'grand', 'Luxury & Grand Tourers'
        ELECTRIC = 'electric', 'Electric Vehicles (EV)'
        SUV = 'suv', 'Premium SUVs'

    class FuelType(models.TextChoices):
        PETROL = 'PETROL', 'Petrol'
        DIESEL = 'DIESEL', 'Diesel'
        ELECTRIC = 'ELECTRIC', 'Electric'
        HYBRID = 'HYBRID', 'Strong Hybrid'
        CNG = 'CNG', 'CNG'

    class Status(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available'
        RESERVED = 'RESERVED', 'Reserved'
        SOLD = 'SOLD', 'Sold'

    vin = models.CharField(max_length=17, unique=True)
    number = models.CharField(max_length=20, blank=True, default='')
    name = models.CharField(max_length=150)
    make = models.CharField(max_length=60)
    model = models.CharField(max_length=60)
    variant = models.CharField(max_length=100, blank=True, default='Top-End')
    year = models.PositiveIntegerField()
    body_type = models.CharField(max_length=50, default='SUV')
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.SUV)
    label = models.CharField(max_length=100, blank=True, default='')
    
    # Pricing in Indian Rupees (INR)
    price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Base ex-showroom price in INR")
    price_display = models.CharField(max_length=50, blank=True, help_text="e.g. ₹21.50 Lakh or ₹1.85 Cr")
    
    # Specs for Indian Buyers
    fuel_type = models.CharField(max_length=20, choices=FuelType.choices, default=FuelType.PETROL)
    mileage = models.PositiveIntegerField(default=0, help_text="Odometer reading in KM if pre-owned, or 0 for brand new")
    mileage_arai = models.CharField(max_length=50, default='16.5 kmpl', help_text="ARAI certified fuel efficiency / EV range")
    seating_capacity = models.PositiveIntegerField(default=5)
    safety_rating = models.CharField(max_length=50, default='5-Star Bharat NCAP')
    transmission = models.CharField(max_length=50, blank=True, default='Automatic')
    engine = models.CharField(max_length=100, blank=True, default='')
    power_bhp = models.CharField(max_length=50, blank=True, default='')
    torque_nm = models.CharField(max_length=50, blank=True, default='')
    warranty_info = models.CharField(max_length=100, default='3 Years / 100,000 km')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    
    # Media
    image_id = models.CharField(max_length=255, blank=True, default='')
    image_url = models.URLField(max_length=500, blank=True, default='')
    alt_text = models.CharField(max_length=255, blank=True, default='')
    
    specs = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True, default='')
    featured = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['price']

    def __str__(self):
        return f"{self.year} {self.name} - {self.formatted_price}"

    @property
    def formatted_price(self):
        if self.price_display:
            return self.price_display
        p = float(self.price)
        if p >= 10000000:
            return f"₹{p / 10000000:.2f} Cr"
        elif p >= 100000:
            return f"₹{p / 100000:.2f} Lakh"
        return f"₹{p:,.0f}"

    @property
    def full_image_url(self):
        if self.image_url:
            return self.image_url
        if self.image_id:
            return f"https://images.unsplash.com/{self.image_id}?auto=format&fit=crop&w=1100&q=85"
        return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1100&q=85"

    def get_best_dealer_price(self, state=None):
        """Returns the best (cheapest) dealer offer for this vehicle, optionally filtered by state."""
        qs = self.dealer_prices.select_related('dealer').filter(dealer__is_verified=True)
        if state and state != 'all':
            state_qs = qs.filter(dealer__state=state)
            if state_qs.exists():
                return state_qs.order_by('final_offer_price').first()
        return qs.order_by('final_offer_price').first()


class VehicleImage(models.Model):
    vehicle = models.ForeignKey(Vehicle, related_name='gallery_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='vehicles/', blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, default='')
    caption = models.CharField(max_length=200, blank=True, default='')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.vehicle.name}"


class DealerVehiclePrice(models.Model):
    vehicle = models.ForeignKey(Vehicle, related_name='dealer_prices', on_delete=models.CASCADE)
    dealer = models.ForeignKey('dms.Dealer', related_name='vehicle_offers', on_delete=models.CASCADE)
    ex_showroom_price = models.DecimalField(max_digits=12, decimal_places=2)
    dealer_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    final_offer_price = models.DecimalField(max_digits=12, decimal_places=2, help_text="Final price after dealer discounts")
    on_road_estimate = models.DecimalField(max_digits=12, decimal_places=2, help_text="Approx on-road price including state RTO and Insurance")
    special_offers = models.CharField(max_length=255, blank=True, default='Festive Bonus + Extended Warranty')
    delivery_timeline = models.CharField(max_length=100, default='Ready in Stock')
    stock_units = models.PositiveIntegerField(default=3)
    is_best_price = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['final_offer_price']
        unique_together = ('vehicle', 'dealer')

    def __str__(self):
        return f"{self.dealer.name} - {self.vehicle.name}: ₹{self.final_offer_price:,.0f}"

    @property
    def formatted_offer_price(self):
        p = float(self.final_offer_price)
        if p >= 10000000:
            return f"₹{p / 10000000:.2f} Cr"
        elif p >= 100000:
            return f"₹{p / 100000:.2f} Lakh"
        return f"₹{p:,.0f}"

    @property
    def formatted_on_road(self):
        p = float(self.on_road_estimate)
        if p >= 10000000:
            return f"₹{p / 10000000:.2f} Cr"
        elif p >= 100000:
            return f"₹{p / 100000:.2f} Lakh"
        return f"₹{p:,.0f}"
