import React from 'react';
import './Navbar.css';

// Consolidated to 5 nav items per brief item #13 / #18
const links = [
  { label: 'About',     href: '#about' },
  { label: 'Tours',     href: '#tours' },
  { label: 'Locations', href: '#locations' },
  { label: 'Gallery',   href: '#gallery' },
  { label: 'Contact',   href: '#contact' },
];

export default function Navbar({ scrolled }) {

  return (

    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>

      {/* BRAND */}

      <a className="nav-brand" href="#hero">

        {/* LOGO IMAGE */}

        <img
          src="/images/gallery/dgs-logo.png"
          alt="Drew's Guide Service"
          className="dgs-logo-mark"
        />

        {/* BRAND TEXT */}

        <div className="nav-brand-text">

          <div className="nav-brand-name">
            Drew's <span>Guide</span> Service
          </div>

          <div className="nav-brand-credential">
            10 Years Orvis Endorsed · Capt Drew Rodriguez
          </div>

        </div>

      </a>

      {/* NAV LINKS */}

      <ul className="nav-links">

        {links.map(l => (

          <li key={l.label}>
            <a href={l.href}>{l.label}</a>
          </li>

        ))}

      </ul>

      {/* CTA */}

      <a
        className="nav-cta"
        href="#florida-day-trips"
      >
        Book Now
      </a>

    </nav>
  );
}