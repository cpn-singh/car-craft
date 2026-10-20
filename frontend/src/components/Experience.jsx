/**
 * Experience.jsx
 * -------------------
 * Showroom Experience Section
 * Styled with Tailwind CSS
 */

import React from 'react';

export default function Experience({ onOpenModal, onOpenFilm }) {
  const handleBookViewing = () => {
    if (typeof onOpenModal === 'function') {
      onOpenModal('inquiry');
    } else {
      console.warn("Experience: onOpenModal prop is missing!");
    }
  };

  const handleWatchFilm = () => {
    if (typeof onOpenFilm === 'function') {
      onOpenFilm();
    }
  };

  return (
    <section className="experience grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] px-6 bg-[#171815] min-h-[590px]" id="experience">
      <div className="experience-image relative min-h-[340px] md:min-h-[590px] overflow-hidden group">
        <img
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=2000&q=85"
          alt="A warmly lit automotive atelier showroom with luxury cars"
          className="w-full h-full absolute inset-0 object-cover brightness-[0.73] group-hover:scale-105 transition-transform duration-1000 ease-out"
          loading="lazy"
        />
        <div className="image-caption absolute bottom-6 left-[8%] text-[8px] tracking-[0.18em] text-[#e0ded7] uppercase z-10 drop-shadow-md">
          A SANCTUARY FOR CAR LOVERS <span className="text-[#aaa79e]">— &nbsp; BENGALURU · MUMBAI · DELHI NCR</span>
        </div>
      </div>
      
      <div className="experience-copy py-12 md:py-[73px] px-6 sm:px-[7%] md:pl-[12%] md:pr-[14%] relative flex flex-col justify-center">
        <div className="section-label flex justify-start text-[9px] tracking-[0.22em] text-[#a8a69e] uppercase mb-2">
          <span>06 / THE AUREL INDIA EXPERIENCE</span>
        </div>
        
        <h2 className="font-light text-[clamp(36px,5.5vw,76px)] leading-[1.05] tracking-[-0.065em] text-white my-4">
          Good cars<br />take <em className="font-serif font-normal italic text-[#c5a77a]">time.</em>
        </h2>
        
        <p className="max-w-[390px] text-[11px] leading-[1.9] text-[#a4a49d] mb-3">
          We believe acquiring a vehicle should be an unhurried, transparent celebration.
          No hidden dealership markups, no high-pressure sales pitches.
        </p>
        
        <p className="max-w-[390px] text-[11px] leading-[1.9] text-[#a4a49d] mb-6">
          Unhurried test drives on curated routes, authentic filter coffee or single-origin espresso,
          and transparent on-road invoicing comparing the best dealer discounts in India.
        </p>
        
        <div className="experience-actions flex flex-wrap items-center gap-4">
          <button
            className="button button-outline inline-flex items-center gap-3 min-h-[46px] px-5 text-[10px] tracking-[0.05em] uppercase font-medium border border-white/45 text-[#eee] hover:bg-white/10 transition-all duration-200 hover:-translate-y-0.5 rounded-xs"
            type="button"
            onClick={handleBookViewing}
          >
            Book a Private Atelier Viewing <span className="text-[#c5a77a]">↗</span>
          </button>
          
          {onOpenFilm && (
            <button
              className="play-film inline-flex items-center gap-2.5 text-[#e1dfd8] text-[10px] tracking-[0.04em] uppercase hover:text-white transition-colors cursor-pointer py-2 group"
              type="button"
              onClick={handleWatchFilm}
              aria-label="Watch atelier cinematic film"
            >
              <span className="play-icon w-7 h-7 rounded-full border border-white/30 group-hover:border-[#c5a77a] grid place-items-center text-[9px] text-[#c5a77a] pl-0.5 transition-colors" aria-hidden="true">▶</span>
              <span>Watch film <span className="film-time text-[8px] text-[#a4a49d] ml-1">1:34</span></span>
            </button>
          )}
        </div>
        
        <div className="experience-note text-[8.5px] leading-relaxed tracking-wider text-[#878780] mt-8 uppercase">
          MON – SAT &nbsp; / &nbsp; BY APPOINTMENT<br />
          LAVELLE ROAD, BENGALURU &amp; WORLI, MUMBAI
        </div>
      </div>
    </section>
  );
}
