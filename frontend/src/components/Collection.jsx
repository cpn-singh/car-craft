import { useState } from 'react';
import cars from '../data/cars.js';

const filters = [
  { label: 'All vehicles', value: 'all', count: '06' },
  { label: 'The spirited', value: 'sport', count: '02' },
  { label: 'The grand tourers', value: 'grand', count: '02' },
  { label: 'The considered', value: 'electric', count: '02' },
];

function VehicleCard({ car }) {
  // Tilt the picture slightly toward the visitor's pointer.
  function tiltImage(event) {
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    const box = event.currentTarget.getBoundingClientRect();
    const horizontalPosition = (event.clientX - box.left) / box.width - 0.5;
    const verticalPosition = (event.clientY - box.top) / box.height - 0.5;
    const image = event.currentTarget.querySelector('img');
    image.style.transform = `scale(1.055) rotateY(${horizontalPosition * 3}deg) rotateX(${-verticalPosition * 3}deg)`;
  }

  function resetImage() {
    const image = document.querySelector(`[data-car-image="${car.number}"]`);
    if (image) image.style.transform = '';
  }

  const photoUrl = `https://images.unsplash.com/${car.image}?auto=format&fit=crop&w=1100&q=85`;

  return (
    <article className="car-card" data-type={car.category}>
      <a
        href="#contact"
        className="car-image-wrap"
        onPointerMove={tiltImage}
        onPointerLeave={resetImage}
        aria-label={`Ask us about the ${car.name}`}
      >
        <img data-car-image={car.number} src={photoUrl} alt={car.alt} loading="lazy" />
        <span className="car-number">{car.number}</span>
        <span className="car-arrow">↗</span>
      </a>
      <div className="car-meta">
        <div><span className="car-type">{car.label}</span><h3>{car.name}</h3></div>
        <span className="car-price">{car.price}</span>
      </div>
      <div className="car-spec">
        {car.specs.map((spec, index) => (
          <span className="spec-item" key={spec}>
            {index > 0 && <i aria-hidden="true" />}{spec}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function Collection() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  return (
    <section className="collection section-pad" id="collection">
      <div className="section-label"><span>02 / THE COLLECTION</span><span>HANDPICKED. NEVER HURRIED.</span></div>
      <div className="collection-heading">
        <div><h2>Find your <em>feeling.</em></h2><p>Every car has a story. These are a few worth getting to know.</p></div>
        <a className="text-link desktop-link" href="#contact">View all vehicles <span>↗</span></a>
      </div>
      <div className="filters" role="group" aria-label="Filter vehicles">
        {filters.map((filter) => (
          <button
            className={`filter ${selectedFilter === filter.value ? 'active' : ''}`}
            key={filter.value}
            type="button"
            aria-pressed={selectedFilter === filter.value}
            onClick={() => setSelectedFilter(filter.value)}
          >
            {filter.label} <span>{filter.count}</span>
          </button>
        ))}
      </div>
      <div className="car-grid">
        {cars.map((car) => {
          const shouldHideCar = selectedFilter !== 'all' && car.category !== selectedFilter;

          return (
            <div className={`car-card-slot ${shouldHideCar ? 'hidden' : ''}`} key={car.number}>
              <VehicleCard car={car} />
            </div>
          );
        })}
      </div>
      <div className="mobile-all"><a className="text-link" href="#contact">View the full collection <span>↗</span></a></div>
    </section>
  );
}
