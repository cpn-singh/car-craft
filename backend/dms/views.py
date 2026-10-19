from rest_framework import viewsets, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User, Dealer, Lead
from .serializers import UserSerializer, RegisterSerializer, DealerSerializer, LeadSerializer


class DealerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Dealer.objects.all()
    serializer_class = DealerSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'brand_focus', 'city', 'state', 'address']
    ordering_fields = ['rating', 'name']

    def get_queryset(self):
        queryset = Dealer.objects.all()
        state = self.request.query_params.get('state')
        if state and state != 'all':
            queryset = queryset.filter(state=state)
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__iexact=city)
        brand = self.request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(brand_focus__icontains=brand)
        return queryset


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Lead.objects.all()
        state = self.request.query_params.get('state')
        if state and state != 'all':
            queryset = queryset.filter(state=state)
        return queryset


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
