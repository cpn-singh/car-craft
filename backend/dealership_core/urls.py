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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aurel India API &middot; Live</title>
  <style>
    body { background: #11120f; color: #eae8e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .box { text-align: center; max-width: 520px; width: 100%; padding: 36px; border: 1px solid rgba(197,167,122,0.3); border-radius: 12px; background: rgba(255,255,255,0.02); box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(197,167,122,0.12); color: #c5a77a; border: 1px solid rgba(197,167,122,0.3); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 12px; border-radius: 999px; margin-bottom: 16px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; display: inline-block; box-shadow: 0 0 8px #4ade80; }
    h1 { color: #ffffff; font-size: 22px; margin: 0 0 8px; font-weight: 500; }
    p { color: #a9aaa3; font-size: 13px; line-height: 1.6; margin: 0 0 24px; }
    .endpoint-grid { display: flex; flex-direction: column; gap: 8px; text-align: left; margin-bottom: 24px; }
    .endpoint-link { display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 10px 14px; border-radius: 6px; color: #eae8e1; text-decoration: none; font-size: 12px; font-family: monospace; transition: all 0.2s; }
    .endpoint-link:hover { border-color: #c5a77a; background: rgba(197,167,122,0.08); color: #c5a77a; }
    .btn { display: inline-block; background: #c5a77a; color: #11120f; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; transition: background 0.2s; }
    .btn:hover { background: #b39364; }
  </style>
</head>
<body>
  <div class="box">
    <div class="status-badge"><span class="dot"></span> Live on Render</div>
    <h1>Aurel India Automotive API</h1>
    <p>The backend is active and serving real-time vehicle searches, dealer comparisons, and user accounts.</p>
    <div class="endpoint-grid">
      <a href="/api/" class="endpoint-link"><span>GET /api/</span> <span>Root &rarr;</span></a>
      <a href="/api/search/?q=Creta&state=Maharashtra" class="endpoint-link"><span>GET /api/search/?q=Creta</span> <span>Search &rarr;</span></a>
      <a href="/api/ai/compare-vehicles/?ids=101,102" class="endpoint-link"><span>GET /api/ai/compare-vehicles/</span> <span>Compare &rarr;</span></a>
      <a href="/admin/" class="endpoint-link"><span>GET /admin/</span> <span>Admin Portal &rarr;</span></a>
    </div>
    <a href="/api/" class="btn">Explore JSON API Root</a>
  </div>
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
