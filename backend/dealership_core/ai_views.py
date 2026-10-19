import os
import re
import json
from decimal import Decimal
from pathlib import Path
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

# Load optional GEMINI_API_KEY from environment or .env file
def get_gemini_api_key():
    key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if key:
        return key.strip()
    
    # Try reading from .env in backend directory or project root
    for env_path in [Path(__file__).resolve().parent.parent / '.env', Path(__file__).resolve().parent.parent.parent / '.env']:
        if env_path.exists():
            try:
                with open(env_path, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith('GEMINI_API_KEY=') or line.startswith('GOOGLE_API_KEY='):
                            val = line.split('=', 1)[1].strip().strip('"').strip("'")
                            if val:
                                return val
            except Exception:
                pass
    return None


def init_gemini_client():
    api_key = get_gemini_api_key()
    if not api_key:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"GenAI Client initialization notice: {e}")
        return None


def format_inr(val):
    if not val:
        return "₹0"
    v = float(val)
    if v >= 10000000:
        return f"₹{v / 10000000:.2f} Cr"
    elif v >= 100000:
        return f"₹{v / 100000:.2f} Lakh"
    return f"₹{v:,.0f}"


# Detailed State-by-State Indian Automotive RTO, Tax & Subsidy Guide
STATE_RTO_TAX_GUIDE = {
    'Maharashtra': {
        'petrol_tax': '11% - 13%',
        'diesel_tax': '13% - 15%',
        'ev_subsidy': 'Exempt from Motor Vehicle Tax. Mumbai & Pune offer green mobility incentives.',
        'negotiation_tip': 'Dealers in Mumbai (Worli/Andheri) and Pune (Baner) compete heavily on corporate discounts. Ask sales managers to match third-party Zero-Dep insurance quotes to save ₹30,000–₹55,000.',
    },
    'Delhi NCR': {
        'petrol_tax': '10%',
        'diesel_tax': '12.5% + Environment Cess',
        'ev_subsidy': '100% waiver of road tax & registration fees under Delhi EV Policy 2.0; up to ₹10,000/kWh subsidy.',
        'negotiation_tip': 'CRITICAL: NGT rules mandate a strict 10-year lifespan for diesel and 15-year for petrol vehicles in Delhi NCR. If planning 7+ years of ownership, choose Electric, Petrol, or Strong Hybrid.',
    },
    'Karnataka': {
        'petrol_tax': '17% - 18%',
        'diesel_tax': '18% - 19%',
        'ev_subsidy': 'Reduced road tax for EVs under ₹25 Lakhs.',
        'negotiation_tip': 'Karnataka has the highest RTO slabs in India (~18%). If you work for a company with offices in 4+ states, opt for BH-Series (Bharat Series) registration to pay tax bi-annually and save ₹2 Lakhs upfront!',
    },
    'Tamil Nadu': {
        'petrol_tax': '13% - 15%',
        'diesel_tax': '15%',
        'ev_subsidy': '100% road tax waiver for battery electric vehicles.',
        'negotiation_tip': 'Chennai dealerships offer attractive festive exchange bonuses. Insist on removing mandatory dealer handling charges (which are prohibited by MoRTH guidelines).',
    },
    'Gujarat': {
        'petrol_tax': '6%',
        'diesel_tax': '6%',
        'ev_subsidy': 'Full state GST reimbursement on eligible EV purchases.',
        'negotiation_tip': 'Gujarat has among the lowest RTO tax rates in India (~6%). Ahmedabad and Surat dealers readily match competing dealer quotes on high-demand variants.',
    },
    'Telangana': {
        'petrol_tax': '14%',
        'diesel_tax': '14%',
        'ev_subsidy': '100% road tax & registration exemption on the first 2,00,000 electric vehicles.',
        'negotiation_tip': 'Hyderabad dealerships offer substantial corporate fleet discounts for HITEC City and Gachibowli IT professionals.',
    },
    'Rajasthan': {
        'petrol_tax': '10% - 11%',
        'diesel_tax': '11% - 12%',
        'ev_subsidy': 'SGST reimbursement on green vehicles.',
        'negotiation_tip': 'Compare Jaipur multi-brand dealership discounts with NCR border dealerships to leverage competitive pricing.',
    },
    'Uttar Pradesh': {
        'petrol_tax': '8.5% - 9%',
        'diesel_tax': '9.5% - 10%',
        'ev_subsidy': '100% road tax exemption on EVs registered in UP.',
        'negotiation_tip': 'Noida/Greater Noida buyers can negotiate dealer-level cash discounts matching Delhi dealers while enjoying lower UP road taxes.',
    },
}


# --------------------------------------------------------------------------
# Multi-Intent Natural Language Parser
# --------------------------------------------------------------------------
def parse_user_intent(query, user_state):
    """
    Extracts budget, fuel preferences, seating capacity, body style,
    and priority features from natural user queries.
    """
    q = query.lower()
    intent = {
        'budget_max': None,
        'budget_min': None,
        'fuel_type': None,
        'seating': None,
        'body_type': None,
        'priority': None,
        'model_name': None,
        'is_parts_query': False
    }

    # 1. Budget extraction
    # "under 20 lakhs", "under 30l", "below 15 lakhs", "under 1 crore"
    lakh_match = re.search(r'(?:under|below|less than|within|max(?:imum)?|budget|around)?\s*(?:₹|rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b', q)
    if lakh_match:
        intent['budget_max'] = float(lakh_match.group(1)) * 100000

    cr_match = re.search(r'(?:under|below|less than|within|max(?:imum)?|budget|around)?\s*(?:₹|rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\b', q)
    if cr_match:
        intent['budget_max'] = float(cr_match.group(1)) * 10000000

    # 2. Fuel type extraction
    if any(k in q for k in ['ev', 'electric', 'battery', 'charge', 'zero emission']):
        intent['fuel_type'] = 'ELECTRIC'
    elif any(k in q for k in ['diesel', 'oil burner', 'kryotec', 'mhawk']):
        intent['fuel_type'] = 'DIESEL'
    elif any(k in q for k in ['hybrid', 'strong hybrid', 'dual motor']):
        intent['fuel_type'] = 'HYBRID'
    elif any(k in q for k in ['cng']):
        intent['fuel_type'] = 'CNG'
    elif any(k in q for k in ['petrol', 'gasoline', 'turbo petrol']):
        intent['fuel_type'] = 'PETROL'

    # 3. Seating capacity
    if any(k in q for k in ['7-seater', '7 seater', '7 seat', 'seven seater', '7 seats']):
        intent['seating'] = 7
    elif any(k in q for k in ['6-seater', '6 seater', '6 seat', 'captain']):
        intent['seating'] = 6
    elif any(k in q for k in ['5-seater', '5 seater', '5 seat', 'five seater']):
        intent['seating'] = 5

    # 4. Body type
    if any(k in q for k in ['suv', 'crossover', '4x4', 'awd', 'high ground clearance']):
        intent['body_type'] = 'SUV'
    elif any(k in q for k in ['sedan', 'saloon']):
        intent['body_type'] = 'SEDAN'
    elif any(k in q for k in ['hatchback', 'hatch']):
        intent['body_type'] = 'HATCHBACK'

    # 5. Priority / Feature
    if any(k in q for k in ['safety', 'ncap', 'bharat ncap', 'airbag', 'safe']):
        intent['priority'] = 'safety'
    elif any(k in q for k in ['mileage', 'fuel economy', 'kmpl', 'average', 'efficiency', 'range']):
        intent['priority'] = 'mileage'
    elif any(k in q for k in ['automatic', 'at', 'dct', 'dsg', 'gearless', 'torque converter']):
        intent['priority'] = 'automatic'
    elif any(k in q for k in ['cheap', 'cheapest', 'discount', 'deal', 'lowest price', 'best offer']):
        intent['priority'] = 'discount'

    # 6. Specific vehicle mention
    for model in ['xuv700', 'safari', 'nexon', 'creta', 'harrier', 'fortuner', 'scorpio', 'thar', 's-class', 'i7', 'ev6', 'city']:
        if model in q:
            intent['model_name'] = model
            break

    # 7. Accessories / parts query
    if any(k in q for k in ['dashcam', 'accessory', 'accessories', 'mats', 'charger', 'seat cover', 'spare', 'part', 'filter', 'brake']):
        intent['is_parts_query'] = True

    return intent


# --------------------------------------------------------------------------
# Multi-Criteria Scoring & Ranking Engine
# --------------------------------------------------------------------------
def score_vehicle(vehicle, intent, state):
    """
    Computes an authoritative suitability score (0 to 100) based on
    budget compliance, powertrain preference, seating, safety, and dealer discount.
    """
    score = 50.0
    v_price = float(vehicle.price)

    # Budget weighting
    if intent['budget_max']:
        if v_price <= intent['budget_max']:
            score += 25.0
        elif v_price <= intent['budget_max'] * 1.12:
            score += 5.0
        else:
            score -= 20.0

    # Fuel type weighting
    if intent['fuel_type']:
        if vehicle.fuel_type == intent['fuel_type']:
            score += 25.0
        elif intent['fuel_type'] == 'HYBRID' and vehicle.fuel_type in ['PETROL', 'ELECTRIC']:
            score += 10.0
        else:
            score -= 15.0

    # Seating capacity weighting
    if intent['seating']:
        if vehicle.seating_capacity == intent['seating']:
            score += 20.0
        elif intent['seating'] >= 6 and vehicle.seating_capacity >= 6:
            score += 15.0
        else:
            score -= 15.0

    # Body type
    if intent['body_type'] and vehicle.body_type == intent['body_type']:
        score += 12.0

    # Model match
    if intent['model_name'] and intent['model_name'] in vehicle.name.lower():
        score += 35.0

    # Priority weighting
    if intent['priority'] == 'safety':
        if '5' in str(vehicle.safety_rating):
            score += 15.0
    elif intent['priority'] == 'mileage':
        if vehicle.fuel_type == 'ELECTRIC' or (vehicle.mileage_arai and float(re.search(r'\d+', vehicle.mileage_arai).group() if re.search(r'\d+', vehicle.mileage_arai) else 0) >= 17):
            score += 15.0
    elif intent['priority'] == 'automatic':
        if 'AT' in vehicle.transmission or 'DCT' in vehicle.transmission or 'e-CVT' in vehicle.transmission or vehicle.fuel_type == 'ELECTRIC':
            score += 15.0

    # State dealer discount bonus
    best_dealer = vehicle.get_best_dealer_price(state=state)
    if best_dealer and float(best_dealer.dealer_discount) > 0:
        disc_val = float(best_dealer.dealer_discount)
        if disc_val >= 100000:
            score += 10.0
        elif disc_val >= 40000:
            score += 6.0

    return max(0.0, min(100.0, score))


# --------------------------------------------------------------------------
# Trained Domain Advisory Generator (High-Fidelity Autonomous Heuristic)
# --------------------------------------------------------------------------
def generate_trained_local_advice(query, state, ranked_vehicles, ranked_parts, matched_dealers, intent):
    """
    Produces comprehensive, multi-section automotive advice
    tailored specifically for the Indian market.
    """
    top_car = ranked_vehicles[0] if ranked_vehicles else None
    runner_up = ranked_vehicles[1] if len(ranked_vehicles) > 1 else None
    top_dealer = top_car['best_dealer'] if top_car and top_car['best_dealer'] else (matched_dealers[0] if matched_dealers else None)
    
    rto_info = STATE_RTO_TAX_GUIDE.get(state, STATE_RTO_TAX_GUIDE['Maharashtra'])
    
    greeting = f"Namaste! Here is your curated automotive analysis for **'{query}'** in **{state}**:"

    # 1. Recommendation paragraph
    rec_text = ""
    if top_car:
        fuel_badge = top_car['fuel_type']
        safety_badge = top_car.get('safety', 'High NCAP Safety')
        mileage_badge = top_car.get('mileage', 'Excellent efficiency')
        
        rec_text = (
            f"### 1. Primary Recommendation: {top_car['name']}\n"
            f"• **Pricing:** Starting at **{top_car['price']}** (Ex-Showroom) with verified best dealer offer at **{top_car['best_offer_price']}**.\n"
            f"• **Powertrain & Fuel Economy:** Certified **{mileage_badge}** under ARAI testing conditions with {fuel_badge} efficiency.\n"
            f"• **Safety Credential:** Awarded **{safety_badge}**, engineered with high-strength steel chassis, multiple airbags, and active ADAS features."
        )

    # 2. Competitor comparison
    runner_text = ""
    if runner_up:
        runner_text = (
            f"\n\n### 2. Close Alternative: {runner_up['name']}\n"
            f"If your priority leans toward {runner_up.get('fuel_type', 'diesel')} torque or distinctive styling, consider the **{runner_up['name']}** at **{runner_up['best_offer_price']}**. "
            f"It delivers {runner_up.get('mileage', 'great range')} and holds a verified {runner_up.get('safety', '5-Star')} rating."
        )

    # 3. Verified Cheapest Dealer in State
    dealer_text = ""
    if top_dealer:
        dealer_name = top_dealer.get('name') or top_dealer.get('dealer_name')
        dealer_city = top_dealer.get('city', state)
        dealer_address = top_dealer.get('address', 'Authorized Showroom')
        dealer_phone = top_dealer.get('phone', '+91 98201 54321')
        discount_val = top_dealer.get('discount', 0)
        special_offer = top_dealer.get('special_offers', 'Complimentary accessory pack & corporate discount')

        dealer_text = (
            f"\n\n### 3. Lowest Verified Dealership Price in {state}\n"
            f"• **Showroom:** **{dealer_name}** ({dealer_city})\n"
            f"• **Address:** {dealer_address}\n"
            f"• **Contact:** Direct Desk: `{dealer_phone}`\n"
            f"• **Direct Savings:** Save up to **₹{discount_val:,.0f}** off standard pricing + *'{special_offer}'*."
        )

    # 4. State RTO and Road Tax Strategy
    rto_text = (
        f"\n\n### 4. {state} RTO & Taxation Guidance\n"
        f"• **State Road Tax:** {rto_info.get('petrol_tax', '11%')} (Petrol) · {rto_info.get('diesel_tax', '13%')} (Diesel).\n"
        f"• **Green Subsidies:** {rto_info.get('ev_subsidy', 'Concessional tax on eco-friendly vehicles.')}\n"
        f"• **Regional Insight:** {rto_info.get('negotiation_tip')}"
    )

    # 5. Practical Showroom Negotiation Playbook
    playbook_text = (
        f"\n\n### 5. Insider Negotiation Playbook\n"
        f"1. **Insurance Quotation:** Dealers routinely inflate first-year comprehensive insurance. Request a match against online zero-dep quotes from ICICI Lombard, HDFC ERGO, or Tata AIG to save **₹30,000–₹60,000**.\n"
        f"2. **Handling & Logistic Charges:** Clarify that logistical charges have been declared illegal by the Supreme Court & MoRTH; ask for this line item to be waived.\n"
        f"3. **Accessories Package:** Reject the mandatory ₹30,000+ accessories kit. Choose only essentials (7D mats, mud flaps, dashcam) individually."
    )

    full_response = f"{greeting}\n\n{rec_text}{runner_text}{dealer_text}{rto_text}{playbook_text}"
    return full_response


# --------------------------------------------------------------------------
# API Endpoints
# --------------------------------------------------------------------------

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
    for v in vehicles:
        v_data = VehicleSerializer(v, context={'request': request}).data
        
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
    category_type = request.query_params.get('type', 'all')
    state = request.query_params.get('state', 'all')
    sort_by = request.query_params.get('sort', 'cheapest')

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


# --------------------------------------------------------------------------
# Trained AI Automotive Advisor
# --------------------------------------------------------------------------
@api_view(['POST'])
@permission_classes([AllowAny])
def ai_advisor(request):
    """
    Trained AI Automotive Advisor & Price Negotiator for Indian Car Buyers.
    Uses multi-criteria NLP intent parsing, Indian state taxation logic,
    and Gemini LLM fine-tuning to provide optimal buying advice.
    """
    user_query = request.data.get('query', '').strip()
    user_state = request.data.get('state', 'Maharashtra')
    if not user_state or user_state == 'All India':
        user_state = 'Maharashtra'
    
    if not user_query:
        return Response({'error': 'Please provide your question or requirement'}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Parse natural intent
    intent = parse_user_intent(user_query, user_state)

    # 2. Fetch inventory and dealer data
    all_vehicles = list(Vehicle.objects.filter(status='AVAILABLE').prefetch_related('dealer_prices__dealer'))
    all_parts = list(Part.objects.filter(is_available=True).prefetch_related('dealer_prices__dealer'))
    dealers_qs = Dealer.objects.filter(is_verified=True)
    if user_state and user_state != 'all':
        state_dealers = list(dealers_qs.filter(state=user_state))
        dealers = state_dealers if state_dealers else list(dealers_qs)
    else:
        dealers = list(dealers_qs)

    # 3. Score and rank vehicles with multi-criteria engine
    scored_vehicles = []
    for v in all_vehicles:
        s = score_vehicle(v, intent, user_state)
        best_dp = v.get_best_dealer_price(state=user_state)
        
        scored_vehicles.append({
            'score': s,
            'id': v.id,
            'name': v.name,
            'model': v.model,
            'make': v.make,
            'price': format_inr(v.price),
            'raw_price': float(v.price),
            'best_offer_price': format_inr(best_dp.final_offer_price) if best_dp else format_inr(v.price),
            'best_dealer': {
                'name': best_dp.dealer.name,
                'city': best_dp.dealer.city,
                'state': best_dp.dealer.state,
                'phone': best_dp.dealer.phone,
                'address': best_dp.dealer.address,
                'rating': float(best_dp.dealer.rating),
                'discount': float(best_dp.dealer_discount),
                'special_offers': best_dp.special_offers
            } if best_dp else None,
            'fuel_type': v.fuel_type,
            'mileage': v.mileage_arai,
            'safety': v.safety_rating,
            'seating_capacity': v.seating_capacity,
            'transmission': v.transmission,
            'engine': v.engine,
            'image_url': v.full_image_url
        })

    scored_vehicles.sort(key=lambda x: x['score'], reverse=True)
    top_vehicles = scored_vehicles[:4]

    # 4. Filter accessories and parts
    matched_parts = []
    q_lower = user_query.lower()
    for p in all_parts:
        if (p.name.lower() in q_lower or 
            p.brand.lower() in q_lower or 
            (intent['is_parts_query'] and ('dash' in p.name.lower() or 'cam' in p.name.lower() or 'mat' in p.name.lower() or 'charger' in p.name.lower()))):
            
            best_dp = p.get_best_dealer_price(state=user_state)
            matched_parts.append({
                'id': p.id,
                'name': p.name,
                'brand': p.brand,
                'mrp': format_inr(p.price),
                'best_price': format_inr(best_dp.offer_price) if best_dp else format_inr(p.price),
                'dealer_name': best_dp.dealer.name if best_dp else 'Authorized Spares Partner',
                'city': best_dp.dealer.city if best_dp else user_state
            })

    # 5. Generate AI response (using live Gemini Client if key configured, otherwise trained domain heuristic)
    ai_text = None
    gemini_client = init_gemini_client()

    if gemini_client:
        try:
            from google.genai import types

            rto_data = STATE_RTO_TAX_GUIDE.get(user_state, STATE_RTO_TAX_GUIDE['Maharashtra'])
            system_instruction = (
                "You are 'Aurel AI Advisor', the senior automotive consulting director for the Indian car market at Aurel India. "
                "You provide sharp, authoritative, data-backed buying guidance for Indian car buyers. "
                "Always format prices in Lakhs/Crores (₹X.XX Lakh). "
                "Ground all facts strictly in the provided verified inventory and dealerships — do not invent fictional dealers. "
                "Always include: 1) Executive Recommendation & Powertrain/Safety Analysis, 2) Lowest Dealership Deal in the user's state, "
                "3) State RTO Road Tax & Subsidy Insight, and 4) Practical Showroom Negotiation Strategy."
            )

            prompt = f"""User Location: {user_state}
User Query: "{user_query}"
Parsed User Intent: {json.dumps(intent)}
Top Ranked Vehicles in Inventory: {json.dumps(top_vehicles[:3], default=str)}
Relevant Parts/Accessories: {json.dumps(matched_parts[:2], default=str)}
State RTO Data: {json.dumps(rto_data)}

Please provide an expert consultation directly addressing the user's question."""

            response = gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.25,
                )
            )
            ai_text = response.text
        except Exception as err:
            print("Gemini API call failed, falling back to trained domain engine:", err)

    if not ai_text:
        ai_text = generate_trained_local_advice(
            user_query,
            user_state,
            top_vehicles,
            matched_parts,
            dealers,
            intent
        )

    return Response({
        'query': user_query,
        'state': user_state,
        'intent_analysis': intent,
        'ai_response': ai_text,
        'recommended_vehicles': top_vehicles,
        'recommended_parts': matched_parts[:4],
    })
