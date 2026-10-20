"""
views.py
--------
User Authentication, Dealership Directory & Lead Management Views for Aurel India.
Only User profile details are stored in the database; automotive searches and comparisons
are delegated to the AI search and discovery engine.
"""

from rest_framework import viewsets, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q
from .models import User, Dealer, Lead
from .serializers import UserSerializer, RegisterSerializer, DealerSerializer, LeadSerializer


class DealerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view for registered authorized dealerships,
    supporting filtering by state, city, and brand.
    """
    queryset = Dealer.objects.all()
    serializer_class = DealerSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'brand_focus', 'city', 'state', 'address']
    ordering_fields = ['rating', 'name']

    def get_queryset(self):
        queryset = Dealer.objects.all()
        state = self.request.query_params.get('state')
        if state and state != 'all' and state != 'All India':
            queryset = queryset.filter(state__iexact=state)
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__iexact=city)
        brand = self.request.query_params.get('brand')
        if brand:
            queryset = queryset.filter(brand_focus__icontains=brand)
        return queryset


class LeadViewSet(viewsets.ModelViewSet):
    """
    Inquiry & Lead Management for client test drives and callbacks.
    """
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Lead.objects.all()
        state = self.request.query_params.get('state')
        if state and state != 'all' and state != 'All India':
            queryset = queryset.filter(state__iexact=state)
        return queryset


class RegisterView(APIView):
    """
    Registers a new user and persists their details in SQLite.
    Immediately returns JWT credentials and profile.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'Account created successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomLoginView(APIView):
    """
    Authenticates user by username or email and returns JWT credentials + profile.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')

        if not identifier or not password:
            return Response(
                {'error': 'Please provide username/email and password.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Lookup user by username or email
        user_obj = User.objects.filter(Q(username__iexact=identifier) | Q(email__iexact=identifier)).first()
        if user_obj and user_obj.check_password(password):
            refresh = RefreshToken.for_user(user_obj)
            return Response({
                'user': UserSerializer(user_obj).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'Logged in successfully'
            }, status=status.HTTP_200_OK)

        return Response(
            {'error': 'Invalid credentials. Please verify your username/email and password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({'user': serializer.data})

