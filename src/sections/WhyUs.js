import React, { useEffect, useState } from 'react';
import { listActiveTestimonials } from '../services/testimonialsService';
import './WhyUs.css';

function StarRating({ rating }) {
  const clamped = Math.min(5, Math.max(0, Math.round(rating || 0)));
  return (
    <div className="testimonial-stars" aria-label={`${clamped} out of 5 stars`}>
      {'★'.repeat(clamped)}{'☆'.repeat(5 - clamped)}
    </div>
  );
}

export default function WhyUs() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    listActiveTestimonials()
      .then(setTestimonials)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const visible = testimonials.length > 0;

  return (
    <section id="whyus" className="whyus">

      <div className="whyus-header">
        <div className="section-tag-line center">
          What Anglers Say
        </div>
        <h2 className="section-title center">
          Stories from the <em>River.</em>
        </h2>
      </div>

      {loading && (
        <p className="testimonials-status">Loading stories…</p>
      )}

      {!loading && !visible && (
        <p className="testimonials-status">No stories yet. Check back soon.</p>
      )}

      {visible && (
        <div className="testimonial-slider">
          <div className="testimonial-track">

            {/* Duplicate array for seamless infinite scroll */}
            {[...testimonials, ...testimonials].map((t, i) => (
              <div className="testimonial-card" key={i}>

                <div
                  className="testimonial-image"
                  style={{
                    backgroundImage: t.image_url ? `url(${t.image_url})` : 'none',
                    background: t.image_url
                      ? `url(${t.image_url}) center / cover no-repeat`
                      : '#0d2b22',
                  }}
                />

                <div className="testimonial-bottom">

                  <div className="quote-icon">"</div>

                  <StarRating rating={t.rating} />

                  <p className="testimonial-review">{t.review}</p>

                  <div className="testimonial-line" />

                  <div className="testimonial-name">{t.name}</div>

                  <div className="testimonial-location">{t.location}</div>

                </div>

              </div>
            ))}

          </div>
        </div>
      )}

    </section>
  );
}
