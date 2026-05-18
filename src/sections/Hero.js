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
          Canada to Argentina. World-class fisheries across the Americas.<br />
          Access you won't get anywhere else.
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

    </section>
  );
}
