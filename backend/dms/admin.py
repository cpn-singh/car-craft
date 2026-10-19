from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Dealer, Lead


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'city', 'state', 'is_staff')
    list_filter = ('role', 'state', 'is_staff', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Indian User Details', {'fields': ('role', 'phone', 'state', 'city', 'notes')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Indian User Details', {'fields': ('role', 'phone', 'state', 'city', 'notes')}),
    )


@admin.register(Dealer)
class DealerAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand_focus', 'city', 'state', 'phone', 'rating', 'is_verified')
    list_filter = ('state', 'brand_focus', 'is_verified')
    search_fields = ('name', 'city', 'brand_focus', 'phone', 'email')


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'city', 'state', 'vehicle_interest', 'preferred_dealer', 'status', 'created_at')
    list_filter = ('status', 'state', 'created_at')
    search_fields = ('name', 'email', 'phone', 'vehicle_interest', 'city')
    readonly_fields = ('created_at', 'updated_at')
