import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Public site — eagerly loaded (needed on first paint of the home page)
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

// Auth shell is small — keep eager so ProtectedRoute works without suspense boundary
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/admin/ProtectedRoute';

// Non-home routes — lazy loaded (split into separate chunks, not in initial bundle)
const TourDetails   = lazy(() => import('./pages/TourDetails'));
const NotFound      = lazy(() => import('./pages/NotFound'));

// Admin routes — lazy loaded (users visiting the public site never download these)
const AdminLayout              = lazy(() => import('./components/admin/AdminLayout'));
const LoginPage                = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage            = lazy(() => import('./pages/admin/DashboardPage'));
const ToursListPage            = lazy(() => import('./pages/admin/tours/ToursListPage'));
const TourFormPage             = lazy(() => import('./pages/admin/tours/TourFormPage'));
const HeroAdminPage            = lazy(() => import('./pages/admin/hero/HeroAdminPage'));
const AboutAdminPage           = lazy(() => import('./pages/admin/about/AboutAdminPage'));
const SpeciesListPage          = lazy(() => import('./pages/admin/species/SpeciesListPage'));
const SpeciesFormPage          = lazy(() => import('./pages/admin/species/SpeciesFormPage'));
const TestimonialsListPage     = lazy(() => import('./pages/admin/testimonials/TestimonialsListPage'));
const TestimonialsFormPage     = lazy(() => import('./pages/admin/testimonials/TestimonialsFormPage'));
const FloridaDayTripsListPage  = lazy(() => import('./pages/admin/florida-day-trips/FloridaDayTripsListPage'));
const FloridaDayTripsFormPage  = lazy(() => import('./pages/admin/florida-day-trips/FloridaDayTripsFormPage'));
const VideoSectionAdminPage    = lazy(() => import('./pages/admin/video-section/VideoSectionAdminPage'));
const GalleryAdminPage         = lazy(() => import('./pages/admin/gallery/GalleryAdminPage'));
const TourGalleryPage          = lazy(() => import('./pages/admin/tours/TourGalleryPage'));

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
        <Suspense fallback={null}>
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
                <Route path="tours"               element={<ToursListPage />} />
                <Route path="tours/new"           element={<TourFormPage />} />
                <Route path="tours/:id/edit"      element={<TourFormPage />} />
                <Route path="tours/:id/gallery"   element={<TourGalleryPage />} />
                <Route path="hero"           element={<HeroAdminPage />} />
                <Route path="about"                    element={<AboutAdminPage />} />
                <Route path="species"                  element={<SpeciesListPage />} />
                <Route path="species/new"              element={<SpeciesFormPage />} />
                <Route path="species/:id/edit"         element={<SpeciesFormPage />} />
                <Route path="testimonials"             element={<TestimonialsListPage />} />
                <Route path="testimonials/new"         element={<TestimonialsFormPage />} />
                <Route path="testimonials/:id/edit"    element={<TestimonialsFormPage />} />
                <Route path="florida-day-trips"             element={<FloridaDayTripsListPage />} />
                <Route path="florida-day-trips/new"         element={<FloridaDayTripsFormPage />} />
                <Route path="florida-day-trips/:id/edit"    element={<FloridaDayTripsFormPage />} />
                <Route path="video-section" element={<VideoSectionAdminPage />} />
                <Route path="gallery" element={<GalleryAdminPage />} />
              </Route>
            </Route>

            {/* ── 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
