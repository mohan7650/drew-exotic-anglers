import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

// Slugs match sitemap.xml and the Supabase tours table
const EXPEDITION_LINKS = [
  { label: 'South Florida Day Trips',       to: '/#florida-day-trips' },
  { label: 'St Jean Salmon Club · Canada',  to: '/tour/canada-st-jean-salmon-club' },
  { label: 'Eco Lodge da Barra · Brazil',   to: '/tour/brazil-eco-lodge-da-barra' },
  { label: 'Xingu River · Brazil',          to: '/tour/brazil-xingu-river' },
  { label: 'Jurubaxi River · Brazil',        to: '/tour/kalua-1-jurubaxi-river' },
  { label: 'Don Joaquin Lodge · Argentina', to: '/tour/argentina-don-joaquin-river-lodge' },
  
  
];

/* SAME IMAGE LOGO AS NAVBAR */

function PeacockBassLogo() {

  return (

    <img
      src="/images/gallery/dgs-logo.webp"
      alt="Drew's Guide Service"
      className="footer-logo-mark"
    />

  );
}

export default function Footer() {

  return (

    <footer className="footer">

      <div className="footer-top">

        {/* BRAND */}

        <div className="footer-brand">

          <div className="footer-logo-row">

            <PeacockBassLogo />

            <div>

              <div className="footer-logo">
                Drew's <span>Guide</span> Service
              </div>

              <div className="footer-tagline">
                10 Years Orvis Endorsed · Capt Drew Rodriguez
              </div>

            </div>

          </div>

          {/* ORVIS */}

         

          {/* DESCRIPTION */}

          <p className="footer-desc">

            U.S.C.G. Licensed guide from Miami, Florida.
            Exclusive access to the Jurubaxi River aboard the Kalua II.
            Florida day trips. Global expeditions in Brazil,
            Argentina, and Canada.

          </p>

          {/* NEWSLETTER */}

          <div className="footer-newsletter-shortcut">

            <span className="footer-newsletter-icon">
              📧
            </span>

            <span>
              Get Drew's fishing intel —
            </span>

            <a href="#newsletter">
              Subscribe →
            </a>

          </div>

          {/* SOCIALS */}

          <div className="footer-social">

            {/* TODO: replace href with real Instagram handle when available */}
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label="Drew's Guide Service on Instagram (coming soon)"
              title="Instagram — coming soon"
            >
              <span className="social-circle">📷</span>
            </a>

            {/* TODO: replace href with real Facebook page URL when available */}
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label="Drew's Guide Service on Facebook (coming soon)"
              title="Facebook — coming soon"
            >
              <span className="social-circle">📘</span>
            </a>

            <a
              href="https://youtube.com/@captdrew1986"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label="Drew's Guide Service on YouTube"
            >
              <span className="social-circle">▶️</span>
            </a>

            <a
              href="https://wa.me/17863425791"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn social-btn--whatsapp"
              aria-label="Message Capt Drew on WhatsApp"
            >
              <span className="social-circle">💬</span>
            </a>

          </div>

        </div>

        {/* EXPEDITIONS */}

        <div className="footer-col">

          <h4>EXPEDITIONS</h4>

          <ul>
            {EXPEDITION_LINKS.map(({ label, to }) => (
              <li key={to}>
                {to.startsWith('/#')
                  ? <a href={to}>{label}</a>
                  : <Link to={to}>{label}</Link>}
              </li>
            ))}
          </ul>

        </div>

        {/* INFORMATION */}

        <div className="footer-col">

          <h4>
            Information
          </h4>

          <ul>

            {[
              ['About Capt Drew','#about'],
              ['Target Species','#species'],
              ['Gallery','#gallery'],
              ['Reviews','#testimonials'],
              ['Why Choose Us','#whyus']
            ].map(([l,h]) => (

              <li key={l}>
                <a href={h}>{l}</a>
              </li>

            ))}

          </ul>

        </div>

        {/* CONTACT */}

        <div className="footer-col">

          <h4>
            Contact
          </h4>

          <ul>

            <li>
              <a href="#contact">
                Reserve Expedition
              </a>
            </li>

            <li>
              <a href="#florida-day-trips">
                Book Florida Day Trip
              </a>
            </li>

            <li>
              <a href="tel:7863425791">
                Call (786) 342-5791
              </a>
            </li>

            <li>
              <a
                href="https://wa.me/17863425791"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Drew
              </a>
            </li>

          </ul>

        </div>

      </div>

      {/* BOTTOM */}

      <div className="footer-bottom">

        <span>
          © 2026 Drew's Guide Service · Capt Drew Rodriguez.
          All rights reserved.
        </span>

        <span>
          drewsguideservice.com · Miami, FL · Barcelos, Brazil ·
          (786) 342-5791
        </span>

      </div>

    </footer>
  );
}