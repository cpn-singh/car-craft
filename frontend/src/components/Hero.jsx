/**
 * Hero.jsx
 * -------------------
 * Landing Page Hero & Quick Search
 * Styled with Tailwind CSS
 */

import React, { useState } from 'react';
import { INDIAN_STATES } from '../services/api.js';

export default function Hero({ 
  userState, 
  onStateChange, 
  onOpenCompare, 
  onOpenSearch, 
  onOpenAdvisor
}) {
  const [quickSearch, setQuickSearch] = useState('');

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    if (!quickSearch || !quickSearch.trim()) return;
    onOpenSearch(quickSearch.trim());
  };

  return (
    <section 
      className="hero relative min-h-[680px] h-[min(880px,100svh)] overflow-hidden flex items-center px-4 sm:px-[7%] lg:px-[11.5%] pt-[100px] pb-[50px]" 
      id="home" 
      role="banner"
    >
      {/* Background image fallback with zoom animation */}
      <div 
        className="hero-backdrop absolute inset-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=90')] bg-center bg-cover scale-[1.04] animate-[hero-zoom_16s_ease-out_forwards]" 
      />
      
      {/* Ambient background video */}
      <video
        className="hero-video absolute inset-0 w-full h-full object-cover opacity-70 animate-[hero-zoom_18s_ease-out_forwards]"
        autoPlay
        muted
        loop
        playsInline
        poster="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=90"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Luxury Scrim gradient overlay */}
      <div 
        className="hero-scrim absolute inset-0 w-full h-full bg-[linear-gradient(90deg,rgba(10,11,10,.85),rgba(10,11,10,.42)_46%,rgba(10,11,10,.08)),linear-gradient(0deg,rgba(10,11,10,.8),transparent_35%,rgba(10,11,10,.25))] pointer-events-none" 
      />

      <div className="hero-content relative z-10 max-w-2xl mt-7 animate-[enter_1.2s_0.15s_both]">
        <div className="eyebrow hero-eyebrow flex items-center gap-3 text-[9px] tracking-[0.22em] text-[#c9c5ba] uppercase font-sans mb-3">
          <span className="eyebrow-line h-[1px] w-7 bg-[#c5a77a]" />
          A MORE CONSIDERED WAY TO BUY
          <span className="eyebrow-line h-[1px] w-7 bg-[#c5a77a]" />
        </div>

        <h1 className="font-light text-[clamp(34px,5.8vw,78px)] leading-[1.08] tracking-[-0.065em] text-white my-3">
          Find the car<br />
          that feels <em className="font-serif font-normal italic text-[#c5a77a] tracking-[-0.04em]">right.</em>
        </h1>

        <p className="hero-copy max-w-lg text-xs sm:text-sm text-[#dcdad2] leading-relaxed mb-6 font-normal">
          Compare the details that matter, explore trusted listings, and get a clearer picture of what your next car will cost.
        </p>

        {/* --- In-page Interactive Quick Search Bar --- */}
        <form 
          className="hero-search-box bg-[#181916]/90 backdrop-blur-md border border-white/15 p-2 rounded-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl shadow-2xl" 
          onSubmit={handleQuickSearchSubmit}
        >
          <div className="hero-search-input-group flex items-center gap-2.5 flex-1 px-3 py-2 border-b sm:border-b-0 sm:border-r border-white/10">
            <span className="hero-search-icon text-[#c5a77a] text-base" aria-hidden="true">⌕</span>
            <input
              type="text"
              className="hero-search-input bg-transparent border-0 outline-none text-white text-xs placeholder:text-[#888880] w-full"
              placeholder="Try a model, brand or accessory"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
            />
          </div>

          <div className="hero-state-picker-group flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#a9aaa3]">
            <span className="hero-pin text-[#c5a77a] font-semibold text-[11px]" aria-hidden="true">IN</span>
            <select
              className="hero-state-select bg-transparent border-0 text-white text-xs outline-none cursor-pointer pr-1"
              value={userState}
              onChange={(e) => onStateChange(e.target.value)}
              aria-label="Filter by state"
            >
              {(INDIAN_STATES || []).map((s) => (
                <option key={`hero-state-${s}`} value={s} className="bg-[#181916] text-white">{s}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            className="hero-search-btn inline-flex items-center justify-center gap-2 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-xs transition-colors cursor-pointer disabled:opacity-50"
            disabled={!quickSearch.trim()}
          >
            Search cars <span aria-hidden="true">↗</span>
          </button>
        </form>

        {/* --- Quick popular search tags --- */}
        <div className="hero-quick-tags flex flex-wrap items-center gap-2 mt-3.5 text-[10px] text-[#888880]">
          <span className="quick-tag-label text-[9px] uppercase tracking-wider text-[#aaa]">Popular searches:</span>
          {['SUVs', 'Electric cars', 'Family cars'].map((tag, idx) => (
            <button
              key={`tag-${idx}`}
              type="button"
              className="quick-tag-pill bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c5a77a]/50 text-[#d1d0cb] px-2.5 py-1 rounded-full text-[10px] transition-colors cursor-pointer"
              onClick={() => onOpenSearch(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* --- Hero Actions --- */}
        <div className="hero-actions flex flex-wrap items-center gap-3.5 mt-7">
          <a 
            href="#compare" 
            className="button button-gold inline-flex items-center justify-center gap-3 min-h-[42px] px-5 bg-[#c5a77a] hover:bg-[#b39364] text-[#11120f] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-all hover:-translate-y-0.5"
          >
            Compare cars
          </a>
          <a 
            href="#accessories" 
            className="button button-outline inline-flex items-center justify-center gap-3 min-h-[42px] px-5 bg-transparent hover:bg-white/10 text-white border border-white/30 font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-all hover:-translate-y-0.5"
          >
            Browse accessories
          </a>
          <a 
            href="#advisor" 
            className="button button-light inline-flex items-center justify-center gap-3 min-h-[42px] px-5 bg-[#e9e7df] hover:bg-white text-[#191915] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-all hover:-translate-y-0.5"
          >
            Talk to a specialist
          </a>
        </div>
      </div>

      {/* --- Desktop Decorative Details --- */}
      <div className="hero-index hidden lg:block absolute right-[6.1%] top-[48%] text-[9px] tracking-[0.16em] text-[#d5d4ce] uppercase">
        <span className="text-[#c5a77a]">MADE FOR INDIA</span>
        <span className="index-rule inline-block w-[52px] h-[1px] bg-white/40 align-middle mx-2.5" /> 
        CLEAR PRICES · USEFUL DETAILS
      </div>
      
      <div className="hero-side-note hidden lg:flex absolute right-[6.3%] bottom-[21%] text-[8px] tracking-[0.18em] [writing-mode:vertical-rl] gap-4 items-center text-[#ccc9c0] uppercase">
        EXPLORE THE COLLECTION <span aria-hidden="true" className="text-[#c5a77a] text-base">↓</span>
      </div>
      
      <div className="hero-bottom hidden md:flex absolute bottom-7 left-[6.1%] right-[6.1%] justify-between text-[8px] tracking-[0.17em] text-[#c7c4bb] uppercase">
        <span>EST. INDIA · BENGALURU · MUMBAI · DELHI</span>
        <span>100% INDIAN SPECIFICATIONS &amp; INR PRICING</span>
      </div>
    </section>
  );
}
