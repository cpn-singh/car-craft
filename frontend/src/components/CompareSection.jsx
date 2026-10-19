import React, { useState, useEffect } from 'react';
import { compareVehicles, INDIAN_STATES } from '../services/api.js';
import indianCars from '../data/cars.js';

export default function CompareSection({ userState, onStateChange, onInquireVehicle }) {
  const [selectedIds, setSelectedIds] = useState([7, 8]); // Default XUV700 & Tata Safari
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    compareVehicles(selectedIds, userState)
      .then((res) => {
        if (isMounted) setComparison(res);
      })
      .catch((err) => {
        console.warn('Comparison API notice, using merged data:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedIds, userState]);

  function handleSelectCar(slotIndex, newId) {
    const updated = [...selectedIds];
    updated[slotIndex] = parseInt(newId);
    setSelectedIds(updated);
  }

  function addThirdCar() {
    if (selectedIds.length === 2) {
      setSelectedIds([...selectedIds, 9]); // Add Creta
    }
  }

  function removeThirdCar() {
    if (selectedIds.length > 2) {
      setSelectedIds(selectedIds.slice(0, 2));
    }
  }

  // Fallback items from indianCars
  const activeCars = selectedIds.map((id) => indianCars.find((c) => c.id === id) || indianCars[0]);

  return (
    <section className="section-pad compare-section" id="compare">
      <div className="section-label">
        <span>03 / SIDE-BY-SIDE COMPARISON</span>
          <span>LOCAL PRICES · {userState.toUpperCase()}</span>
      </div>

      <div className="compare-section-header">
        <div>
          <h2>Two cars, <em>side by side.</em></h2>
          <p>Compare key specifications and listed dealer offers in {userState}. Confirm final prices and availability with the showroom.</p>
        </div>

        <div className="state-picker-wrap">
          <span className="picker-label">Location:</span>
          <select
            className="state-select-stylish"
            value={userState}
            onChange={(e) => onStateChange(e.target.value)}
          >
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Car Selectors Row */}
      <div className="car-selectors-row">
        {selectedIds.map((id, slotIndex) => (
          <div className="car-select-slot" key={slotIndex}>
            <span className="slot-label">Vehicle {slotIndex + 1}:</span>
            <select
              className="car-dropdown"
              value={id}
              onChange={(e) => handleSelectCar(slotIndex, e.target.value)}
            >
              {indianCars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.formatted_price})
                </option>
              ))}
            </select>
          </div>
        ))}

        {selectedIds.length === 2 ? (
          <button type="button" className="add-compare-btn" onClick={addThirdCar}>
            + Add 3rd Car
          </button>
        ) : (
          <button type="button" className="remove-compare-btn" onClick={removeThirdCar}>
            ✕ Remove 3rd Car
          </button>
        )}
      </div>

      {/* AI Comparison Content */}
      <div className="compare-card-container">
        {comparison?.ai_verdict && (
          <div className="ai-verdict-banner-inline">
            <div className="verdict-tag">A QUICK PRICE SUMMARY · {userState.toUpperCase()}</div>
            <h3>{comparison.ai_verdict.headline}</h3>
            <p>{comparison.ai_verdict.summary}</p>

            {comparison.ai_verdict.cheapest_option && (
              <div className="cheapest-dealer-callout">
                <div className="callout-badge">
                  CHEAPEST DEALER IN {userState.toUpperCase()}
                </div>
                
                <div className="callout-vehicle-group">
                  <h4 className="callout-vehicle-name">
                    {comparison.ai_verdict.cheapest_option.vehicle_name}
                  </h4>
                  <div className="callout-vehicle-price">
                    {comparison.ai_verdict.cheapest_option.price}
                  </div>
                </div>

                <div className="callout-meta-group">
                  <span className="callout-meta-label">VERIFIED DEALER:</span>
                  <div className="callout-dealer-name">
                    {comparison.ai_verdict.cheapest_option.dealer} ({comparison.ai_verdict.cheapest_option.city})
                  </div>
                </div>

                <div className="callout-meta-group">
                  <span className="callout-meta-label">YOUR DIRECT SAVINGS:</span>
                  <div className="callout-savings-value">
                    Save {comparison.ai_verdict.cheapest_option.savings_vs_competitor}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scroll indicator for mobile/tablet */}
        <div className="table-scroll-hint" aria-hidden="true">
          <span>⟵ Swipe horizontally to compare cars &amp; dealers ⟶</span>
        </div>

        {/* Side by side comparison table */}
        <div className="table-responsive">
          <table className="comparison-table inpage-table">
            <thead>
              <tr>
                <th className="feature-col">Specification / Dealer Offer</th>
                {activeCars.map((car, idx) => {
                  const compItem = comparison?.comparison?.[idx];
                  const displayImg = compItem?.vehicle?.full_image_url || car.full_image_url;
                  const displayName = compItem?.vehicle?.name || car.name;
                  const displayPrice = compItem?.vehicle?.formatted_price || car.formatted_price;

                  return (
                    <th key={car.id} className="vehicle-col">
                      <div className="table-car-header">
                        <img src={displayImg} alt={displayName} className="table-car-img" />
                        <h4>{displayName}</h4>
                        <span className="table-car-base-price">Base: {displayPrice}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* CHEAPEST DEALER IN STATE */}
              <tr className="highlight-row">
                <td className="feature-label feature-label-dealer">
                  <div className="feature-label-inner">
                    <span className="dealer-trophy">🏆</span>
                    <strong>Best Dealer</strong>
                    <span className="feature-sub">Offer in {userState}</span>
                  </div>
                </td>
                {activeCars.map((car, idx) => {
                  const compItem = comparison?.comparison?.[idx];
                  const bestD = compItem?.best_dealer || car.best_dealer_offer?.dealer;
                  const finalPrice = compItem?.best_dealer?.formatted_final_price || car.best_dealer_offer?.formatted_offer_price;
                  const discount = compItem?.best_dealer?.dealer_discount || car.best_dealer_offer?.dealer_discount;
                  const perks = compItem?.best_dealer?.special_offers || car.best_dealer_offer?.special_offers;
                  const onRoad = compItem?.best_dealer?.formatted_on_road || car.best_dealer_offer?.formatted_on_road;

                  return (
                    <td key={car.id} className="vehicle-col best-dealer-cell">
                      {bestD ? (
                        <div className="dealer-card-compact">
                          <div className="dealer-header-mini">
                            <span className="dealer-name">{bestD.dealer_name || bestD.name}</span>
                            <span className="dealer-rating">★ {bestD.rating}</span>
                          </div>
                          <div className="dealer-address-mini">
                            📍 {bestD.address}, {bestD.city}
                          </div>
                          <div className="dealer-phone-mini">
                            📞 <a href={`tel:${bestD.phone}`} className="phone-link">{bestD.phone}</a>
                          </div>
                          <div className="price-offer-box">
                            <span className="offer-label">Cheapest Offer Price:</span>
                            <span className="offer-val">{finalPrice}</span>
                            {discount > 0 && (
                              <span className="offer-discount">Save ₹{Number(discount).toLocaleString()} Discount</span>
                            )}
                          </div>
                          {onRoad && (
                            <div className="on-road-est">
                              <span>Est. On-Road:</span> <strong>{onRoad}</strong>
                            </div>
                          )}
                          {perks && <div className="special-perk">🎁 {perks}</div>}
                          <button
                            type="button"
                            className="button button-gold-sm"
                            onClick={() => onInquireVehicle(car)}
                          >
                            Lock Best Deal ↗
                          </button>
                        </div>
                      ) : (
                        <div className="dim-text">Direct dealership inquiry available</div>
                      )}
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="feature-label">ARAI Mileage / Range</td>
                {activeCars.map((car, idx) => (
                  <td key={car.id} className="vehicle-col">
                    <span className="stat-pill">{comparison?.comparison?.[idx]?.vehicle?.mileage_arai || car.mileage_arai}</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="feature-label">Safety Credential</td>
                {activeCars.map((car, idx) => (
                  <td key={car.id} className="vehicle-col">
                    <span className="safety-badge">🛡️ {comparison?.comparison?.[idx]?.vehicle?.safety_rating || car.safety_rating}</span>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="feature-label">Fuel &amp; Transmission</td>
                {activeCars.map((car, idx) => (
                  <td key={car.id} className="vehicle-col">
                    {comparison?.comparison?.[idx]?.vehicle?.fuel_type || car.fuel_type} · {comparison?.comparison?.[idx]?.vehicle?.transmission || car.transmission}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="feature-label">Seating Capacity</td>
                {activeCars.map((car, idx) => (
                  <td key={car.id} className="vehicle-col">
                    {comparison?.comparison?.[idx]?.vehicle?.seating_capacity || car.seating_capacity} Seater
                  </td>
                ))}
              </tr>

              <tr>
                <td className="feature-label">Engine &amp; Performance</td>
                {activeCars.map((car, idx) => (
                  <td key={car.id} className="vehicle-col">
                    <div>{comparison?.comparison?.[idx]?.vehicle?.engine || car.engine}</div>
                    <small className="dim-text">
                      {comparison?.comparison?.[idx]?.vehicle?.power_bhp || car.power_bhp} · {comparison?.comparison?.[idx]?.vehicle?.torque_nm || car.torque_nm}
                    </small>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="feature-label">Warranty Support</td>
                {activeCars.map((car, idx) => (
                  <td key={car.id} className="vehicle-col">
                    {comparison?.comparison?.[idx]?.vehicle?.warranty_info || car.warranty_info}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
