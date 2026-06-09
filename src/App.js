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
import ToursListPage from './pages/admin/tours/ToursListPage';
import TourFormPage from './pages/admin/tours/TourFormPage';
import HeroAdminPage from './pages/admin/hero/HeroAdminPage';
import AboutAdminPage from './pages/admin/about/AboutAdminPage';
import SpeciesListPage from './pages/admin/species/SpeciesListPage';
import SpeciesFormPage from './pages/admin/species/SpeciesFormPage';
import TestimonialsListPage from './pages/admin/testimonials/TestimonialsListPage';
import TestimonialsFormPage from './pages/admin/testimonials/TestimonialsFormPage';
import FloridaDayTripsListPage from './pages/admin/florida-day-trips/FloridaDayTripsListPage';
import FloridaDayTripsFormPage from './pages/admin/florida-day-trips/FloridaDayTripsFormPage';
import VideoSectionAdminPage from './pages/admin/video-section/VideoSectionAdminPage';

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
              {/* ── Phase 2: Tours management */}
              <Route path="tours"          element={<ToursListPage />} />
              <Route path="tours/new"      element={<TourFormPage />} />
              <Route path="tours/:id/edit" element={<TourFormPage />} />
              {/* ── Phase 4: Hero section CMS */}
              <Route path="hero"           element={<HeroAdminPage />} />
              {/* ── About section CMS */}
              <Route path="about"                    element={<AboutAdminPage />} />
              {/* ── Species CMS */}
              <Route path="species"                  element={<SpeciesListPage />} />
              <Route path="species/new"              element={<SpeciesFormPage />} />
              <Route path="species/:id/edit"         element={<SpeciesFormPage />} />
              {/* ── Testimonials CMS */}
              <Route path="testimonials"             element={<TestimonialsListPage />} />
              <Route path="testimonials/new"         element={<TestimonialsFormPage />} />
              <Route path="testimonials/:id/edit"    element={<TestimonialsFormPage />} />
              {/* ── Florida Day Trips CMS */}
              <Route path="florida-day-trips"             element={<FloridaDayTripsListPage />} />
              <Route path="florida-day-trips/new"         element={<FloridaDayTripsFormPage />} />
              <Route path="florida-day-trips/:id/edit"    element={<FloridaDayTripsFormPage />} />
              {/* ── Video Section CMS */}
              <Route path="video-section" element={<VideoSectionAdminPage />} />
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
