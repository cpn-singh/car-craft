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


from django.http import HttpResponse

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    accept_header = request.META.get('HTTP_ACCEPT', '')
    # If accessed by a web browser at root `/`
    if 'text/html' in accept_header and request.path == '/':
        html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=http://localhost:5173/">
  <title>Aurel India</title>
  <style>
    body { background: #11120f; color: #eae8e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .box { text-align: center; max-width: 480px; padding: 32px; border: 1px solid rgba(234,232,225,0.15); border-radius: 12px; background: rgba(255,255,255,0.02); }
    h1 { color: #eae8e1; font-size: 20px; margin-bottom: 12px; }
    p { color: #8a8a82; font-size: 14px; margin-bottom: 24px; }
    a { display: inline-block; background: #c5a77a; color: #11120f; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Aurel India Motor Atelier</h1>
    <p>Redirecting you to the interactive web application on port 5173...</p>
    <a href="http://localhost:5173/">Launch Aurel India Web App &rarr;</a>
  </div>
  <script>
    window.location.replace("http://localhost:5173/");
  </script>
</body>
</html>"""
        return HttpResponse(html, content_type='text/html')

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
