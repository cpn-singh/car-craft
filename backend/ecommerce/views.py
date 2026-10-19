from rest_framework import viewsets, permissions, filters
from .models import PartCategory, Part, Order, DealerPartPrice
from .serializers import PartCategorySerializer, PartSerializer, OrderSerializer, DealerPartPriceSerializer


class PartCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PartCategory.objects.all()
    serializer_class = PartCategorySerializer
    permission_classes = [permissions.AllowAny]


class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.filter(is_available=True).prefetch_related('dealer_prices__dealer')
    serializer_class = PartSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'sku', 'compatibility', 'brand', 'description']
    ordering_fields = ['price', 'name', 'stock']

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

    def get_queryset(self):
        queryset = Part.objects.filter(is_available=True).prefetch_related('dealer_prices__dealer')
        
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        item_type = self.request.query_params.get('item_type')
        if item_type:
            queryset = queryset.filter(item_type=item_type)

        state = self.request.query_params.get('state')
        if state and state != 'all':
            queryset = queryset.filter(dealer_prices__dealer__state=state).distinct()

        sort_by = self.request.query_params.get('sort')
        if sort_by == 'cheapest':
            queryset = queryset.order_by('price')

        return queryset


class DealerPartPriceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DealerPartPrice.objects.all().select_related('part', 'dealer')
    serializer_class = DealerPartPriceSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = DealerPartPrice.objects.all().select_related('part', 'dealer')
        part_id = self.request.query_params.get('part_id')
        if part_id:
            qs = qs.filter(part_id=part_id)
        state = self.request.query_params.get('state')
        if state and state != 'all':
            qs = qs.filter(dealer__state=state)
        return qs.order_by('offer_price')


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and not user.is_staff:
            return Order.objects.filter(user=user)
        return Order.objects.all()
