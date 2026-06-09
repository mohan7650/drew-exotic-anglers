import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './TourDetails.css';

export default function TourDetails() {
  const { slug } = useParams();
  const [tour, setTour]       = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchTour = async () => {
      // Step 1 — fetch the tour row by slug
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

      // Step 2 — fetch gallery using the resolved tour.id.
      // Sequential by necessity: tour_gallery.tour_id is only known after step 1.
      const { data: galleryData } = await supabase
        .from('tour_gallery')
        .select('id, image_url, alt, sort_order')
        .eq('tour_id', tourData.id)
        .order('sort_order', { ascending: true });

      setTour(tourData);
      setGallery(galleryData ?? []);
      setLoading(false);
    };

    fetchTour();
  }, [slug]);

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
console.log('tour id:', tour.id);
console.log('gallery:', gallery);
  return (
    <div className="tour-details-page">

      <div
        className="tour-details-hero"
        
      >
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

          {/* GALLERY — only renders when the tour has gallery rows */}
          {gallery.length > 0 && (
            <section className="tour-details-gallery">
              <div className="gallery-header">
                <h2>Expedition Gallery</h2>
                {tour.gallery_desc && <p>{tour.gallery_desc}</p>}
              </div>
              <div className="gallery-grid">
                {gallery.map((img) => (
                  <img
                    key={img.id}
                    src={img.image_url}
                    alt={img.alt || `${tour.title} gallery`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* TRIP DETAILS */}
          <section className="tour-details-info">
            <h2>Trip Details</h2>
            <ul className="tour-details-list">
              {[
                { label: 'Duration',        value: tour.duration },
                { label: 'Departs',         value: tour.departs },
                { label: 'Max Anglers',     value: tour.max_anglers },
                { label: 'Target Species',  value: tour.target_species },
                { label: 'Style',           value: tour.style },
                { label: 'Includes',        value: tour.includes },
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
