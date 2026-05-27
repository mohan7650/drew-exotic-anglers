import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Public site
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import StatsBar from './sections/StatsBar';
import SponsorBar from './sections/SponsorBar';
import WhyUs from './sections/WhyUs';
import About from './sections/About';
import Tours from './sections/Tours';
import FloridaTrips from './sections/FloridaTrips';
import LocationMap from './components/LocationMap/LocationMap';
import Species from './sections/Species';
import VideoSection from './sections/VideoSection';
import Newsletter from './sections/Newsletter';
import Contact from './sections/Contact';
import Footer from './sections/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import TourDetails from './pages/TourDetails';
import NotFound from './pages/NotFound';

// Admin auth architecture
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';

function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <a href="#hero" className="skip-link">Skip to main content</a>
      <Navbar scrolled={scrolled} />
      <main id="main-content">
        <Hero />
        <StatsBar />
        <SponsorBar />
        <FloridaTrips />
        <WhyUs />
        <Tours />
        <LocationMap />
        <About />
        {/* Florida Day Trips between tours and gallery per brief item #05 */}
        <Species />
        <VideoSection />

        {/* Newsletter signup above footer per brief item #11 */}
        <Newsletter />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public site */}
          <Route path="/" element={<HomePage />} />
          <Route path="/tour/:slug" element={<TourDetails />} />

          {/* ── Admin: public login */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* ── Admin: protected area */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              {/* Phase 2+ CRUD routes will nest here */}
            </Route>
          </Route>

          {/* ── 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
