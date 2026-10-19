# Aurel Motor Atelier & Indian Auto Suite 🇮🇳

A full-stack Indian automotive platform featuring an **AI Comparison Engine**, **Universal Search**, **State-Specific Dealer Filtering**, and an **Autonomous Best Price (Cheapest Dealer) Discovery Algorithm**.

---

## Key Features

1. **AI Comparison Engine (Vehicles, Accessories & Spare Parts):**
   * Compare 2 or 3 Indian vehicles side-by-side on ARAI fuel efficiency/range, Bharat NCAP safety, engine/transmission, seating, and on-road prices.
   * Compare authentic accessories (4K dashcams, ceramic kits, 7D mats) and spare parts (Brembo ceramic pads, Michelin SUV tyres).
   * **Cheapest Dealer Discovery:** Instantly highlights the verified dealership offering the lowest final price after cash discounts, corporate benefits, and festive packages in the user's state.
   * **AI Buying Verdict:** Generates personalized advice explaining real-world cost of ownership, road suitability, and exact savings vs competing dealers.

2. **Universal Search & Indian State Filtering:**
   * Filter across Indian states: `Maharashtra`, `Delhi NCR`, `Karnataka`, `Tamil Nadu`, `Telangana`, `Gujarat`, `Punjab`, etc.
   * Search across cars, accessories, spare parts, and authorized dealers.
   * Displays full dealer credentials: Name, address, city, phone, star ratings, and exact discount offers.

3. **AI Automotive Advisor (Natural Language Chat):**
   * Ask queries like *"Suggest the best 7-seater diesel SUV under ₹30 Lakhs in Delhi with cheapest dealer"*.
   * Powered by Google Gemini / Indian automotive heuristic intelligence.

4. **100% Tailored for Indian Buyers:**
   * INR Pricing (`₹ Lakh` and `₹ Cr`).
   * Vehicles certified for India (Mahindra XUV700, Tata Safari Dark Edition, Hyundai Creta Turbo, Tata Nexon EV, Toyota Fortuner GR-S, BMW 3 Series LWB, Porsche 911).
   * Top verified dealer network (AutoHangar Mumbai, PPS Motors Pune, Koncept Delhi, Infinity Cars Gurgaon, Kalyani Motors Bengaluru, Lanson Toyota Chennai, etc.).

---

## Quick Start Guide

### 1. Backend Server

```bash
cd backend
.\venv\Scripts\activate
python manage.py runserver 127.0.0.1:8000
```

- **API Base:** [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)
- **DMS Admin Panel:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/) (`admin` / `admin`)

### 2. Frontend Application

```bash
cd frontend
npm run dev
```

- **Frontend URL:** [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

---

## API Endpoints

| Resource | Method | Endpoint | Description |
|---|---|---|---|
| **AI Vehicle Comparison** | `GET` | `/api/ai/compare-vehicles/?ids=7,8&state=Maharashtra` | Side-by-side comparison + cheapest dealer in state |
| **AI Parts Comparison** | `GET` | `/api/ai/compare-parts/?ids=4,5&state=Delhi NCR` | Accessory/parts comparison with lowest seller price |
| **AI Advisor Chat** | `POST` | `/api/ai/advisor/` | Natural language automotive recommendation |
| **Universal Search** | `GET` | `/api/search/?q=xuv&type=all&state=Maharashtra` | Unified search across cars, accessories, and dealers |
| **Dealers Directory** | `GET` | `/api/dms/dealers/?state=Karnataka` | List authorized dealerships with ratings and contacts |
| **Vehicles** | `GET` | `/api/inventory/vehicles/?state=Maharashtra` | Vehicle fleet with best dealer offer badges |
