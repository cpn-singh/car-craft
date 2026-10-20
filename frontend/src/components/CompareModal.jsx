/**
 * CompareModal.jsx
 * -------------------
 * AI Vehicle & Part Comparison Engine Full-Screen Studio
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

  const activeCount = mode === 'vehicles' ? selectedVehicleIds.length : selectedPartIds.length;

  return (
    <div
      className="fixed inset-0 z-[100] w-screen h-screen bg-[#11120f] text-white flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
    >
      {/* ========================================================
          STICKY TOP HEADER STUDIO CONTROLS
          ======================================================== */}
      <header className="shrink-0 bg-[#151714] border-b border-white/10 px-4 sm:px-6 lg:px-10 py-3 sm:py-4 shadow-xl z-30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="font-serif text-xl sm:text-2xl font-normal text-[#c5a77a] border border-[#c5a77a]/70 w-8 h-8 sm:w-9 sm:h-9 grid place-items-center rounded-xs shrink-0">
              A
            </span>
            <div>
              <span className="text-[9px] tracking-[0.22em] text-[#c5a77a] uppercase font-semibold block">
                AUREL MOTOR ATELIER · COMPARISON STUDIO
              </span>
              <h1 className="font-serif text-lg sm:text-xl font-light text-white m-0 tracking-tight">
                Compare Specifications &amp; Lowest Dealer Prices
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 self-end sm:self-auto">
            {/* Regional location selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/15 rounded-xs text-xs">
              <span className="text-[#c5a77a] text-xs" aria-hidden="true">📍</span>
              <span className="text-[10px] uppercase tracking-wider text-[#888] hidden md:inline">Location:</span>
              <select
                id="comp-state-select"
                className="bg-transparent border-0 text-white text-xs outline-none cursor-pointer pr-1 font-medium"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                {(INDIAN_STATES || []).map((s) => (
                  <option key={s} value={s} className="bg-[#171814] text-white">{s}</option>
                ))}
              </select>
            </div>

            {/* Prominent Close Button */}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:text-[#c5a77a] rounded-xs text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              aria-label="Close comparison view"
            >
              <span className="text-sm font-bold">✕</span>
              <span className="hidden sm:inline">Close</span>
              <kbd className="hidden lg:inline text-[9px] text-white/50 bg-black/40 px-1 py-0.5 rounded ml-0.5">ESC</kbd>
            </button>
          </div>
        </div>

        {/* Secondary Navigation: Modes & Selectors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 shrink-0">
            <button
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${mode === 'vehicles' ? 'bg-[#c5a77a] text-[#11120f]' : 'bg-white/5 text-[#aaa] hover:text-white'
                }`}
              onClick={() => { setMode('vehicles'); setComparisonData(null); }}
              type="button"
            >
              Vehicles ({selectedVehicleIds.length}/3)
            </button>
            <button
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${mode === 'parts' ? 'bg-[#c5a77a] text-[#11120f]' : 'bg-white/5 text-[#aaa] hover:text-white'
                }`}
              onClick={() => { setMode('parts'); setComparisonData(null); }}
              type="button"
            >
              Accessories &amp; Spares ({selectedPartIds.length}/3)
            </button>
          </div>

          {/* Quick Select Item Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] text-[#888] uppercase tracking-wider shrink-0 hidden lg:inline">
              Select items (max 3):
            </span>
            {mode === 'vehicles' ? (
              availableVehicles.map((v) => {
                const isSelected = selectedVehicleIds.includes(v.id);
                return (
                  <button
                    key={`v-pill-${v.id}`}
                    type="button"
                    className={`item-pill whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-colors border shrink-0 ${isSelected
                        ? 'bg-[#c5a77a] text-[#11120f] border-[#c5a77a] font-bold shadow-sm'
                        : 'bg-white/5 text-[#ccc] border-white/10 hover:border-white/30'
                      }`}
                    onClick={() => toggleVehicleId(v.id)}
                  >
                    {isSelected && <span className="mr-1 font-bold">✓</span>}
                    {v.name}
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
                    className={`item-pill whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-colors border shrink-0 ${isSelected
                        ? 'bg-[#c5a77a] text-[#11120f] border-[#c5a77a] font-bold shadow-sm'
                        : 'bg-white/5 text-[#ccc] border-white/10 hover:border-white/30'
                      }`}
                    onClick={() => togglePartId(p.id)}
                  >
                    {isSelected && <span className="mr-1 font-bold">✓</span>}
                    {p.name}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </header>

      {/* ========================================================
          FULL-SCREEN SCROLLABLE COMPARISON CANVAS
          ======================================================== */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 lg:px-10 py-5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-28 text-[#888]">
            <div className="w-9 h-9 rounded-full border-2 border-[#c5a77a] border-t-transparent animate-spin mb-4" />
            <p className="text-xs uppercase tracking-wider">Analyzing dealer inventory &amp; calculating lowest offers in {selectedState}...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xs text-xs mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* ========================================================
            VEHICLE COMPARISON TABLE
            ======================================================== */}
        {!loading && comparisonData && mode === 'vehicles' && (
          <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* AI Verdict Banner */}
            {comparisonData.ai_verdict && (
              <div className="bg-[#181a18] border border-[#c5a77a]/30 p-5 sm:p-6 rounded-xs shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">✨</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a77a] font-semibold">
                    Aurel AI Buying Verdict · {selectedState}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5">{comparisonData.ai_verdict.headline}</h3>
                <p className="text-xs sm:text-sm text-[#a9aaa3] leading-relaxed mb-4 max-w-4xl">{comparisonData.ai_verdict.summary}</p>

                {comparisonData.ai_verdict.cheapest_option && (
                  <div className="bg-white/5 border border-[#c5a77a]-500/30 p-4 rounded-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="col-span-full text-[10px] uppercase tracking-wider text-[#c5a77a]-400 font-bold mb-0.5">
                      🏆 CHEAPEST DEALER IN {selectedState.toUpperCase()}
                    </div>

                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        {comparisonData.ai_verdict.cheapest_option.vehicle_name}
                      </h4>
                      <div className="text-[#c5a77a]-400 font-bold text-base mt-0.5">
                        {comparisonData.ai_verdict.cheapest_option.price}
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#888] block">VERIFIED DEALER:</span>
                      <div className="text-white font-medium mt-0.5 truncate">
                        {comparisonData.ai_verdict.cheapest_option.dealer} ({comparisonData.ai_verdict.cheapest_option.city})
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#888] block">YOUR DIRECT SAVINGS:</span>
                      <div className="text-[#c5a77a]-400 font-semibold mt-0.5 text-sm">
                        Save {comparisonData.ai_verdict.cheapest_option.savings_vs_competitor}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Swipe Hint */}
            <div className="lg:hidden text-center text-[10px] text-[#888] uppercase tracking-wider py-1">
              ⟵ Swipe horizontally to compare cars &amp; dealers ⟶
            </div>

            {/* Full-width Responsive Table */}
            <div className="overflow-x-auto rounded-xs border border-white/10 bg-[#161815] shadow-2xl">
              {Array.isArray(comparisonData.comparison) ? (
                <table className="w-full border-collapse text-left text-xs min-w-[780px] lg:min-w-0 lg:table-fixed">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#181a17]">
                      {/* Sticky Top-Left Header Cell */}
                      <th className="w-[180px] sm:w-[220px] lg:w-[240px] p-4 sm:p-5 text-[#c9c5ba] uppercase tracking-wider text-[10px] font-semibold sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
                        Specification / Offer
                      </th>
                      {comparisonData.comparison.map((item) => (
                        <th
                          key={`head-${item.vehicle.id}`}
                          className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 align-top"
                          style={{ width: `${100 / (comparisonData.comparison.length + 1)}%` }}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className="w-full max-w-[220px] aspect-[16/10] overflow-hidden rounded-xs bg-black/40 mb-3 shadow-md">
                              <img
                                src={item.vehicle.full_image_url || '/assets/images/fallback-car.jpg'}
                                alt={item.vehicle.name}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <h4 className="font-semibold text-white text-sm sm:text-base tracking-tight">{item.vehicle.name}</h4>
                            <span className="text-[10px] text-[#888] uppercase tracking-wider mt-0.5 block">{item.vehicle.variant || item.vehicle.category}</span>
                            <span className="text-xs sm:text-sm text-[#c5a77a] mt-1 font-bold">Base: {item.vehicle.formatted_price}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {/* CHEAPEST DEALER ROW */}
                    <tr className="border-b border-white/10 bg-white/[0.015]">
                      <td className="p-4 sm:p-5 sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)] align-top">
                        <strong className="text-white block font-semibold text-sm">Best Dealer</strong>
                        <span className="text-[10px] text-[#888] block mt-0.5">Lowest Offer in {selectedState}</span>
                      </td>
                      {comparisonData.comparison.map((item) => {
                        const bd = item.best_dealer;
                        return (
                          <td key={`bd-${item.vehicle.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 align-top">
                            {bd ? (
                              <div className="bg-[#11120f] border border-[#c5a77a]/35 p-4 rounded-xs space-y-2.5 shadow-md">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-white truncate text-xs sm:text-sm">{bd.dealer_name}</span>
                                  <span className="text-[#c5a77a] font-bold text-[11px] shrink-0">★ {bd.rating || '4.0'}</span>
                                </div>
                                <div className="text-[10px] text-[#888] truncate">
                                  {bd.address}, {bd.city}, {bd.state}
                                </div>
                                <div className="text-[10px]">
                                  <a href={`tel:${bd.phone}`} className="text-[#c5a77a] hover:underline font-medium">{bd.phone}</a>
                                </div>
                                <div className="bg-white/5 p-2.5 rounded-xs space-y-1">
                                  <span className="text-[9px] uppercase tracking-wider text-[#888] block">Cheapest Offer:</span>
                                  <span className="text-[#c5a77a]-400 font-bold text-base block">{bd.formatted_final_price}</span>
                                  <span className="text-[10px] text-[#c5a77a]-400 font-semibold block">
                                    Save ₹{bd.dealer_discount ? bd.dealer_discount.toLocaleString('en-IN') : '0'} Discount
                                  </span>
                                </div>
                                <div className="text-[10px] text-[#aaa]">
                                  <span>Approx On-Road:</span> <strong className="text-white">{bd.formatted_on_road}</strong>
                                </div>
                                {bd.special_offers && (
                                  <div className="text-[10px] text-[#c5a77a] bg-[#c5a77a]/10 p-2 rounded-xs leading-snug">{bd.special_offers}</div>
                                )}
                                <button
                                  type="button"
                                  className="w-full py-2.5 px-3 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer mt-2"
                                  onClick={() => {
                                    onClose();
                                    onSelectInquiry(item.vehicle);
                                  }}
                                >
                                  Claim Best Deal ↗
                                </button>
                              </div>
                            ) : (
                              <div className="text-[#888] italic text-center py-6">Direct booking available</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* SPECS ROWS */}
                    <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-[#c9c5ba] sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">Fuel Type</td>
                      {comparisonData.comparison.map((item) => (
                        <td key={`fuel-${item.vehicle.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 text-white font-medium">
                          {item.vehicle.fuel_type || 'N/A'}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-[#c9c5ba] sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">ARAI Certified Mileage / Range</td>
                      {comparisonData.comparison.map((item) => (
                        <td key={`mil-${item.vehicle.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0">
                          <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-white font-medium text-[11px]">
                            {item.vehicle.mileage_arai || 'N/A'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-[#c9c5ba] sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">Safety Rating</td>
                      {comparisonData.comparison.map((item) => (
                        <td key={`saf-${item.vehicle.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0">
                          <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xs text-[11px] font-semibold">
                            🛡️ {item.vehicle.safety_rating || 'Unrated'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-[#c9c5ba] sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">Seating Capacity</td>
                      {comparisonData.comparison.map((item) => (
                        <td key={`seat-${item.vehicle.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 text-white">
                          {item.vehicle.seating_capacity ? `${item.vehicle.seating_capacity} Seats` : 'N/A'}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-[#c9c5ba] sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">Transmission</td>
                      {comparisonData.comparison.map((item) => (
                        <td key={`trans-${item.vehicle.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 text-white">
                          {item.vehicle.transmission || 'N/A'}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-[#c9c5ba] sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">Engine &amp; Power</td>
                      {comparisonData.comparison.map((item) => (
                        <td key={`eng-${item.vehicle.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0">
                          <div className="text-white font-medium">{item.vehicle.engine || 'N/A'}</div>
                          {item.vehicle.power_bhp && (
                            <span className="text-[10px] text-[#888] block mt-0.5">
                              {item.vehicle.power_bhp} · {item.vehicle.torque_nm}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-[#c9c5ba] sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">Warranty Coverage</td>
                      {comparisonData.comparison.map((item) => (
                        <td key={`war-${item.vehicle.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 text-white">
                          {item.vehicle.warranty_info || 'Standard Manufacturer Warranty'}
                        </td>
                      ))}
                    </tr>

                    {/* ALL DEALERS LIST */}
                    <tr>
                      <td className="p-4 sm:p-5 sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)] align-top">
                        <strong className="text-white block font-semibold text-sm">All Verified Dealers</strong>
                        <span className="text-[10px] text-[#888] block mt-0.5">Ranked by Price in {selectedState}</span>
                      </td>
                      {comparisonData.comparison.map((item) => (
                        <td key={`all-dealers-${item.vehicle.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 align-top">
                          <div className="space-y-2">
                            {Array.isArray(item.all_dealer_offers) && item.all_dealer_offers.length > 0 ? (
                              item.all_dealer_offers.map((d, idx) => (
                                <div
                                  className={`flex justify-between p-3 rounded-xs text-[10px] ${d.is_cheapest
                                      ? 'bg-[#c5a77a]-500/10 border-l-2 border-[#c5a77a]-400'
                                      : 'bg-white/5 border-b border-white/5'
                                    }`}
                                  key={`dlist-${d.dealer_id}`}
                                >
                                  <div className="space-y-0.5 pr-2">
                                    <strong className="text-white block font-medium">{idx + 1}. {d.dealer_name}</strong>
                                    <span className="text-[#888] block">{d.city}, {d.state} · {d.phone}</span>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="font-semibold text-white block">{d.formatted_final_price}</span>
                                    {Number(d.dealer_discount) > 0 && (
                                      <small className="text-[#c5a77a]-400 block">-₹{Number(d.dealer_discount).toLocaleString('en-IN')}</small>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-[#888] italic">No alternate dealers found.</p>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="p-6 text-xs text-red-400">Error: Invalid comparison data format.</p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            PARTS COMPARISON TABLE
            ======================================================== */}
        {!loading && comparisonData && mode === 'parts' && (
          <div className="space-y-6 max-w-[1600px] mx-auto">
            <div className="lg:hidden text-center text-[10px] text-[#888] uppercase tracking-wider py-1">
              ⟵ Swipe horizontally to compare items &amp; sellers ⟶
            </div>

            <div className="overflow-x-auto rounded-xs border border-white/10 bg-[#161815] shadow-2xl">
              {Array.isArray(comparisonData.comparison) ? (
                <table className="w-full border-collapse text-left text-xs min-w-[780px] lg:min-w-0 lg:table-fixed">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#181a17]">
                      <th className="w-[180px] sm:w-[220px] lg:w-[240px] p-4 sm:p-5 text-[#c9c5ba] uppercase tracking-wider text-[10px] font-semibold sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
                        Accessory / Part
                      </th>
                      {comparisonData.comparison.map((item) => (
                        <th
                          key={`p-head-${item.part.id}`}
                          className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 align-top"
                          style={{ width: `${100 / (comparisonData.comparison.length + 1)}%` }}
                        >
                          <div className="flex flex-col items-center text-center">
                            {item.part.image_url && (
                              <img src={item.part.image_url} alt={item.part.name} className="w-32 h-20 object-cover rounded-xs mb-2 bg-black/40 shadow-md" />
                            )}
                            <h4 className="font-semibold text-white text-sm sm:text-base tracking-tight">{item.part.name}</h4>
                            <span className="text-[10px] text-[#888] uppercase tracking-wider mt-0.5 block">{item.part.brand} · {item.part.item_type}</span>
                            <span className="text-xs sm:text-sm text-[#c5a77a] mt-1 font-bold">MRP: {item.part.formatted_price}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {/* CHEAPEST SELLER ROW */}
                    <tr className="border-b border-white/10 bg-white/[0.015]">
                      <td className="p-4 sm:p-5 sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)] align-top">
                        <strong className="text-white block font-semibold text-sm">Lowest Price Workshop</strong>
                        <span className="text-[10px] text-[#888] block mt-0.5">In {selectedState}</span>
                      </td>
                      {comparisonData.comparison.map((item) => {
                        const bd = item.best_dealer;
                        return (
                          <td key={`p-bd-${item.part.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 align-top">
                            {bd ? (
                              <div className="bg-[#11120f] border border-[#c5a77a]/35 p-4 rounded-xs space-y-2 shadow-md">
                                <span className="font-semibold text-white block text-sm">{bd.dealer_name}</span>
                                <div className="text-[10px] text-[#888]">{bd.address}, {bd.city}</div>
                                <div className="text-[10px]">
                                  <a href={`tel:${bd.phone}`} className="text-[#c5a77a] hover:underline font-medium">{bd.phone}</a>
                                </div>
                                <div className="bg-white/5 p-2.5 rounded-xs space-y-0.5">
                                  <span className="text-[9px] uppercase tracking-wider text-[#888] block">Best Deal Price:</span>
                                  <span className="text-[#c5a77a]-400 font-bold text-base block">{bd.formatted_price}</span>
                                  <span className="text-[10px] text-[#c5a77a]-400 font-semibold block">{bd.discount_percent}% OFF MRP</span>
                                </div>
                                <div className="text-[10px] text-[#aaa]">
                                  {bd.installation_available ? '🔧 Free Installation Available' : 'Self-Fit'} · Delivery: {bd.delivery_days} Day(s)
                                </div>
                              </div>
                            ) : (
                              <span className="text-[#888] italic block text-center py-6">Authorized Stockist</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-[#c9c5ba] sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">Brand &amp; Origin</td>
                      {comparisonData.comparison.map((item) => (
                        <td key={`p-brand-${item.part.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 text-white font-medium">
                          {item.part.brand}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-[#c9c5ba] sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">Compatibility in India</td>
                      {comparisonData.comparison.map((item) => (
                        <td key={`p-comp-${item.part.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 text-white">
                          {item.part.compatibility}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5 font-medium text-[#c9c5ba] sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">Official Warranty</td>
                      {comparisonData.comparison.map((item) => (
                        <td key={`p-war-${item.part.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 text-white">
                          {item.part.warranty_months} Months Replacement Warranty
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 sm:p-5 font-medium text-[#c9c5ba] sticky left-0 z-20 bg-[#141613] border-r border-white/10 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">GST Rate</td>
                      {comparisonData.comparison.map((item) => (
                        <td key={`p-gst-${item.part.id}`} className="p-4 sm:p-5 border-r border-white/10 last:border-r-0 text-white">
                          {item.part.gst_percentage}% (GST Invoice Provided)
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="p-6 text-xs text-red-400">Error: Invalid parts data format.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
