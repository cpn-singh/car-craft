/**
 * AiAdvisorModal.jsx
 * -------------------
 * AI Advisor & Best Price Negotiator Modal
 * Styled with Tailwind CSS
 */

import React, { useState, useEffect, useRef } from 'react';
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

  const chatEndRef = useRef(null);

  const quickPrompts = [
    'Suggest the best 7-seater diesel SUV under ₹30 Lakhs with cheapest dealer',
    'Which is cheaper: Mahindra XUV700 or Tata Safari in Maharashtra?',
    'Find best deals on Tata Nexon EV with subsidy in Karnataka',
    'Recommend top 4K dashcam for Indian roads with installation'
  ];

  useEffect(() => {
    if (userState) {
      setSelectedState(userState);
    }
  }, [userState]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [conversation, loading]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async (textToSend) => {
    const q = typeof textToSend === 'string' ? textToSend : query;
    if (!q || !q.trim()) return;

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
      console.error("AI Advisor API failed:", err);
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
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.25s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-card advisor-modal-card relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#171814] border border-[#c5a77a]/30 shadow-2xl p-5 sm:p-8 text-white rounded-xs overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close absolute top-5 right-5 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:border-[#c5a77a] transition-colors cursor-pointer text-sm z-10"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        <div className="advisor-header pb-4 border-b border-white/10 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-10">
            <div>
              <span className="modal-eyebrow text-[9px] tracking-[0.22em] text-[#c5a77a] uppercase font-semibold block mb-1">
                AUREL AI AUTOMOTIVE CONSULTANT · INDIA
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-light text-white m-0">
                AI Advisor &amp; Best Price Negotiator
              </h2>
            </div>
            <div className="state-picker-group flex items-center gap-2 text-xs text-[#aaa]">
              <label htmlFor="advisor-state-select" className="text-[10px] uppercase tracking-wider text-[#888]">Your State:</label>
              <select
                id="advisor-state-select"
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
        </div>

        {/* --- Quick Prompts --- */}
        <div className="quick-prompts-bar flex items-center gap-2 overflow-x-auto py-3 border-b border-white/10 shrink-0">
          <span className="quick-label text-[10px] text-[#888] uppercase tracking-wider shrink-0">Try asking:</span>
          {quickPrompts.map((p, index) => (
            <button
              key={`prompt-${index}`}
              type="button"
              className="quick-chip whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#ccc] hover:border-[#c5a77a] hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              onClick={() => handleSend(p)}
              disabled={loading}
            >
              &quot;{p}&quot;
            </button>
          ))}
        </div>

        {/* --- Conversation Stream --- */}
        <div className="advisor-chat-stream flex-1 overflow-y-auto space-y-4 py-4 pr-2">
          {conversation.map((msg, idx) => (
            <div
              key={`msg-${idx}`}
              className={`chat-bubble-wrap flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse justify-start' : 'justify-start'}`}
            >
              <div className={`chat-avatar w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm border ${msg.sender === 'user' ? 'bg-[#c5a77a] border-[#c5a77a]' : 'bg-white/10 border-white/15'
                }`}>
                {msg.sender === 'ai' ? '🤖' : '👤'}
              </div>
              <div className={`chat-bubble max-w-2xl p-4 rounded-xs text-xs leading-relaxed ${msg.sender === 'user'
                  ? 'bg-[#c5a77a] text-[#11120f] font-medium'
                  : 'bg-[#1c211c] text-[#eae8e1] border border-white/10'
                }`}>
                <div className="chat-text" style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>

                {/* Recommended Vehicles Cards */}
                {msg.vehicles && msg.vehicles.length > 0 && (
                  <div className="chat-recs-grid grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {msg.vehicles.map((v) => (
                      <div className="chat-car-card bg-[#141714] border border-white/10 rounded-xs overflow-hidden p-3 text-xs flex flex-col justify-between" key={v.id}>
                        {v.image_url && <img src={v.image_url} alt={v.name} className="chat-car-img w-full h-28 object-cover rounded-xs mb-2" />}
                        <div className="chat-car-info space-y-1">
                          <h4 className="font-semibold text-white text-sm">{v.name}</h4>
                          <span className="chat-car-price text-[#c5a77a] font-bold block">{v.price} · {v.fuel_type}</span>
                          <span className="chat-car-stats text-[10px] text-[#888] block">🛡️ {v.safety} · ⛽ {v.mileage}</span>

                          {v.best_dealer && (
                            <div className="chat-dealer-box bg-white/5 border border-[#c5a77a]-500/30 p-2.5 rounded-xs my-2 text-[11px] space-y-1">
                              <span className="chat-best-title text-[9px] uppercase tracking-wider text-[#c5a77a]-400 font-bold block">
                                🏆 CHEAPEST DEALER ({v.best_dealer.state}):
                              </span>
                              <strong className="text-white block">{v.best_dealer.name}</strong> ({v.best_dealer.city})
                              <div className="chat-deal-highlight text-[#c5a77a]-400 font-bold">
                                Best Offer: {v.best_offer_price}
                                {v.best_dealer.discount && ` (Save ₹${v.best_dealer.discount.toLocaleString()})`}
                              </div>
                              <div className="chat-dealer-contact text-[10px] text-[#888]">
                                📍 {v.best_dealer.address} · 📞 <a href={`tel:${v.best_dealer.phone}`} className="text-[#c5a77a] hover:underline">{v.best_dealer.phone}</a>
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            className="button button-gold-sm w-full py-2 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer mt-2"
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
            <div className="chat-bubble-wrap flex gap-3 justify-start">
              <div className="chat-avatar w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm bg-white/10 border border-white/15">🤖</div>
              <div className="chat-bubble bg-[#1c211c] text-[#eae8e1] border border-white/10 p-4 rounded-xs text-xs space-y-2">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-[#c5a77a] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#c5a77a] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#c5a77a] animate-bounce [animation-delay:0.4s]" />
                </div>
                <small className="text-[#888]">Consulting Indian dealer pricing database &amp; calculating best discounts...</small>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* --- Input Footer --- */}
        <form
          className="advisor-input-form flex gap-2.5 pt-4 border-t border-white/10 shrink-0"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            className="advisor-input flex-1 bg-[#11120f] border border-white/15 rounded-xs px-4 py-2.5 text-xs text-white placeholder:text-[#888] outline-none focus:border-[#c5a77a]"
            placeholder={`Ask about cars, accessories, discounts, or dealers in ${selectedState}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="button button-gold px-5 py-2.5 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[11px] uppercase tracking-wider rounded-xs transition-colors cursor-pointer disabled:opacity-50"
            disabled={loading || !query.trim()}
          >
            Ask AI ↗
          </button>
        </form>
      </div>
    </div>
  );
}
