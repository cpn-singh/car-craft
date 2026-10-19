import React, { useState } from 'react';
import { INDIAN_STATES } from '../services/api.js';

export default function Hero({ userState, onStateChange, onOpenCompare, onOpenSearch, onOpenAdvisor }) {
  const [quickSearch, setQuickSearch] = useState('');

  function handleQuickSearchSubmit(e) {
    e.preventDefault();
    onOpenSearch(quickSearch);
  }

  return (
    <section className="hero" id="home">
      <div className="hero-backdrop" />
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=90"
      >
        <source src="https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_25fps.mp4" type="video/mp4" />
      </video>
      <div className="hero-scrim" />

      <div className="hero-content">
        <div className="eyebrow hero-eyebrow">
          <span className="eyebrow-line" />
          A MORE CONSIDERED WAY TO BUY
          <span className="eyebrow-line" />
        </div>

        <h1>
          Find the car<br />
          that feels <em>right.</em>
        </h1>

        <p className="hero-copy">
          Compare the details that matter, explore trusted listings, and get a clearer picture of what your next car will cost.
        </p>

        {/* In-page Interactive Quick Search Bar */}
        <form className="hero-search-box" onSubmit={handleQuickSearchSubmit}>
          <div className="hero-search-input-group">
            <span className="hero-search-icon" aria-hidden="true">⌕</span>
            <input
              type="text"
              className="hero-search-input"
              placeholder="Try a model, brand or accessory"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
            />
          </div>

          <div className="hero-state-picker-group">
            <span className="hero-pin" aria-hidden="true">IN</span>
            <select
              className="hero-state-select"
              value={userState}
              onChange={(e) => onStateChange(e.target.value)}
              aria-label="Filter by state"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="button button-gold hero-search-btn">
            Search cars <span aria-hidden="true">↗</span>
          </button>
        </form>

        {/* Quick popular search tags */}
        <div className="hero-quick-tags">
          <span className="quick-tag-label">Popular searches</span>
          {['SUVs', 'Electric cars', 'Family cars'].map((tag) => (
            <button
              key={tag}
              type="button"
              className="quick-tag-pill"
              onClick={() => onOpenSearch(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="hero-actions">
          <a href="#compare" className="button button-gold">
              Compare cars
          </a>
          <a href="#accessories" className="button button-outline">
            Browse accessories
          </a>
          <a href="#advisor" className="button button-light">
            Talk to a specialist
          </a>
        </div>
      </div>

      <div className="hero-index">
        <span>MADE FOR INDIA</span><span className="index-rule" /> CLEAR PRICES · USEFUL DETAILS
      </div>
      <div className="hero-side-note">
        EXPLORE THE COLLECTION <span>↓</span>
      </div>
      <div className="hero-bottom">
        <span>EST. INDIA · BENGALURU · MUMBAI · DELHI</span>
        <span>100% INDIAN SPECIFICATIONS &amp; INR PRICING</span>
      </div>
    </section>
  );
}
