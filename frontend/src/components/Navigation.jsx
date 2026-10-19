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
    <header className="nav-wrap fixed inset-x-0 top-0 z-50 flex h-[76px] items-center justify-between border-b border-white/15 bg-atelier-ink/95 px-[5.5%] backdrop-blur-md max-[700px]:h-[68px] max-[700px]:px-5">
      <div className="brand-group flex items-center gap-6">
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

      <nav className={`nav-links hidden items-center gap-8 text-xs min-[701px]:flex ${isMenuOpen ? 'open max-[700px]:absolute max-[700px]:left-0 max-[700px]:right-0 max-[700px]:top-[68px] max-[700px]:z-50 max-[700px]:flex max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-0 max-[700px]:border-b max-[700px]:border-white/10 max-[700px]:bg-atelier-ink max-[700px]:px-5' : ''}`} aria-label="Main navigation">
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
          className="menu-toggle hidden cursor-pointer max-[700px]:flex"
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
