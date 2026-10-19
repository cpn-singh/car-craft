import React, { useState } from 'react';
import { askAiAdvisor, INDIAN_STATES } from '../services/api.js';

export default function AiAdvisorModal({ isOpen, onClose, userState, onSelectInquiry }) {
  const [selectedState, setSelectedState] = useState(userState || 'Maharashtra');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([
    {
      sender: 'ai',
      text: 'Namaste! I am your AI Automotive Consultant for India. Ask me anything about car comparisons, RTO taxes, or finding the cheapest authorized dealer in your city.'
    }
  ]);

  const quickPrompts = [
    'Suggest the best 7-seater diesel SUV under ₹30 Lakhs with cheapest dealer',
    'Which is cheaper: Mahindra XUV700 or Tata Safari in Maharashtra?',
    'Find best deals on Tata Nexon EV with subsidy in Karnataka',
    'Recommend top 4K dashcam for Indian roads with installation'
  ];

  if (!isOpen) return null;

  async function handleSend(textToSend) {
    const q = textToSend || query;
    if (!q.trim()) return;

    const userMessage = { sender: 'user', text: q };
    setConversation((prev) => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      const res = await askAiAdvisor(q, selectedState);
      const aiMessage = {
        sender: 'ai',
        text: res.ai_response,
        vehicles: res.recommended_vehicles,
        parts: res.recommended_parts
      };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (err) {
      setConversation((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I encountered an error querying the dealer network. Please ensure the backend server is running.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card advisor-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">✕</button>

        <div className="advisor-header">
          <div className="flex-between">
            <div>
              <span className="modal-eyebrow">AUREL AI AUTOMOTIVE CONSULTANT · INDIA</span>
              <h2>AI Advisor & Best Price Negotiator</h2>
            </div>
            <div className="state-picker-group">
              <label htmlFor="advisor-state-select">Your State:</label>
              <select
                id="advisor-state-select"
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
        </div>

        {/* Quick Prompts */}
        <div className="quick-prompts-bar">
          <span className="quick-label">Try asking:</span>
          {quickPrompts.map((p) => (
            <button
              key={p}
              type="button"
              className="quick-chip"
              onClick={() => handleSend(p)}
              disabled={loading}
            >
              &quot;{p}&quot;
            </button>
          ))}
        </div>

        {/* Conversation Stream */}
        <div className="advisor-chat-stream">
          {conversation.map((msg, idx) => (
            <div key={idx} className={`chat-bubble-wrap ${msg.sender}`}>
              <div className="chat-avatar">
                {msg.sender === 'ai' ? '🤖' : '👤'}
              </div>
              <div className="chat-bubble">
                <div className="chat-text" style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>

                {/* Recommended Vehicles Cards */}
                {msg.vehicles && msg.vehicles.length > 0 && (
                  <div className="chat-recs-grid">
                    {msg.vehicles.map((v) => (
                      <div className="chat-car-card" key={v.id}>
                        {v.image_url && <img src={v.image_url} alt={v.name} className="chat-car-img" />}
                        <div className="chat-car-info">
                          <h4>{v.name}</h4>
                          <span className="chat-car-price">{v.price} · {v.fuel_type}</span>
                          <span className="chat-car-stats">🛡️ {v.safety} · ⛽ {v.mileage}</span>

                          {v.best_dealer && (
                            <div className="chat-dealer-box">
                              <span className="chat-best-title">🏆 CHEAPEST DEALER ({v.best_dealer.state}):</span>
                              <strong>{v.best_dealer.name}</strong> ({v.best_dealer.city})
                              <div className="chat-deal-highlight">
                                Best Offer: {v.best_offer_price} (Save ₹{v.best_dealer.discount?.toLocaleString()})
                              </div>
                              <div className="chat-dealer-contact">
                                📍 {v.best_dealer.address} · 📞 <a href={`tel:${v.best_dealer.phone}`}>{v.best_dealer.phone}</a>
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            className="button button-gold-sm"
                            onClick={() => {
                              onClose();
                              onSelectInquiry(v);
                            }}
                          >
                            Connect with Dealer ↗
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
            <div className="chat-bubble-wrap ai">
              <div className="chat-avatar">🤖</div>
              <div className="chat-bubble thinking">
                <div className="typing-dots">
                  <span /><span /><span />
                </div>
                <small>Consulting Indian dealer pricing database & calculating best discounts...</small>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <form
          className="advisor-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className="advisor-input"
            placeholder={`Ask about cars, accessories, discounts, or dealers in ${selectedState}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="button button-gold" disabled={loading || !query.trim()}>
            Ask AI ↗
          </button>
        </form>
      </div>
    </div>
  );
}
