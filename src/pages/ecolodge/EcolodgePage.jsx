import { useEffect } from 'react';
import './styles/tokens.css';
import './styles/global.css';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import FishingIntro from './components/FishingIntro.jsx';
import Species from './components/Species.jsx';
import Lodge from './components/Lodge.jsx';
import Itinerary from './components/Itinerary.jsx';
import InfoCards from './components/InfoCards.jsx';
import CtaBanner from './components/CtaBanner.jsx';
import Footer from './components/Footer.jsx';
import Contact from '../../sections/Contact';

// Fonts are added with a <link> (not a CSS @import) so a blocked font request can
// never fail the lazy CSS chunk and crash the route. Only loaded on this page.
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Kalam:wght@300;400&display=swap';

function useEcolodgeFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);
}

// In-page links (#fishing, #lodge, …) are scrolled in JS so they also work when the
// mobile menu has just locked body scrolling, and when the URL already has that hash.
function handleHashLinks(e) {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.getElementById(link.getAttribute('href').slice(1));
  if (!target) return;
  e.preventDefault();
  document.body.style.overflow = '';
  window.history.replaceState(null, '', link.getAttribute('href'));
  requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

/**
 * Dedicated EcoLodge da Barra page.
 * Served at /tour/brazil-eco-lodge-da-barra (see App.js), replacing the
 * generic TourDetails template for this one lodge.
 */
export default function EcolodgePage() {
  useEcolodgeFonts();

  useEffect(() => {
    // Coming from the home page in the SPA keeps the old scroll position — reset it,
    // unless the URL points at a section (e.g. a shared …#fishing link or a reload).
    const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (target) target.scrollIntoView({ block: 'start' });
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const prevTitle = document.title;
    document.title = 'EcoLodge da Barra — Amazon Fly Fishing | Drew’s Guide Service';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="eco" id="top" onClick={handleHashLinks}>
      <Navbar />
      <main>
        <Hero />
        <FishingIntro />
        <Species />
        <Lodge />
        <Itinerary />
        <InfoCards />
        <CtaBanner />
        {/* Same reservation form as the home page; distinct id since InfoCards owns #contact here. */}
        <Contact id="eco-contact" defaultTripType="Brazil, Eco Lodge da Barra" />
      </main>
      <Footer />
    </div>
  );
}
