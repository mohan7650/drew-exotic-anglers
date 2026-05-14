import React, { useState } from 'react';
import './Hero.css';

export default function Hero() {
  const [selectedDate, setSelectedDate] = useState(null);

  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });

  return (
    <section id="hero" className="hero">
      <div className="hero-bg">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/gallery/catch-1.jpg"
          onError={(e) => { e.target.style.display = 'none'; }}
          aria-hidden="true"
        >
          <source src="/videos/hero_bg.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="hero-pattern" />

      <div className="hero-content">

        <div className="hero-eyebrow">
          <span className="eyebrow-line" />
          10 YEARS ORVIS ENDORSED · URUBAXI RIVER · 240 MILES PRIVATE WATER
        </div>

        <h1 className="hero-title">
          From the Canals<br />
          to the <em>World.</em>
        </h1>

        <p className="hero-sub">
          World's Biggest Peacock Bass. Private River.<br />
          240 miles of private water. Nobody else gets in.
        </p>

        <div className="hero-btns">
          <a href="#tours" className="btn-gold">
            Explore Tours
          </a>

          <a href="#florida" className="btn-ghost">
            Book a Florida Day Trip
          </a>
        </div>

      </div>

      {/* Floating booking card — absolutely positioned, does not affect hero layout */}
      <div className="hero-cal-card">
        <div className="hero-cal-label">Florida Day Trip · Book Now</div>

        <div className="hero-cal-header">
          <span>📅</span>
          <span>Check Availability · Next 14 Days</span>
        </div>

        <div className="hero-cal-grid">
          {days.map((d, i) => {
            const day     = d.getDate();
            const month   = d.toLocaleDateString('en-US', { month: 'short' });
            const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
            const isSelected = selectedDate === i;
            return (
              <button
                key={i}
                className={`hero-cal-day${isSelected ? ' selected' : ''}`}
                onClick={() => setSelectedDate(i)}
                aria-label={`Select ${weekday} ${month} ${day}`}
                aria-pressed={isSelected}
              >
                <div className="hero-cal-weekday">{weekday}</div>
                <div className="hero-cal-date">{day}</div>
                <div className="hero-cal-month">{month}</div>
              </button>
            );
          })}
        </div>

        <div className="hero-cal-note">Instant confirmation via FareHarbor at launch.</div>

        <a href="#contact" className="hero-book-btn">
          {selectedDate !== null
            ? `Reserve ${days[selectedDate].toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} →`
            : 'Check Availability →'}
        </a>

        <p className="hero-cal-trust">Capt Drew responds within 24 hours.</p>
      </div>

      <div className="hero-scroll">
        <div className="scroll-line" />
        <span>scroll</span>
      </div>
    </section>
  );
}
