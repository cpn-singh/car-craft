/**
 * Navigation.jsx
 * -------------------
 * Global Navigation & Mobile Drawer
 * Styled with Tailwind CSS
 */

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

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

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

  const handleOpenSearch = () => {
    if (typeof onOpenSearch === 'function') onOpenSearch();
  };

  const handleOpenModal = (modalType) => {
    if (typeof onOpenModal === 'function') onOpenModal(modalType);
  };

  return (
    <>
      <header className="nav-wrap fixed top-0 left-0 w-full z-40 flex items-center justify-between h-[82px] px-4 sm:px-[6.1%] border-b border-white/[0.13] bg-[#11120f]/85 backdrop-blur-md transition-colors">
        <div className="brand-group flex items-center gap-3 sm:gap-6">
          <a className="brand inline-flex items-center gap-2.5 text-white group" href="#home" aria-label="Aurel home" onClick={closeMenu}>
            <span className="brand-mark font-serif text-[26px] max-sm:text-[21px] max-sm:w-[30px] max-sm:h-[30px] font-normal text-[#c5a77a] border border-[#c5a77a]/70 w-[34px] h-[34px] grid place-items-center group-hover:bg-[#c5a77a]/10 transition-colors">
              A
            </span>
            <span className="brand-name text-xs max-sm:text-[11px] tracking-[0.22em] max-sm:tracking-[0.14em] font-semibold text-white">
              AUREL<span className="brand-sub text-[7px] block tracking-[0.28em] text-[#b4b1a9] mt-[3px] font-normal">INDIA</span>
            </span>
          </a>

          {/* Regional State selector in Navbar */}
          <div className="nav-state-picker hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-[#ccc]">
            <span className="location-pin text-[#c5a77a] font-semibold text-[10px]" aria-hidden="true">IN</span>
            <select
              className="state-dropdown bg-transparent border-0 text-[#eae8e1] text-[11px] outline-none cursor-pointer pr-1"
              value={userState}
              onChange={(e) => onStateChange(e.target.value)}
              title="Filter prices and dealers by state"
              aria-label="Filter prices and dealers by state"
            >
              {(INDIAN_STATES || []).map((s) => (
                <option key={`nav-state-${s}`} value={s} className="bg-[#141714] text-white">{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- Desktop Navigation Links --- */}
        <nav className="nav-links desktop-only hidden md:flex items-center gap-8 text-[#d1d0cb] text-[11px] tracking-wider uppercase font-medium" aria-label="Main navigation">
          <a href="#collection" className="hover:text-[#c5a77a] transition-colors py-2">Cars</a>
          <a href="#compare" className="highlight-gold text-[#c5a77a] hover:text-[#dfcaa7] transition-colors py-2">Compare cars</a>
          <a href="#accessories" className="hover:text-[#c5a77a] transition-colors py-2">Parts &amp; accessories</a>
          <a href="#advisor" className="highlight-gold text-[#c5a77a] hover:text-[#dfcaa7] transition-colors py-2">Dealers</a>
          <button
            type="button"
            className="nav-text-btn hover:text-[#c5a77a] transition-colors cursor-pointer bg-transparent border-0 p-0 text-[11px] tracking-wider uppercase font-medium text-[#d1d0cb]"
            onClick={() => handleOpenModal('service')}
          >
            Service
          </button>
        </nav>

        <div className="nav-right flex items-center gap-3 sm:gap-5">
          {/* Quick Search trigger */}
          <button
            type="button"
            className="nav-search-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 hover:border-[#c5a77a] text-white/80 hover:text-white text-xs transition-colors cursor-pointer bg-white/5"
            onClick={handleOpenSearch}
            title="Search cars, accessories and dealers across India"
            aria-label="Search cars, accessories and dealers"
          >
            <span aria-hidden="true" className="text-[#c5a77a]">⌕</span>
            <span className="search-label-text hidden sm:inline text-[11px] font-medium tracking-wide">Search</span>
          </button>

          <button
            className="nav-cta hidden sm:inline-flex items-center gap-2 text-[11px] tracking-[0.03em] uppercase text-white hover:text-[#c5a77a] transition-colors font-medium cursor-pointer"
            type="button"
            onClick={() => handleOpenModal('inquiry')}
          >
            Talk to a dealer <span className="text-[#c5a77a]">↗</span>
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            className="menu-toggle md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5 bg-transparent border-0 cursor-pointer p-0"
            type="button"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`block w-5 h-[2px] bg-white rounded-full transition-all duration-200 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <i className={`block w-5 h-[2px] bg-white rounded-full transition-all duration-200 ${isMenuOpen ? '-rotate-45 -translate-y-0.5' : ''}`} />
          </button>
        </div>
      </header>

      {/* --- Mobile Drawer Overlay Backdrop --- */}
      {isMenuOpen && (
        <div
          className="nav-backdrop visible fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-[fadeIn_0.2s_ease-out]"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* --- Mobile Drawer --- */}
      <nav
        className={`nav-mobile-drawer fixed top-0 right-0 w-[min(88vw,380px)] h-full bg-[#141714] border-l border-white/15 z-[60] flex flex-col p-6 shadow-2xl transition-transform duration-300 ease-out overflow-y-auto ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Mobile navigation drawer"
        aria-hidden={!isMenuOpen}
      >
        <div className="mobile-drawer-header flex items-center justify-between pb-4 border-b border-white/10">
          <span className="drawer-eyebrow text-[9px] tracking-[0.22em] text-[#c5a77a] uppercase font-semibold">NAVIGATION</span>
          <button
            type="button"
            className="drawer-close-btn w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-white cursor-pointer text-sm"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* State selector inside drawer for mobile */}
        <div className="mobile-drawer-state py-4 border-b border-white/10">
          <span className="drawer-state-label text-[9px] tracking-[0.16em] text-[#888882] uppercase block mb-1.5">YOUR LOCATION:</span>
          <div className="drawer-state-select-wrap flex items-center gap-2 p-2 rounded-xs bg-white/5 border border-white/10">
            <span className="location-pin text-sm" aria-hidden="true">📍</span>
            <select
              value={userState}
              onChange={(e) => {
                onStateChange(e.target.value);
              }}
              className="drawer-state-select bg-transparent border-0 text-white text-xs outline-none w-full cursor-pointer"
              aria-label="Select state in mobile menu"
            >
              {(INDIAN_STATES || []).map((s) => (
                <option key={`drawer-state-${s}`} value={s} className="bg-[#141714] text-white">{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mobile-drawer-links flex flex-col gap-4 py-6 border-b border-white/10 text-xs tracking-wider uppercase font-medium">
          <a href="#collection" onClick={closeMenu} className="flex items-center justify-between text-[#eae8e1] hover:text-[#c5a77a] py-1">
            <span>Cars Collection</span>
            <em className="text-[#c5a77a] not-italic">↗</em>
          </a>
          <a href="#compare" className="highlight-gold flex items-center justify-between text-[#c5a77a] hover:text-[#dfcaa7] py-1" onClick={closeMenu}>
            <span>Compare Cars Side-by-Side</span>
            <em className="not-italic">↗</em>
          </a>
          <a href="#accessories" onClick={closeMenu} className="flex items-center justify-between text-[#eae8e1] hover:text-[#c5a77a] py-1">
            <span>Genuine Parts &amp; Accessories</span>
            <em className="text-[#c5a77a] not-italic">↗</em>
          </a>
          <a href="#advisor" className="highlight-gold flex items-center justify-between text-[#c5a77a] hover:text-[#dfcaa7] py-1" onClick={closeMenu}>
            <span>Authorized Dealerships</span>
            <em className="not-italic">↗</em>
          </a>
          
          <button
            type="button"
            className="mobile-drawer-link-btn flex items-center justify-between text-[#eae8e1] hover:text-[#c5a77a] py-1 bg-transparent border-0 text-left uppercase text-xs font-medium cursor-pointer"
            onClick={() => { 
              closeMenu(); 
              handleOpenModal('service'); 
            }}
          >
            <span>Book Atelier Service</span>
            <em className="text-[#c5a77a] not-italic">↗</em>
          </button>
        </div>

        {/* Action Buttons grouped at the bottom of the drawer */}
        <div className="mobile-drawer-actions flex flex-col gap-2.5 mt-auto pt-6">
          <button
            type="button"
            className="button button-gold mobile-action-btn w-full min-h-[42px] px-4 inline-flex items-center justify-center gap-2 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer"
            onClick={() => { 
              closeMenu(); 
              handleOpenSearch(); 
            }}
          >
            <span>⌕</span> Search Cars &amp; Dealers
          </button>

          <button
            type="button"
            className="button button-outline mobile-action-btn w-full min-h-[42px] px-4 inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 text-white border border-white/25 font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer"
            onClick={() => { 
              closeMenu(); 
              if (typeof onOpenAdvisor === 'function') onOpenAdvisor(); 
            }}
          >
            Ask AI Deal Advisor
          </button>

          <button
            type="button"
            className="button button-light mobile-action-btn w-full min-h-[42px] px-4 inline-flex items-center justify-center gap-2 bg-[#e9e7df] hover:bg-white text-[#191915] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer"
            onClick={() => { 
              closeMenu(); 
              handleOpenModal('inquiry'); 
            }}
          >
            Talk to a Dealer <span className="text-[#c5a77a]">↗</span>
          </button>
        </div>
      </nav>
    </>
  );
}
