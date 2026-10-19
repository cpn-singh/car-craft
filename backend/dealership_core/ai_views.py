import os
import json
from decimal import Decimal
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from inventory.models import Vehicle, DealerVehiclePrice
from inventory.serializers import VehicleSerializer, DealerVehiclePriceSerializer
from ecommerce.models import Part, DealerPartPrice
from ecommerce.serializers import PartSerializer, DealerPartPriceSerializer
from dms.models import Dealer
from dms.serializers import DealerSerializer

# Try loading google-genai if key is present
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
gemini_client = None
if GEMINI_API_KEY:
    try:
        from google import genai
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        print(f"GenAI initialization notice: {e}")


def format_inr(val):
    if not val:
        return "₹0"
    v = float(val)
    if v >= 10000000:
        return f"₹{v / 10000000:.2f} Cr"
    elif v >= 100000:
        return f"₹{v / 100000:.2f} Lakh"
    return f"₹{v:,.0f}"


@api_view(['GET'])
@permission_classes([AllowAny])
def compare_vehicles(request):
    """
    Compare 2 or more vehicles side-by-side with Indian market specifications,
    identify the cheapest/best dealer in the user's state, and provide AI insights.
    """
    ids_param = request.query_params.get('ids', '')
    state = request.query_params.get('state', 'all')
    
    if not ids_param:
        return Response({'error': 'Please provide vehicle IDs to compare, e.g. ?ids=1,2'}, status=status.HTTP_400_BAD_REQUEST)
    
    id_list = [int(i.strip()) for i in ids_param.split(',') if i.strip().isdigit()]
    vehicles = Vehicle.objects.filter(id__in=id_list).prefetch_related('dealer_prices__dealer')
    
    if not vehicles.exists():
        return Response({'error': 'No matching vehicles found'}, status=status.HTTP_404_NOT_FOUND)

    results = []
    all_dealers_list = []

    for v in vehicles:
        v_data = VehicleSerializer(v, context={'request': request}).data
        
        # Get dealer prices
        dealer_prices_qs = v.dealer_prices.select_related('dealer').filter(dealer__is_verified=True)
        if state and state != 'all':
            state_prices = dealer_prices_qs.filter(dealer__state=state)
            dealers_for_car = state_prices if state_prices.exists() else dealer_prices_qs
        else:
            dealers_for_car = dealer_prices_qs

        sorted_dealers = dealers_for_car.order_by('final_offer_price')
        best_dealer_offer = sorted_dealers.first()
        
        dealer_offers_data = []
        for dp in sorted_dealers:
            dealer_offers_data.append({
                'dealer_id': dp.dealer.id,
                'dealer_name': dp.dealer.name,
                'dealer_brand': dp.dealer.brand_focus,
                'state': dp.dealer.state,
                'city': dp.dealer.city,
                'address': dp.dealer.address,
                'phone': dp.dealer.phone,
                'email': dp.dealer.email,
                'rating': float(dp.dealer.rating),
                'reviews_count': dp.dealer.reviews_count,
                'is_verified': dp.dealer.is_verified,
                'ex_showroom': float(dp.ex_showroom_price),
                'dealer_discount': float(dp.dealer_discount),
                'final_offer_price': float(dp.final_offer_price),
                'formatted_final_price': format_inr(dp.final_offer_price),
                'on_road_estimate': float(dp.on_road_estimate),
                'formatted_on_road': format_inr(dp.on_road_estimate),
                'special_offers': dp.special_offers,
                'delivery_timeline': dp.delivery_timeline,
                'is_cheapest': dp == best_dealer_offer,
                'is_local_to_state': dp.dealer.state == state if state != 'all' else True
            })

        results.append({
            'vehicle': v_data,
            'best_dealer': dealer_offers_data[0] if dealer_offers_data else None,
            'all_dealer_offers': dealer_offers_data,
            'cheapest_price': float(best_dealer_offer.final_offer_price) if best_dealer_offer else float(v.price),
            'formatted_cheapest_price': format_inr(best_dealer_offer.final_offer_price if best_dealer_offer else v.price),
        })

    # AI Summary & Recommendation Generation
    ai_verdict = generate_ai_vehicle_comparison(results, state)

    return Response({
        'state_filter': state,
        'vehicles_count': len(results),
        'comparison': results,
        'ai_verdict': ai_verdict
    })


def generate_ai_vehicle_comparison(results, state):
    """Generates an intelligent comparison breakdown tailored for Indian car buyers."""
    if len(results) < 2:
        v = results[0]['vehicle']
        dealer = results[0]['best_dealer']
        return {
            'headline': f"Best deal analysis for {v['name']} in {state if state != 'all' else 'India'}",
            'summary': f"The lowest available price is {results[0]['formatted_cheapest_price']} offered by {dealer['dealer_name'] if dealer else 'Authorized Dealers'}.",
            'key_highlights': [
                f"Fuel Efficiency: {v.get('mileage_arai', 'High efficiency')}",
                f"Safety: {v.get('safety_rating', 'Tested for Indian roads')}",
                f"Dealer savings: Up to ₹{dealer['dealer_discount']:,.0f} festive discount" if dealer else "Competitive pricing"
            ],
            'cheapest_dealer_verdict': f"Visit {dealer['dealer_name']} in {dealer['city']} for immediate delivery and verified warranty." if dealer else ""
        }

    # Compare 2 or more
    v1 = results[0]
    v2 = results[1]
    
    p1 = v1['cheapest_price']
    p2 = v2['cheapest_price']
    
    cheaper = v1 if p1 <= p2 else v2
    pricier = v2 if p1 <= p2 else v1
    diff = abs(p1 - p2)

    best_dealers_summary = []
    for r in results:
        v_name = r['vehicle']['name']
        bd = r['best_dealer']
        if bd:
            best_dealers_summary.append(
                f"{v_name}: Best priced at {bd['formatted_final_price']} by {bd['dealer_name']} ({bd['city']}, {bd['state']}) with ₹{bd['dealer_discount']:,.0f} discount."
            )

    return {
        'headline': f"{cheaper['vehicle']['name']} offers lower acquisition cost by {format_inr(diff)}",
        'summary': (
            f"Comparing {len(results)} vehicles in {state if state != 'all' else 'India'}: "
            f"{cheaper['vehicle']['name']} is the more affordable choice with prices starting at {cheaper['formatted_cheapest_price']}. "
            f"Meanwhile, {pricier['vehicle']['name']} offers {pricier['vehicle'].get('engine', 'premium performance')} with {pricier['vehicle'].get('safety_rating')}."
        ),
        'cheapest_option': {
            'vehicle_name': cheaper['vehicle']['name'],
            'price': cheaper['formatted_cheapest_price'],
            'dealer': cheaper['best_dealer']['dealer_name'] if cheaper['best_dealer'] else 'Authorized Network',
            'city': cheaper['best_dealer']['city'] if cheaper['best_dealer'] else state,
            'savings_vs_competitor': format_inr(diff)
        },
        'dealer_breakdown': best_dealers_summary,
        'recommendation_by_use_case': [
            f"For daily city commute & high fuel economy: Choose {results[0]['vehicle']['name']} ({results[0]['vehicle'].get('mileage_arai')}).",
            f"For highway cruising & long family trips: Evaluate seating and safety ratings ({[r['vehicle']['name'] + ' - ' + r['vehicle'].get('safety_rating', '') for r in results]}).",
            f"To get the best price in {state if state != 'all' else 'your region'}: Contact verified dealers offering upfront cash discounts."
        ]
    }


@api_view(['GET'])
@permission_classes([AllowAny])
def compare_parts(request):
    """
    Compare 2 or more accessories or spare parts side-by-side,
    find cheapest dealer/seller in state with delivery & installation.
    """
    ids_param = request.query_params.get('ids', '')
    state = request.query_params.get('state', 'all')
    
    if not ids_param:
        return Response({'error': 'Please provide part IDs to compare, e.g. ?ids=1,2'}, status=status.HTTP_400_BAD_REQUEST)
    
    id_list = [int(i.strip()) for i in ids_param.split(',') if i.strip().isdigit()]
    parts = Part.objects.filter(id__in=id_list).prefetch_related('dealer_prices__dealer')
    
    if not parts.exists():
        return Response({'error': 'No matching parts or accessories found'}, status=status.HTTP_404_NOT_FOUND)

    results = []
    for p in parts:
        p_data = PartSerializer(p, context={'request': request}).data
        
        dealer_prices_qs = p.dealer_prices.select_related('dealer').filter(dealer__is_verified=True)
        if state and state != 'all':
            state_prices = dealer_prices_qs.filter(dealer__state=state)
            dealers_for_part = state_prices if state_prices.exists() else dealer_prices_qs
        else:
            dealers_for_part = dealer_prices_qs

        sorted_dealers = dealers_for_part.order_by('offer_price')
        best_dealer = sorted_dealers.first()

        dealer_offers = []
        for dp in sorted_dealers:
            dealer_offers.append({
                'dealer_id': dp.dealer.id,
                'dealer_name': dp.dealer.name,
                'state': dp.dealer.state,
                'city': dp.dealer.city,
                'address': dp.dealer.address,
                'phone': dp.dealer.phone,
                'rating': float(dp.dealer.rating),
                'mrp': float(dp.mrp),
                'offer_price': float(dp.offer_price),
                'formatted_price': format_inr(dp.offer_price),
                'discount_percent': round((1 - float(dp.offer_price) / float(dp.mrp)) * 100) if float(dp.mrp) > 0 else 0,
                'installation_available': dp.installation_available,
                'delivery_days': dp.delivery_days,
                'is_cheapest': dp == best_dealer,
            })

        results.append({
            'part': p_data,
            'best_dealer': dealer_offers[0] if dealer_offers else None,
            'all_dealer_offers': dealer_offers,
            'cheapest_price': float(best_dealer.offer_price) if best_dealer else float(p.price),
            'formatted_cheapest_price': format_inr(best_dealer.offer_price if best_dealer else p.price),
        })

    return Response({
        'state_filter': state,
        'parts_count': len(results),
        'comparison': results,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def universal_search(request):
    """
    Search vehicles, accessories, parts, and dealers available in India.
    Supports filtering by state and sorting by cheapest price.
    """
    query = request.query_params.get('q', '').strip()
    category_type = request.query_params.get('type', 'all')  # all, vehicles, accessories, parts, dealers
    state = request.query_params.get('state', 'all')
    sort_by = request.query_params.get('sort', 'cheapest')   # cheapest, rating, nearest

    response_data = {
        'query': query,
        'state_filter': state,
        'results': {
            'vehicles': [],
            'accessories': [],
            'parts': [],
            'dealers': [],
        },
        'total_count': 0
    }

    # 1. Search Vehicles
    if category_type in ['all', 'vehicles']:
        v_qs = Vehicle.objects.filter(status='AVAILABLE').prefetch_related('dealer_prices__dealer')
        if query:
            v_qs = v_qs.filter(
                models_q(name__icontains=query) |
                models_q(make__icontains=query) |
                models_q(model__icontains=query) |
                models_q(category__icontains=query) |
                models_q(fuel_type__icontains=query) |
                models_q(description__icontains=query)
            )
        if state and state != 'all':
            v_qs = v_qs.filter(dealer_prices__dealer__state=state).distinct()

        if sort_by == 'cheapest':
            v_qs = v_qs.order_by('price')

        v_list = []
        for v in v_qs[:12]:
            best_dealer = v.get_best_dealer_price(state=state)
            v_data = VehicleSerializer(v, context={'request': request}).data
            v_data['best_dealer_in_state'] = {
                'dealer_id': best_dealer.dealer.id,
                'dealer_name': best_dealer.dealer.name,
                'city': best_dealer.dealer.city,
                'state': best_dealer.dealer.state,
                'phone': best_dealer.dealer.phone,
                'address': best_dealer.dealer.address,
                'rating': float(best_dealer.dealer.rating),
                'offer_price': float(best_dealer.final_offer_price),
                'formatted_offer_price': format_inr(best_dealer.final_offer_price),
                'special_offers': best_dealer.special_offers,
            } if best_dealer else None
            v_list.append(v_data)

        response_data['results']['vehicles'] = v_list

    # 2. Search Accessories & Parts
    if category_type in ['all', 'accessories', 'parts']:
        p_qs = Part.objects.filter(is_available=True).prefetch_related('dealer_prices__dealer')
        if category_type == 'accessories':
            p_qs = p_qs.filter(item_type=Part.ItemType.ACCESSORY)
        elif category_type == 'parts':
            p_qs = p_qs.filter(item_type=Part.ItemType.SPARE_PART)

        if query:
            p_qs = p_qs.filter(
                models_q(name__icontains=query) |
                models_q(brand__icontains=query) |
                models_q(compatibility__icontains=query) |
                models_q(description__icontains=query)
            )

        if state and state != 'all':
            p_qs = p_qs.filter(dealer_prices__dealer__state=state).distinct()

        if sort_by == 'cheapest':
            p_qs = p_qs.order_by('price')

        p_list = []
        acc_list = []
        for p in p_qs[:12]:
            best_dealer = p.get_best_dealer_price(state=state)
            p_data = PartSerializer(p, context={'request': request}).data
            p_data['best_dealer_in_state'] = {
                'dealer_id': best_dealer.dealer.id,
                'dealer_name': best_dealer.dealer.name,
                'city': best_dealer.dealer.city,
                'state': best_dealer.dealer.state,
                'phone': best_dealer.dealer.phone,
                'rating': float(best_dealer.dealer.rating),
                'offer_price': float(best_dealer.offer_price),
                'formatted_offer_price': format_inr(best_dealer.offer_price),
                'delivery_days': best_dealer.delivery_days,
            } if best_dealer else None

            if p.item_type == Part.ItemType.ACCESSORY:
                acc_list.append(p_data)
            else:
                p_list.append(p_data)

        if category_type in ['all', 'accessories']:
            response_data['results']['accessories'] = acc_list
        if category_type in ['all', 'parts']:
            response_data['results']['parts'] = p_list

    # 3. Search Dealers
    if category_type in ['all', 'dealers']:
        d_qs = Dealer.objects.filter(is_verified=True)
        if query:
            d_qs = d_qs.filter(
                models_q(name__icontains=query) |
                models_q(brand_focus__icontains=query) |
                models_q(city__icontains=query) |
                models_q(state__icontains=query)
            )
        if state and state != 'all':
            d_qs = d_qs.filter(state=state)

        if sort_by == 'rating':
            d_qs = d_qs.order_by('-rating')
        else:
            d_qs = d_qs.order_by('city', 'name')

        response_data['results']['dealers'] = DealerSerializer(d_qs[:12], many=True).data

    response_data['total_count'] = (
        len(response_data['results']['vehicles']) +
        len(response_data['results']['accessories']) +
        len(response_data['results']['parts']) +
        len(response_data['results']['dealers'])
    )

    return Response(response_data)


def models_q(**kwargs):
    from django.db.models import Q
    return Q(**kwargs)


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_advisor(request):
    """
    Intelligent AI Automotive Advisor for Indian users.
    Analyzes queries like:
    - "Suggest a 7-seater diesel SUV under 30 Lakhs in Delhi with cheapest dealer"
    - "Find the best dashcam and lowest price dealer in Maharashtra"
    - "Which is cheaper: Mahindra XUV700 or Tata Safari in Karnataka?"
    """
    user_query = request.data.get('query', '').strip()
    user_state = request.data.get('state', 'Maharashtra')
    
    if not user_query:
        return Response({'error': 'Please provide your question or requirement'}, status=status.HTTP_400_BAD_REQUEST)

    # Context retrieval from Indian catalog
    vehicles = Vehicle.objects.filter(status='AVAILABLE').prefetch_related('dealer_prices__dealer')
    parts = Part.objects.filter(is_available=True).prefetch_related('dealer_prices__dealer')
    dealers = Dealer.objects.filter(is_verified=True)
    if user_state and user_state != 'all':
        dealers = dealers.filter(state=user_state)

    matched_vehicles = []
    matched_parts = []
    
    # Simple semantic match for vehicles
    q_lower = user_query.lower()
    for v in vehicles:
        if (v.make.lower() in q_lower or 
            v.model.lower() in q_lower or 
            v.fuel_type.lower() in q_lower or 
            (v.category.lower() in q_lower) or
            ('suv' in q_lower and v.body_type.lower() == 'suv') or
            ('electric' in q_lower and v.fuel_type == 'ELECTRIC') or
            ('diesel' in q_lower and v.fuel_type == 'DIESEL') or
            ('7-seater' in q_lower and v.seating_capacity == 7)):
            
            best_dealer = v.get_best_dealer_price(state=user_state)
            matched_vehicles.append({
                'id': v.id,
                'name': v.name,
                'price': format_inr(v.price),
                'best_offer_price': format_inr(best_dealer.final_offer_price) if best_dealer else format_inr(v.price),
                'best_dealer': {
                    'name': best_dealer.dealer.name,
                    'city': best_dealer.dealer.city,
                    'state': best_dealer.dealer.state,
                    'phone': best_dealer.dealer.phone,
                    'address': best_dealer.dealer.address,
                    'rating': float(best_dealer.dealer.rating),
                    'discount': float(best_dealer.dealer_discount),
                    'special_offers': best_dealer.special_offers
                } if best_dealer else None,
                'fuel_type': v.fuel_type,
                'mileage': v.mileage_arai,
                'safety': v.safety_rating,
                'image_url': v.full_image_url
            })

    # If no specific match, default to top 3 featured
    if not matched_vehicles:
        for v in vehicles[:3]:
            best_dealer = v.get_best_dealer_price(state=user_state)
            matched_vehicles.append({
                'id': v.id,
                'name': v.name,
                'price': format_inr(v.price),
                'best_offer_price': format_inr(best_dealer.final_offer_price) if best_dealer else format_inr(v.price),
                'best_dealer': {
                    'name': best_dealer.dealer.name,
                    'city': best_dealer.dealer.city,
                    'state': best_dealer.dealer.state,
                    'phone': best_dealer.dealer.phone,
                    'address': best_dealer.dealer.address,
                    'rating': float(best_dealer.dealer.rating),
                    'discount': float(best_dealer.dealer_discount),
                    'special_offers': best_dealer.special_offers
                } if best_dealer else None,
                'fuel_type': v.fuel_type,
                'mileage': v.mileage_arai,
                'safety': v.safety_rating,
                'image_url': v.full_image_url
            })

    # Parts matching
    for p in parts:
        if p.name.lower() in q_lower or p.brand.lower() in q_lower or ('dashcam' in q_lower and 'dash' in p.name.lower()):
            best_dealer = p.get_best_dealer_price(state=user_state)
            matched_parts.append({
                'id': p.id,
                'name': p.name,
                'brand': p.brand,
                'mrp': format_inr(p.price),
                'best_price': format_inr(best_dealer.offer_price) if best_dealer else format_inr(p.price),
                'dealer_name': best_dealer.dealer.name if best_dealer else 'Authorized Spares Partner',
                'city': best_dealer.dealer.city if best_dealer else user_state
            })

    # Generate response
    ai_text = None
    if gemini_client:
        try:
            prompt = f"""You are 'Aurel AI Advisor', India's premier automotive buying consultant.
Target audience: Indian car buyers looking for best prices, authentic accessories, verified dealers, and maximum discounts.
User Query: "{user_query}"
User State: "{user_state}"
Matched Vehicles in Inventory: {json.dumps(matched_vehicles[:3], default=str)}
Matched Parts/Accessories: {json.dumps(matched_parts[:3], default=str)}

Instructions:
1. Provide a sharp, authoritative recommendation in 2-3 short paragraphs.
2. Explicitly name the cheapest authorized dealer in {user_state} with their discount and phone/address.
3. Use Indian pricing terminology (Lakhs, Crores, ₹).
4. Give actionable advice on negotiating on-road pricing and RTO benefits in {user_state}.
"""
            response = gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            ai_text = response.text
        except Exception as err:
            print("Gemini API call skipped/fallback:", err)

    if not ai_text:
        # High quality local Indian automotive advisor response
        top_v = matched_vehicles[0] if matched_vehicles else None
        top_d = top_v['best_dealer'] if top_v and top_v['best_dealer'] else None
        
        dealer_text = (
            f"The best deal in {user_state} is currently available at **{top_d['name']}** in {top_d['city']} ({top_d['address']}), "
            f"offering an upfront discount of ₹{top_d['discount']:,.0f} plus '{top_d['special_offers']}'. "
            f"Contact their sales team directly at {top_d['phone']}."
        ) if top_d else f"Authorized dealerships in {user_state} have ready stock with standard manufacturer incentives."

        ai_text = (
            f"Namaste! Based on your query for **'{user_query}'** in **{user_state}**, here is our expert advisory:\n\n"
            f"**Recommended Choice:** **{top_v['name']}** ({top_v['price']}). It stands out with a certified {top_v['mileage']} fuel economy, "
            f"{top_v['safety']} safety credentials, and robust long-term reliability on Indian roads.\n\n"
            f"**Cheapest Dealer & Best Price:**\n{dealer_text}\n\n"
            f"**Pro Tip for {user_state} Buyers:** Ensure you verify the BH-Series registration eligibility or regional RTO tax concessions "
            f"for hybrid/EV models which can save you up to an additional ₹1.2 Lakh on the final on-road invoice."
        )

    return Response({
        'query': user_query,
        'state': user_state,
        'ai_response': ai_text,
        'recommended_vehicles': matched_vehicles[:4],
        'recommended_parts': matched_parts[:4],
    })
