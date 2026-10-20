/**
 * Collection.jsx (includes VehicleCard)
 * -------------------
 * Vehicle Listing & Filtering
 * Styled with Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { getVehicles } from '../services/api.js';
import indianCars from '../data/cars.js';

function VehicleCard({ car, onInquire, onCompare, isSelectedForCompare, onToggleCompare }) {
  function tiltImage(event) {
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    const box = event.currentTarget.getBoundingClientRect();
    const horizontalPosition = (event.clientX - box.left) / box.width - 0.5;
    const verticalPosition = (event.clientY - box.top) / box.height - 0.5;

    const image = event.currentTarget.querySelector('img');
    if (image) {
      const tiltMultiplier = 15;
      image.style.transform = `scale(1.055) rotateY(${horizontalPosition * tiltMultiplier}deg) rotateX(${-verticalPosition * tiltMultiplier}deg)`;
    }
  }

  function resetImage() {
    const image = document.querySelector(`[data-car-image="${car.vin || car.id}"]`);
    if (image) image.style.transform = '';
  }

  const photoUrl = car.full_image_url || `https://images.unsplash.com/${car.image_id}?auto=format&fit=crop&w=1100&q=85`;
  const displayPrice = car.formatted_price || car.price_display || `₹${car.price}`;

  const displaySpecs = Array.isArray(car.specs) && car.specs.length > 0
    ? car.specs
    : [car.fuel_type, car.mileage_arai, `${car.seating_capacity} Seater`].filter(Boolean);

  const bestOffer = car.best_dealer_offer;

  return (
    <article
      className={`car-card min-w-0 flex flex-col bg-[#dfdcd3] border rounded-sm overflow-hidden p-4 group transition-all duration-300 hover:shadow-xl ${
        isSelectedForCompare ? 'border-[#c5a77a] ring-2 ring-[#c5a77a]/50' : 'border-black/10 hover:border-black/20'
      }`}
      data-type={car.category}
    >
      <button
        type="button"
        className="car-image-wrap block relative overflow-hidden aspect-[1.42] bg-[#d5d2ca] rounded-xs cursor-pointer group/img text-left w-full border-0 p-0"
        onClick={() => onInquire(car)}
        onPointerMove={tiltImage}
        onPointerLeave={resetImage}
        aria-label={`Ask us about the ${car.name}`}
      >
        <img
          data-car-image={car.vin || car.id}
          src={photoUrl}
          alt={car.alt_text || car.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1100&q=85';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        <span className="car-number absolute top-3 left-3 bg-[#11120f]/85 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded-full font-medium tracking-wider uppercase">
          {car.fuel_type}
        </span>
        <span className="car-arrow absolute top-3 right-3 w-7 h-7 rounded-full bg-[#11120f]/85 text-[#c5a77a] flex items-center justify-center text-xs opacity-0 group-hover/img:opacity-100 transition-opacity">
          ↗
        </span>
      </button>

      <div className="car-meta flex justify-between items-start gap-3 mt-4">
        <div>
          <span className="car-type text-[9px] tracking-[0.16em] uppercase text-[#77776f] block font-medium">
            {car.label || `${car.make} · ${car.year}`}
          </span>
          <h3 className="text-base font-semibold text-[#181916] mt-0.5 tracking-tight">{car.name}</h3>
        </div>
        <div className="price-stack text-right shrink-0">
          <span className="car-price text-base font-bold text-[#181916] block tracking-tight">{displayPrice}</span>
          <span className="ex-showroom-sub text-[8px] uppercase tracking-wider text-[#888880] block">Ex-Showroom</span>
        </div>
      </div>

      {/* --- Best Dealer Offer In State Callout --- */}
      {bestOffer?.dealer && (
        <div className="card-dealer-badge mt-3 p-2.5 rounded-xs bg-[#d3d0c5] border border-black/10 text-xs">
          <div className="badge-title flex items-center justify-between text-[10px] text-[#444] font-medium">
            <span>🏆 Best Price ({bestOffer.dealer.state}):</span>
            <strong className="badge-price text-[#181916] font-bold text-xs">{bestOffer.formatted_offer_price}</strong>
          </div>
          <div className="badge-dealer flex items-center justify-between gap-2 mt-1 text-[10px] text-[#666]">
            <div className="dealer-callout-info flex items-center gap-1.5 truncate">
              <span className="dealer-name-strong font-semibold text-[#181916] truncate">{bestOffer.dealer.name}</span>
              <span className="dealer-city-tag text-[10px] font-medium text-[#666] ">({bestOffer.dealer.city})</span>
              <span className="dealer-star-pill text-[#b38600] font-bold text-[9px]">★ {bestOffer.dealer.rating}</span>
            </div>
            {Number(bestOffer.dealer_discount) > 0 && (
              <span className="save-pill bg-[#c5a77a] text-[#1c1917] font-bold px-1.5 py-0.5 rounded-xs text-[9px] shrink-0">
                Save ₹{Number(bestOffer.dealer_discount).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="car-spec flex items-center flex-wrap gap-2 text-[9px] text-[#666660] my-3.5 pt-2 border-t border-black/10">
        {displaySpecs.map((spec, index) => (
          <span className="spec-item flex items-center gap-1" key={`spec-${index}-${spec}`}>
            {index > 0 && <span aria-hidden="true" className="w-1 h-1 rounded-full bg-black/25" />}
            {spec}
          </span>
        ))}
      </div>

      <div className="car-card-footer-actions flex gap-2.5 mt-auto pt-2">
        <button
          type="button"
          className="button button-gold-sm flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer"
          onClick={() => onInquire(car)}
        >
          Get Quote ↗
        </button>
        <button
          type="button"
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer border ${
            isSelectedForCompare
              ? 'bg-[#181916] text-[#c5a77a] border-[#181916] shadow-sm'
              : 'bg-transparent hover:bg-black/5 text-[#181916] border-black/30'
          }`}
          onClick={() => onToggleCompare ? onToggleCompare(car) : onCompare(car)}
          title="Select to compare side-by-side"
        >
          {isSelectedForCompare ? '✓ In Compare' : '+ Compare'}
        </button>
      </div>
    </article>
  );
}

export default function Collection({
  userState,
  onInquireVehicle,
  onOpenCompare,
  selectedCompareIds = [],
  onToggleCompareCar,
}) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [vehicles, setVehicles] = useState(indianCars);
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getVehicles('all', userState)
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setVehicles(data);
            setBackendConnected(true);
          } else {
            console.warn('API returned malformed data, falling back to local static cars.');
            setBackendConnected(false);
          }
        }
      })
      .catch(() => {
        if (isMounted) setBackendConnected(false);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userState]);

  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  const totalCount = safeVehicles.length.toString().padStart(2, '0');
  const suvCount = safeVehicles.filter((c) => c.category === 'suv').length.toString().padStart(2, '0');
  const sportCount = safeVehicles.filter((c) => c.category === 'sport').length.toString().padStart(2, '0');
  const grandCount = safeVehicles.filter((c) => c.category === 'grand').length.toString().padStart(2, '0');
  const electricCount = safeVehicles.filter((c) => c.category === 'electric').length.toString().padStart(2, '0');

  const filterOptions = [
    { label: 'All vehicles', value: 'all', count: totalCount },
    { label: 'Premium SUVs', value: 'suv', count: suvCount },
    { label: 'Luxury & Grand', value: 'grand', count: grandCount },
    { label: 'Electric (EV)', value: 'electric', count: electricCount },
    { label: 'Performance', value: 'sport', count: sportCount },
  ];

  return (
    <section
      className="collection section-pad bg-[#e8e6df] text-[#181916] pt-16 md:pt-[88px] pb-20 md:pb-[116px] px-4 sm:px-[7%] lg:px-[11.5%]"
      id="collection"
    >
      <div className="section-label flex justify-between pb-[19px] border-b border-black/15 text-[#77776f] text-[9px] tracking-[0.22em] uppercase font-sans">
        <span>02 / FIND YOUR NEXT CAR</span>
        <span>
          VERIFIED DEALER PRICING IN {userState ? userState.toUpperCase() : 'INDIA'}
          {backendConnected && <span className="api-badge text-[#c5a77a]-700 font-bold ml-1"> · LIVE LISTINGS</span>}
        </span>
      </div>

      <div className="collection-heading flex flex-col sm:flex-row sm:items-end justify-between pt-8 gap-4">
        <div>
          <h2 className="font-light text-[clamp(34px,5.5vw,76px)] leading-[1.05] tracking-[-0.065em] m-0 text-[#181916]">
            A collection for <em className="font-serif font-normal italic text-[#a88e68]">everyday life.</em>
          </h2>
          <p className="text-xs text-[#77776f] mt-3 max-w-md">Browse models by the way you drive. Compare features and prices, then decide what is worth a closer look.</p>
        </div>
        <div className="collection-quick-actions shrink-0">
          <button
            className="button button-gold-sm inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer"
            type="button"
            onClick={() => onOpenCompare()}
          >
            Compare models
          </button>
        </div>
      </div>

      <div className="filters flex items-center gap-6 border-b border-black/15 my-8 overflow-x-auto pb-3" role="group" aria-label="Filter vehicles">
        {filterOptions.map((filter) => (
          <button
            className={`filter whitespace-nowrap pb-3 border-b-2 text-[10px] uppercase tracking-wider cursor-pointer font-medium transition-colors bg-transparent border-t-0 border-x-0 ${selectedFilter === filter.value
                ? 'border-[#9b8057] text-[#1a1b17] font-bold'
                : 'border-transparent text-[#85857d] hover:text-[#181916]'
              }`}
            key={filter.value}
            type="button"
            aria-pressed={selectedFilter === filter.value}
            onClick={() => setSelectedFilter(filter.value)}
          >
            {filter.label} <span className="text-[8px] ml-1 opacity-75">{filter.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state flex flex-col items-center justify-center py-20 text-[#666]">
          <div className="pulse-spinner w-8 h-8 rounded-full border-2 border-[#c5a77a] border-t-transparent animate-spin mb-4" />
          <p className="text-xs">Querying authorized dealer pricing in {userState || 'your state'}...</p>
        </div>
      ) : (
        <div className="car-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {safeVehicles.map((car) => {
            const shouldHideCar = selectedFilter !== 'all' && car.category !== selectedFilter;

            return (
              <div
                className={`car-card-slot ${shouldHideCar ? 'hidden' : 'block'}`}
                key={car.vin || car.id}
              >
                <VehicleCard
                  car={car}
                  onInquire={onInquireVehicle}
                  onCompare={() => onOpenCompare(car.id)}
                  isSelectedForCompare={selectedCompareIds.includes(car.id)}
                  onToggleCompare={() => onToggleCompareCar && onToggleCompareCar(car)}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
