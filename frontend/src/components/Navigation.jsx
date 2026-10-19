import { useState } from 'react';

const navigationLinks = [
  { label: 'Collection', href: '#collection' },
  { label: 'Our philosophy', href: '#philosophy' },
  { label: 'Experience', href: '#experience' },
];

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="nav-wrap">
      <a className="brand" href="#home" aria-label="Aurel home">
        <span className="brand-mark">A</span>
        <span className="brand-name">AUREL<span className="brand-sub">MOTOR ATELIER</span></span>
      </a>
      <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`} aria-label="Main navigation">
        {navigationLinks.map((link) => (
          <a href={link.href} key={link.label} onClick={closeMenu}>{link.label}</a>
        ))}
      </nav>
      <a className="nav-cta" href="#contact">Arrange a visit <span>↗</span></a>
      <button
        className="menu-toggle"
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <i /><i />
      </button>
    </header>
  );
}
