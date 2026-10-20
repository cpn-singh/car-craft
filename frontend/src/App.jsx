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
import AuthModal from './components/AuthModal.jsx';
import CompareFloatingBar from './components/CompareFloatingBar.jsx';
import { getCurrentUser, logoutUser } from './services/api.js';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [userState, setUserState] = useState(currentUser?.state || 'Maharashtra');

  // Modals
  const [isFilmOpen, setIsFilmOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('login');

  const [bookingTab, setBookingTab] = useState('inquiry');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Compare multi-select state
  const [compareMode, setCompareMode] = useState('vehicles'); // 'vehicles' | 'parts'
  const [selectedCompareCars, setSelectedCompareCars] = useState([]);
  const [selectedCompareParts, setSelectedCompareParts] = useState([]);
  const [compareModalInitialIds, setCompareModalInitialIds] = useState(null);
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
      setCompareModalInitialIds([Number(vehicleId)]);
      setCompareMode('vehicles');
    } else if (selectedCompareCars.length > 0) {
      setCompareModalInitialIds(selectedCompareCars.map((c) => c.id));
      setCompareMode('vehicles');
    } else {
      setCompareModalInitialIds(null);
    }
    setIsCompareOpen(true);
  }

  function handleToggleCompareCar(car) {
    setCompareMode('vehicles');
    setSelectedCompareCars((prev) => {
      const exists = prev.some((c) => c.id === car.id);
      if (exists) {
        return prev.filter((c) => c.id !== car.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), { id: car.id, name: car.name, image: car.full_image_url }];
      }
      return [...prev, { id: car.id, name: car.name, image: car.full_image_url }];
    });
  }

  function handleToggleComparePart(part) {
    setCompareMode('parts');
    setSelectedCompareParts((prev) => {
      const exists = prev.some((p) => p.id === part.id);
      if (exists) {
        return prev.filter((p) => p.id !== part.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), { id: part.id, name: part.name, image: part.image_url }];
      }
      return [...prev, { id: part.id, name: part.name, image: part.image_url }];
    });
  }

  function handleRemoveCompareItem(id) {
    if (compareMode === 'vehicles') {
      setSelectedCompareCars((prev) => prev.filter((item) => item.id !== id));
    } else {
      setSelectedCompareParts((prev) => prev.filter((item) => item.id !== id));
    }
  }

  function handleClearCompare() {
    if (compareMode === 'vehicles') {
      setSelectedCompareCars([]);
    } else {
      setSelectedCompareParts([]);
    }
  }

  function handleLaunchMultiCompare() {
    if (compareMode === 'vehicles' && selectedCompareCars.length > 0) {
      setCompareModalInitialIds(selectedCompareCars.map((c) => c.id));
    } else if (compareMode === 'parts' && selectedCompareParts.length > 0) {
      setCompareModalInitialIds(selectedCompareParts.map((p) => p.id));
    }
    setIsCompareOpen(true);
  }

  // Auth handlers
  function handleOpenAuth(initialTab = 'login') {
    setAuthInitialTab(initialTab);
    setIsAuthOpen(true);
  }

  function handleAuthSuccess(user) {
    setCurrentUser(user);
    if (user?.state && user.state !== 'All India') {
      setUserState(user.state);
    }
  }

  function handleLogout() {
    logoutUser();
    setCurrentUser(null);
  }

  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  function handleOpenSearchWithQuery(initialQuery = '') {
    setSearchInitialQuery(initialQuery);
    setIsSearchOpen(true);
  }

  // Reveal observer with viewport check and fallback guarantee
  useEffect(() => {
    const selector =
      '.section-label, .intro-grid, .intro-stat-row, .collection-heading, .filters, .car-card, .experience-copy, .closing h2, .compare-section-header, .parts-section-header, .advisor-section-header';
    const elements = document.querySelectorAll(selector);

    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '60px 0px 60px 0px' },
    );

    elements.forEach((element) => {
      element.classList.add('reveal');
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight + 60) {
        element.classList.add('visible');
      } else {
        observer.observe(element);
      }
    });

    // Failsafe: reveal all content after 500ms so no section remains hidden
    const timer = setTimeout(() => {
      elements.forEach((el) => el.classList.add('visible'));
    }, 500);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const anyModalOpen = isFilmOpen || isBookingOpen || isCompareOpen || isSearchOpen || isAdvisorOpen || isAuthOpen;

  useEffect(() => {
    // Clear any stuck inline overflow from previous sessions
    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }

    if (anyModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [anyModalOpen]);

  return (
    <>
      {/* Navigation with Indian State Selector and User Auth */}
      <Navigation
        userState={userState}
        onStateChange={setUserState}
        onOpenModal={(tab) => handleOpenModal(tab, null)}
        onOpenCompare={() => handleOpenCompare()}
        onOpenSearch={() => handleOpenSearchWithQuery()}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      <main className="min-h-screen">
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
          selectedCompareIds={selectedCompareCars.map((c) => c.id)}
          onToggleCompareCar={handleToggleCompareCar}
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
          selectedComparePartIds={selectedCompareParts.map((p) => p.id)}
          onToggleComparePart={handleToggleComparePart}
        />

        {/* 4. In-Page AI Deal Advisor & Dealership Directory */}
        <AdvisorSection
          userState={userState}
          onSelectInquiry={handleInquireVehicle}
        />

        <Experience
          onOpenModal={(tab) => handleOpenModal(tab, null)}
          onOpenFilm={() => setIsFilmOpen(true)}
        />
        <ClosingSection onOpenModal={(tab) => handleOpenModal(tab, null)} />
      </main>

      <Footer />

      {/* Floating Multi-Select Compare Bar */}
      <CompareFloatingBar
        selectedItems={compareMode === 'vehicles' ? selectedCompareCars : selectedCompareParts}
        mode={compareMode}
        onRemoveItem={handleRemoveCompareItem}
        onClearAll={handleClearCompare}
        onCompareNow={handleLaunchMultiCompare}
      />

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
        initialIds={compareModalInitialIds}
        initialMode={compareMode}
        onSelectInquiry={handleInquireVehicle}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        userState={userState}
        initialQuery={searchInitialQuery}
        onSelectInquiry={handleInquireVehicle}
        onToggleCompareCar={handleToggleCompareCar}
        onToggleComparePart={handleToggleComparePart}
        selectedCompareCarIds={selectedCompareCars.map((c) => c.id)}
        selectedComparePartIds={selectedCompareParts.map((p) => p.id)}
      />

      <AiAdvisorModal
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        userState={userState}
        onSelectInquiry={handleInquireVehicle}
      />

      {/* User Auth Modal (Database Only Stores User Details) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialTab={authInitialTab}
      />
    </>
  );
}
