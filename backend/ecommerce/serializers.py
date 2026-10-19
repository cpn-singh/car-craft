import uuid
from rest_framework import serializers
from .models import PartCategory, Part, Order, OrderItem, DealerPartPrice
from dms.serializers import DealerSerializer


class PartCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PartCategory
        fields = ['id', 'name', 'slug', 'description']


class DealerPartPriceSerializer(serializers.ModelSerializer):
    dealer = DealerSerializer(read_only=True)

    class Meta:
        model = DealerPartPrice
        fields = [
            'id', 'dealer', 'mrp', 'offer_price',
            'stock_units', 'installation_available', 'delivery_days'
        ]


class PartSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    formatted_price = serializers.ReadOnlyField()
    dealer_offers = DealerPartPriceSerializer(source='dealer_prices', many=True, read_only=True)
    best_dealer_offer = serializers.SerializerMethodField()

    class Meta:
        model = Part
        fields = [
            'id', 'sku', 'name', 'category', 'category_name',
            'item_type', 'brand', 'price', 'formatted_price', 'stock',
            'compatibility', 'warranty_months', 'gst_percentage',
            'description', 'image_url', 'is_available', 'dealer_offers',
            'best_dealer_offer', 'created_at'
        ]

    def get_best_dealer_offer(self, obj):
        request = self.context.get('request')
        state = request.query_params.get('state') if request else None
        best = obj.get_best_dealer_price(state=state)
        if best:
            return DealerPartPriceSerializer(best).data
        return None


class OrderItemSerializer(serializers.ModelSerializer):
    part_name = serializers.ReadOnlyField(source='part.name')
    part_sku = serializers.ReadOnlyField(source='part.sku')

    class Meta:
        model = OrderItem
        fields = ['id', 'part', 'part_name', 'part_sku', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    items_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    dealer_name = serializers.ReadOnlyField(source='dealer.name')

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'dealer', 'dealer_name',
            'customer_name', 'customer_email', 'customer_phone',
            'state', 'city', 'shipping_address', 'total_amount',
            'status', 'items', 'items_data', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'total_amount', 'status', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items_data', [])
        order_number = f"ORD-IND-{uuid.uuid4().hex[:8].upper()}"
        order = Order.objects.create(order_number=order_number, **validated_data)
        
        total = 0
        for item in items_data:
            part_id = item.get('part_id')
            qty = item.get('quantity', 1)
            try:
                part = Part.objects.get(id=part_id)
                item_price = part.price
                OrderItem.objects.create(
                    order=order,
                    part=part,
                    quantity=qty,
                    price=item_price
                )
                total += item_price * qty
            except Part.DoesNotExist:
                continue
                
        order.total_amount = total
        order.save()
        return order
