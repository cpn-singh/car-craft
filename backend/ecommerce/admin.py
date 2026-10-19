from django.contrib import admin
from .models import PartCategory, Part, Order, OrderItem, DealerPartPrice


@admin.register(PartCategory)
class PartCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


class DealerPartPriceInline(admin.TabularInline):
    model = DealerPartPrice
    extra = 1


@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'item_type', 'brand', 'price', 'compatibility', 'warranty_months', 'is_available')
    list_filter = ('item_type', 'brand', 'category', 'is_available')
    search_fields = ('name', 'sku', 'compatibility', 'brand')
    inlines = [DealerPartPriceInline]


@admin.register(DealerPartPrice)
class DealerPartPriceAdmin(admin.ModelAdmin):
    list_display = ('dealer', 'part', 'mrp', 'offer_price', 'stock_units', 'delivery_days', 'installation_available')
    list_filter = ('dealer__state', 'installation_available')
    search_fields = ('dealer__name', 'part__name')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('part', 'quantity', 'price')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'state', 'city', 'dealer', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'state', 'created_at')
    search_fields = ('order_number', 'customer_name', 'customer_email', 'customer_phone')
    inlines = [OrderItemInline]
