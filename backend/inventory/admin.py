from django.contrib import admin
from .models import Vehicle, VehicleImage, DealerVehiclePrice


class VehicleImageInline(admin.TabularInline):
    model = VehicleImage
    extra = 1


class DealerVehiclePriceInline(admin.TabularInline):
    model = DealerVehiclePrice
    extra = 1


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'make', 'model', 'variant', 'year', 'fuel_type',
        'body_type', 'formatted_price', 'mileage_arai', 'safety_rating', 'status'
    )
    list_filter = ('fuel_type', 'body_type', 'category', 'status', 'make', 'year')
    search_fields = ('name', 'vin', 'make', 'model', 'variant', 'description')
    inlines = [DealerVehiclePriceInline, VehicleImageInline]


@admin.register(DealerVehiclePrice)
class DealerVehiclePriceAdmin(admin.ModelAdmin):
    list_display = (
        'dealer', 'vehicle', 'ex_showroom_price', 'dealer_discount',
        'final_offer_price', 'on_road_estimate', 'delivery_timeline', 'is_best_price'
    )
    list_filter = ('dealer__state', 'is_best_price')
    search_fields = ('dealer__name', 'vehicle__name')


@admin.register(VehicleImage)
class VehicleImageAdmin(admin.ModelAdmin):
    list_display = ('vehicle', 'caption', 'is_primary', 'created_at')
