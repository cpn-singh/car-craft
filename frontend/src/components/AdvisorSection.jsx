/**
 * AdvisorSection.jsx
 * -------------------
 * Guidance & Local Dealers
 * Styled with Tailwind CSS
 */

import React, { useState, useEffect } from 'react';
import { askAiAdvisor, getDealers } from '../services/api.js';

export default function AdvisorSection({ userState, onSelectInquiry }) {
  const [activeTab, setActiveTab] = useState('advisor');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [dealers, setDealers] = useState([]);

  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: `Namaste! I am your AI Automotive Consultant for ${userState}. Ask me anything about car specs, comparing models, RTO charges, or discovering which authorized dealer is offering the lowest price.`
    }
  ]);

  const quickPrompts = [
    `Which dealer has the cheapest price for Mahindra XUV700 in ${userState}?`,
    `Compare Mahindra XUV700 vs Tata Safari for family highway trips in India`,
    `Find best discounts on Tata Nexon EV with subsidy in ${userState}`,
    `Which 4K dashcam is best for Indian driving conditions?`
  ];

  useEffect(() => {
    let isMounted = true;

    getDealers(userState)
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setDealers(data);
          } else {
            console.warn("API didn't return an array for dealers:", data);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch dealers:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [userState]);

  const handleSend = async (textToSend) => {
    const q = typeof textToSend === 'string' ? textToSend : query;
    if (!q || !q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setChatLog((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await askAiAdvisor(q, userState);
      const aiMsg = {
        sender: 'ai',
        text: res.ai_response,
        vehicles: res.recommended_vehicles
      };
      setChatLog((prev) => [...prev, aiMsg]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Unable to connect to dealer advisory network. Please check that the backend is active.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="section-pad advisor-section pt-16 md:pt-24 pb-20 md:pb-28 px-4 sm:px-[7%] lg:px-[11.5%] bg-[#11120f] text-white"
      id="advisor"
    >
      <div className="section-label flex justify-between pb-[19px] border-b border-white/15 text-[#c9c5ba] text-[9px] tracking-[0.22em] uppercase font-sans">
        <span>05 / GUIDANCE &amp; LOCAL DEALERS</span>
        <span>INTELLIGENT DEAL ADVISORY · {userState.toUpperCase()}</span>
      </div>

      <div className="advisor-section-header flex flex-col md:flex-row md:items-end justify-between pt-8 gap-4">
        <div>
          <h2 className="font-light text-[clamp(34px,5.5vw,76px)] leading-[1.05] tracking-[-0.065em] m-0 text-white">
            Get help with <em className="font-serif font-normal italic text-[#c5a77a]">the next step.</em>
          </h2>
          <p className="text-xs text-[#a9aaa3] mt-3 max-w-md leading-relaxed">
            Explore a few options, compare running costs, or find a nearby dealer. Use the guide for a starting point, then confirm details directly with the showroom.
          </p>
        </div>

        <div className="advisor-toggle-tabs flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-full self-start md:self-auto">
          <button
            type="button"
            className={`toggle-tab-btn px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'advisor' ? 'bg-[#c5a77a] text-[#11120f]' : 'text-[#ccc] hover:text-white'
              }`}
            onClick={() => setActiveTab('advisor')}
          >
            Ask a question
          </button>
          <button
            type="button"
            className={`toggle-tab-btn px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'dealers' ? 'bg-[#c5a77a] text-[#11120f]' : 'text-[#ccc] hover:text-white'
              }`}
            onClick={() => setActiveTab('dealers')}
          >
            🏢 Verified Dealerships ({dealers.length || 0})
          </button>
        </div>
      </div>

      {activeTab === 'advisor' ? (
        <div className="advisor-inline-container bg-[#181916] border border-white/10 rounded-xs my-8 p-4 sm:p-6 shadow-2xl">
          {/* --- Quick Prompts --- */}
          <div className="quick-prompts-row flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-white/10">
            <span className="quick-prompt-label text-[10px] text-[#888] uppercase tracking-wider shrink-0">Common Inquiries:</span>
            {quickPrompts.map((p, idx) => (
              <button
                key={`prompt-${idx}`}
                type="button"
                className="quick-chip-btn whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#ccc] hover:border-[#c5a77a] hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                onClick={() => handleSend(p)}
                disabled={loading}
              >
                &quot;{p}&quot;
              </button>
            ))}
          </div>

          {/* --- Chat Stream --- */}
          <div className="advisor-inline-chat-stream space-y-4 max-h-[500px] overflow-y-auto pr-2 mb-4">
            {chatLog.map((msg, index) => (
              <div
                key={index}
                className={`chat-row flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse justify-start' : 'justify-start'}`}
              >
                <div className={`chat-avatar-badge w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm border ${msg.sender === 'user' ? 'bg-[#c5a77a] border-[#c5a77a]' : 'bg-white/10 border-white/15'
                  }`}>
                  {msg.sender === 'ai' ? '🤖' : '👤'}
                </div>

                <div className={`chat-message-box max-w-2xl p-4 rounded-xs text-xs leading-relaxed ${msg.sender === 'user'
                    ? 'bg-[#c5a77a] text-[#11120f] font-medium'
                    : 'bg-[#1c211c] text-[#eae8e1] border border-white/10'
                  }`}>
                  <div className="chat-message-text" style={{ whiteSpace: 'pre-line' }}>
                    {msg.text}
                  </div>

                  {/* Recommended Vehicles Cards */}
                  {msg.vehicles && msg.vehicles.length > 0 && (
                    <div className="recs-card-grid grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {msg.vehicles.map((v) => (
                        <div className="rec-vehicle-card bg-[#141714] border border-white/10 rounded-xs overflow-hidden p-3.5 text-xs flex flex-col justify-between" key={v.id}>
                          <img
                            src={v.image_url || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=85'}
                            alt={v.name}
                            className="rec-img w-full h-32 object-cover rounded-xs mb-2 bg-black/40"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=85';
                            }}
                          />
                          <div className="rec-body space-y-1">
                            <h4 className="font-semibold text-white text-sm">{v.name}</h4>
                            <span className="rec-price text-[#c5a77a] font-bold block">{v.price} · {v.fuel_type}</span>
                            <span className="rec-stats text-[10px] text-[#888] block">⛽ {v.mileage} · 🛡️ {v.safety}</span>

                            {v.best_dealer && (
                              <div className="rec-dealer-callout bg-white/5 border border-[#c5a77a]-500/30 p-2.5 rounded-xs my-2 text-[11px] space-y-1">
                                <span className="rec-best-tag text-[9px] uppercase tracking-wider text-[#c5a77a]-400 font-bold block">
                                  🏆 CHEAPEST IN {v.best_dealer.state}:
                                </span>
                                <strong className="text-white block">{v.best_dealer.name}</strong> ({v.best_dealer.city})
                                <div className="rec-offer-price text-[#c5a77a]-400 font-bold">
                                  Best Deal: <strong>{v.best_offer_price}</strong>
                                  {v.best_dealer.discount && (
                                    <span className="rec-save text-[10px] ml-1 text-[#c5a77a]-300">
                                      (Save ₹{v.best_dealer.discount?.toLocaleString()})
                                    </span>
                                  )}
                                </div>
                                <div className="rec-dealer-address text-[10px] text-[#888]">
                                  📍 {v.best_dealer.address} · 📞 <a href={`tel:${v.best_dealer.phone}`} className="text-[#c5a77a] hover:underline">{v.best_dealer.phone}</a>
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              className="button button-gold-sm w-full py-2 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer mt-2"
                              onClick={() => onSelectInquiry(v)}
                            >
                              Contact Dealer for Invoice ↗
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-row flex gap-3 justify-start">
                <div className="chat-avatar-badge w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm bg-white/10 border border-white/15">🤖</div>
                <div className="chat-message-box bg-[#1c211c] text-[#eae8e1] border border-white/10 p-4 rounded-xs text-xs space-y-2">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 rounded-full bg-[#c5a77a] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#c5a77a] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#c5a77a] animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <small className="text-[#888]">Calculating verified dealer offers and state RTO benefits for {userState}...</small>
                </div>
              </div>
            )}
          </div>

          {/* --- Chat Input Form --- */}
          <form
            className="advisor-inline-form flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-white/10"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              className="advisor-inline-input flex-1 bg-[#11120f] border border-white/15 rounded-xs px-4 py-2.5 text-xs text-white placeholder:text-[#888] outline-none focus:border-[#c5a77a]"
              placeholder={`Ask about on-road prices, comparisons, or best dealers in ${userState}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="button button-gold inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[11px] uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
              disabled={loading || !query.trim()}
            >
              Get suggestions ↗
            </button>
          </form>
        </div>
      ) : (
        /* --- DEALERS DIRECTORY --- */
        <div className="dealers-directory-container my-8">
          <div className="dealers-showcase-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealers.length === 0 && !loading ? (
              <p className="col-span-full text-center text-[#888] py-8">No verified dealers found in this state yet.</p>
            ) : (
              dealers.map((d) => (
                <div className="dealer-card-full bg-[#181916] border border-white/10 rounded-xs p-5 flex flex-col justify-between hover:border-[#c5a77a]/50 transition-all hover:shadow-2xl" key={d.id}>
                  <div>
                    <div className="d-card-header flex justify-between items-start gap-2 mb-3 pb-3 border-b border-white/10">
                      <div>
                        <h4 className="font-semibold text-white text-base">{d.name}</h4>
                        <span className="d-brand text-[#c5a77a] text-[10px] uppercase tracking-wider font-semibold block">{d.brand_focus}</span>
                      </div>
                      <span className="d-rating-badge text-[#c5a77a] font-bold text-xs shrink-0">★ {d.rating} ({d.reviews_count} reviews)</span>
                    </div>

                    <div className="d-card-body text-xs text-[#aaa] space-y-1.5">
                      <p className="d-address">
                        {d.address}, {d.city}, {d.state} {d.pincode}
                      </p>
                      <p className="d-phone">Direct Line: <a href={`tel:${d.phone}`} className="phone-link text-[#c5a77a] hover:underline">{d.phone}</a></p>
                      <p className="d-email">Inquiries: <a href={`mailto:${d.email}`} className="text-white hover:underline">{d.email}</a></p>
                    </div>
                  </div>

                  <div className="d-card-footer flex items-center justify-between gap-3 mt-5 pt-3 border-t border-white/10">
                    <span className="verified-pill text-[#c5a77a]-400 font-semibold text-[10px]">✓ Authorized Dealership</span>
                    <a
                      href={`tel:${d.phone}`}
                      className="button button-outline-sm inline-flex items-center justify-center px-3 py-1.5 bg-transparent hover:bg-white/10 text-white border border-white/25 rounded-xs text-[10px] tracking-wider uppercase font-semibold transition-colors"
                    >
                      Call Dealership
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
