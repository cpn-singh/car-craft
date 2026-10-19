import React, { useState, useEffect } from 'react';
import { compareVehicles, compareParts, getVehicles, getParts, INDIAN_STATES } from '../services/api.js';
import indianCars from '../data/cars.js';
import indianParts from '../data/parts.js';

export default function CompareModal({ isOpen, onClose, userState, onSelectInquiry, initialVehicleId }) {
  const [mode, setMode] = useState('vehicles'); // 'vehicles' or 'parts'
  const [selectedState, setSelectedState] = useState(userState || 'Maharashtra');
  
  // Available items for selection (default to offline datasets so never empty)
  const [availableVehicles, setAvailableVehicles] = useState(indianCars);
  const [availableParts, setAvailableParts] = useState(indianParts);
  
  // Selected IDs
  const [selectedVehicleIds, setSelectedVehicleIds] = useState([indianCars[0].id, indianCars[1]?.id || indianCars[0].id]);
  const [selectedPartIds, setSelectedPartIds] = useState([indianParts[0].id, indianParts[1]?.id || indianParts[0].id]);

  // Comparison Results
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync state prop
  useEffect(() => {
    if (userState) setSelectedState(userState);
  }, [userState]);

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load available items
  useEffect(() => {
    if (isOpen) {
      getVehicles('all', 'all').then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableVehicles(data);
          if (initialVehicleId) {
            const firstId = Number(initialVehicleId);
            const secondCar = data.find((c) => c.id !== firstId) || data[0];
            setSelectedVehicleIds([firstId, secondCar.id]);
          } else if (data.length >= 2) {
            setSelectedVehicleIds([data[0].id, data[1].id]);
          }
        }
      }).catch(console.error);

      getParts('', 'all').then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableParts(data);
          if (data.length >= 2) {
            setSelectedPartIds([data[0].id, data[1].id]);
          }
        }
      }).catch(console.error);
    }
  }, [isOpen, initialVehicleId]);

  // Trigger comparison when IDs or State or Mode change
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'vehicles' && selectedVehicleIds.length > 0) {
      setLoading(true);
      setError(null);
      compareVehicles(selectedVehicleIds, selectedState)
        .then((res) => setComparisonData(res))
        .catch((err) => setError(err.message || 'Comparison failed'))
        .finally(() => setLoading(false));
    } else if (mode === 'parts' && selectedPartIds.length > 0) {
      setLoading(true);
      setError(null);
      compareParts(selectedPartIds, selectedState)
        .then((res) => setComparisonData(res))
        .catch((err) => setError(err.message || 'Comparison failed'))
        .finally(() => setLoading(false));
    }
  }, [mode, selectedVehicleIds, selectedPartIds, selectedState, isOpen]);

  if (!isOpen) return null;

  function toggleVehicleId(id) {
    if (selectedVehicleIds.includes(id)) {
      if (selectedVehicleIds.length <= 1) return;
      setSelectedVehicleIds(selectedVehicleIds.filter((i) => i !== id));
    } else {
      if (selectedVehicleIds.length >= 3) {
        setSelectedVehicleIds([...selectedVehicleIds.slice(1), id]);
      } else {
        setSelectedVehicleIds([...selectedVehicleIds, id]);
      }
    }
  }

  function togglePartId(id) {
    if (selectedPartIds.includes(id)) {
      if (selectedPartIds.length <= 1) return;
      setSelectedPartIds(selectedPartIds.filter((i) => i !== id));
    } else {
      if (selectedPartIds.length >= 3) {
        setSelectedPartIds([...selectedPartIds.slice(1), id]);
      } else {
        setSelectedPartIds([...selectedPartIds, id]);
      }
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card compare-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">✕</button>

        <div className="modal-header">
          <div className="flex-between">
            <div>
              <span className="modal-eyebrow">AUREL AI COMPARISON ENGINE · INDIA</span>
              <h2>Compare & Discover Cheapest Dealer</h2>
            </div>
            
            <div className="state-picker-group">
              <label htmlFor="comp-state-select">Select Your State:</label>
              <select
                id="comp-state-select"
                className="state-select-input"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-tabs">
            <button
              className={`modal-tab ${mode === 'vehicles' ? 'active' : ''}`}
              onClick={() => { setMode('vehicles'); setComparisonData(null); }}
              type="button"
            >
              Compare Vehicles (Side-by-Side)
            </button>
            <button
              className={`modal-tab ${mode === 'parts' ? 'active' : ''}`}
              onClick={() => { setMode('parts'); setComparisonData(null); }}
              type="button"
            >
              Compare Accessories & Spare Parts
            </button>
          </div>
        </div>

        {/* Item Selection Pills */}
        <div className="item-selector-bar">
          <span className="selector-title">Select up to 3 {mode === 'vehicles' ? 'cars' : 'items'} to compare:</span>
          <div className="pills-scroll">
            {mode === 'vehicles' ? (
              availableVehicles.map((v) => {
                const isSelected = selectedVehicleIds.includes(v.id);
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={`item-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleVehicleId(v.id)}
                  >
                    {isSelected && <span className="pill-check">✓</span>}
                    {v.name} ({v.formatted_price || v.price_display})
                  </button>
                );
              })
            ) : (
              availableParts.map((p) => {
                const isSelected = selectedPartIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`item-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => togglePartId(p.id)}
                  >
                    {isSelected && <span className="pill-check">✓</span>}
                    {p.name} ({p.formatted_price})
                  </button>
                );
              })
            )}
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="pulse-spinner" />
            <p>Analyzing dealer inventory & finding cheapest dealer in {selectedState}...</p>
          </div>
        )}

        {error && (
          <div className="alert-box error">
            <p>{error}</p>
          </div>
        )}

        {/* VEHICLE COMPARISON TABLE */}
        {!loading && comparisonData && mode === 'vehicles' && (
          <div className="comparison-content">
            {/* AI Verdict Banner */}
            {comparisonData.ai_verdict && (
              <div className="ai-verdict-card">
                <div className="ai-badge-row">
                  <span className="sparkle-icon">✨</span>
                  <span className="ai-tag">Aurel AI Buying Verdict · {selectedState}</span>
                </div>
                <h3>{comparisonData.ai_verdict.headline}</h3>
                <p className="verdict-summary">{comparisonData.ai_verdict.summary}</p>
                
                {comparisonData.ai_verdict.cheapest_option && (
                  <div className="cheapest-dealer-callout">
                    <div className="callout-badge">CHEAPEST DEALER IN {selectedState.toUpperCase()}</div>
                    <div className="callout-grid">
                      <div>
                        <strong>{comparisonData.ai_verdict.cheapest_option.vehicle_name}</strong>
                        <div className="price-tag">{comparisonData.ai_verdict.cheapest_option.price}</div>
                      </div>
                      <div>
                        <span className="label-dim">Verified Dealer:</span>
                        <div className="dealer-highlight-name">
                          {comparisonData.ai_verdict.cheapest_option.dealer} ({comparisonData.ai_verdict.cheapest_option.city})
                        </div>
                      </div>
                      <div>
                        <span className="label-dim">Your Direct Savings:</span>
                        <div className="savings-highlight">Save {comparisonData.ai_verdict.cheapest_option.savings_vs_competitor}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Side by Side Specs & Dealers Table */}
            <div className="table-scroll-hint">⟵ Swipe horizontally to compare cars &amp; dealers ⟶</div>
            <div className="table-responsive">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th className="feature-col">Feature / Detail</th>
                    {comparisonData.comparison.map((item) => (
                      <th key={item.vehicle.id} className="vehicle-col">
                        <div className="table-car-header">
                          <img src={item.vehicle.full_image_url} alt={item.vehicle.name} className="table-car-img" />
                          <h4>{item.vehicle.name}</h4>
                          <span className="table-car-variant">{item.vehicle.variant || item.vehicle.category}</span>
                          <span className="table-car-base-price">Base: {item.vehicle.formatted_price}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* CHEAPEST DEALER ROW */}
                  <tr className="highlight-row">
                    <td className="feature-label">
                      <strong>🏆 Best Dealer</strong>
                      <span className="feature-sub">Lowest in {selectedState}</span>
                    </td>
                    {comparisonData.comparison.map((item) => {
                      const bd = item.best_dealer;
                      return (
                        <td key={item.vehicle.id} className="vehicle-col best-dealer-cell">
                          {bd ? (
                            <div className="dealer-card-compact">
                              <div className="dealer-header-mini">
                                <span className="dealer-name">{bd.dealer_name}</span>
                                <span className="dealer-rating">★ {bd.rating}</span>
                              </div>
                              <div className="dealer-address-mini">
                                📍 {bd.address}, {bd.city}, {bd.state}
                              </div>
                              <div className="dealer-phone-mini">
                                📞 <a href={`tel:${bd.phone}`} className="phone-link">{bd.phone}</a>
                              </div>
                              <div className="price-offer-box">
                                <span className="offer-label">Cheapest Offer Price:</span>
                                <span className="offer-val">{bd.formatted_final_price}</span>
                                <span className="offer-discount">Save ₹{bd.dealer_discount.toLocaleString()}</span>
                              </div>
                              <div className="on-road-est">
                                <span>Approx On-Road:</span> <strong>{bd.formatted_on_road}</strong>
                              </div>
                              {bd.special_offers && (
                                <div className="special-perk">🎁 {bd.special_offers}</div>
                              )}
                              <button
                                type="button"
                                className="button button-gold-sm"
                                onClick={() => {
                                  onClose();
                                  onSelectInquiry(item.vehicle);
                                }}
                              >
                                Claim Best Deal ↗
                              </button>
                            </div>
                          ) : (
                            <div className="dim-text">Direct booking available</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* SPECS */}
                  <tr>
                    <td className="feature-label">Fuel Type</td>
                    {comparisonData.comparison.map((item) => (
                      <td key={item.vehicle.id} className="vehicle-col"><strong>{item.vehicle.fuel_type}</strong></td>
                    ))}
                  </tr>
                  <tr>
                    <td className="feature-label">ARAI Certified Mileage / Range</td>
                    {comparisonData.comparison.map((item) => (
                      <td key={item.vehicle.id} className="vehicle-col"><span className="stat-pill">{item.vehicle.mileage_arai}</span></td>
                    ))}
                  </tr>
                  <tr>
                    <td className="feature-label">Safety Rating</td>
                    {comparisonData.comparison.map((item) => (
                      <td key={item.vehicle.id} className="vehicle-col"><span className="safety-badge">🛡️ {item.vehicle.safety_rating}</span></td>
                    ))}
                  </tr>
                  <tr>
                    <td className="feature-label">Seating Capacity</td>
                    {comparisonData.comparison.map((item) => (
                      <td key={item.vehicle.id} className="vehicle-col">{item.vehicle.seating_capacity} Seats</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="feature-label">Transmission</td>
                    {comparisonData.comparison.map((item) => (
                      <td key={item.vehicle.id} className="vehicle-col">{item.vehicle.transmission}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="feature-label">Engine &amp; Power</td>
                    {comparisonData.comparison.map((item) => (
                      <td key={item.vehicle.id} className="vehicle-col">
                        <div>{item.vehicle.engine}</div>
                        {item.vehicle.power_bhp && <span className="dim-text">{item.vehicle.power_bhp} · {item.vehicle.torque_nm}</span>}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="feature-label">Warranty Coverage</td>
                    {comparisonData.comparison.map((item) => (
                      <td key={item.vehicle.id} className="vehicle-col">{item.vehicle.warranty_info}</td>
                    ))}
                  </tr>

                  {/* ALL DEALERS LIST */}
                  <tr>
                    <td className="feature-label">
                      <strong>All Verified Dealers</strong>
                      <span className="feature-sub">Ranked by price</span>
                    </td>
                    {comparisonData.comparison.map((item) => (
                      <td key={item.vehicle.id} className="vehicle-col">
                        <div className="dealers-list-mini">
                          {item.all_dealer_offers.map((d, idx) => (
                            <div className={`dealer-row-item ${d.is_cheapest ? 'best-row' : ''}`} key={d.dealer_id}>
                              <div className="d-info">
                                <strong>{idx + 1}. {d.dealer_name}</strong>
                                <span>{d.city}, {d.state} · 📞 {d.phone}</span>
                              </div>
                              <div className="d-price">
                                <span>{d.formatted_final_price}</span>
                                {d.dealer_discount > 0 && <small>-₹{d.dealer_discount.toLocaleString()}</small>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PARTS COMPARISON TABLE */}
        {!loading && comparisonData && mode === 'parts' && (
          <div className="comparison-content">
            <div className="table-scroll-hint">⟵ Swipe horizontally to compare items &amp; sellers ⟶</div>
            <div className="table-responsive">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th className="feature-col">Accessory / Part</th>
                    {comparisonData.comparison.map((item) => (
                      <th key={item.part.id} className="vehicle-col">
                        <div className="table-car-header">
                          {item.part.image_url && <img src={item.part.image_url} alt={item.part.name} className="table-car-img" />}
                          <h4>{item.part.name}</h4>
                          <span className="table-car-variant">{item.part.brand} · {item.part.item_type}</span>
                          <span className="table-car-base-price">MRP: {item.part.formatted_price}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* CHEAPEST SELLER ROW */}
                  <tr className="highlight-row">
                    <td className="feature-label">
                      <strong>🏆 Lowest Price Dealer / Workshop</strong>
                      <span className="feature-sub">In {selectedState}</span>
                    </td>
                    {comparisonData.comparison.map((item) => {
                      const bd = item.best_dealer;
                      return (
                        <td key={item.part.id} className="best-dealer-cell">
                          {bd ? (
                            <div className="dealer-card-compact">
                              <span className="dealer-name">{bd.dealer_name}</span>
                              <div className="dealer-address-mini">📍 {bd.address}, {bd.city}</div>
                              <div className="dealer-phone-mini">📞 {bd.phone}</div>
                              <div className="price-offer-box">
                                <span className="offer-label">Best Deal Price:</span>
                                <span className="offer-val">{bd.formatted_price}</span>
                                <span className="offer-discount">{bd.discount_percent}% OFF MRP</span>
                              </div>
                              <div className="installation-tag">
                                {bd.installation_available ? '🔧 Free Installation Available' : 'Self-Fit'} · Delivery: {bd.delivery_days} Day(s)
                              </div>
                            </div>
                          ) : (
                            <span className="dim-text">Authorized Stockist</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td className="feature-label">Brand & Origin</td>
                    {comparisonData.comparison.map((item) => (
                      <td key={item.part.id}><strong>{item.part.brand}</strong></td>
                    ))}
                  </tr>
                  <tr>
                    <td className="feature-label">Compatibility in India</td>
                    {comparisonData.comparison.map((item) => (
                      <td key={item.part.id}>{item.part.compatibility}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="feature-label">Official Warranty</td>
                    {comparisonData.comparison.map((item) => (
                      <td key={item.part.id}>{item.part.warranty_months} Months Replacement Warranty</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="feature-label">GST Rate</td>
                    {comparisonData.comparison.map((item) => (
                      <td key={item.part.id}>{item.part.gst_percentage}% (GST Invoice Provided)</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
