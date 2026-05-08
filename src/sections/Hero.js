import React from 'react';
import './Hero.css';

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-bg">
        <video autoPlay muted loop playsInline preload="auto">
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

      <div className="hero-scroll">
        <div className="scroll-line" />
        <span>scroll</span>
      </div>
    </section>
  );
}