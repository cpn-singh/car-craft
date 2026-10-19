import React, { useState, useEffect } from 'react';
import { searchUniversal, INDIAN_STATES } from '../services/api.js';

export default function SearchModal({ isOpen, onClose, userState, initialQuery = '', onSelectVehicle, onSelectInquiry }) {
  const [query, setQuery] = useState(initialQuery || '');
  const [categoryType, setCategoryType] = useState('all'); // all, vehicles, accessories, parts, dealers
  const [selectedState, setSelectedState] = useState(userState || 'Maharashtra');
  const [sortBy, setSortBy] = useState('cheapest'); // cheapest, rating

  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userState) setSelectedState(userState);
  }, [userState]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    if (!isOpen) return;

    const timeout = setTimeout(() => {
      setLoading(true);
      searchUniversal(query, categoryType, selectedState, sortBy)
        .then((data) => setSearchResults(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [query, categoryType, selectedState, sortBy, isOpen]);

  if (!isOpen) return null;

  const results = searchResults?.results || { vehicles: [], accessories: [], parts: [], dealers: [] };
  const totalCount = searchResults?.total_count || 0;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card search-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close search">✕</button>

        <div className="search-header">
          <span className="modal-eyebrow">AUREL UNIVERSAL SEARCH · INDIA</span>
          <h2>Search Cars, Accessories & Verified Dealers</h2>
          
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-field"
              placeholder="Search XUV700, Tata Safari, 4K Dashcam, Ceramic Coating, Dealers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button type="button" className="clear-btn" onClick={() => setQuery('')}>✕</button>
            )}
          </div>

          <div className="search-filter-bar">
            <div className="filter-tabs">
              {[
                { label: 'All Results', value: 'all' },
                { label: 'Vehicles', value: 'vehicles' },
                { label: 'Accessories', value: 'accessories' },
                { label: 'Spare Parts', value: 'parts' },
                { label: 'Dealers', value: 'dealers' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={`tab-btn ${categoryType === tab.value ? 'active' : ''}`}
                  onClick={() => setCategoryType(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="state-and-sort">
              <select
                className="select-mini"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                aria-label="Filter by Indian State"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                className="select-mini"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort by"
              >
                <option value="cheapest">Price: Lowest First (Cheapest)</option>
                <option value="rating">Dealer Rating: Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="search-body">
          {loading && (
            <div className="loading-state">
              <div className="pulse-spinner" />
              <p>Searching verified dealers & inventory across {selectedState}...</p>
            </div>
          )}

          {!loading && totalCount === 0 && (
            <div className="empty-search">
              <p>No results found for &quot;{query}&quot; in {selectedState}. Try searching &quot;XUV&quot;, &quot;Safari&quot;, &quot;Creta&quot;, &quot;Dashcam&quot;, or select &quot;All India&quot;.</p>
            </div>
          )}

          {!loading && (
            <div className="search-results-container">
              {/* VEHICLES RESULTS */}
              {results.vehicles.length > 0 && (
                <div className="result-section">
                  <div className="section-title-row">
                    <h3>Vehicles ({results.vehicles.length})</h3>
                  </div>
                  <div className="search-grid">
                    {results.vehicles.map((v) => (
                      <div className="search-item-card" key={v.id}>
                        <img src={v.full_image_url} alt={v.name} className="search-card-img" />
                        <div className="search-card-content">
                          <span className="car-category-tag">{v.fuel_type} · {v.category.toUpperCase()}</span>
                          <h4>{v.name}</h4>
                          <span className="car-base-price">Base: {v.formatted_price}</span>

                          {/* Best Dealer In State */}
                          {v.best_dealer_in_state ? (
                            <div className="search-dealer-callout">
                              <span className="best-tag">🏆 CHEAPEST DEALER IN {selectedState.toUpperCase()}:</span>
                              <div className="dealer-name-line">
                                <strong>{v.best_dealer_in_state.dealer_name}</strong>
                                <span className="dealer-city">({v.best_dealer_in_state.city}) ★{v.best_dealer_in_state.rating}</span>
                              </div>
                              <div className="dealer-price-line">
                                <span className="deal-price">{v.best_dealer_in_state.formatted_offer_price}</span>
                                {v.best_dealer_in_state.special_offers && (
                                  <small className="offer-note">🎁 {v.best_dealer_in_state.special_offers}</small>
                                )}
                              </div>
                              <div className="dealer-contact-line">
                                📍 {v.best_dealer_in_state.address} · 📞 <a href={`tel:${v.best_dealer_in_state.phone}`}>{v.best_dealer_in_state.phone}</a>
                              </div>
                            </div>
                          ) : (
                            <div className="search-dealer-callout standard">
                              <span>Available through authorized dealer network</span>
                            </div>
                          )}

                          <div className="search-card-actions">
                            <button
                              type="button"
                              className="button button-gold-sm"
                              onClick={() => {
                                onClose();
                                onSelectInquiry(v);
                              }}
                            >
                              Inquire with Cheapest Dealer ↗
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACCESSORIES RESULTS */}
              {results.accessories.length > 0 && (
                <div className="result-section">
                  <div className="section-title-row">
                    <h3>Accessories ({results.accessories.length})</h3>
                  </div>
                  <div className="search-grid">
                    {results.accessories.map((p) => (
                      <div className="search-item-card part" key={p.id}>
                        {p.image_url && <img src={p.image_url} alt={p.name} className="search-card-img" />}
                        <div className="search-card-content">
                          <span className="car-category-tag">{p.brand} · ACCESSORY</span>
                          <h4>{p.name}</h4>
                          <span className="car-base-price">MRP: {p.formatted_price}</span>
                          <p className="dim-desc">{p.description}</p>

                          {p.best_dealer_in_state && (
                            <div className="search-dealer-callout">
                              <span className="best-tag">LOWEST SELLER PRICE IN {selectedState.toUpperCase()}:</span>
                              <div className="dealer-name-line">
                                <strong>{p.best_dealer_in_state.dealer_name}</strong> ({p.best_dealer_in_state.city})
                              </div>
                              <div className="dealer-price-line">
                                <span className="deal-price">{p.best_dealer_in_state.formatted_offer_price}</span>
                                <small>Delivery: {p.best_dealer_in_state.delivery_days} Day(s)</small>
                              </div>
                              <div className="dealer-contact-line">
                                📞 <a href={`tel:${p.best_dealer_in_state.phone}`}>{p.best_dealer_in_state.phone}</a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SPARE PARTS RESULTS */}
              {results.parts.length > 0 && (
                <div className="result-section">
                  <div className="section-title-row">
                    <h3>Spare Parts ({results.parts.length})</h3>
                  </div>
                  <div className="search-grid">
                    {results.parts.map((p) => (
                      <div className="search-item-card part" key={p.id}>
                        {p.image_url && <img src={p.image_url} alt={p.name} className="search-card-img" />}
                        <div className="search-card-content">
                          <span className="car-category-tag">{p.brand} · OEM SPARE</span>
                          <h4>{p.name}</h4>
                          <span className="car-base-price">Price: {p.formatted_price}</span>
                          <span className="compat-text">Compatibility: {p.compatibility}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DEALERS RESULTS */}
              {results.dealers.length > 0 && (
                <div className="result-section">
                  <div className="section-title-row">
                    <h3>Authorized Dealers ({results.dealers.length})</h3>
                  </div>
                  <div className="dealers-grid">
                    {results.dealers.map((d) => (
                      <div className="dealer-full-card" key={d.id}>
                        <div className="dealer-top">
                          <div>
                            <h4>{d.name}</h4>
                            <span className="dealer-focus">{d.brand_focus}</span>
                          </div>
                          <span className="rating-pill">★ {d.rating} ({d.reviews_count} reviews)</span>
                        </div>
                        <div className="dealer-details">
                          <p>📍 {d.address}, {d.city}, {d.state} - {d.pincode}</p>
                          <p>📞 Phone: <a href={`tel:${d.phone}`} className="phone-link">{d.phone}</a></p>
                          <p>✉️ Email: <a href={`mailto:${d.email}`}>{d.email}</a></p>
                        </div>
                        <div className="dealer-verified-tag">
                          ✓ Authorized & Certified Dealer
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
