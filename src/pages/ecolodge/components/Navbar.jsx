import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';
import Icon from './Icon.jsx';
import { nav } from '../data/content.js';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    onScroll();

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
  };

  return (
    <header
      className={`eco-navbar ${
        scrolled ? 'eco-navbar--scrolled' : ''
      }`}
    >
      <div className="eco-navbar__inner">

        {/* Logo */}
        <Logo />

        {/* Desktop / Mobile Navigation */}
        <nav
          className={`eco-navbar__nav ${
            open ? 'is-open' : ''
          }`}
          aria-label="Primary navigation"
        >
          <ul className="eco-navbar__links">
            {nav.links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={nav.cta.href}
            className="eco-navbar__cta"
            onClick={closeMenu}
          >
            {nav.cta.label}
          </a>
        </nav>

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="eco-navbar__toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <Icon
            name={open ? 'close' : 'menu'}
            size={24}
          />
        </button>

      </div>
    </header>
  );
}