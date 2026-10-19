import React, { useState, useEffect } from 'react';
import { getVehicles } from '../services/api.js';
import indianCars from '../data/cars.js';

function VehicleCard({ car, onInquire, onCompare }) {
  // Tilt the picture slightly toward the visitor's pointer.
  function tiltImage(event) {
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    const box = event.currentTarget.getBoundingClientRect();
    const horizontalPosition = (event.clientX - box.left) / box.width - 0.5;
    const verticalPosition = (event.clientY - box.top) / box.height - 0.5;
    const image = event.currentTarget.querySelector('img');
    if (image) {
      image.style.transform = `scale(1.055) rotateY(${horizontalPosition * 3}deg) rotateX(${-verticalPosition * 3}deg)`;
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
    <article className="car-card" data-type={car.category}>
      <button
        type="button"
        className="car-image-wrap"
        onClick={() => onInquire(car)}
        onPointerMove={tiltImage}
        onPointerLeave={resetImage}
        aria-label={`Ask us about the ${car.name}`}
      >
        <img data-car-image={car.vin || car.id} src={photoUrl} alt={car.alt_text || car.name} loading="lazy" />
        <span className="car-number">{car.fuel_type}</span>
        <span className="car-arrow">↗</span>
      </button>

      <div className="car-meta">
        <div>
          <span className="car-type">{car.label || `${car.make} · ${car.year}`}</span>
          <h3>{car.name}</h3>
        </div>
        <div className="price-stack">
          <span className="car-price">{displayPrice}</span>
          <span className="ex-showroom-sub">Ex-Showroom</span>
        </div>
      </div>

      {/* Best Dealer Offer In State Callout */}
      {bestOffer && bestOffer.dealer && (
        <div className="card-dealer-badge">
          <div className="badge-title">
            <span>🏆 Best Price ({bestOffer.dealer.state}):</span>
            <strong className="badge-price">{bestOffer.formatted_offer_price}</strong>
          </div>
          <div className="badge-dealer">
            <div className="dealer-callout-info">
              <span className="dealer-name-strong">{bestOffer.dealer.name}</span>
              <span className="dealer-city-tag">({bestOffer.dealer.city})</span>
              <span className="dealer-star-pill">★ {bestOffer.dealer.rating}</span>
            </div>
            {bestOffer.dealer_discount > 0 && (
              <span className="save-pill">Save ₹{Number(bestOffer.dealer_discount).toLocaleString()}</span>
            )}
          </div>
        </div>
      )}

      <div className="car-spec">
        {displaySpecs.map((spec, index) => (
          <span className="spec-item" key={spec}>
            {index > 0 && <i aria-hidden="true" />}{spec}
          </span>
        ))}
      </div>

      <div className="car-card-footer-actions">
        <button
          type="button"
          className="button button-gold-sm"
          onClick={() => onInquire(car)}
        >
          Get Dealer Quote ↗
        </button>
        <button
          type="button"
          className="button button-outline-sm"
          onClick={() => onCompare(car)}
        >
          Compare
        </button>
      </div>
    </article>
  );
}

export default function Collection({ userState, onInquireVehicle, onOpenCompare }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [vehicles, setVehicles] = useState(indianCars);
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getVehicles('all', userState)
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setVehicles(data);
          setBackendConnected(true);
        }
      })
      .catch((err) => {
        console.warn('Vehicle fetch notice:', err);
        if (isMounted) setBackendConnected(false);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userState]);

  // Compute category counts
  const totalCount = vehicles.length.toString().padStart(2, '0');
  const suvCount = vehicles.filter((c) => c.category === 'suv').length.toString().padStart(2, '0');
  const sportCount = vehicles.filter((c) => c.category === 'sport').length.toString().padStart(2, '0');
  const grandCount = vehicles.filter((c) => c.category === 'grand').length.toString().padStart(2, '0');
  const electricCount = vehicles.filter((c) => c.category === 'electric').length.toString().padStart(2, '0');

  const filterOptions = [
    { label: 'All vehicles', value: 'all', count: totalCount },
    { label: 'Premium SUVs', value: 'suv', count: suvCount },
    { label: 'Luxury & Grand', value: 'grand', count: grandCount },
    { label: 'Electric (EV)', value: 'electric', count: electricCount },
    { label: 'Performance', value: 'sport', count: sportCount },
  ];

  return (
    <section className="collection section-pad" id="collection">
      <div className="section-label">
        <span>02 / FIND YOUR NEXT CAR</span>
        <span>
          VERIFIED DEALER PRICING IN {userState ? userState.toUpperCase() : 'INDIA'}
          {backendConnected && <span className="api-badge"> · LIVE LISTINGS</span>}
        </span>
      </div>

      <div className="collection-heading">
        <div>
          <h2>A collection for <em>everyday life.</em></h2>
          <p>Browse models by the way you drive. Compare features and prices, then decide what is worth a closer look.</p>
        </div>
        <div className="collection-quick-actions">
          <button
            className="button button-gold-sm"
            type="button"
            onClick={() => onOpenCompare()}
          >
            Compare models
          </button>
        </div>
      </div>

      <div className="filters" role="group" aria-label="Filter vehicles">
        {filterOptions.map((filter) => (
          <button
            className={`filter ${selectedFilter === filter.value ? 'active' : ''}`}
            key={filter.value}
            type="button"
            aria-pressed={selectedFilter === filter.value}
            onClick={() => setSelectedFilter(filter.value)}
          >
            {filter.label} <span>{filter.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="pulse-spinner" />
          <p>Querying authorized dealer pricing in {userState}...</p>
        </div>
      ) : (
        <div className="car-grid">
          {vehicles.map((car) => {
            const shouldHideCar = selectedFilter !== 'all' && car.category !== selectedFilter;

            return (
              <div
                className={`car-card-slot ${shouldHideCar ? 'hidden' : ''}`}
                key={car.vin || car.id}
              >
                <VehicleCard
                  car={car}
                  onInquire={onInquireVehicle}
                  onCompare={() => onOpenCompare(car.id)}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
