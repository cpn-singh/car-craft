/**
 * PartsSection.jsx
 * -------------------
 * Parts & Accessories Showcase
 * Styled with Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { getParts } from '../services/api.js';
import indianParts from '../data/parts.js';

const partImageFallback = 'https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=800&q=85';

export default function PartsSection({
  userState,
  onSelectPartOrder,
  selectedComparePartIds = [],
  onToggleComparePart,
}) {
  const [parts, setParts] = useState(indianParts);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getParts('', userState)
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setParts(data);
          } else {
            console.warn('API returned empty or invalid parts array. Using local fallback data.');
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userState]);

  const safeParts = Array.isArray(parts) ? parts : [];
  
  const filteredParts = safeParts.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'accessories') return p.item_type === 'ACCESSORY';
    if (activeFilter === 'spares') return p.item_type === 'SPARE_PART';
    return true;
  });

  return (
    <section 
      className="section-pad parts-section pt-16 md:pt-24 pb-20 md:pb-28 px-4 sm:px-[7%] lg:px-[11.5%] bg-[#141714] text-white" 
      id="accessories"
    >
      <div className="section-label flex justify-between pb-[19px] border-b border-white/15 text-[#c9c5ba] text-[9px] tracking-[0.22em] uppercase font-sans">
        <span>04 / PARTS &amp; ACCESSORIES</span>
        <span>SELLERS IN {(userState || 'INDIA').toUpperCase()}</span>
      </div>

      <div className="parts-section-header flex flex-col md:flex-row md:items-end justify-between pt-8 gap-4">
        <div>
          <h2 className="font-light text-[clamp(34px,5.5vw,76px)] leading-[1.05] tracking-[-0.065em] m-0 text-white">
            Useful upgrades. <em className="font-serif font-normal italic text-[#c5a77a]">Clear prices.</em>
          </h2>
          <p className="text-xs text-[#a9aaa3] mt-3 max-w-md leading-relaxed">
            Browse accessories and replacement parts, compare listed prices, and check who sells them in {userState}.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="parts-filter-pills flex flex-wrap items-center gap-2 mt-4 md:mt-0">
          <button
            type="button"
            className={`filter-pill px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#c5a77a] text-[#11120f] border-[#c5a77a] font-semibold'
                : 'bg-white/5 text-[#dcdad2] border-white/15 hover:border-white/30'
            }`}
            onClick={() => setActiveFilter('all')}
          >
            All items <span className="text-[10px] ml-1 opacity-75">{safeParts.length}</span>
          </button>
          <button
            type="button"
            className={`filter-pill px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
              activeFilter === 'accessories'
                ? 'bg-[#c5a77a] text-[#11120f] border-[#c5a77a] font-semibold'
                : 'bg-white/5 text-[#dcdad2] border-white/15 hover:border-white/30'
            }`}
            onClick={() => setActiveFilter('accessories')}
          >
            Accessories
          </button>
          <button
            type="button"
            className={`filter-pill px-3.5 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-colors ${
              activeFilter === 'spares'
                ? 'bg-[#c5a77a] text-[#11120f] border-[#c5a77a] font-semibold'
                : 'bg-white/5 text-[#dcdad2] border-white/15 hover:border-white/30'
            }`}
            onClick={() => setActiveFilter('spares')}
          >
            Parts &amp; tyres
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state flex flex-col items-center justify-center py-20 text-[#888]">
          <div className="pulse-spinner w-8 h-8 rounded-full border-2 border-[#c5a77a] border-t-transparent animate-spin mb-4" />
          <p className="text-xs">Finding genuine parts stockists in {userState}...</p>
        </div>
      ) : (
        <div className="parts-showcase-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {filteredParts.length === 0 && (
            <p className="dim-text col-span-full text-center text-[#888] py-8">No items found for this category.</p>
          )}
          
          {filteredParts.map((part) => {
            const bestOffer = part.best_dealer_offer;
            const dealer = bestOffer?.dealer;
            const savings = (Number(part.price) || 0) - (Number(bestOffer?.offer_price) || 0);

            return (
              <div 
                className="part-showcase-card flex min-w-0 flex-col overflow-hidden rounded-xs border border-white/10 bg-[#1c211c] hover:border-[#c5a77a]/50 transition-all hover:shadow-2xl" 
                key={`part-${part.id}`}
              >
                {part.image_url && (
                  <img
                    src={part.image_url}
                    alt={part.name}
                    className="part-showcase-img w-full h-48 object-cover bg-black/40"
                    loading="lazy"
                    onError={(event) => { 
                      event.currentTarget.onerror = null; 
                      event.currentTarget.src = partImageFallback; 
                    }}
                  />
                )}
                
                <div className="part-showcase-body flex grow flex-col p-5">
                  <div className="part-badge-row flex items-center justify-between text-[10px] mb-2">
                    <span className="brand-tag text-[#c5a77a] font-semibold tracking-wider uppercase">{part.brand}</span>
                    <span className="warranty-tag text-[#888] font-medium">{part.warranty_months} month warranty</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mb-1 leading-snug">{part.name}</h4>
                  <p className="part-compat-note text-[11px] text-[#888] mb-4">
                    <strong className="text-[#aaa]">Fits:</strong> {part.compatibility}
                  </p>

                  <div className="price-and-dealer-block bg-white/5 border border-white/10 p-3.5 rounded-xs mb-4 space-y-2">
                    <div className="mrp-row flex items-center justify-between text-xs text-[#888]">
                      <span className="mrp-label">MRP:</span>
                      <span className="mrp-value line-through">{part.formatted_price}</span>
                    </div>

                    {bestOffer && dealer ? (
                      <div className="cheapest-part-dealer space-y-1">
                        <span className="deal-title text-[9px] uppercase tracking-wider text-[#c5a77a] font-semibold block">
                          Listed offer · {dealer.state}
                        </span>
                        <div className="deal-line flex items-baseline gap-2">
                          <strong className="deal-amt text-base font-bold">
                            ₹{Number(bestOffer.offer_price).toLocaleString('en-IN')}
                          </strong>
                          {savings > 0 && (
                            <span className="save-tag text-[#c5a77a] text-[10px] font-bold px-1.5 py-0.5 rounded-xs">
                              Save ₹{savings.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <span className="dealer-loc text-[10px] text-[#aaa] block truncate">
                          {dealer.name} · {dealer.city} · <a href={`tel:${dealer.phone}`} className="text-[#c5a77a] hover:underline">{dealer.phone}</a>
                        </span>
                        <div className="install-note text-[10px] text-[#888] italic">
                          {bestOffer.installation_available ? 'Fitting available' : 'Self installation'} · Ships in {bestOffer.delivery_days} day(s)
                        </div>
                      </div>
                    ) : (
                      <div className="cheapest-part-dealer standard text-xs text-[#888] italic">
                        <span>Genuine Manufacturer Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-auto">
                    <button
                      type="button"
                      className="button button-gold-sm part-order-btn flex-1 py-2.5 px-3 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      onClick={() => onSelectPartOrder(part)}
                    >
                      Inquire <span aria-hidden="true">↗</span>
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2.5 px-3 font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer border ${
                        selectedComparePartIds.includes(part.id)
                          ? 'bg-[#c5a77a] text-[#11120f] border-[#c5a77a] font-bold'
                          : 'bg-white/5 hover:bg-white/10 text-white border-white/20'
                      }`}
                      onClick={() => onToggleComparePart && onToggleComparePart(part)}
                      title="Select part to compare side-by-side"
                    >
                      {selectedComparePartIds.includes(part.id) ? '✓ In Compare' : '+ Compare'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
