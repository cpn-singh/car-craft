from rest_framework import viewsets, permissions, filters
from django.db.models import Min
from .models import Vehicle, VehicleImage, DealerVehiclePrice
from .serializers import VehicleSerializer, VehicleImageSerializer, DealerVehiclePriceSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all().prefetch_related('gallery_images', 'dealer_prices__dealer')
    serializer_class = VehicleSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'make', 'model', 'variant', 'category', 'fuel_type', 'body_type', 'description']
    ordering_fields = ['price', 'year', 'mileage', 'created_at']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = Vehicle.objects.all().prefetch_related('gallery_images', 'dealer_prices__dealer')
        
        category = self.request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category=category)

        fuel = self.request.query_params.get('fuel_type')
        if fuel:
            queryset = queryset.filter(fuel_type__iexact=fuel)

        body = self.request.query_params.get('body_type')
        if body:
            queryset = queryset.filter(body_type__iexact=body)

        state = self.request.query_params.get('state')
        if state and state != 'all':
            # Vehicles that have an authorized dealer offer in this state
            queryset = queryset.filter(dealer_prices__dealer__state=state).distinct()

        min_price = self.request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        max_price = self.request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        sort_by = self.request.query_params.get('sort')
        if sort_by == 'cheapest':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-price')

        return queryset


class VehicleImageViewSet(viewsets.ModelViewSet):
    queryset = VehicleImage.objects.all()
    serializer_class = VehicleImageSerializer
    permission_classes = [permissions.AllowAny]


class DealerVehiclePriceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DealerVehiclePrice.objects.all().select_related('vehicle', 'dealer')
    serializer_class = DealerVehiclePriceSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['final_offer_price', 'on_road_estimate']

    def get_queryset(self):
        qs = DealerVehiclePrice.objects.all().select_related('vehicle', 'dealer')
        vehicle_id = self.request.query_params.get('vehicle_id')
        if vehicle_id:
            qs = qs.filter(vehicle_id=vehicle_id)
        state = self.request.query_params.get('state')
        if state and state != 'all':
            qs = qs.filter(dealer__state=state)
        return qs.order_by('final_offer_price')
