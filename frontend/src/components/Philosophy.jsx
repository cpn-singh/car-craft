/**
 * Philosophy.jsx
 * -------------------
 * Brand Philosophy & Three-Step Process
 * Styled with Tailwind CSS
 */

import React from 'react';

export default function Philosophy() {
  const handleHelpClick = (e) => {
    const target = document.getElementById('experience');
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="intro section-pad pt-16 md:pt-[126px] pb-16 md:pb-[119px] px-[18px] sm:px-[7%] lg:px-[11.5%]" 
      id="philosophy" 
      aria-labelledby="philosophy-heading"
    >
      <div className="section-label flex justify-between pb-[19px] border-b border-[rgba(234,232,225,0.22)] text-[9px] tracking-[0.22em] text-[#c9c5ba] uppercase font-sans">
        <span>01 / A BETTER STARTING POINT</span>
        <span>THE DETAILS, MADE CLEAR</span>
      </div>
      
      <div className="intro-grid grid grid-cols-1 md:grid-cols-[1fr_0.74fr] gap-8 md:gap-[10%] items-start pt-8 md:pt-10">
        <h2 
          id="philosophy-heading" 
          className="intro-kicker font-light text-[clamp(32px,5.1vw,70px)] leading-[1.1] tracking-[-0.065em] m-0 text-white"
        >
          Good decisions<br />start with <em className="font-serif font-normal not-italic italic text-[#c5a77a] tracking-[-0.04em]">clarity.</em>
        </h2>
        
        <div className="intro-copy max-w-[410px] pt-1.5 text-[#a9aaa3] text-xs leading-relaxed">
          <p className="mb-4">Buying a car means balancing a lot: space, running costs, safety, and the price you will actually pay.</p>
          <p className="mb-4">We bring the useful details together so you can compare at your own pace, then speak with a dealer when you are ready.</p>
          
          <a 
            className="text-link inline-flex items-center gap-2 text-white hover:text-[#c5a77a] transition-colors duration-200 text-xs group" 
            href="#experience" 
            onClick={handleHelpClick}
          >
            See how we can help <span aria-hidden="true" className="text-[#c5a77a] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
          </a>
        </div>
      </div>
      
      <div className="intro-stat-row border-t border-[rgba(234,232,225,0.22)] mt-12 md:mt-[78px] pt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[1fr_1fr_1fr_1.3fr] gap-6 items-start">
        <div className="flex flex-col gap-2">
          <b aria-hidden="true" className="font-light text-2xl md:text-[32px] tracking-[-0.05em] text-white">01</b>
          <span className="text-[8px] tracking-[0.17em] text-[#92938b] uppercase">COMPARE MODELS</span>
        </div>
        <div className="flex flex-col gap-2">
          <b aria-hidden="true" className="font-light text-2xl md:text-[32px] tracking-[-0.05em] text-white">02</b>
          <span className="text-[8px] tracking-[0.17em] text-[#92938b] uppercase">CHECK THE DETAILS</span>
        </div>
        <div className="flex flex-col gap-2">
          <b aria-hidden="true" className="font-light text-2xl md:text-[32px] tracking-[-0.05em] text-white">03</b>
          <span className="text-[8px] tracking-[0.17em] text-[#92938b] uppercase">CONTACT A DEALER</span>
        </div>
        
        <div className="stat-quote col-span-2 sm:col-span-3 md:col-span-1 font-serif italic text-[#b8a98f] text-sm md:text-base leading-snug pt-3 md:pt-0 md:pl-6 md:border-l md:border-[rgba(234,232,225,0.15)]">
          “A little more clarity makes<br />the choice feel like yours.”
        </div>
      </div>
    </section>
  );
}
