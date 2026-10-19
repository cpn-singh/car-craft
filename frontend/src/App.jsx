import React, { useEffect, useState } from 'react';
import Navigation from './components/Navigation.jsx';
import Hero from './components/Hero.jsx';
import Philosophy from './components/Philosophy.jsx';
import Collection from './components/Collection.jsx';
import CompareSection from './components/CompareSection.jsx';
import PartsSection from './components/PartsSection.jsx';
import AdvisorSection from './components/AdvisorSection.jsx';
import Experience from './components/Experience.jsx';
import ClosingSection from './components/ClosingSection.jsx';
import Footer from './components/Footer.jsx';
import FilmModal from './components/FilmModal.jsx';
import BookingModal from './components/BookingModal.jsx';
import CompareModal from './components/CompareModal.jsx';
import SearchModal from './components/SearchModal.jsx';
import AiAdvisorModal from './components/AiAdvisorModal.jsx';

export default function App() {
  const [userState, setUserState] = useState('Maharashtra');

  // Modals
  const [isFilmOpen, setIsFilmOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  const [bookingTab, setBookingTab] = useState('inquiry');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [compareInitialVehicleId, setCompareInitialVehicleId] = useState(null);

  function handleOpenModal(tab = 'inquiry', vehicle = null) {
    setBookingTab(tab);
    setSelectedVehicle(vehicle);
    setIsBookingOpen(true);
  }

  function handleInquireVehicle(vehicle) {
    handleOpenModal('inquiry', vehicle);
  }

  function handleSelectPartOrder(part) {
    handleOpenModal('parts');
  }

  function handleOpenCompare(vehicleId = null) {
    if (vehicleId) {
      setCompareInitialVehicleId(vehicleId);
    }
    setIsCompareOpen(true);
  }

  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  function handleOpenSearchWithQuery(initialQuery = '') {
    setSearchInitialQuery(initialQuery);
    setIsSearchOpen(true);
  }

  // Reveal observer
  useEffect(() => {
    const elements = document.querySelectorAll(
      '.section-label, .intro-grid, .intro-stat-row, .collection-heading, .filters, .car-card, .experience-copy, .closing h2, .compare-section-header, .parts-section-header, .advisor-section-header',
    );
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach((element) => {
      element.classList.add('reveal');
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Navigation with Indian State Selector */}
      <Navigation
        userState={userState}
        onStateChange={setUserState}
        onOpenModal={(tab) => handleOpenModal(tab, null)}
        onOpenCompare={() => handleOpenCompare()}
        onOpenSearch={() => handleOpenSearchWithQuery()}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
      />

      <main>
        {/* Hero with interactive Search Bar */}
        <Hero
          userState={userState}
          onStateChange={setUserState}
          onOpenCompare={() => handleOpenCompare()}
          onOpenSearch={handleOpenSearchWithQuery}
          onOpenAdvisor={() => setIsAdvisorOpen(true)}
        />

        <Philosophy />

        {/* 1. Indian Vehicle Fleet */}
        <Collection
          userState={userState}
          onInquireVehicle={handleInquireVehicle}
          onOpenCompare={handleOpenCompare}
        />

        {/* 2. In-Page Interactive AI Vehicle & Best Dealer Comparison */}
        <CompareSection
          userState={userState}
          onStateChange={setUserState}
          onInquireVehicle={handleInquireVehicle}
        />

        {/* 3. In-Page Genuine Accessories & Parts Showcase */}
        <PartsSection
          userState={userState}
          onSelectPartOrder={handleSelectPartOrder}
        />

        {/* 4. In-Page AI Deal Advisor & Dealership Directory */}
        <AdvisorSection
          userState={userState}
          onSelectInquiry={handleInquireVehicle}
        />

        <Experience onOpenModal={(tab) => handleOpenModal(tab, null)} />
        <ClosingSection onOpenModal={(tab) => handleOpenModal(tab, null)} />
      </main>

      <Footer />

      {/* Interactive Modals */}
      <FilmModal isOpen={isFilmOpen} onClose={() => setIsFilmOpen(false)} />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedVehicle={selectedVehicle}
        initialTab={bookingTab}
        userState={userState}
      />

      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        userState={userState}
        initialVehicleId={compareInitialVehicleId}
        onSelectInquiry={handleInquireVehicle}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        userState={userState}
        initialQuery={searchInitialQuery}
        onSelectInquiry={handleInquireVehicle}
      />

      <AiAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        userState={userState}
        onSelectInquiry={handleInquireVehicle}
      />
    </>
  );
}
