import React, { useState, useEffect } from 'react';
import './Navbar.css';

const links = [
  { label: 'About',     href: '#about' },
  { label: 'Tours',     href: '#tours' },
  { label: 'Locations', href: '#locations' },
  { label: 'Gallery',   href: '#gallery' },
  { label: 'Contact',   href: '#contact' },
];

export default function Navbar({ scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">

        {/* BRAND */}
        <a className="nav-brand" href="#hero" onClick={closeMenu}>
          <img
            src="/images/gallery/dgs-logo.webp"
            alt="Drew's Guide Service logo"
            className="dgs-logo-mark"
          />
          <div className="nav-brand-text">
            <div className="nav-brand-name">
              Drew's <span>Guide</span> Service
            </div>
            <div className="nav-brand-credential">
              10 Years Orvis Endorsed · Capt Drew Rodriguez
            </div>
          </div>
        </a>

        {/* DESKTOP NAV LINKS */}
        <ul className="nav-links" role="list">
          {links.map(l => (
            <li key={l.label}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>

        {/* DESKTOP CTA */}
        <a className="nav-cta" href="#florida-day-trips">
          Book Now
        </a>

        {/* HAMBURGER BUTTON — mobile only */}
        <button
          className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

      </nav>

      {/* MOBILE MENU OVERLAY */}
      <div
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul className="mobile-nav-links" role="list">
          {links.map(l => (
            <li key={l.label}>
              <a href={l.href} onClick={closeMenu}>{l.label}</a>
            </li>
          ))}
        </ul>
        <a
          href="#florida-day-trips"
          className="mobile-cta"
          onClick={closeMenu}
        >
          Book a Trip Now
        </a>
        <a
          href="https://wa.me/17863425791"
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-whatsapp"
          onClick={closeMenu}
        >
          💬 WhatsApp Drew
        </a>
      </div>
    </>
  );
}
