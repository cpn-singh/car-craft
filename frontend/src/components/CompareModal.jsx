/**
 * CompareModal.jsx
 * -------------------
 * AI Vehicle & Part Comparison Engine Modal
 * Styled with Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { compareVehicles, compareParts, getVehicles, getParts, INDIAN_STATES } from '../services/api.js';
import indianCars from '../data/cars.js';
import indianParts from '../data/parts.js';

export default function CompareModal({ isOpen, onClose, userState, onSelectInquiry, initialVehicleId }) {
  const [mode, setMode] = useState('vehicles');
  const [selectedState, setSelectedState] = useState(userState || 'Maharashtra');
  
  const [availableVehicles, setAvailableVehicles] = useState(indianCars);
  const [availableParts, setAvailableParts] = useState(indianParts);
  
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([indianCars[0].id, indianCars[1]?.id || indianCars[0].id]);
  const [selectedPartIds, setSelectedPartIds] = useState([indianParts[0].id, indianParts[1]?.id || indianParts[0].id]);

  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userState) setSelectedState(userState);
  }, [userState]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      getVehicles('all', 'all')
        .then((data) => {
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setAvailableVehicles(data);
            if (initialVehicleId) {
              const firstId = Number(initialVehicleId);
              const secondCar = data.find((c) => c.id !== firstId) || data[0];
              setSelectedVehicleIds([firstId, secondCar.id]);
            } else if (data.length >= 2) {
              setSelectedVehicleIds([data[0].id, data[1].id]);
            }
          }
        })
        .catch((err) => console.error("Vehicle fetch failed, using fallback JSON:", err));

      getParts('', 'all')
        .then((data) => {
          if (isMounted && Array.isArray(data) && data.length > 0) {
            setAvailableParts(data);
            if (data.length >= 2) {
              setSelectedPartIds([data[0].id, data[1].id]);
            }
          }
        })
        .catch((err) => console.error("Parts fetch failed, using fallback JSON:", err));
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, initialVehicleId]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const apiCall = mode === 'vehicles'
      ? compareVehicles(selectedVehicleIds, selectedState)
      : compareParts(selectedPartIds, selectedState);

    apiCall
      .then((data) => {
        if (isMounted) setComparisonData(data);
      })
      .catch((err) => {
        console.error("Comparison fetch failed:", err);
        if (isMounted) setError("Failed to calculate real-time dealer offers. Please ensure backend is running.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, mode, selectedVehicleIds, selectedPartIds, selectedState]);

  if (!isOpen) return null;

  const toggleVehicleId = (id) => {
    if (selectedVehicleIds.includes(id)) {
      if (selectedVehicleIds.length > 1) {
        setSelectedVehicleIds(selectedVehicleIds.filter((item) => item !== id));
      }
    } else {
      if (selectedVehicleIds.length < 3) {
        setSelectedVehicleIds([...selectedVehicleIds, id]);
      } else {
        setSelectedVehicleIds([selectedVehicleIds[1], selectedVehicleIds[2], id]);
      }
    }
  };

  const togglePartId = (id) => {
    if (selectedPartIds.includes(id)) {
      if (selectedPartIds.length > 1) {
        setSelectedPartIds(selectedPartIds.filter((item) => item !== id));
      }
    } else {
      if (selectedPartIds.length < 3) {
        setSelectedPartIds([...selectedPartIds, id]);
      } else {
        setSelectedPartIds([selectedPartIds[1], selectedPartIds[2], id]);
      }
    }
  };

  return (
    <div 
      className="modal-backdrop fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.25s_ease-out]" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true"
    >
      <div 
        className="modal-card relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#171814] border border-[#c5a77a]/30 shadow-2xl p-5 sm:p-8 text-white rounded-xs overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="modal-close absolute top-5 right-5 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:border-[#c5a77a] transition-colors cursor-pointer text-sm z-10" 
          onClick={onClose} 
          aria-label="Close dialog"
        >
          ✕
        </button>

        <div className="modal-header pb-4 border-b border-white/10 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10">
            <div>
              <span className="modal-eyebrow text-[9px] tracking-[0.22em] text-[#c5a77a] uppercase font-semibold block mb-1">
                AUREL COMPARISON ENGINE · INDIA
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-light text-white m-0">
                Compare Specifications &amp; Lowest Dealer Prices
              </h2>
            </div>
            
            <div className="state-picker-group flex items-center gap-2 text-xs text-[#aaa]">
              <label htmlFor="comp-state-select" className="text-[10px] uppercase tracking-wider text-[#888]">Location:</label>
              <select
                id="comp-state-select"
                className="state-select-input bg-white/5 border border-white/15 text-white text-xs px-2.5 py-1 rounded-xs outline-none cursor-pointer"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                {(INDIAN_STATES || []).map((s) => (
                  <option key={s} value={s} className="bg-[#171814] text-white">{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-tabs flex items-center gap-2 mt-4">
            <button
              className={`modal-tab px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                mode === 'vehicles' ? 'bg-[#c5a77a] text-[#11120f]' : 'bg-white/5 text-[#aaa] hover:text-white'
              }`}
              onClick={() => { setMode('vehicles'); setComparisonData(null); }}
              type="button"
            >
              Compare Vehicles (Side-by-Side)
            </button>
            <button
              className={`modal-tab px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                mode === 'parts' ? 'bg-[#c5a77a] text-[#11120f]' : 'bg-white/5 text-[#aaa] hover:text-white'
              }`}
              onClick={() => { setMode('parts'); setComparisonData(null); }}
              type="button"
            >
              Compare Accessories &amp; Spare Parts
            </button>
          </div>
        </div>

        {/* --- Item Selection Pills --- */}
        <div className="item-selector-bar py-3 border-b border-white/10 shrink-0">
          <span className="selector-title text-[10px] text-[#888] uppercase tracking-wider block mb-2">
            Select up to 3 {mode === 'vehicles' ? 'cars' : 'items'} to compare:
          </span>
          
          <div className="pills-scroll flex items-center gap-2 overflow-x-auto pb-1">
            {mode === 'vehicles' ? (
              availableVehicles.map((v) => {
                const isSelected = selectedVehicleIds.includes(v.id);
                return (
                  <button
                    key={`v-pill-${v.id}`}
                    type="button"
                    className={`item-pill whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
                      isSelected 
                        ? 'bg-[#c5a77a] text-[#11120f] border-[#c5a77a] font-semibold' 
                        : 'bg-white/5 text-[#ccc] border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => toggleVehicleId(v.id)}
                  >
                    {isSelected && <span className="pill-check mr-1 font-bold">✓</span>}
                    {v.name} ({v.formatted_price || v.price_display})
                  </button>
                );
              })
            ) : (
              availableParts.map((p) => {
                const isSelected = selectedPartIds.includes(p.id);
                return (
                  <button
                    key={`p-pill-${p.id}`}
                    type="button"
                    className={`item-pill whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${
                      isSelected 
                        ? 'bg-[#c5a77a] text-[#11120f] border-[#c5a77a] font-semibold' 
                        : 'bg-white/5 text-[#ccc] border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => togglePartId(p.id)}
                  >
                    {isSelected && <span className="pill-check mr-1 font-bold">✓</span>}
                    {p.name} ({p.formatted_price})
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* --- Loading / Error States --- */}
        <div className="comparison-content flex-1 overflow-y-auto py-4 pr-1">
          {loading && (
            <div className="loading-state flex flex-col items-center justify-center py-20 text-[#888]">
              <div className="pulse-spinner w-8 h-8 rounded-full border-2 border-[#c5a77a] border-t-transparent animate-spin mb-4" />
              <p className="text-xs">Analyzing dealer inventory &amp; finding cheapest dealer in {selectedState}...</p>
            </div>
          )}

          {error && (
            <div className="alert-box error p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xs text-xs mb-4">
              <p>{error}</p>
            </div>
          )}

          {/* VEHICLE COMPARISON TABLE */}
          {!loading && comparisonData && mode === 'vehicles' && (
            <div className="space-y-6">
              {comparisonData.ai_verdict && (
                <div className="ai-verdict-card bg-[#181a18] border border-[#c5a77a]/30 p-5 rounded-xs">
                  <div className="ai-badge-row flex items-center gap-2 mb-2">
                    <span className="sparkle-icon">✨</span>
                    <span className="ai-tag text-[9px] uppercase tracking-[0.2em] text-[#c5a77a] font-semibold">
                      Aurel AI Buying Verdict · {selectedState}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{comparisonData.ai_verdict.headline}</h3>
                  <p className="verdict-summary text-xs text-[#a9aaa3] leading-relaxed mb-4">{comparisonData.ai_verdict.summary}</p>
                  
                  {comparisonData.ai_verdict.cheapest_option && (
                    <div className="cheapest-dealer-callout bg-white/5 border  p-4 rounded-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="callout-badge col-span-full text-[9px] uppercase tracking-wider font-bold mb-1">
                        CHEAPEST DEALER IN {selectedState.toUpperCase()}
                      </div>
                      
                      <div className="callout-vehicle-group">
                        <h4 className="callout-vehicle-name font-semibold text-white">
                          {comparisonData.ai_verdict.cheapest_option.vehicle_name}
                        </h4>
                        <div className="callout-vehicle-price text-emerald-400 font-bold text-sm mt-0.5">
                          {comparisonData.ai_verdict.cheapest_option.price}
                        </div>
                      </div>

                      <div className="callout-meta-group">
                        <span className="callout-meta-label text-[9px] uppercase tracking-wider text-[#888] block">VERIFIED DEALER:</span>
                        <div className="callout-dealer-name text-white font-medium mt-0.5 truncate">
                          {comparisonData.ai_verdict.cheapest_option.dealer} ({comparisonData.ai_verdict.cheapest_option.city})
                        </div>
                      </div>

                      <div className="callout-meta-group">
                        <span className="callout-meta-label text-[9px] uppercase tracking-wider text-[#888] block">YOUR DIRECT SAVINGS:</span>
                        <div className="callout-savings-value text-emerald-400 font-semibold mt-0.5">
                          Save {comparisonData.ai_verdict.cheapest_option.savings_vs_competitor}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="table-scroll-hint md:hidden text-center text-[10px] text-[#888] mb-2 uppercase tracking-wider">
                ⟵ Swipe horizontally to compare cars &amp; dealers ⟶
              </div>
              
              <div className="table-responsive overflow-x-auto border border-white/10 rounded-xs bg-[#181916]">
                {Array.isArray(comparisonData.comparison) ? (
                  <table className="comparison-table w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="feature-col w-1/4 min-w-[170px] p-4 text-[#c9c5ba] uppercase tracking-wider text-[10px] font-semibold border-r border-white/10">
                          Feature / Detail
                        </th>
                        {comparisonData.comparison.map((item) => (
                          <th key={`head-${item.vehicle.id}`} className="vehicle-col min-w-[240px] p-4 border-r border-white/10 last:border-r-0">
                            <div className="table-car-header flex flex-col items-center text-center">
                              <img 
                                src={item.vehicle.full_image_url || '/assets/images/fallback-car.jpg'} 
                                alt={item.vehicle.name} 
                                className="table-car-img w-28 h-16 object-cover rounded-xs mb-2" 
                              />
                              <h4 className="font-semibold text-white text-sm">{item.vehicle.name}</h4>
                              <span className="table-car-variant text-[10px] text-[#888] uppercase block">{item.vehicle.variant || item.vehicle.category}</span>
                              <span className="table-car-base-price text-[11px] text-[#c5a77a] mt-0.5 font-medium">Base: {item.vehicle.formatted_price}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {/* CHEAPEST DEALER ROW */}
                      <tr className="highlight-row border-b border-white/10 bg-white/[0.01]">
                        <td className="feature-label p-4 border-r border-white/10 align-top">
                          <strong className="text-white block font-semibold">Best Dealer</strong>
                          <span className="feature-sub text-[10px] text-[#888] block">Lowest in {selectedState}</span>
                        </td>
                        {comparisonData.comparison.map((item) => {
                          const bd = item.best_dealer;
                          return (
                            <td key={`bd-${item.vehicle.id}`} className="vehicle-col best-dealer-cell p-4 border-r border-white/10 last:border-r-0 align-top">
                              {bd ? (
                                <div className="dealer-card-compact bg-[#11120f] border border-[#c5a77a]/30 p-3.5 rounded-xs space-y-2">
                                  <div className="dealer-header-mini flex items-center justify-between">
                                    <span className="dealer-name font-semibold text-white truncate">{bd.dealer_name}</span>
                                    <span className="dealer-rating text-[#c5a77a] font-bold text-[10px] shrink-0 ml-1">★ {bd.rating || '4.0'}</span>
                                  </div>
                                  <div className="dealer-address-mini text-[10px] text-[#888] truncate">
                                    {bd.address}, {bd.city}, {bd.state}
                                  </div>
                                  <div className="dealer-phone-mini text-[10px]">
                                    <a href={`tel:${bd.phone}`} className="phone-link text-[#c5a77a] hover:underline">{bd.phone}</a>
                                  </div>
                                  <div className="price-offer-box bg-white/5 p-2 rounded-xs">
                                    <span className="offer-label text-[9px] uppercase tracking-wider text-[#888] block">Cheapest Offer Price:</span>
                                    <span className="offer-val text-emerald-400 font-bold text-sm block">{bd.formatted_final_price}</span>
                                    <span className="offer-discount text-[10px] text-emerald-400 font-semibold block">
                                      Save ₹{bd.dealer_discount ? bd.dealer_discount.toLocaleString('en-IN') : '0'}
                                    </span>
                                  </div>
                                  <div className="on-road-est text-[10px] text-[#aaa]">
                                    <span>Approx On-Road:</span> <strong className="text-white">{bd.formatted_on_road}</strong>
                                  </div>
                                  {bd.special_offers && (
                                    <div className="special-perk text-[10px] text-[#c5a77a] bg-[#c5a77a]/10 p-1 rounded-xs">{bd.special_offers}</div>
                                  )}
                                  <button
                                    type="button"
                                    className="button button-gold-sm w-full py-2 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer mt-2"
                                    onClick={() => {
                                      onClose();
                                      onSelectInquiry(item.vehicle);
                                    }}
                                  >
                                    Claim Best Deal ↗
                                  </button>
                                </div>
                              ) : (
                                <div className="dim-text text-[#888] italic text-center py-4">Direct booking available</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* SPECS ROWS */}
                      <tr className="border-b border-white/10">
                        <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Fuel Type</td>
                        {comparisonData.comparison.map((item) => (
                          <td key={`fuel-${item.vehicle.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0 text-white font-medium">
                            {item.vehicle.fuel_type || 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">ARAI Certified Mileage / Range</td>
                        {comparisonData.comparison.map((item) => (
                          <td key={`mil-${item.vehicle.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0">
                            <span className="stat-pill inline-block px-2.5 py-1 bg-white/5 rounded-full text-white font-medium text-[11px]">
                              {item.vehicle.mileage_arai || 'N/A'}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Safety Rating</td>
                        {comparisonData.comparison.map((item) => (
                          <td key={`saf-${item.vehicle.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0">
                            <span className="safety-badge inline-block px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xs text-[11px] font-semibold">
                              🛡️ {item.vehicle.safety_rating || 'Unrated'}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Seating Capacity</td>
                        {comparisonData.comparison.map((item) => (
                          <td key={`seat-${item.vehicle.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0 text-white">
                            {item.vehicle.seating_capacity ? `${item.vehicle.seating_capacity} Seats` : 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Transmission</td>
                        {comparisonData.comparison.map((item) => (
                          <td key={`trans-${item.vehicle.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0 text-white">
                            {item.vehicle.transmission || 'N/A'}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Engine &amp; Power</td>
                        {comparisonData.comparison.map((item) => (
                          <td key={`eng-${item.vehicle.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0">
                            <div className="text-white font-medium">{item.vehicle.engine || 'N/A'}</div>
                            {item.vehicle.power_bhp && (
                              <span className="dim-text text-[10px] text-[#888] block mt-0.5">
                                {item.vehicle.power_bhp} · {item.vehicle.torque_nm}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Warranty Coverage</td>
                        {comparisonData.comparison.map((item) => (
                          <td key={`war-${item.vehicle.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0 text-white">
                            {item.vehicle.warranty_info || 'Standard Manufacturer Warranty'}
                          </td>
                        ))}
                      </tr>

                      {/* ALL DEALERS LIST */}
                      <tr>
                        <td className="feature-label p-4 border-r border-white/10 align-top">
                          <strong className="text-white block font-semibold">All Verified Dealers</strong>
                          <span className="feature-sub text-[10px] text-[#888] block">Ranked by price</span>
                        </td>
                        {comparisonData.comparison.map((item) => (
                          <td key={`all-dealers-${item.vehicle.id}`} className="vehicle-col p-4 border-r border-white/10 last:border-r-0 align-top">
                            <div className="dealers-list-mini space-y-2">
                              {Array.isArray(item.all_dealer_offers) && item.all_dealer_offers.length > 0 ? (
                                item.all_dealer_offers.map((d, idx) => (
                                  <div 
                                    className={`dealer-row-item flex justify-between p-2.5 rounded-xs text-[10px] ${
                                      d.is_cheapest 
                                        ? 'bg-emerald-500/10 border-l-2 border-emerald-400' 
                                        : 'bg-white/5 border-b border-white/5'
                                    }`} 
                                    key={`dlist-${d.dealer_id}`}
                                  >
                                    <div className="d-info space-y-0.5">
                                      <strong className="text-white block">{idx + 1}. {d.dealer_name}</strong>
                                      <span className="text-[#888] block">{d.city}, {d.state} · {d.phone}</span>
                                    </div>
                                    <div className="d-price text-right shrink-0">
                                      <span className="font-semibold text-white block">{d.formatted_final_price}</span>
                                      {Number(d.dealer_discount) > 0 && (
                                        <small className="text-emerald-400 block">-₹{Number(d.dealer_discount).toLocaleString('en-IN')}</small>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="dim-text text-[10px] text-[#888] italic">No alternate dealers found.</p>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="p-4 text-xs text-red-400">Error: Invalid comparison data format.</p>
                )}
              </div>
            </div>
          )}

          {/* PARTS COMPARISON TABLE */}
          {!loading && comparisonData && mode === 'parts' && (
            <div className="space-y-4">
              <div className="table-scroll-hint md:hidden text-center text-[10px] text-[#888] mb-2 uppercase tracking-wider">
                ⟵ Swipe horizontally to compare items &amp; sellers ⟶
              </div>
              
              <div className="table-responsive overflow-x-auto border border-white/10 rounded-xs bg-[#181916]">
                {Array.isArray(comparisonData.comparison) ? (
                  <table className="comparison-table w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="feature-col w-1/4 min-w-[170px] p-4 text-[#c9c5ba] uppercase tracking-wider text-[10px] font-semibold border-r border-white/10">
                          Accessory / Part
                        </th>
                        {comparisonData.comparison.map((item) => (
                          <th key={`p-head-${item.part.id}`} className="vehicle-col min-w-[240px] p-4 border-r border-white/10 last:border-r-0">
                            <div className="table-car-header flex flex-col items-center text-center">
                              {item.part.image_url && <img src={item.part.image_url} alt={item.part.name} className="table-car-img w-28 h-20 object-cover rounded-xs mb-2" />}
                              <h4 className="font-semibold text-white text-sm">{item.part.name}</h4>
                              <span className="table-car-variant text-[10px] text-[#888] uppercase block">{item.part.brand} · {item.part.item_type}</span>
                              <span className="table-car-base-price text-[11px] text-[#c5a77a] mt-0.5 font-medium">MRP: {item.part.formatted_price}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {/* CHEAPEST SELLER ROW */}
                      <tr className="highlight-row border-b border-white/10 bg-white/[0.01]">
                        <td className="feature-label p-4 border-r border-white/10 align-top">
                          <strong className="text-white block font-semibold">Lowest Price Dealer / Workshop</strong>
                          <span className="feature-sub text-[10px] text-[#888] block">In {selectedState}</span>
                        </td>
                        {comparisonData.comparison.map((item) => {
                          const bd = item.best_dealer;
                          return (
                            <td key={`p-bd-${item.part.id}`} className="best-dealer-cell p-4 border-r border-white/10 last:border-r-0 align-top">
                              {bd ? (
                                <div className="dealer-card-compact bg-[#11120f] border border-[#c5a77a]/30 p-3.5 rounded-xs space-y-2">
                                  <span className="dealer-name font-semibold text-white block">{bd.dealer_name}</span>
                                  <div className="dealer-address-mini text-[10px] text-[#888]">{bd.address}, {bd.city}</div>
                                  <div className="dealer-phone-mini text-[10px]">
                                    <a href={`tel:${bd.phone}`} className="text-[#c5a77a] hover:underline">{bd.phone}</a>
                                  </div>
                                  <div className="price-offer-box bg-white/5 p-2 rounded-xs">
                                    <span className="offer-label text-[9px] uppercase tracking-wider text-[#888] block">Best Deal Price:</span>
                                    <span className="offer-val text-emerald-400 font-bold text-sm block">{bd.formatted_price}</span>
                                    <span className="offer-discount text-[10px] text-emerald-400 font-semibold block">{bd.discount_percent}% OFF MRP</span>
                                  </div>
                                  <div className="installation-tag text-[10px] text-[#aaa]">
                                    {bd.installation_available ? '🔧 Free Installation Available' : 'Self-Fit'} · Delivery: {bd.delivery_days} Day(s)
                                  </div>
                                </div>
                              ) : (
                                <span className="dim-text text-[#888] italic">Authorized Stockist</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      <tr className="border-b border-white/10">
                        <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Brand &amp; Origin</td>
                        {comparisonData.comparison.map((item) => (
                          <td key={`p-brand-${item.part.id}`} className="p-4 border-r border-white/10 last:border-r-0 text-white font-medium">
                            {item.part.brand}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Compatibility in India</td>
                        {comparisonData.comparison.map((item) => (
                          <td key={`p-comp-${item.part.id}`} className="p-4 border-r border-white/10 last:border-r-0 text-white">
                            {item.part.compatibility}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">Official Warranty</td>
                        {comparisonData.comparison.map((item) => (
                          <td key={`p-war-${item.part.id}`} className="p-4 border-r border-white/10 last:border-r-0 text-white">
                            {item.part.warranty_months} Months Replacement Warranty
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="feature-label p-4 font-medium text-[#c9c5ba] border-r border-white/10">GST Rate</td>
                        {comparisonData.comparison.map((item) => (
                          <td key={`p-gst-${item.part.id}`} className="p-4 border-r border-white/10 last:border-r-0 text-white">
                            {item.part.gst_percentage}% (GST Invoice Provided)
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="p-4 text-xs text-red-400">Error: Invalid parts data format.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
