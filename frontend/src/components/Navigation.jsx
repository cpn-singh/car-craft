import React, { useState } from 'react';
import { INDIAN_STATES } from '../services/api.js';

export default function Navigation({
  userState,
  onStateChange,
  onOpenModal,
  onOpenCompare,
  onOpenSearch,
  onOpenAdvisor,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="nav-wrap">
      <div className="brand-group">
        <a className="brand" href="#home" aria-label="Aurel home">
          <span className="brand-mark">A</span>
          <span className="brand-name">
          AUREL<span className="brand-sub">INDIA</span>
          </span>
        </a>

        <div className="nav-state-picker">
          <span className="location-pin" aria-hidden="true">IN</span>
          <select
            className="state-dropdown"
            value={userState}
            onChange={(e) => onStateChange(e.target.value)}
            title="Filter prices and dealers by state"
          >
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`} aria-label="Main navigation">
        <a href="#collection" onClick={closeMenu}>Cars</a>
        <a href="#compare" className="highlight-gold" onClick={closeMenu}>Compare cars</a>
        <a href="#accessories" onClick={closeMenu}>Parts &amp; accessories</a>
        <a href="#advisor" className="highlight-gold" onClick={closeMenu}>Dealers</a>
        <button
          type="button"
          className="nav-text-btn"
          onClick={() => { closeMenu(); onOpenModal('service'); }}
        >
          Service
        </button>
      </nav>

      <div className="nav-right">
        {/* Search button */}
        <button
          type="button"
          className="nav-search-btn"
          onClick={onOpenSearch}
          title="Search cars, accessories and dealers across India"
        >
          <span aria-hidden="true">⌕</span> Search
        </button>

        <button
          className="nav-cta"
          type="button"
          onClick={() => onOpenModal('inquiry')}
        >
          Talk to a dealer <span>↗</span>
        </button>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i /><i />
        </button>
      </div>
    </header>
  );
}
