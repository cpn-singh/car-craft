import React, { useState, useEffect } from 'react';
import { getParts } from '../services/api.js';
import indianParts from '../data/parts.js';

const partImageFallback = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=85';

export default function PartsSection({ userState, onSelectPartOrder }) {
  const [parts, setParts] = useState(indianParts);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getParts('', userState)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setParts(data);
        }
      })
      .catch((err) => {
        console.warn('Parts fetch notice:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userState]);

  const filteredParts = parts.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'accessories') return p.item_type === 'ACCESSORY';
    if (activeFilter === 'spares') return p.item_type === 'SPARE_PART';
    return true;
  });

  return (
    <section className="section-pad parts-section bg-atelier-ink px-[9%] py-[82px] max-[700px]:px-[22px] max-[700px]:py-[62px]" id="accessories">
      <div className="section-label">
          <span>04 / PARTS &amp; ACCESSORIES</span>
        <span>SELLERS IN {userState.toUpperCase()}</span>
      </div>

      <div className="parts-section-header">
        <div>
          <h2>Useful upgrades. <em>Clear prices.</em></h2>
          <p>Browse accessories and replacement parts, compare listed prices, and check who sells them in {userState}.</p>
        </div>

        <div className="parts-filter-pills">
            <button
            type="button"
              className={`filter-pill inline-flex min-h-[38px] items-center justify-center gap-2 rounded-sm border px-3 py-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atelier-clay ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All items <span>{parts.length}</span>
          </button>
          <button
            type="button"
            className={`filter-pill inline-flex min-h-[38px] items-center justify-center rounded-sm border px-3 py-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atelier-clay ${activeFilter === 'accessories' ? 'active' : ''}`}
            onClick={() => setActiveFilter('accessories')}
          >
            Accessories
          </button>
          <button
            type="button"
            className={`filter-pill inline-flex min-h-[38px] items-center justify-center rounded-sm border px-3 py-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-atelier-clay ${activeFilter === 'spares' ? 'active' : ''}`}
            onClick={() => setActiveFilter('spares')}
          >
            Parts &amp; tyres
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="pulse-spinner" />
          <p>Finding genuine parts stockists in {userState}...</p>
        </div>
      ) : (
        <div className="parts-showcase-grid">
          {filteredParts.map((part) => {
            const bestOffer = part.best_dealer_offer;
            const dealer = bestOffer?.dealer;

            return (
              <div className="part-showcase-card flex min-w-0 flex-col overflow-hidden rounded-sm border border-white/10 bg-[#1c211c]" key={part.id}>
                {part.image_url && (
                  <img
                    src={part.image_url}
                    alt={part.name}
                    className="part-showcase-img"
                    onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = partImageFallback; }}
                  />
                )}
                <div className="part-showcase-body flex grow flex-col p-[18px]">
                  <div className="part-badge-row">
                    <span className="brand-tag">{part.brand}</span>
                    <span className="warranty-tag">{part.warranty_months} month warranty</span>
                  </div>

                  <h4>{part.name}</h4>
                  <p className="part-compat-note"><strong>Fits:</strong> {part.compatibility}</p>

                  <div className="price-and-dealer-block">
                    <div className="mrp-row">
                      <span className="mrp-label">MRP:</span>
                      <span className="mrp-value">{part.formatted_price}</span>
                    </div>

                    {bestOffer && dealer ? (
                      <div className="cheapest-part-dealer">
                        <span className="deal-title">Listed offer · {dealer.state}</span>
                        <div className="deal-line">
                          <strong className="deal-amt">₹{Number(bestOffer.offer_price).toLocaleString()}</strong>
                          <span className="save-tag">
                            Save ₹{Number(part.price - bestOffer.offer_price).toLocaleString()}
                          </span>
                        </div>
                        <span className="dealer-loc">
                          {dealer.name} · {dealer.city} · <a href={`tel:${dealer.phone}`}>{dealer.phone}</a>
                        </span>
                        <div className="install-note">
                          {bestOffer.installation_available ? 'Fitting available' : 'Self installation'} · Ships in {bestOffer.delivery_days} day(s)
                        </div>
                      </div>
                    ) : (
                      <div className="cheapest-part-dealer standard">
                        <span>Genuine Manufacturer Stock</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="button button-gold-sm part-order-btn"
                    onClick={() => onSelectPartOrder(part)}
                  >
                    Ask about this item <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
