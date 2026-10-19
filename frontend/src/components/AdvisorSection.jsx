import React, { useState, useEffect } from 'react';
import { askAiAdvisor, getDealers } from '../services/api.js';

export default function AdvisorSection({ userState, onSelectInquiry }) {
  const [activeTab, setActiveTab] = useState('advisor'); // 'advisor' or 'dealers'
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

  // Fetch dealers when tab is 'dealers' or userState changes
  useEffect(() => {
    getDealers(userState)
      .then((data) => {
        if (Array.isArray(data)) setDealers(data);
      })
      .catch(console.error);
  }, [userState]);

  async function handleSend(textToSend) {
    const q = textToSend || query;
    if (!q.trim()) return;

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
    } catch (err) {
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
  }

  return (
    <section className="section-pad advisor-section" id="advisor">
      <div className="section-label">
        <span>05 / GUIDANCE &amp; LOCAL DEALERS</span>
        <span>INTELLIGENT DEAL ADVISORY · {userState.toUpperCase()}</span>
      </div>

      <div className="advisor-section-header">
        <div>
          <h2>Get help with <em>the next step.</em></h2>
          <p>Explore a few options, compare running costs, or find a nearby dealer. Use the guide for a starting point, then confirm details directly with the showroom.</p>
        </div>

        <div className="advisor-toggle-tabs">
          <button
            type="button"
            className={`toggle-tab-btn ${activeTab === 'advisor' ? 'active' : ''}`}
            onClick={() => setActiveTab('advisor')}
          >
            Ask a question
          </button>
          <button
            type="button"
            className={`toggle-tab-btn ${activeTab === 'dealers' ? 'active' : ''}`}
            onClick={() => setActiveTab('dealers')}
          >
            🏢 Verified Dealerships ({dealers.length})
          </button>
        </div>
      </div>

      {activeTab === 'advisor' ? (
        <div className="advisor-inline-container">
          {/* Quick Prompts */}
          <div className="quick-prompts-row">
            <span className="quick-prompt-label">Common Inquiries:</span>
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="quick-chip-btn"
                onClick={() => handleSend(p)}
                disabled={loading}
              >
                &quot;{p}&quot;
              </button>
            ))}
          </div>

          {/* Chat Stream */}
          <div className="advisor-inline-chat-stream">
            {chatLog.map((msg, index) => (
              <div key={index} className={`chat-row ${msg.sender}`}>
                <div className="chat-avatar-badge">
                  {msg.sender === 'ai' ? '🤖' : '👤'}
                </div>
                <div className="chat-message-box">
                  <div className="chat-message-text" style={{ whiteSpace: 'pre-line' }}>
                    {msg.text}
                  </div>

                  {/* Recommended Vehicles Cards */}
                  {msg.vehicles && msg.vehicles.length > 0 && (
                    <div className="recs-card-grid">
                      {msg.vehicles.map((v) => (
                        <div className="rec-vehicle-card" key={v.id}>
                          {v.image_url && <img src={v.image_url} alt={v.name} className="rec-img" />}
                          <div className="rec-body">
                            <h4>{v.name}</h4>
                            <span className="rec-price">{v.price} · {v.fuel_type}</span>
                            <span className="rec-stats">⛽ {v.mileage} · 🛡️ {v.safety}</span>

                            {v.best_dealer && (
                              <div className="rec-dealer-callout">
                                <span className="rec-best-tag">🏆 CHEAPEST IN {v.best_dealer.state}:</span>
                                <strong>{v.best_dealer.name}</strong> ({v.best_dealer.city})
                                <div className="rec-offer-price">
                                  Best Deal: <strong>{v.best_offer_price}</strong>
                                  <span className="rec-save">Save ₹{v.best_dealer.discount?.toLocaleString()}</span>
                                </div>
                                <div className="rec-dealer-address">
                                  📍 {v.best_dealer.address} · 📞 <a href={`tel:${v.best_dealer.phone}`}>{v.best_dealer.phone}</a>
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              className="button button-gold-sm"
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
              <div className="chat-row ai">
                <div className="chat-avatar-badge">🤖</div>
                <div className="chat-message-box thinking">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                  <small>Calculating verified dealer offers and state RTO benefits for {userState}...</small>
                </div>
              </div>
            )}
          </div>

          {/* Form */}
          <form
            className="advisor-inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              className="advisor-inline-input"
              placeholder={`Ask about on-road prices, comparisons, or best dealers in ${userState}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="button button-gold"
              disabled={loading || !query.trim()}
            >
              Get suggestions ↗
            </button>
          </form>
        </div>
      ) : (
        /* DEALERS DIRECTORY */
        <div className="dealers-directory-container">
          <div className="dealers-showcase-grid">
            {dealers.map((d) => (
              <div className="dealer-card-full" key={d.id}>
                <div className="d-card-header">
                  <div>
                    <h4>{d.name}</h4>
                    <span className="d-brand">{d.brand_focus}</span>
                  </div>
                  <span className="d-rating-badge">★ {d.rating} ({d.reviews_count} reviews)</span>
                </div>

                <div className="d-card-body">
                  <p className="d-address">📍 {d.address}, {d.city}, {d.state} - {d.pincode}</p>
                  <p className="d-phone">📞 Direct Line: <a href={`tel:${d.phone}`} className="phone-link">{d.phone}</a></p>
                  <p className="d-email">✉️ Inquiries: <a href={`mailto:${d.email}`}>{d.email}</a></p>
                </div>

                <div className="d-card-footer">
                  <span className="verified-pill">✓ Authorized Dealership</span>
                  <a href={`tel:${d.phone}`} className="button button-outline-sm">
                    Call Dealership 📞
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
