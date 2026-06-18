import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { listTourAssets } from '../services/tourAssetsService';
import './TourDetails.css';

// Seamless auto-scroll carousel for 4+ images.
// Duplicates the array so CSS translateX(-50%) loops invisibly.
function GalleryCarousel({ images, tourTitle }) {
  const doubled = [...images, ...images];
  // Scale speed with count so each image gets ~5s of screen time
  const duration = Math.max(18, images.length * 5);

  return (
    <div className="tda-carousel">
      <div
        className="tda-track"
        style={{ animationDuration: `${duration}s` }}
      >
        {doubled.map((img, i) => (
          <div className="tda-slide" key={`${img.id}-${i}`}>
            <img
              src={img.image_url}
              alt={img.alt || tourTitle}
              loading="lazy"
              width="380"
              height="260"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

const SITE       = 'https://drewsguideservice.com';
const DEFAULT_TITLE = "Drew's Guide Service — Capt Drew Rodriguez · Orvis Endorsed";
const DEFAULT_DESC  = "Capt Drew Rodriguez — 10 Years Orvis Endorsed. Exclusive Peacock Bass fishing on the Urubaxi River, Amazon Brazil. Aboard the Kalua II. Florida day trips. From the Canals to the World.";

function setMeta(sel, attr, value) {
  document.querySelector(sel)?.setAttribute(attr, value);
}

function injectJsonLd(id, data) {
  document.getElementById(id)?.remove();
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.id   = id;
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
}

export default function TourDetails() {
  const { slug } = useParams();
  const [tour,    setTour]    = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchTour = async () => {
      // Step 1 — resolve slug to tour row
      const { data: tourData, error: tourError } = await supabase
        .from('tours')
        .select('*')
        .eq('slug', slug)
        .single();

      if (tourError || !tourData) {
        setError(tourError?.message ?? `No tour matched slug "${slug}"`);
        setLoading(false);
        return;
      }

      // Step 2 — fetch gallery from tour_assets (sequential: tour_id known only after step 1)
      const assets = await listTourAssets(tourData.id).catch(() => []);

      setTour(tourData);
      setGallery(assets);
      setLoading(false);
    };

    fetchTour();
  }, [slug]);

  // ── Dynamic SEO: runs once tour data is available ─────────────────────
  useEffect(() => {
    if (!tour) return;

    const pageUrl  = `${SITE}/tour/${slug}`;
    const rawDesc  = (tour.full_desc || tour.meta || '').trim();
    const pageDesc = (rawDesc.slice(0, 150) + (rawDesc.length > 150 ? '…' : '') +
      ' Book with Capt Drew Rodriguez, 10 Years Orvis Endorsed.').trim();
    const pageTitle = `${tour.title} — Drew's Guide Service`;
    const pageImage = tour.image_url || `${SITE}/images/gallery/catch-1.webp`;

    // Title + description
    document.title = pageTitle;
    setMeta('meta[name="description"]',         'content', pageDesc);

    // OG
    setMeta('meta[property="og:title"]',        'content', pageTitle);
    setMeta('meta[property="og:description"]',  'content', pageDesc);
    setMeta('meta[property="og:url"]',          'content', pageUrl);
    setMeta('meta[property="og:image"]',        'content', pageImage);

    // Twitter
    setMeta('meta[name="twitter:title"]',       'content', pageTitle);
    setMeta('meta[name="twitter:description"]', 'content', pageDesc);
    setMeta('meta[name="twitter:image"]',       'content', pageImage);

    // Canonical
    setMeta('link[rel="canonical"]',            'href',    pageUrl);

    // TouristTrip structured data
    injectJsonLd('tour-jsonld', {
      '@context': 'https://schema.org',
      '@type':    'TouristTrip',
      'name':     tour.title,
      'description': tour.full_desc || tour.meta || '',
      'url':      pageUrl,
      ...(tour.image_url ? { 'image': tour.image_url } : {}),
      ...(tour.duration  ? { 'duration': tour.duration } : {}),
      'provider': {
        '@type':     'LocalBusiness',
        '@id':       `${SITE}/#business`,
        'name':      "Drew's Guide Service",
        'telephone': '+17863425791',
        'url':       SITE,
      },
    });

    // BreadcrumbList
    injectJsonLd('tour-breadcrumb-jsonld', {
      '@context': 'https://schema.org',
      '@type':    'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home',        'item': `${SITE}/` },
        { '@type': 'ListItem', 'position': 2, 'name': 'Expeditions', 'item': `${SITE}/#tours` },
        { '@type': 'ListItem', 'position': 3, 'name': tour.title,    'item': pageUrl },
      ],
    });

    // Restore homepage defaults when navigating away
    return () => {
      document.title = DEFAULT_TITLE;
      setMeta('meta[name="description"]',         'content', DEFAULT_DESC);
      setMeta('meta[property="og:title"]',        'content', "Drew's Guide Service — Orvis Endorsed Amazon & Florida Fishing");
      setMeta('meta[property="og:description"]',  'content', DEFAULT_DESC);
      setMeta('meta[property="og:url"]',          'content', `${SITE}/`);
      setMeta('meta[property="og:image"]',        'content', `${SITE}/images/gallery/catch-1.webp`);
      setMeta('meta[name="twitter:title"]',       'content', "Drew's Guide Service — Orvis Endorsed Amazon Fishing");
      setMeta('meta[name="twitter:description"]', 'content', "Exclusive Peacock Bass fishing on the Urubaxi River. 10 Years Orvis Endorsed. Capt Drew Rodriguez — Miami, FL.");
      setMeta('meta[name="twitter:image"]',       'content', `${SITE}/images/gallery/catch-1.webp`);
      setMeta('link[rel="canonical"]',            'href',    `${SITE}/`);
      document.getElementById('tour-jsonld')?.remove();
      document.getElementById('tour-breadcrumb-jsonld')?.remove();
    };
  }, [tour, slug]);

  if (loading) {
    return (
      <div className="tour-details-not-found">
        <p>Loading expedition…</p>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="tour-details-not-found">
        <h2>Tour not found</h2>
        <p>{error || `No tour matched slug "${slug}"`}</p>
        <Link to="/" className="tour-details-back">← Back to Home</Link>
      </div>
    );
  }

  const useCarousel = gallery.length > 3;

  return (
    <div className="tour-details-page">

      <div className="tour-details-hero">
        <div className="tour-details-hero-overlay">
          <Link to="/#tours" className="tour-details-back">← All Expeditions</Link>
          <div className="tour-details-tag">{tour.tag}</div>
          <h1 className="tour-details-title">{tour.title}</h1>
          <p className="tour-details-meta">{tour.meta}</p>
        </div>
      </div>

      <div className="tour-details-body">
        <div className="tour-details-content">

          {/* ABOUT */}
          <section className="tour-details-about">
            <h2>About This Trip</h2>
            <p>{tour.full_desc}</p>
          </section>

          {/* GALLERY */}
          {gallery.length > 0 && (
            <section className="tour-details-gallery">
              <div className="gallery-header">
                <h2>Expedition Gallery</h2>
                {tour.gallery_desc && <p>{tour.gallery_desc}</p>}
              </div>

              {useCarousel ? (
                <GalleryCarousel images={gallery} tourTitle={tour.title} />
              ) : (
                <div className="gallery-grid">
                  {gallery.map((img) => (
                    <img
                      key={img.id}
                      src={img.image_url}
                      alt={img.alt || `${tour.title} gallery`}
                      loading="lazy"
                      width="400"
                      height="300"
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* TRIP DETAILS */}
          <section className="tour-details-info">
            <h2>Trip Details</h2>
            <ul className="tour-details-list">
              {[
                { label: 'Duration',       value: tour.duration },
                { label: 'Departs',        value: tour.departs },
                { label: 'Max Anglers',    value: tour.max_anglers },
                { label: 'Target Species', value: tour.target_species },
                { label: 'Style',          value: tour.style },
                { label: 'Includes',       value: tour.includes },
              ]
                .filter(({ value }) => value != null && value !== '')
                .map(({ label, value }) => (
                  <li key={label}>
                    <span className="detail-label">{label}</span>
                    <span className="detail-value">{value}</span>
                  </li>
                ))}
            </ul>
          </section>

          {/* CTA */}
          <div className="tour-details-cta">
            {tour.booking_url && (
              <a
                href={tour.booking_url}
                className="tour-details-btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book Now
              </a>
            )}
            <Link to="/#tours" className="tour-details-link">
              View All Expeditions
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
