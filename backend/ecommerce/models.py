from django.db import models
from django.conf import settings


class PartCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')

    class Meta:
        verbose_name_plural = 'Part Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Part(models.Model):
    class ItemType(models.TextChoices):
        ACCESSORY = 'ACCESSORY', 'Car Accessory'
        SPARE_PART = 'SPARE_PART', 'OEM / Spare Part'

    sku = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    category = models.ForeignKey(PartCategory, related_name='parts', on_delete=models.CASCADE)
    item_type = models.CharField(max_length=20, choices=ItemType.choices, default=ItemType.ACCESSORY)
    brand = models.CharField(max_length=100, default='OEM Genuine India')
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="MRP in INR")
    stock = models.PositiveIntegerField(default=10)
    compatibility = models.CharField(max_length=255, help_text='Compatible vehicles in India (e.g. Mahindra XUV700, Tata Safari, Creta)')
    warranty_months = models.PositiveIntegerField(default=12)
    gst_percentage = models.PositiveIntegerField(default=18)
    description = models.TextField(blank=True, default='')
    image_url = models.URLField(max_length=500, blank=True, default='')
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.brand}) - ₹{self.price:,.0f}"

    @property
    def formatted_price(self):
        return f"₹{self.price:,.0f}"

    def get_best_dealer_price(self, state=None):
        """Returns the best (cheapest) dealer offer for this part, optionally filtered by state."""
        qs = self.dealer_prices.select_related('dealer').filter(dealer__is_verified=True)
        if state and state != 'all':
            state_qs = qs.filter(dealer__state=state)
            if state_qs.exists():
                return state_qs.order_by('offer_price').first()
        return qs.order_by('offer_price').first()


class DealerPartPrice(models.Model):
    part = models.ForeignKey(Part, related_name='dealer_prices', on_delete=models.CASCADE)
    dealer = models.ForeignKey('dms.Dealer', related_name='part_offers', on_delete=models.CASCADE)
    mrp = models.DecimalField(max_digits=10, decimal_places=2)
    offer_price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Discounted price at this dealer")
    stock_units = models.PositiveIntegerField(default=5)
    installation_available = models.BooleanField(default=True)
    delivery_days = models.PositiveIntegerField(default=2)

    class Meta:
        ordering = ['offer_price']
        unique_together = ('part', 'dealer')

    def __str__(self):
        return f"{self.dealer.name} - {self.part.name}: ₹{self.offer_price:,.0f}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Payment'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        SHIPPED = 'SHIPPED', 'Dispatched / Shipped'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'

    order_number = models.CharField(max_length=32, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='orders',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    dealer = models.ForeignKey(
        'dms.Dealer',
        related_name='orders',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=30, blank=True, default='')
    state = models.CharField(max_length=50, default='Maharashtra')
    city = models.CharField(max_length=100, default='Mumbai')
    shipping_address = models.TextField()
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} - {self.customer_name} (₹{self.total_amount:,.0f})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    part = models.ForeignKey(Part, related_name='order_items', on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.part.name} in Order #{self.order.order_number}"
