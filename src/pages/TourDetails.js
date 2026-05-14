import React from 'react';
import { useParams, Link } from 'react-router-dom';
import tours from '../data/tours';
import './TourDetails.css';

export default function TourDetails() {
  const { slug } = useParams();
  const tour = tours.find(t => t.slug === slug);

  if (!tour) {
    return (
      <div className="tour-details-not-found">
        <h2>Tour not found</h2>
        <Link to="/" className="tour-details-back">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="tour-details-page">
      <div className="tour-details-hero" style={{ backgroundImage: `url(${tour.img})` }}>
        <div className="tour-details-hero-overlay">
          <Link to="/#tours" className="tour-details-back">← All Expeditions</Link>
          <div className="tour-details-tag">{tour.tag}</div>
          <h1 className="tour-details-title">{tour.name}</h1>
          <p className="tour-details-meta">{tour.meta}</p>
        </div>
      </div>

      <div className="tour-details-body">
        <div className="tour-details-content">
          <section className="tour-details-about">
            <h2>About This Trip</h2>
            <p>{tour.fullDesc}</p>
          </section>

          <section className="tour-details-info">
            <h2>Trip Details</h2>
            <ul className="tour-details-list">
              {tour.details.map(d => (
                <li key={d.label}>
                  <span className="detail-label">{d.label}</span>
                  <span className="detail-value">{d.value}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="tour-details-cta">
            <a
              href="/#contact"
              className="tour-details-btn"
            >
              Book Now
            </a>
            <Link to="/#tours" className="tour-details-link">View All Expeditions</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
