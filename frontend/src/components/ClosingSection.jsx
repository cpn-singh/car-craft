/**
 * ClosingSection.jsx
 * -------------------
 * Closing Call-to-Action Section
 * Styled with Tailwind CSS
 */

import React from 'react';

export default function ClosingSection({ onOpenModal }) {
  const handleActionClick = (modalTab) => {
    if (typeof onOpenModal === 'function') {
      onOpenModal(modalTab);
    } else {
      console.warn('ClosingSection: onOpenModal prop is missing or not a function!');
    }
  };

  return (
    <section 
      className="closing section-pad relative overflow-hidden pt-16 md:pt-[91px] pb-16 md:pb-[93px] px-[18px] sm:px-[7%] lg:px-[11.5%] bg-[#c6b18e] text-[#191a16]" 
      id="contact"
    >
      <div className="section-label flex justify-between pb-[19px] border-b border-black/20 text-[#544e43] text-[9px] tracking-[0.22em] uppercase font-sans">
        <span>07 / YOUR NEXT CHAPTER</span>
        <span>WE’RE HERE WHEN YOU’RE READY</span>
      </div>
      
      <h2 className="font-light text-[clamp(42px,7vw,110px)] leading-[1.05] tracking-[-0.065em] my-8 md:my-12 text-[#191a16]">
        Shall we take<br />the <em className="font-serif font-normal italic text-[#66553e]">long way?</em>
      </h2>
      
      <div className="closing-actions flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 relative z-10">
        <button
          className="button button-light inline-flex items-center justify-center gap-4 min-h-[49px] px-6 text-[10px] tracking-[0.06em] uppercase font-medium bg-[#191a16] text-[#e8e6df] hover:bg-black transition-all duration-200 hover:-translate-y-0.5 rounded-xs"
          type="button"
          onClick={() => handleActionClick('inquiry')}
        >
          Start a conversation <span className="text-[#c5a77a] text-sm">↗</span>
        </button>
        
        <button
          className="button button-outline closing-secondary inline-flex items-center justify-center gap-4 min-h-[49px] px-6 text-[10px] tracking-[0.06em] uppercase font-medium bg-transparent text-[#20251f] border border-[#20251f]/50 hover:bg-[#20251f]/10 transition-all duration-200 hover:-translate-y-0.5 rounded-xs"
          type="button"
          onClick={() => handleActionClick('service')}
        >
          Book Atelier Service <span className="text-sm">↗</span>
        </button>
      </div>
      
      <div 
        className="closing-mark absolute right-[5%] md:right-[8%] -bottom-[90px] sm:-bottom-[130px] md:-bottom-[184px] font-serif text-[260px] sm:text-[380px] md:text-[570px] leading-none text-white/15 pointer-events-none select-none" 
        aria-hidden="true"
      >
        A
      </div>
    </section>
  );
}
