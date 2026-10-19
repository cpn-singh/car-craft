import React from 'react';

export default function Experience({ onOpenModal, onOpenFilm }) {
  return (
    <section className="experience" id="experience">
      <div className="experience-image">
        <img
          src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=2000&q=85"
          alt="A warmly lit automotive atelier showroom with luxury cars"
          loading="lazy"
        />
        <div className="image-caption">
          A SANCTUARY FOR CAR LOVERS <span>— &nbsp; BENGALURU · MUMBAI · DELHI NCR</span>
        </div>
      </div>
      <div className="experience-copy">
        <div className="section-label">
          <span>06 / THE AUREL INDIA EXPERIENCE</span>
        </div>
        <h2>Good cars<br />take <em>time.</em></h2>
        <p>
          We believe acquiring a vehicle should be an unhurried, transparent celebration.
          No hidden dealership markups, no high-pressure sales pitches.
        </p>
        <p>
          Unhurried test drives on curated routes, authentic filter coffee or single-origin espresso,
          and transparent on-road invoicing comparing the best dealer discounts in India.
        </p>
        <div className="experience-actions">
          <button
            className="button button-outline"
            type="button"
            onClick={() => onOpenModal('inquiry')}
          >
            Book a Private Atelier Viewing <span>↗</span>
          </button>
          {onOpenFilm && (
            <button
              className="play-film"
              type="button"
              onClick={onOpenFilm}
              aria-label="Watch atelier cinematic film"
            >
              <span className="play-icon" aria-hidden="true">▶</span>
              <span>Watch film <span className="film-time">1:34</span></span>
            </button>
          )}
        </div>
        <div className="experience-note">
          MON – SAT &nbsp; / &nbsp; BY APPOINTMENT<br />
          LAVELLE ROAD, BENGALURU &amp; WORLI, MUMBAI
        </div>
      </div>
    </section>
  );
}
