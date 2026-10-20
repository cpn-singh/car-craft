/**
 * Footer.jsx
 * -------------------
 * Global Footer
 * Styled with Tailwind CSS
 */

import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = (e) => {
    const homeSection = document.getElementById('home');
    if (homeSection) {
      e.preventDefault();
      homeSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer 
      className="footer min-h-[98px] px-4 sm:px-[6.1%] py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#999991] text-[8px] tracking-[0.14em] border-t border-white/10 uppercase bg-[#11120f]" 
      role="contentinfo"
    >
      <a className="brand inline-flex items-center gap-2.5 text-white group" href="#home" aria-label="Go to Aurel homepage">
        <span className="brand-mark font-serif text-[22px] font-normal text-[#c5a77a] border border-[#c5a77a]/70 w-7 h-7 grid place-items-center group-hover:bg-[#c5a77a]/10 transition-colors" aria-hidden="true">A</span>
        <span className="brand-name text-[11px] tracking-[0.22em] font-semibold text-white">
          AUREL<span className="brand-sub text-[6.5px] block tracking-[0.28em] text-[#b4b1a9] mt-0.5 font-normal">INDIA ATELIER</span>
        </span>
      </a>

      <span className="footer-tagline text-center text-[#888880]">
        CAR DETAILS, COMPARISONS &amp; LOCAL DEALERS.
      </span>

      <span className="copyright text-[#888880]">
        &copy; AUREL INDIA {currentYear}
      </span>

      <a 
        className="back-top text-[#999991] hover:text-[#c5a77a] transition-colors duration-200" 
        href="#home"
        onClick={handleScrollToTop}
        aria-label="Scroll back to top of page"
      >
        BACK TO TOP ↑
      </a>
    </footer>
  );
}
