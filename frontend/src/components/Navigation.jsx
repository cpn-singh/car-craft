import React, { useState, useEffect } from 'react';
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

  // Close menu on Escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="nav-wrap">
        <div className="brand-group">
          <a className="brand" href="#home" aria-label="Aurel home" onClick={closeMenu}>
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
              aria-label="Filter prices and dealers by state"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links desktop-only" aria-label="Main navigation">
          <a href="#collection">Cars</a>
          <a href="#compare" className="highlight-gold">Compare cars</a>
          <a href="#accessories">Parts &amp; accessories</a>
          <a href="#advisor" className="highlight-gold">Dealers</a>
          <button
            type="button"
            className="nav-text-btn"
            onClick={() => onOpenModal('service')}
          >
            Service
          </button>
        </nav>

        <div className="nav-right">
          {/* Quick Search trigger - icon on small screens, full text on desktop */}
          <button
            type="button"
            className="nav-search-btn"
            onClick={onOpenSearch}
            title="Search cars, accessories and dealers across India"
            aria-label="Search cars, accessories and dealers"
          >
            <span aria-hidden="true">⌕</span>
            <span className="search-label-text">Search</span>
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
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i /><i />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay Backdrop */}
      {isMenuOpen && (
        <div
          className="nav-backdrop visible"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <nav
        className={`nav-mobile-drawer ${isMenuOpen ? 'open' : ''}`}
        aria-label="Mobile navigation drawer"
        aria-hidden={!isMenuOpen}
      >
        <div className="mobile-drawer-header">
          <span className="drawer-eyebrow">NAVIGATION</span>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* State selector inside drawer for mobile visitors */}
        <div className="mobile-drawer-state">
          <span className="drawer-state-label">YOUR LOCATION:</span>
          <div className="drawer-state-select-wrap">
            <span className="location-pin" aria-hidden="true">📍</span>
            <select
              value={userState}
              onChange={(e) => onStateChange(e.target.value)}
              className="drawer-state-select"
              aria-label="Select state in mobile menu"
            >
              {INDIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mobile-drawer-links">
          <a href="#collection" onClick={closeMenu}>
            <span>Cars Collection</span>
            <em>↗</em>
          </a>
          <a href="#compare" className="highlight-gold" onClick={closeMenu}>
            <span>Compare Cars Side-by-Side</span>
            <em>↗</em>
          </a>
          <a href="#accessories" onClick={closeMenu}>
            <span>Genuine Parts &amp; Accessories</span>
            <em>↗</em>
          </a>
          <a href="#advisor" className="highlight-gold" onClick={closeMenu}>
            <span>Authorized Dealerships</span>
            <em>↗</em>
          </a>
          <button
            type="button"
            className="mobile-drawer-link-btn"
            onClick={() => { closeMenu(); onOpenModal('service'); }}
          >
            <span>Book Atelier Service</span>
            <em>↗</em>
          </button>
        </div>

        <div className="mobile-drawer-actions">
          <button
            type="button"
            className="button button-gold mobile-action-btn"
            onClick={() => { closeMenu(); onOpenSearch(); }}
          >
            <span>⌕</span> Search Cars &amp; Dealers
          </button>

          <button
            type="button"
            className="button button-outline mobile-action-btn"
            onClick={() => { closeMenu(); onOpenAdvisor(); }}
          >
            <span>✨</span> Ask AI Deal Advisor
          </button>

          <button
            type="button"
            className="button button-light mobile-action-btn"
            onClick={() => { closeMenu(); onOpenModal('inquiry'); }}
          >
            Talk to a Dealer <span>↗</span>
          </button>
        </div>
      </nav>
    </>
  );
}
