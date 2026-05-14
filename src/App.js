import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import StatsBar from './sections/StatsBar';
import SponsorBar from './sections/SponsorBar';
import WhyUs from './sections/WhyUs';
import About from './sections/About';
import Tours from './sections/Tours';
import FloridaTrips from './sections/FloridaTrips';
import LocationMap from './sections/LocationMap';
import Species from './sections/Species';
import VideoSection from './sections/VideoSection';
import Testimonials from './sections/Testimonials';
import Newsletter from './sections/Newsletter';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import TourDetails from './pages/TourDetails';

function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Navbar scrolled={scrolled} />
      <Hero />
      <StatsBar />
      <SponsorBar />
      <WhyUs />
      <About />
      <Tours />
      {/* Florida Day Trips between tours and gallery per brief item #05 */}
      <FloridaTrips />
      <LocationMap />
      <Species />
      <VideoSection />
      <Testimonials />
      {/* Newsletter signup above footer per brief item #11 */}
      <Newsletter />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tour/:slug" element={<TourDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
