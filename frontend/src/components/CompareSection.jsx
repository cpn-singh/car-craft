/**
 * CompareSection.jsx
 * -------------------
 * Inline Vehicle Comparison (Landing Page)
 * Styled with Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { compareVehicles, INDIAN_STATES } from '../services/api.js';
import indianCars from '../data/cars.js';

export default function CompareSection({ userState, onStateChange, onInquireVehicle }) {
  const [selectedIds, setSelectedIds] = useState([7, 8]);
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
        console.warn('Comparison API failed, using merged local data instead:', err);
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
    updated[slotIndex] = parseInt(newId, 10);
    setSelectedIds(updated);
  }

  function addThirdCar() {
    if (selectedIds.length === 2) {
      setSelectedIds([...selectedIds, 9]);
    }
  }

  function removeThirdCar() {
    if (selectedIds.length > 2) {
      setSelectedIds(selectedIds.slice(0, 2));
    }
  }

  const activeCars = selectedIds.map((id) => indianCars.find((c) => c.id === id) || indianCars[0]);

  return (
    <section
      className="section-pad compare-section pt-16 md:pt-24 pb-20 md:pb-28 px-4 sm:px-[7%] lg:px-[11.5%] bg-[#11120f] text-white"
      id="compare"
    >
      <div className="section-label flex justify-between pb-[19px] border-b border-white/15 text-[#c9c5ba] text-[9px] tracking-[0.22em] uppercase font-sans">
        <span>03 / SIDE-BY-SIDE COMPARISON</span>
        <span>LOCAL PRICES · {(userState || 'India').toUpperCase()}</span>
      </div>

      <div className="compare-section-header flex flex-col md:flex-row md:items-end justify-between pt-8 gap-4">
        <div>
          <h2 className="font-light text-[clamp(34px,5.5vw,76px)] leading-[1.05] tracking-[-0.065em] m-0 text-white">
            Two cars, <em className="font-serif font-normal italic text-[#c5a77a]">side by side.</em>
          </h2>
          <p className="text-xs text-[#a9aaa3] mt-3 max-w-md leading-relaxed">
            Compare key specifications and listed dealer offers in {userState}. Confirm final prices and availability with the showroom.
          </p>
        </div>

        <div className="state-picker-wrap flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xs self-start md:self-auto">
          <span className="picker-label text-[10px] text-[#888880] uppercase tracking-wider">Location:</span>
          <select
            className="state-select-stylish bg-transparent border-0 text-white text-xs outline-none cursor-pointer pr-1"
            value={userState}
            onChange={(e) => onStateChange(e.target.value)}
          >
            {(INDIAN_STATES || []).map((s) => (
              <option key={`state-${s}`} value={s} className="bg-[#181916] text-white">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Car Selectors Row --- */}
      <div className="car-selectors-row flex flex-wrap items-center gap-3 my-6 p-4 bg-[#181916] border border-white/10 rounded-xs">
        {selectedIds.map((id, slotIndex) => (
          <div className="car-select-slot flex items-center gap-2 flex-1 min-w-[200px]" key={`slot-${slotIndex}`}>
            <span className="slot-label text-[10px] text-[#c5a77a] font-semibold uppercase tracking-wider shrink-0">
              Vehicle {slotIndex + 1}:
            </span>
            <select
              className="car-dropdown bg-[#11120f] border border-white/15 text-white text-xs px-3 py-2 rounded-xs outline-none w-full cursor-pointer focus:border-[#c5a77a]"
              value={id}
              onChange={(e) => handleSelectCar(slotIndex, e.target.value)}
            >
              {indianCars.map((c) => (
                <option key={`opt-${c.id}`} value={c.id} className="bg-[#181916] text-white">
                  {c.name} ({c.formatted_price})
                </option>
              ))}
            </select>
          </div>
        ))}

        {selectedIds.length === 2 ? (
          <button
            type="button"
            className="add-compare-btn px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border border-[#c5a77a] text-[#c5a77a] hover:bg-[#c5a77a]/10 rounded-xs transition-colors cursor-pointer"
            onClick={addThirdCar}
          >
            + Add 3rd Car
          </button>
        ) : (
          <button
            type="button"
            className="remove-compare-btn px-3.5 py-2 text-xs font-semibold uppercase tracking-wider border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-xs transition-colors cursor-pointer"
            onClick={removeThirdCar}
          >
            ✕ Remove 3rd Car
          </button>
        )}
      </div>

      {/* --- AI Comparison Content --- */}
      <div className="compare-card-container">
        {comparison?.ai_verdict && (
          <div className="ai-verdict-banner-inline bg-[#181a18] border border-[#c5a77a]/30 p-5 rounded-xs my-6">
            <div className="verdict-tag text-[9px] uppercase tracking-[0.2em] text-[#c5a77a] font-semibold mb-2 block">
              A QUICK PRICE SUMMARY · {(userState || 'INDIA').toUpperCase()}
            </div>
            <h3 className="text-base font-semibold text-white mb-1.5">{comparison.ai_verdict.headline}</h3>
            <p className="text-xs text-[#a9aaa3] leading-relaxed mb-4">{comparison.ai_verdict.summary}</p>

            {comparison.ai_verdict.cheapest_option && (
              <div className="cheapest-dealer-callout bg-white/5 border border-[#c5a77a]/30 p-4 rounded-xs mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="callout-badge col-span-full text-[11px] uppercase tracking-wider text-[#c5a77a] font-bold mb-1">
                  CHEAPEST DEALER IN {(userState || 'INDIA').toUpperCase()}
                </div>

                <div className="callout-vehicle-group">
                  <h4 className="callout-vehicle-name font-semibold text-white">
                    {comparison.ai_verdict.cheapest_option.vehicle_name}
                  </h4>
                  <div className="callout-vehicle-price text-[#c5a77a] font-bold text-sm mt-0.5">
                    {comparison.ai_verdict.cheapest_option.price}
                  </div>
                </div>

                <div className="callout-meta-group">
                  <span className="callout-meta-label text-[9px] uppercase tracking-wider text-[#888] block">VERIFIED DEALER:</span>
                  <div className="callout-dealer-name text-white font-medium mt-0.5 truncate">
                    {comparison.ai_verdict.cheapest_option.dealer} ({comparison.ai_verdict.cheapest_option.city})
                  </div>
                </div>

                <div className="callout-meta-group">
                  <span className="callout-meta-label text-[9px] uppercase tracking-wider text-[#888] block">YOUR DIRECT SAVINGS:</span>
                  <div className="callout-savings-value text-[#c5a77a] font-semibold mt-0.5">
                    Save {comparison.ai_verdict.cheapest_option.savings_vs_competitor}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="table-scroll-hint md:hidden text-center text-[10px] text-[#888] mb-2 uppercase tracking-wider" aria-hidden="true">
          <span>⟵ Swipe horizontally to compare cars &amp; dealers ⟶</span>
        </div>

        {/* --- Side by side comparison table --- */}
        <div className={`table-responsive overflow-x-auto my-4 border border-white/10 rounded-xs bg-[#181916] ${loading ? 'opacity-50' : ''}`}>
          <table className="comparison-table inpage-table w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="feature-col w-1/4 min-w-[170px] p-4 text-[#c9c5ba] uppercase tracking-wider text-[10px] font-semibold border-r border-white/10">
                  Specification / Dealer Offer
                </th>
                {activeCars.map((car, idx) => {
                  const compItem = comparison?.comparison?.[idx];
                  const displayImg = compItem?.vehicle?.full_image_url || car.full_image_url || '/assets/images/fallback-car.jpg';
                  const displayName = compItem?.vehicle?.name || car.name;
                  const displayPrice = compItem?.vehicle?.formatted_price || car.formatted_price;

                  return (
                    <th key={`head-col-${car.id}`} className="vehicle-col min-w-[240px] p-4 border-r border-white/10 last:border-r-0">
                      <div className="table-car-header flex flex-col items-center text-center">
                        <img src={displayImg} alt={displayName} className="table-car-img w-28 h-16 object-cover rounded-xs mb-2" loading="lazy" />
                        <h4 className="font-semibold text-white text-sm">{displayName}</h4>
                        <span className="table-car-base-price text-[11px] text-[#c5a77a] mt-0.5 font-medium">Base: {displayPrice}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {/* --- CHEAPEST DEALER IN STATE --- */}
              <tr className="highlight-row border-b border-white/10 bg-white/[0.01]">
                <td className="feature-label feature-label-dealer p-4 border-r border-white/10 align-top">
                  <div className="feature-label-inner">
                    <strong className="text-white block font-semibold">Best Dealer</strong>
                    <span className="feature-sub text-[10px] text-[#888] block">Offer in {userState}</span>
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
                    <td key={`dealer-cell-${car.id}`} className="vehicle-col best-dealer-cell p-4 border-r border-white/10 last:border-r-0 align-top">
                      {bestD ? (
                        <div className="dealer-card-compact bg-[#11120f] border border-[#c5a77a]/30 p-3.5 rounded-xs space-y-2">
                          <div className="dealer-header-mini flex items-center justify-between">
                            <span className="dealer-name font-semibold text-white truncate">{bestD.dealer_name || bestD.name}</span>
                            <span className="dealer-rating text-[#c5a77a] font-bold text-[10px] shrink-0 ml-1">★ {bestD.rating || '4.0'}</span>
                          </div>
                          <div className="dealer-address-mini text-[10px] text-[#888] truncate">
                            {bestD.address}, {bestD.city}
                          </div>
                          <div className="dealer-phone-mini text-[10px]">
                            <a href={`tel:${bestD.phone}`} className="phone-link text-[#c5a77a] hover:underline">{bestD.phone}</a>
                          </div>
                          <div className="price-offer-box bg-white/5 p-2 rounded-xs">
                            <span className="offer-label text-[9px] uppercase tracking-wider text-[#888] block">Cheapest Offer:</span>
                            <span className="offer-val text-[#c5a77a]-400 font-bold text-sm block">{finalPrice}</span>
                            {Number(discount) > 0 && (
                              <span className="offer-discount text-[10px] text-[#c5a77a]-400 font-semibold block">
                                Save ₹{Number(discount).toLocaleString('en-IN')} Discount
                              </span>
                            )}
                          </div>
                          {onRoad && (
                            <div className="on-road-est text-[10px] text-[#aaa]">
                              <span>Est. On-Road:</span> <strong className="text-white">{onRoad}</strong>
                            </div>
                          )}
                          {perks && <div className="special-perk text-[10px] text-[#c5a77a] bg-[#c5a77a]/10 p-1 rounded-xs">{perks}</div>}
                          <button
                            type="button"
                            className="button button-gold-sm w-full py-2 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer mt-2"
                            onClick={() => onInquireVehicle(car)}
                          >
                            Lock Best Deal ↗
                          </button>
                        </div>
                      ) : (
                        <div className="dim-text text-[#888] italic text-center py-4">Direct dealership inquiry available</div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* --- STANDARD SPECS --- */}
              <tr className="border-b border-white/10">
                <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">ARAI Mileage / Range</td>
                {activeCars.map((car, idx) => (
                  <td key={`mil-${car.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0">
                    <span className="stat-pill inline-block px-2.5 py-1 bg-white/5 rounded-full text-white font-medium text-[11px]">
                      {comparison?.comparison?.[idx]?.vehicle?.mileage_arai || car.mileage_arai || 'N/A'}
                    </span>
                  </td>
                ))}
              </tr>

              <tr className="border-b border-white/10">
                <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Safety Credential</td>
                {activeCars.map((car, idx) => (
                  <td key={`saf-${car.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0">
                    <span className="safety-badge inline-block px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xs text-[11px] font-semibold">
                      🛡️ {comparison?.comparison?.[idx]?.vehicle?.safety_rating || car.safety_rating || 'Unrated'}
                    </span>
                  </td>
                ))}
              </tr>

              <tr className="border-b border-white/10">
                <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Fuel &amp; Transmission</td>
                {activeCars.map((car, idx) => (
                  <td key={`fuel-${car.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0 text-white">
                    {comparison?.comparison?.[idx]?.vehicle?.fuel_type || car.fuel_type} · {comparison?.comparison?.[idx]?.vehicle?.transmission || car.transmission}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-white/10">
                <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Seating Capacity</td>
                {activeCars.map((car, idx) => (
                  <td key={`seat-${car.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0 text-white">
                    {comparison?.comparison?.[idx]?.vehicle?.seating_capacity || car.seating_capacity} Seater
                  </td>
                ))}
              </tr>

              <tr className="border-b border-white/10">
                <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Engine &amp; Performance</td>
                {activeCars.map((car, idx) => (
                  <td key={`eng-${car.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0">
                    <div className="text-white font-medium">{comparison?.comparison?.[idx]?.vehicle?.engine || car.engine}</div>
                    <small className="dim-text text-[10px] text-[#888] block mt-0.5">
                      {comparison?.comparison?.[idx]?.vehicle?.power_bhp || car.power_bhp} · {comparison?.comparison?.[idx]?.vehicle?.torque_nm || car.torque_nm}
                    </small>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Warranty Support</td>
                {activeCars.map((car, idx) => (
                  <td key={`war-${car.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0 text-white">
                    {comparison?.comparison?.[idx]?.vehicle?.warranty_info || car.warranty_info || 'Standard Warranty'}
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
