/**
 * SearchModal.jsx
 * -------------------
 * Universal Search & Filtering
 * Styled with Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { searchUniversal, INDIAN_STATES } from '../services/api.js';

export default function SearchModal({ 
  isOpen, 
  onClose, 
  userState, 
  initialQuery = '', 
  onSelectVehicle, 
  onSelectInquiry 
}) {
  const [query, setQuery] = useState(initialQuery || '');
  const [categoryType, setCategoryType] = useState('all');
  const [selectedState, setSelectedState] = useState(userState || 'Maharashtra');
  const [sortBy, setSortBy] = useState('cheapest');

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

    let isMounted = true;
    const timeout = setTimeout(() => {
      setLoading(true);
      
      searchUniversal(query, categoryType, selectedState, sortBy)
        .then((data) => {
          if (isMounted) setSearchResults(data);
        })
        .catch((err) => {
          console.error("Search API failed:", err);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [query, categoryType, selectedState, sortBy, isOpen]);

  if (!isOpen) return null;

  const results = searchResults?.results || { vehicles: [], accessories: [], parts: [], dealers: [] };
  const totalCount = searchResults?.total_count || 0;

  return (
    <div 
      className="modal-backdrop fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.25s_ease-out]" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true"
    >
      <div 
        className="modal-card search-modal-card relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#171814] border border-[#c5a77a]/30 shadow-2xl p-5 sm:p-8 text-white rounded-xs overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="modal-close absolute top-5 right-5 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:border-[#c5a77a] transition-colors cursor-pointer text-sm z-10" 
          onClick={onClose} 
          aria-label="Close search"
        >
          ✕
        </button>

        <div className="search-header pb-4 border-b border-white/10 shrink-0">
          <span className="modal-eyebrow text-[9px] tracking-[0.22em] text-[#c5a77a] uppercase font-semibold block mb-1">
            AUREL UNIVERSAL SEARCH · INDIA
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-light text-white m-0">
            Search Cars, Accessories &amp; Verified Dealers
          </h2>
          
          <div className="search-input-wrap relative flex items-center my-3 bg-[#11120f] border border-white/15 rounded-xs p-1 focus-within:border-[#c5a77a]">
            <span className="search-icon text-[#c5a77a] px-3 text-base" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="search-field w-full bg-transparent border-0 outline-none text-white text-xs placeholder:text-[#888] py-2"
              placeholder="Search XUV700, Tata Safari, 4K Dashcam, Ceramic Coating, Dealers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus 
            />
            {query && (
              <button 
                type="button" 
                className="clear-btn px-3 text-xs text-[#888] hover:text-white cursor-pointer" 
                onClick={() => setQuery('')}
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          <div className="search-filter-bar flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
            <div className="filter-tabs flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { label: 'All Results', value: 'all' },
                { label: 'Vehicles', value: 'vehicles' },
                { label: 'Accessories', value: 'accessories' },
                { label: 'Spare Parts', value: 'parts' },
                { label: 'Dealers', value: 'dealers' },
              ].map((tab) => (
                <button
                  key={`tab-${tab.value}`}
                  type="button"
                  className={`tab-btn px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                    categoryType === tab.value 
                      ? 'bg-[#c5a77a] text-[#11120f] font-semibold' 
                      : 'bg-white/5 text-[#aaa] hover:text-white'
                  }`}
                  onClick={() => setCategoryType(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="state-and-sort flex items-center gap-2">
              <select
                className="select-mini bg-white/5 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-xs outline-none cursor-pointer"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                aria-label="Filter by Indian State"
              >
                {(INDIAN_STATES || []).map((s) => (
                  <option key={`search-state-${s}`} value={s} className="bg-[#171814] text-white">{s}</option>
                ))}
              </select>

              <select
                className="select-mini bg-white/5 border border-white/15 text-white text-xs px-2.5 py-1.5 rounded-xs outline-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort by"
              >
                <option value="cheapest" className="bg-[#171814] text-white">Price: Lowest First (Cheapest)</option>
                <option value="rating" className="bg-[#171814] text-white">Dealer Rating: Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="search-body flex-1 overflow-y-auto py-4 pr-1">
          {loading && (
            <div className="loading-state flex flex-col items-center justify-center py-16 text-[#888]">
              <div className="pulse-spinner w-8 h-8 rounded-full border-2 border-[#c5a77a] border-t-transparent animate-spin mb-4" />
              <p className="text-xs">Searching verified dealers &amp; inventory across {selectedState}...</p>
            </div>
          )}

          {!loading && totalCount === 0 && (
            <div className="empty-search text-center py-16 text-[#888] text-xs">
              <p>No results found for &quot;{query}&quot; in {selectedState}. Try searching &quot;XUV&quot;, &quot;Safari&quot;, &quot;Creta&quot;, &quot;Dashcam&quot;, or select &quot;All India&quot;.</p>
            </div>
          )}

          {!loading && (
            <div className="search-results-container space-y-6">
              
              {/* VEHICLES RESULTS */}
              {Array.isArray(results.vehicles) && results.vehicles.length > 0 && (
                <div className="result-section">
                  <div className="section-title-row mb-3">
                    <h3 className="text-sm font-semibold text-[#c5a77a] uppercase tracking-wider">Vehicles ({results.vehicles.length})</h3>
                  </div>
                  <div className="search-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.vehicles.map((v) => (
                      <div className="search-item-card bg-[#1c211c] border border-white/10 rounded-xs overflow-hidden p-4 flex flex-col justify-between hover:border-[#c5a77a]/50 transition-all" key={`veh-${v.id}`}>
                        <div>
                          <img 
                            src={v.full_image_url || '/assets/images/fallback-car.jpg'} 
                            alt={v.name} 
                            className="search-card-img w-full h-36 object-cover rounded-xs mb-3 bg-black/40" 
                            loading="lazy"
                          />
                          <div className="search-card-content space-y-1">
                            <span className="car-category-tag text-[9px] uppercase tracking-wider text-[#888] font-semibold block">
                              {v.fuel_type} · {v.category?.toUpperCase() || 'SUV'}
                            </span>
                            <h4 className="font-semibold text-white text-sm">{v.name}</h4>
                            <span className="car-base-price text-[#c5a77a] font-bold text-xs block">Base: {v.formatted_price}</span>

                            {v.best_dealer_in_state ? (
                              <div className="search-dealer-callout bg-white/5 border border-emerald-500/30 p-2.5 rounded-xs my-2 text-[11px] space-y-1">
                                <span className="best-tag text-[9px] uppercase tracking-wider text-emerald-400 font-bold block">
                                  CHEAPEST DEALER IN {selectedState.toUpperCase()}:
                                </span>
                                <div className="dealer-name-line flex items-center justify-between text-xs">
                                  <span className="dealer-name-strong text-white font-semibold truncate">{v.best_dealer_in_state.dealer_name}</span>
                                  <span className="dealer-star-pill text-[#c5a77a] font-bold text-[10px] shrink-0 ml-1">★ {v.best_dealer_in_state.rating || '4.0'}</span>
                                </div>
                                <div className="dealer-price-line flex items-baseline justify-between text-emerald-400 font-bold">
                                  <span className="deal-price">{v.best_dealer_in_state.formatted_offer_price}</span>
                                </div>
                                <div className="dealer-contact-line text-[10px] text-[#888] truncate">
                                  {v.best_dealer_in_state.address} · <a href={`tel:${v.best_dealer_in_state.phone}`} className="text-[#c5a77a] hover:underline">{v.best_dealer_in_state.phone}</a>
                                </div>
                              </div>
                            ) : (
                              <div className="search-dealer-callout standard text-[11px] text-[#888] italic py-2">
                                <span>Available through authorized dealer network</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="search-card-actions mt-3">
                          <button
                            type="button"
                            className="button button-gold-sm w-full py-2 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer"
                            onClick={() => {
                              onClose();
                              onSelectInquiry(v);
                            }}
                          >
                            Inquire with Cheapest Dealer ↗
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ACCESSORIES RESULTS */}
              {Array.isArray(results.accessories) && results.accessories.length > 0 && (
                <div className="result-section">
                  <div className="section-title-row mb-3">
                    <h3 className="text-sm font-semibold text-[#c5a77a] uppercase tracking-wider">Accessories ({results.accessories.length})</h3>
                  </div>
                  <div className="search-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.accessories.map((p) => (
                      <div className="search-item-card part bg-[#1c211c] border border-white/10 rounded-xs overflow-hidden p-4 flex flex-col justify-between" key={`acc-${p.id}`}>
                        <div>
                          {p.image_url && <img src={p.image_url} alt={p.name} className="search-card-img w-full h-36 object-cover rounded-xs mb-3 bg-black/40" loading="lazy" />}
                          <div className="search-card-content space-y-1">
                            <span className="car-category-tag text-[9px] uppercase tracking-wider text-[#888] font-semibold block">{p.brand} · ACCESSORY</span>
                            <h4 className="font-semibold text-white text-sm">{p.name}</h4>
                            <span className="car-base-price text-[#c5a77a] font-bold text-xs block">MRP: {p.formatted_price}</span>
                            <p className="dim-desc text-[11px] text-[#888] line-clamp-2">{p.description}</p>

                            {p.best_dealer_in_state && (
                              <div className="search-dealer-callout bg-white/5 border border-emerald-500/30 p-2.5 rounded-xs my-2 text-[11px] space-y-1">
                                <span className="best-tag text-[9px] uppercase tracking-wider text-emerald-400 font-bold block">
                                  LOWEST SELLER PRICE IN {selectedState.toUpperCase()}:
                                </span>
                                <div className="dealer-name-line text-white font-semibold text-xs">
                                  <strong>{p.best_dealer_in_state.dealer_name}</strong> ({p.best_dealer_in_state.city})
                                </div>
                                <div className="dealer-price-line flex items-baseline justify-between text-emerald-400 font-bold">
                                  <span className="deal-price">{p.best_dealer_in_state.formatted_offer_price}</span>
                                  <small className="text-[10px] text-[#aaa]">Delivery: {p.best_dealer_in_state.delivery_days} Day(s)</small>
                                </div>
                                <div className="dealer-contact-line text-[10px]">
                                  <a href={`tel:${p.best_dealer_in_state.phone}`} className="text-[#c5a77a] hover:underline">{p.best_dealer_in_state.phone}</a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SPARE PARTS RESULTS */}
              {Array.isArray(results.parts) && results.parts.length > 0 && (
                <div className="result-section">
                  <div className="section-title-row mb-3">
                    <h3 className="text-sm font-semibold text-[#c5a77a] uppercase tracking-wider">Spare Parts ({results.parts.length})</h3>
                  </div>
                  <div className="search-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.parts.map((p) => (
                      <div className="search-item-card part bg-[#1c211c] border border-white/10 rounded-xs overflow-hidden p-4 flex flex-col justify-between" key={`part-${p.id}`}>
                        <div>
                          {p.image_url && <img src={p.image_url} alt={p.name} className="search-card-img w-full h-36 object-cover rounded-xs mb-3 bg-black/40" loading="lazy" />}
                          <div className="search-card-content space-y-1">
                            <span className="car-category-tag text-[9px] uppercase tracking-wider text-[#888] font-semibold block">{p.brand} · OEM SPARE</span>
                            <h4 className="font-semibold text-white text-sm">{p.name}</h4>
                            <span className="car-base-price text-[#c5a77a] font-bold text-xs block">Price: {p.formatted_price}</span>
                            <span className="compat-text text-[11px] text-[#aaa] block">Compatibility: {p.compatibility}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DEALERS RESULTS */}
              {Array.isArray(results.dealers) && results.dealers.length > 0 && (
                <div className="result-section">
                  <div className="section-title-row mb-3">
                    <h3 className="text-sm font-semibold text-[#c5a77a] uppercase tracking-wider">Authorized Dealers ({results.dealers.length})</h3>
                  </div>
                  <div className="dealers-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {results.dealers.map((d) => (
                      <div className="dealer-full-card bg-[#1c211c] border border-white/10 rounded-xs p-4 flex flex-col justify-between" key={`dlr-${d.id}`}>
                        <div>
                          <div className="dealer-top flex justify-between items-start gap-2 mb-2 pb-2 border-b border-white/10">
                            <div>
                              <h4 className="font-semibold text-white text-sm">{d.name}</h4>
                              <span className="dealer-focus text-[10px] text-[#c5a77a] font-semibold block">{d.brand_focus}</span>
                            </div>
                            <span className="rating-pill text-[#c5a77a] font-bold text-xs shrink-0">★ {d.rating} ({d.reviews_count} reviews)</span>
                          </div>
                          
                          <div className="dealer-details text-xs text-[#aaa] space-y-1 my-2">
                            <p>{d.address}, {d.city}, {d.state} {d.pincode}</p>
                            <p>Phone: <a href={`tel:${d.phone}`} className="phone-link text-[#c5a77a] hover:underline">{d.phone}</a></p>
                            <p>Email: <a href={`mailto:${d.email}`} className="text-white hover:underline">{d.email}</a></p>
                          </div>
                        </div>
                        
                        <div className="dealer-verified-tag text-emerald-400 font-semibold text-[10px] pt-2 border-t border-white/10">
                          ✓ Authorized &amp; Certified Dealer
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
