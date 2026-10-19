from rest_framework import serializers
from .models import User, Dealer, Lead


class DealerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dealer
        fields = [
            'id', 'name', 'brand_focus', 'state', 'city', 'address',
            'pincode', 'phone', 'email', 'website', 'rating',
            'reviews_count', 'is_verified', 'latitude', 'longitude'
        ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'state', 'city', 'notes']
        read_only_fields = ['id', 'role']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'phone', 'state', 'city']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            state=validated_data.get('state', 'Maharashtra'),
            city=validated_data.get('city', 'Mumbai'),
            role=User.Role.CUSTOMER
        )
        return user


class LeadSerializer(serializers.ModelSerializer):
    dealer_details = DealerSerializer(source='preferred_dealer', read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'state', 'city',
            'vehicle_interest', 'preferred_dealer', 'dealer_details',
            'message', 'status', 'preferred_contact_method',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
