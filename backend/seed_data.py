import os
import django
import datetime
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dealership_core.settings')
django.setup()

from dms.models import User, Dealer, Lead
from inventory.models import Vehicle, DealerVehiclePrice
from ecommerce.models import PartCategory, Part, DealerPartPrice


def seed_indian_dealership():
    print("Seeding Indian Automotive Marketplace data...")

    # 1. Admin User
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@aurel.in',
            'first_name': 'Aurel',
            'last_name': 'India Admin',
            'state': 'Maharashtra',
            'city': 'Mumbai',
            'role': User.Role.ADMIN,
            'is_staff': True,
            'is_superuser': True
        }
    )
    admin_user.set_password('admin')
    admin_user.save()
    print("Admin: admin / admin")

    # 2. Indian Authorized Dealers across key states
    dealers_data = [
        # Maharashtra
        {
            "name": "AutoHangar Luxury & Multi-Brand",
            "brand_focus": "Mercedes-Benz, Luxury Multi-brand",
            "state": "Maharashtra",
            "city": "Mumbai",
            "address": "Prabhadevi Industrial Estate, Worli, Mumbai",
            "pincode": "400025",
            "phone": "+91 98201 54321",
            "email": "sales@autohangar.in",
            "website": "https://autohangar.in",
            "rating": Decimal("4.9"),
            "reviews_count": 340,
        },
        {
            "name": "PPS Motors & Automotive Hub",
            "brand_focus": "Tata, Mahindra, Multi-brand",
            "state": "Maharashtra",
            "city": "Pune",
            "address": "Baner-Pashan Link Road, Baner, Pune",
            "pincode": "411045",
            "phone": "+91 98902 11223",
            "email": "pune@ppsmotors.in",
            "website": "https://ppsmotors.in",
            "rating": Decimal("4.8"),
            "reviews_count": 210,
        },
        {
            "name": "Shaman Wheels & Auto Atelier",
            "brand_focus": "Hyundai, Toyota, Premium",
            "state": "Maharashtra",
            "city": "Mumbai",
            "address": "CST Road, Kalina, Santacruz East, Mumbai",
            "pincode": "400098",
            "phone": "+91 98210 99887",
            "email": "inquiry@shamanwheels.com",
            "website": "https://shamanwheels.com",
            "rating": Decimal("4.7"),
            "reviews_count": 185,
        },

        # Delhi NCR
        {
            "name": "Koncept Automotive Delhi",
            "brand_focus": "Mahindra, Hyundai, Multi-brand",
            "state": "Delhi NCR",
            "city": "New Delhi",
            "address": "A-Block, Connaught Place, New Delhi",
            "pincode": "110001",
            "phone": "+91 98111 22334",
            "email": "delhi@konceptauto.com",
            "website": "https://konceptauto.com",
            "rating": Decimal("4.8"),
            "reviews_count": 420,
        },
        {
            "name": "Infinity Cars & Performance Atelier",
            "brand_focus": "BMW, Porsche, Luxury German",
            "state": "Delhi NCR",
            "city": "Gurgaon",
            "address": "Sector 29, Leisure Valley Road, Gurgaon",
            "pincode": "122002",
            "phone": "+91 98105 77665",
            "email": "gurgaon@infinitycars.in",
            "website": "https://infinitycars.in",
            "rating": Decimal("4.9"),
            "reviews_count": 315,
        },
        {
            "name": "Silver Arrows Automotive",
            "brand_focus": "Mercedes-Benz, Premium EV",
            "state": "Delhi NCR",
            "city": "Noida",
            "address": "Sector 63, Near Electronic City, Noida",
            "pincode": "201301",
            "phone": "+91 98188 44332",
            "email": "noida@silverarrows.in",
            "rating": Decimal("4.7"),
            "reviews_count": 190,
        },

        # Karnataka
        {
            "name": "Kalyani Motors Automotive Hub",
            "brand_focus": "Tata, Maruti Nexa, Premium",
            "state": "Karnataka",
            "city": "Bengaluru",
            "address": "Bannerghatta Main Road, JP Nagar, Bengaluru",
            "pincode": "560076",
            "phone": "+91 98450 12345",
            "email": "bangalore@kalyanimotors.com",
            "website": "https://kalyanimotors.com",
            "rating": Decimal("4.8"),
            "reviews_count": 510,
        },
        {
            "name": "Sireesh Auto & SUV World",
            "brand_focus": "Mahindra, 4x4 Off-Road",
            "state": "Karnataka",
            "city": "Bengaluru",
            "address": "Hosur Road, Singasandra, Bengaluru",
            "pincode": "560068",
            "phone": "+91 98451 99880",
            "email": "hosur@sireeshauto.in",
            "rating": Decimal("4.7"),
            "reviews_count": 275,
        },

        # Tamil Nadu
        {
            "name": "Lanson Premium Automobiles",
            "brand_focus": "Toyota, Lexus, Multi-brand",
            "state": "Tamil Nadu",
            "city": "Chennai",
            "address": "Poonamallee High Road, Koyambedu, Chennai",
            "pincode": "600107",
            "phone": "+91 98400 33445",
            "email": "chennai@lansontoyota.com",
            "website": "https://lansontoyota.com",
            "rating": Decimal("4.8"),
            "reviews_count": 380,
        },

        # Telangana
        {
            "name": "Vibrant Motors Hitec",
            "brand_focus": "Hyundai, Tata EV, Multi-brand",
            "state": "Telangana",
            "city": "Hyderabad",
            "address": "Madhapur, Hitec City Road, Hyderabad",
            "pincode": "500081",
            "phone": "+91 98490 66778",
            "email": "hitec@vibrantmotors.in",
            "rating": Decimal("4.8"),
            "reviews_count": 290,
        },

        # Gujarat
        {
            "name": "Cargo Motors West Hub",
            "brand_focus": "Tata, Mahindra, Commercial & Passenger",
            "state": "Gujarat",
            "city": "Ahmedabad",
            "address": "S.G. Highway, Thaltej, Ahmedabad",
            "pincode": "380054",
            "phone": "+91 98250 88990",
            "email": "ahmedabad@cargomotors.com",
            "rating": Decimal("4.8"),
            "reviews_count": 230,
        }
    ]

    dealer_map = {}
    for d_data in dealers_data:
        dealer, _ = Dealer.objects.update_or_create(
            name=d_data['name'],
            city=d_data['city'],
            defaults=d_data
        )
        dealer_map[f"{dealer.city}_{dealer.name.split()[0]}"] = dealer
        dealer_map[f"{dealer.city.split()[0]}_{dealer.name.split()[0]}"] = dealer
        dealer_map[dealer.name.split()[0]] = dealer
        dealer_map[dealer.name] = dealer
        print(f"Dealer: {dealer.name} ({dealer.city}, {dealer.state})")

    # 3. Vehicles available in India
    vehicles_data = [
        {
            "vin": "MAHINDRAXUV70001",
            "number": "01 / 07",
            "name": "Mahindra XUV700 AX7 Luxury AWD",
            "make": "Mahindra",
            "model": "XUV700",
            "variant": "AX7 L AWD Diesel AT",
            "year": 2024,
            "category": "suv",
            "body_type": "SUV",
            "label": "THE RULER · DIESEL AWD",
            "price": Decimal("2699000.00"),
            "price_display": "₹26.99 Lakh",
            "fuel_type": "DIESEL",
            "mileage": 0,
            "mileage_arai": "16.57 kmpl",
            "seating_capacity": 7,
            "safety_rating": "5-Star Bharat NCAP (Highest)",
            "transmission": "6-Speed Torque Converter AT",
            "engine": "2.2L mHawk Turbocharged Diesel (185 PS, 450 Nm)",
            "power_bhp": "182 bhp",
            "torque_nm": "450 Nm",
            "warranty_info": "3 Years / 100,000 km (Extendable to 5 Years)",
            "image_id": "photo-1533473359331-0135ef1b58bf",
            "image_url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1100&q=85",
            "alt_text": "Bold luxury Indian full-size SUV in metallic midnight black",
            "specs": ["2.2L mHAWK DIESEL", "AWD AUTO", "5-STAR NCAP", "7 SEATER"],
            "description": "India's best-selling 7-seater SUV equipped with Level-2 ADAS, Dual 10.25-inch curved screens, Sony 12-Speaker 3D Audio, and AWD.",
            "status": "AVAILABLE"
        },
        {
            "vin": "TATASAFARI002002",
            "number": "02 / 07",
            "name": "Tata Safari Accomplished+ Dark Edition",
            "make": "Tata",
            "model": "Safari",
            "variant": "Accomplished+ 6S AT",
            "year": 2024,
            "category": "suv",
            "body_type": "SUV",
            "label": "THE FLAGSHIP · DARK EDITION",
            "price": Decimal("2734000.00"),
            "price_display": "₹27.34 Lakh",
            "fuel_type": "DIESEL",
            "mileage": 0,
            "mileage_arai": "16.30 kmpl",
            "seating_capacity": 6,
            "safety_rating": "5-Star Global & Bharat NCAP",
            "transmission": "6-Speed E-Shifter Automatic",
            "engine": "2.0L Kryotec Turbocharged Diesel",
            "power_bhp": "168 bhp",
            "torque_nm": "350 Nm",
            "warranty_info": "3 Years / 100,000 km",
            "image_id": "photo-1549399542-7e3f8b79c341",
            "image_url": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1100&q=85",
            "alt_text": "Tata Safari dark edition premium flagship SUV",
            "specs": ["2.0L KRYOTEC", "VENTILATED SEATS", "5-STAR NCAP", "ADAS L2"],
            "description": "Oberon Black Dark Edition. Features ventilated front & 2nd row captain seats, 12.3-inch Harman touchscreen, gesture tailgate, and Level 2 ADAS.",
            "status": "AVAILABLE"
        },
        {
            "vin": "HYUNDAICRETA0303",
            "number": "03 / 07",
            "name": "Hyundai Creta SX(O) Turbo DCT",
            "make": "Hyundai",
            "model": "Creta",
            "variant": "SX(O) 1.5 Turbo Petrol",
            "year": 2024,
            "category": "grand",
            "body_type": "SUV",
            "label": "THE URBAN FAVORITE · 2024",
            "price": Decimal("2015000.00"),
            "price_display": "₹20.15 Lakh",
            "fuel_type": "PETROL",
            "mileage": 0,
            "mileage_arai": "18.40 kmpl",
            "seating_capacity": 5,
            "safety_rating": "Level-2 SmartSense ADAS",
            "transmission": "7-Speed Dual Clutch (DCT)",
            "engine": "1.5L Turbo GDi Petrol",
            "power_bhp": "158 bhp",
            "torque_nm": "253 Nm",
            "warranty_info": "3 Years / Unlimited km",
            "image_id": "photo-1508974239320-0a029497e820",
            "image_url": "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1100&q=85",
            "alt_text": "Modern compact luxury SUV on urban streets",
            "specs": ["1.5L TURBO GDI", "7-SPEED DCT", "PANORAMIC SUNROOF", "BOSE AUDIO"],
            "description": "Equipped with Bose 8-Speaker Audio, Dual-Zone Climate, 360-degree camera with Blind View Monitor, and 19 ADAS features.",
            "status": "AVAILABLE"
        },
        {
            "vin": "TATANEXONEV04040",
            "number": "04 / 07",
            "name": "Tata Nexon.ev Empowered+ Long Range",
            "make": "Tata",
            "model": "Nexon.ev",
            "variant": "Empowered+ LR 45kWh",
            "year": 2024,
            "category": "electric",
            "body_type": "SUV",
            "label": "THE ELECTRIFYING · 465 KM",
            "price": Decimal("1949000.00"),
            "price_display": "₹19.49 Lakh",
            "fuel_type": "ELECTRIC",
            "mileage": 0,
            "mileage_arai": "465 km Range",
            "seating_capacity": 5,
            "safety_rating": "5-Star Bharat NCAP",
            "transmission": "Single Speed Direct Drive",
            "engine": "Permanent Magnet Synchronous Motor (143 bhp)",
            "power_bhp": "143 bhp",
            "torque_nm": "215 Nm",
            "warranty_info": "8 Years / 160,000 km on Battery Pack",
            "image_id": "photo-1560958089-b8a1929cea89",
            "image_url": "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1100&q=85",
            "alt_text": "High-tech electric vehicle under architectural light",
            "specs": ["45 kWh BATTERY", "465 KM RANGE", "V2L & V2V CHARGE", "ARCADE.EV"],
            "description": "India's highest selling EV with Vehicle-to-Load (V2L) power bank feature, 12.3-inch Cinematic screen, and 7.2 kW AC fast home charging.",
            "status": "AVAILABLE"
        },
        {
            "vin": "TOYOTAFORTUNER05",
            "number": "05 / 07",
            "name": "Toyota Fortuner GR-Sport 4x4",
            "make": "Toyota",
            "model": "Fortuner",
            "variant": "GR-Sport 4x4 AT",
            "year": 2024,
            "category": "suv",
            "body_type": "SUV",
            "label": "THE UNSTOPPABLE · 4X4",
            "price": Decimal("5144000.00"),
            "price_display": "₹51.44 Lakh",
            "fuel_type": "DIESEL",
            "mileage": 0,
            "mileage_arai": "14.20 kmpl",
            "seating_capacity": 7,
            "safety_rating": "5-Star ASEAN NCAP",
            "transmission": "6-Speed Torque Converter with Paddle Shifters",
            "engine": "2.8L 4-Cylinder D-4D Diesel",
            "power_bhp": "201 bhp",
            "torque_nm": "500 Nm",
            "warranty_info": "3 Years / 100,000 km",
            "image_id": "photo-1533473359331-0135ef1b58bf",
            "image_url": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1100&q=85",
            "alt_text": "Rugged premium Japanese 4x4 SUV",
            "specs": ["2.8L DIESEL (500 NM)", "REAL 4X4 LOW RATIO", "GR SUSPENSION", "7 SEATER"],
            "description": "Gazoo Racing tuned suspension, monolithic road presence, electronic drive control, and unmatched resale value across India.",
            "status": "AVAILABLE"
        },
        {
            "vin": "BMW330LIMSPORT06",
            "number": "06 / 07",
            "name": "BMW 3 Series Gran Limousine 330Li M Sport",
            "make": "BMW",
            "model": "3 Series Gran Limousine",
            "variant": "330Li M Sport",
            "year": 2024,
            "category": "grand",
            "body_type": "Sedan",
            "label": "THE REFINED · LONG WHEELBASE",
            "price": Decimal("6200000.00"),
            "price_display": "₹62.00 Lakh",
            "fuel_type": "PETROL",
            "mileage": 0,
            "mileage_arai": "15.39 kmpl",
            "seating_capacity": 5,
            "safety_rating": "5-Star Euro NCAP",
            "transmission": "8-Speed Steptronic Sport Automatic",
            "engine": "2.0L BMW TwinPower Turbo 4-Cylinder",
            "power_bhp": "258 bhp",
            "torque_nm": "400 Nm",
            "warranty_info": "3 Years / 60,000 km BSI Package",
            "image_id": "photo-1555215695-3004980ad54e",
            "image_url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1100&q=85",
            "alt_text": "Long wheelbase executive luxury German sedan in Dravit Grey",
            "specs": ["258 BHP TURBO", "EXTENDED WHEELBASE", "CURVED DISPLAY", "HARMAN KARDON"],
            "description": "Extra 110mm legroom engineered for chauffeur-driven comfort in India, featuring BMW Curved Display, Panorama sunroof, and M Aerodynamics.",
            "status": "AVAILABLE"
        },
        {
            "vin": "PORSCHE911GTSIND",
            "number": "07 / 07",
            "name": "Porsche 911 Carrera GTS",
            "make": "Porsche",
            "model": "911 Carrera GTS",
            "variant": "Coupe PDK",
            "year": 2024,
            "category": "sport",
            "body_type": "Coupe",
            "label": "THE ICONIC · 480 PS",
            "price": Decimal("27500000.00"),
            "price_display": "₹2.75 Cr",
            "fuel_type": "PETROL",
            "mileage": 1400,
            "mileage_arai": "10.20 kmpl",
            "seating_capacity": 4,
            "safety_rating": "Porsche Stability Management (PSM)",
            "transmission": "8-Speed Porsche Doppelkupplung (PDK)",
            "engine": "3.0L Twin-Turbo Boxer 6-Cylinder",
            "power_bhp": "473 bhp",
            "torque_nm": "570 Nm",
            "warranty_info": "2 Years / Unlimited km Global Warranty",
            "image_id": "photo-1503376780353-7e6692767b70",
            "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1100&q=85",
            "alt_text": "Silver Porsche 911 sports car",
            "specs": ["3.0L FLAT-SIX TWIN-TURBO", "0-100 IN 3.4s", "PASM SPORT", "SPORT EXHAUST"],
            "description": "Bespoke Crayon exterior with GTS Alcantara package, Front Axle Lift system (essential for Indian speed-breakers), and Sport Chrono.",
            "status": "AVAILABLE"
        }
    ]

    saved_vehicles = {}
    for v_data in vehicles_data:
        v, _ = Vehicle.objects.update_or_create(
            vin=v_data['vin'],
            defaults=v_data
        )
        saved_vehicles[v.model] = v
        print(f"Vehicle: {v.name} -> {v.formatted_price}")

    # 4. Multi-Dealer Pricing for Each Vehicle (Creating Price Variations for Best Dealer Discovery)
    all_dealers = list(Dealer.objects.all())
    
    # Pricing matrix: Assign multiple dealers to each car with distinct discounts
    dealer_offers = [
        # Mahindra XUV700
        {
            "vehicle": saved_vehicles["XUV700"],
            "dealer_key": "Mumbai_AutoHangar",
            "ex_showroom": Decimal("2699000.00"),
            "discount": Decimal("85000.00"),
            "final": Decimal("2614000.00"),
            "on_road": Decimal("3140000.00"),
            "offer": "₹85,000 Cash Discount + Free 5-Year Roadside Assistance",
            "timeline": "Ready in Stock (2 Days)",
            "is_best": False
        },
        {
            "vehicle": saved_vehicles["XUV700"],
            "dealer_key": "Pune_PPS",
            "ex_showroom": Decimal("2699000.00"),
            "discount": Decimal("110000.00"),
            "final": Decimal("2589000.00"),
            "on_road": Decimal("3115000.00"),
            "offer": "₹1,10,000 Special Maharashtra Corporate Discount + Free Floor Mats",
            "timeline": "Immediate Stock (Same Day)",
            "is_best": True  # CHEAPEST IN MAHARASHTRA!
        },
        {
            "vehicle": saved_vehicles["XUV700"],
            "dealer_key": "New_Koncept",
            "ex_showroom": Decimal("2699000.00"),
            "discount": Decimal("125000.00"),
            "final": Decimal("2574000.00"),
            "on_road": Decimal("3090000.00"),
            "offer": "₹1,25,000 Massive Delhi Festive Benefit + Zero Downpayment EMI",
            "timeline": "Immediate Delivery",
            "is_best": True  # CHEAPEST OVERALL IN INDIA!
        },
        {
            "vehicle": saved_vehicles["XUV700"],
            "dealer_key": "Bengaluru_Sireesh",
            "ex_showroom": Decimal("2699000.00"),
            "discount": Decimal("65000.00"),
            "final": Decimal("2634000.00"),
            "on_road": Decimal("3280000.00"),
            "offer": "₹65,000 Exchange Bonus + Free 3-Year Service Pack",
            "timeline": "1 Week Delivery",
            "is_best": False
        },

        # Tata Safari
        {
            "vehicle": saved_vehicles["Safari"],
            "dealer_key": "Mumbai_Shaman",
            "ex_showroom": Decimal("2734000.00"),
            "discount": Decimal("75000.00"),
            "final": Decimal("2659000.00"),
            "on_road": Decimal("3195000.00"),
            "offer": "₹75,000 Cash Discount + Ceramic Coating Voucher",
            "timeline": "In Stock",
            "is_best": False
        },
        {
            "vehicle": saved_vehicles["Safari"],
            "dealer_key": "Bengaluru_Kalyani",
            "ex_showroom": Decimal("2734000.00"),
            "discount": Decimal("105000.00"),
            "final": Decimal("2629000.00"),
            "on_road": Decimal("3240000.00"),
            "offer": "₹1,05,000 Super Exchange Privilege + Extended Shield Warranty",
            "timeline": "Ready in Stock",
            "is_best": True  # CHEAPEST IN KARNATAKA
        },
        {
            "vehicle": saved_vehicles["Safari"],
            "dealer_key": "Ahmedabad_Cargo",
            "ex_showroom": Decimal("2734000.00"),
            "discount": Decimal("90000.00"),
            "final": Decimal("2644000.00"),
            "on_road": Decimal("3020000.00"),
            "offer": "₹90,000 Corporate Bonus + 0% Foreclosure Loan",
            "timeline": "3 Days",
            "is_best": False
        },

        # Hyundai Creta
        {
            "vehicle": saved_vehicles["Creta"],
            "dealer_key": "Mumbai_Shaman",
            "ex_showroom": Decimal("2015000.00"),
            "discount": Decimal("45000.00"),
            "final": Decimal("1970000.00"),
            "on_road": Decimal("2320000.00"),
            "offer": "₹45,000 Festive Savings + Free 3M Underbody Anti-Rust Coating",
            "timeline": "Immediate Stock",
            "is_best": True  # CHEAPEST IN MH
        },
        {
            "vehicle": saved_vehicles["Creta"],
            "dealer_key": "New_Koncept",
            "ex_showroom": Decimal("2015000.00"),
            "discount": Decimal("40000.00"),
            "final": Decimal("1975000.00"),
            "on_road": Decimal("2290000.00"),
            "offer": "₹40,000 Cash Rebate + Free Dashcam",
            "timeline": "Ready in Stock",
            "is_best": False
        },
        {
            "vehicle": saved_vehicles["Creta"],
            "dealer_key": "Hyderabad_Vibrant",
            "ex_showroom": Decimal("2015000.00"),
            "discount": Decimal("50000.00"),
            "final": Decimal("1965000.00"),
            "on_road": Decimal("2340000.00"),
            "offer": "₹50,000 Telangana IT Employee Benefit + 2 Free Services",
            "timeline": "2 Days",
            "is_best": True  # CHEAPEST OVERALL
        },

        # Tata Nexon.ev
        {
            "vehicle": saved_vehicles["Nexon.ev"],
            "dealer_key": "Pune_PPS",
            "ex_showroom": Decimal("1949000.00"),
            "discount": Decimal("60000.00"),
            "final": Decimal("1889000.00"),
            "on_road": Decimal("1995000.00"),
            "offer": "₹60,000 Green Mobility Subsidy Match + Free 7.2 kW Wallbox Charger",
            "timeline": "Ready Stock",
            "is_best": True
        },
        {
            "vehicle": saved_vehicles["Nexon.ev"],
            "dealer_key": "Bengaluru_Kalyani",
            "ex_showroom": Decimal("1949000.00"),
            "discount": Decimal("75000.00"),
            "final": Decimal("1874000.00"),
            "on_road": Decimal("1960000.00"),
            "offer": "₹75,000 Bengaluru Tech Park EV Promo + Zero Road Tax in Karnataka",
            "timeline": "Immediate Delivery",
            "is_best": True  # BEST PRICE
        },

        # Toyota Fortuner
        {
            "vehicle": saved_vehicles["Fortuner"],
            "dealer_key": "Chennai_Lanson",
            "ex_showroom": Decimal("5144000.00"),
            "discount": Decimal("80000.00"),
            "final": Decimal("5064000.00"),
            "on_road": Decimal("6210000.00"),
            "offer": "₹80,000 VIP Access Package + Free Chrome Exhaust Tip & Footsteps",
            "timeline": "Ready in Stock",
            "is_best": True
        },
        {
            "vehicle": saved_vehicles["Fortuner"],
            "dealer_key": "Mumbai_Shaman",
            "ex_showroom": Decimal("5144000.00"),
            "discount": Decimal("40000.00"),
            "final": Decimal("5104000.00"),
            "on_road": Decimal("6380000.00"),
            "offer": "₹40,000 Insurance Concession",
            "timeline": "10 Days",
            "is_best": False
        },

        # BMW 3 Series
        {
            "vehicle": saved_vehicles["3 Series Gran Limousine"],
            "dealer_key": "Gurgaon_Infinity",
            "ex_showroom": Decimal("6200000.00"),
            "discount": Decimal("350000.00"),
            "final": Decimal("5850000.00"),
            "on_road": Decimal("6780000.00"),
            "offer": "₹3,50,000 Luxury Festive Bonanza + 3 Years BSI Service Pack Included",
            "timeline": "Immediate Stock",
            "is_best": True  # BEST IN INDIA
        },
        {
            "vehicle": saved_vehicles["3 Series Gran Limousine"],
            "dealer_key": "Mumbai_AutoHangar",
            "ex_showroom": Decimal("6200000.00"),
            "discount": Decimal("280000.00"),
            "final": Decimal("5920000.00"),
            "on_road": Decimal("7150000.00"),
            "offer": "₹2,80,000 Corporate Advantage + 1 Year Complimentary Insurance",
            "timeline": "Ready in Showroom",
            "is_best": False
        },

        # Porsche 911
        {
            "vehicle": saved_vehicles["911 Carrera GTS"],
            "dealer_key": "Gurgaon_Infinity",
            "ex_showroom": Decimal("27500000.00"),
            "discount": Decimal("500000.00"),
            "final": Decimal("27000000.00"),
            "on_road": Decimal("31500000.00"),
            "offer": "₹5,00,000 Atelier Credit for Tequipment Accessories & Custom Tailoring",
            "timeline": "Atelier Viewing",
            "is_best": True
        },
        {
            "vehicle": saved_vehicles["911 Carrera GTS"],
            "dealer_key": "Mumbai_AutoHangar",
            "ex_showroom": Decimal("27500000.00"),
            "discount": Decimal("300000.00"),
            "final": Decimal("27200000.00"),
            "on_road": Decimal("32100000.00"),
            "offer": "₹3,00,000 Track Day Experience + Ceramic Protection",
            "timeline": "Ready for Viewing",
            "is_best": False
        }
    ]

    for off in dealer_offers:
        dealer = dealer_map.get(off['dealer_key'])
        if dealer:
            DealerVehiclePrice.objects.update_or_create(
                vehicle=off['vehicle'],
                dealer=dealer,
                defaults={
                    'ex_showroom_price': off['ex_showroom'],
                    'dealer_discount': off['discount'],
                    'final_offer_price': off['final'],
                    'on_road_estimate': off['on_road'],
                    'special_offers': off['offer'],
                    'delivery_timeline': off['timeline'],
                    'is_best_price': off['is_best'],
                    'stock_units': 3
                }
            )

    print("Seeded vehicle dealer prices & discounts!")

    # 5. Indian Accessories & Parts Categories
    cat_dash, _ = PartCategory.objects.get_or_create(slug='dashcams-electronics', defaults={'name': 'Dashcams & Smart Electronics', 'description': 'Dual-channel 4K dashcams, TPMS, and smart GPS devices for Indian traffic.'})
    cat_care, _ = PartCategory.objects.get_or_create(slug='monsoon-ceramic-care', defaults={'name': 'Ceramic, PPF & Dust Care', 'description': 'Weatherproof protection engineered for Indian monsoon, dust and heat.'})
    cat_mats, _ = PartCategory.objects.get_or_create(slug='mats-utility', defaults={'name': '7D Mats & Utility Upgrades', 'description': 'Precision-fit 7D all-weather waterproof mats, side steps and roof carriers.'})
    cat_perf, _ = PartCategory.objects.get_or_create(slug='brakes-tyres', defaults={'name': 'Brakes, Tyres & Suspension', 'description': 'Brembo brake pads, Michelin SUV tyres, and suspension reinforcement.'})

    parts_data = [
        {
            "sku": "70MAI-A810-4K",
            "name": "70mai A810 4K HDR Dual Dashcam (Sony STARVIS 2)",
            "category": cat_dash,
            "item_type": Part.ItemType.ACCESSORY,
            "brand": "70mai India",
            "price": Decimal("18999.00"),
            "stock": 25,
            "compatibility": "Universal (Mahindra XUV700, Safari, Creta, Fortuner, BMW, Mercedes)",
            "warranty_months": 24,
            "gst_percentage": 18,
            "description": "Essential for Indian driving safety. Dual front 4K & rear 1080P recording with Sony Starvis 2 night vision, Built-in GPS, ADAS alerts, and 24H parking surveillance.",
            "image_url": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80"
        },
        {
            "sku": "MEG-CERAMIC-IND",
            "name": "Meguiar's Deep Crystal Ceramic Coating Kit",
            "category": cat_care,
            "item_type": Part.ItemType.ACCESSORY,
            "brand": "Meguiar's India",
            "price": Decimal("6499.00"),
            "stock": 40,
            "compatibility": "All Indian Cars (Dark & Metallic finishes)",
            "warranty_months": 12,
            "gst_percentage": 18,
            "description": "9H hardness hydrophobic protective barrier guarding your car against harsh Indian sun, acid rain, bird droppings, and swirl marks.",
            "image_url": "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80"
        },
        {
            "sku": "XUV700-STEP-SCUFF",
            "name": "Mahindra XUV700 Integrated Aluminium Side Steps & Illuminated Scuff Plates",
            "category": cat_mats,
            "item_type": Part.ItemType.ACCESSORY,
            "brand": "Mahindra Genuine Accessories",
            "price": Decimal("14500.00"),
            "stock": 15,
            "compatibility": "Mahindra XUV700 (All Variants: MX, AX3, AX5, AX7, AX7L)",
            "warranty_months": 12,
            "gst_percentage": 18,
            "description": "Heavy-duty aircraft grade extruded aluminium side footboard supporting up to 180kg, with laser-etched illuminated XUV700 door entry sill plates.",
            "image_url": "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80"
        },
        {
            "sku": "SAFARI-7D-MATS",
            "name": "Tata Safari Luxury 7D Custom-Fit Waterproof Floor & Boot Mats",
            "category": cat_mats,
            "item_type": Part.ItemType.ACCESSORY,
            "brand": "Tata Genuine Spares",
            "price": Decimal("7800.00"),
            "stock": 30,
            "compatibility": "Tata Safari (6-Seater and 7-Seater)",
            "warranty_months": 12,
            "gst_percentage": 18,
            "description": "High-wall water, mud and slush proof 7-layer composite leatherette mats with detachable curly coil mats for easy cleaning during Indian monsoons.",
            "image_url": "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80"
        },
        {
            "sku": "BREMBO-CERAMIC-PADS",
            "name": "Brembo High-Performance Low-Metallic Ceramic Brake Pads (Front Axle)",
            "category": cat_perf,
            "item_type": Part.ItemType.SPARE_PART,
            "brand": "Brembo India",
            "price": Decimal("8900.00"),
            "stock": 20,
            "compatibility": "BMW 3 Series, Fortuner, XUV700, Safari, Creta",
            "warranty_months": 24,
            "gst_percentage": 18,
            "description": "Zero brake dust formulation with anti-fade stopping power under aggressive Indian highway driving and high thermal loads.",
            "image_url": "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80"
        },
        {
            "sku": "MICHELIN-SUV-TYRE",
            "name": "Michelin Primacy SUV 235/60 R18 All-Terrain High-Silence Tyre",
            "category": cat_perf,
            "item_type": Part.ItemType.SPARE_PART,
            "brand": "Michelin India",
            "price": Decimal("13400.00"),
            "stock": 35,
            "compatibility": "Mahindra XUV700, Tata Safari, Hyundai Tucson",
            "warranty_months": 36,
            "gst_percentage": 28,
            "description": "Engineered for Indian tarmac and broken roads with reinforced FlexMax 2.0 sidewalls, shorter wet braking distance, and ultra-plush ride quality.",
            "image_url": "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=800&q=80"
        }
    ]

    saved_parts = {}
    for p_data in parts_data:
        part, _ = Part.objects.update_or_create(
            sku=p_data['sku'],
            defaults=p_data
        )
        saved_parts[part.sku] = part
        print(f"Part: {part.name} -> ₹{part.price:,.0f}")

    # 6. Dealer pricing for parts
    part_dealer_links = [
        # Dashcam
        {"part": saved_parts["70MAI-A810-4K"], "dealer_key": "Mumbai_AutoHangar", "mrp": Decimal("18999.00"), "offer": Decimal("16499.00"), "days": 1, "inst": True},
        {"part": saved_parts["70MAI-A810-4K"], "dealer_key": "New_Koncept", "mrp": Decimal("18999.00"), "offer": Decimal("15999.00"), "days": 1, "inst": True},  # BEST PRICE
        {"part": saved_parts["70MAI-A810-4K"], "dealer_key": "Bengaluru_Kalyani", "mrp": Decimal("18999.00"), "offer": Decimal("16200.00"), "days": 2, "inst": True},

        # Ceramic
        {"part": saved_parts["MEG-CERAMIC-IND"], "dealer_key": "Mumbai_AutoHangar", "mrp": Decimal("6499.00"), "offer": Decimal("5200.00"), "days": 1, "inst": True},  # BEST IN MH
        {"part": saved_parts["MEG-CERAMIC-IND"], "dealer_key": "Pune_PPS", "mrp": Decimal("6499.00"), "offer": Decimal("5400.00"), "days": 1, "inst": True},

        # XUV700 Side Steps
        {"part": saved_parts["XUV700-STEP-SCUFF"], "dealer_key": "Pune_PPS", "mrp": Decimal("14500.00"), "offer": Decimal("12800.00"), "days": 1, "inst": True},
        {"part": saved_parts["XUV700-STEP-SCUFF"], "dealer_key": "New_Koncept", "mrp": Decimal("14500.00"), "offer": Decimal("12200.00"), "days": 1, "inst": True},  # BEST IN DELHI

        # Brembo Brake Pads
        {"part": saved_parts["BREMBO-CERAMIC-PADS"], "dealer_key": "Gurgaon_Infinity", "mrp": Decimal("8900.00"), "offer": Decimal("7600.00"), "days": 1, "inst": True},
        {"part": saved_parts["BREMBO-CERAMIC-PADS"], "dealer_key": "Bengaluru_Kalyani", "mrp": Decimal("8900.00"), "offer": Decimal("7450.00"), "days": 2, "inst": True},  # BEST PRICE
    ]

    for pd in part_dealer_links:
        dealer = dealer_map.get(pd['dealer_key'])
        if dealer:
            DealerPartPrice.objects.update_or_create(
                part=pd['part'],
                dealer=dealer,
                defaults={
                    'mrp': pd['mrp'],
                    'offer_price': pd['offer'],
                    'stock_units': 8,
                    'delivery_days': pd['days'],
                    'installation_available': pd['inst']
                }
            )

    print("Seeded part dealer prices successfully!")
    print("ALL INDIAN MARKETPLACE DATA SEEDED!")


if __name__ == '__main__':
    seed_indian_dealership()
