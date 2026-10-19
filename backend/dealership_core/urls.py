"""
URL configuration for dealership_core project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .ai_views import compare_vehicles, compare_parts, universal_search, ai_advisor


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "status": "online",
        "market": "India",
        "name": "Aurel Motor Atelier & Indian Auto Suite",
        "version": "2.0.0",
        "endpoints": {
            "search": "/api/search/?q=&type=all&state=Maharashtra",
            "ai_compare_vehicles": "/api/ai/compare-vehicles/?ids=1,2&state=Maharashtra",
            "ai_compare_parts": "/api/ai/compare-parts/?ids=1,2&state=Maharashtra",
            "ai_advisor": "/api/ai/advisor/",
            "inventory_vehicles": "/api/inventory/vehicles/",
            "inventory_dealer_prices": "/api/inventory/dealer-prices/",
            "dms_dealers": "/api/dms/dealers/",
            "dms_leads": "/api/dms/leads/",
            "ecommerce_parts": "/api/ecommerce/parts/",
            "ecommerce_part_dealer_prices": "/api/ecommerce/dealer-prices/",
            "service_appointments": "/api/service/appointments/",
            "admin": "/admin/",
        }
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('api/', api_root, name='api-root-nested'),
    path('admin/', admin.site.urls),
    
    # AI Comparison & Search Endpoints
    path('api/search/', universal_search, name='universal-search'),
    path('api/ai/compare-vehicles/', compare_vehicles, name='ai-compare-vehicles'),
    path('api/ai/compare-parts/', compare_parts, name='ai-compare-parts'),
    path('api/ai/advisor/', ai_advisor, name='ai-advisor'),

    # Modular App Endpoints
    path('api/inventory/', include('inventory.urls')),
    path('api/dms/', include('dms.urls')),
    path('api/ecommerce/', include('ecommerce.urls')),
    path('api/service/', include('service.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
