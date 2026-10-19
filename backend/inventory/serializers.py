from rest_framework import serializers
from .models import Vehicle, VehicleImage, DealerVehiclePrice
from dms.serializers import DealerSerializer


class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ['id', 'image', 'image_url', 'caption', 'is_primary', 'created_at']


class DealerVehiclePriceSerializer(serializers.ModelSerializer):
    dealer = DealerSerializer(read_only=True)
    formatted_offer_price = serializers.ReadOnlyField()
    formatted_on_road = serializers.ReadOnlyField()

    class Meta:
        model = DealerVehiclePrice
        fields = [
            'id', 'dealer', 'ex_showroom_price', 'dealer_discount',
            'final_offer_price', 'formatted_offer_price', 'on_road_estimate',
            'formatted_on_road', 'special_offers', 'delivery_timeline',
            'stock_units', 'is_best_price'
        ]


class VehicleSerializer(serializers.ModelSerializer):
    formatted_price = serializers.ReadOnlyField()
    full_image_url = serializers.ReadOnlyField()
    gallery_images = VehicleImageSerializer(many=True, read_only=True)
    dealer_offers = DealerVehiclePriceSerializer(source='dealer_prices', many=True, read_only=True)
    best_dealer_offer = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            'id', 'vin', 'number', 'name', 'make', 'model', 'variant', 'year',
            'body_type', 'category', 'label', 'price', 'formatted_price',
            'price_display', 'fuel_type', 'mileage', 'mileage_arai',
            'seating_capacity', 'safety_rating', 'transmission', 'engine',
            'power_bhp', 'torque_nm', 'warranty_info', 'status',
            'image_id', 'image_url', 'full_image_url', 'alt_text', 'specs',
            'description', 'featured', 'gallery_images', 'dealer_offers',
            'best_dealer_offer', 'created_at', 'updated_at'
        ]

    def get_best_dealer_offer(self, obj):
        request = self.context.get('request')
        state = request.query_params.get('state') if request else None
        best = obj.get_best_dealer_price(state=state)
        if best:
            return DealerVehiclePriceSerializer(best).data
        return None
