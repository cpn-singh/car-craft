import { useEffect, useState } from 'react';
import Navigation from './components/Navigation.jsx';
import Hero from './components/Hero.jsx';
import Philosophy from './components/Philosophy.jsx';
import Collection from './components/Collection.jsx';
import Experience from './components/Experience.jsx';
import ClosingSection from './components/ClosingSection.jsx';
import Footer from './components/Footer.jsx';
import FilmModal from './components/FilmModal.jsx';

export default function App() {
  const [isFilmOpen, setIsFilmOpen] = useState(false);

  // Add a soft light that follows the mouse on desktop screens.
  useEffect(() => {
    const glow = document.querySelector('.cursor-glow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let lightX = mouseX;
    let lightY = mouseY;
    let animationFrame;

    function rememberMousePosition(event) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      glow.style.opacity = '1';
    }

    function moveLight() {
      lightX += (mouseX - lightX) * 0.13;
      lightY += (mouseY - lightY) * 0.13;
      glow.style.left = `${lightX}px`;
      glow.style.top = `${lightY}px`;
      animationFrame = requestAnimationFrame(moveLight);
    }

    window.addEventListener('pointermove', rememberMousePosition);
    animationFrame = requestAnimationFrame(moveLight);

    return () => {
      window.removeEventListener('pointermove', rememberMousePosition);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Fade page sections into view as the visitor scrolls down.
  useEffect(() => {
    const elements = document.querySelectorAll(
      '.section-label, .intro-grid, .intro-stat-row, .collection-heading, .filters, .car-card, .experience-copy, .closing h2',
    );
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach((element) => {
      element.classList.add('reveal');
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="cursor-glow" aria-hidden="true" />
      <Navigation />
      <main>
        <Hero onPlayFilm={() => setIsFilmOpen(true)} />
        <Philosophy />
        <Collection />
        <Experience />
        <ClosingSection />
      </main>
      <Footer />
      <FilmModal isOpen={isFilmOpen} onClose={() => setIsFilmOpen(false)} />
    </>
  );
}
