import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './Hero.css';

export default function Hero() {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      const { data, error } = await supabase
        .from('hero')
        .select('*')
        .single();

      if (!error && data) setHero(data);
      setLoading(false);
    };

    fetchHero();
  }, []);

  if (loading) {
    return <section id="hero" className="hero" />;
  }

  if (!hero) {
    return <section id="hero" className="hero" />;
  }

  return (
    <section id="hero" className="hero">

      <div className="hero-bg">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={hero.poster_image}
          onError={(e) => { e.target.style.display = 'none'; }}
          aria-hidden="true"
        >
          <source src={hero.background_video} type="video/mp4" />
        </video>
      </div>

      <div className="hero-pattern" />

      <div className="hero-content">

        <div className="hero-eyebrow">
          <span className="eyebrow-line" />
          {hero.eyebrow}
        </div>

        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: hero.title }} />

        <p className="hero-sub" dangerouslySetInnerHTML={{ __html: hero.subtitle }} />

        <div className="hero-btns">
          {hero.primary_cta_text && hero.primary_cta_link && (
            <a href={hero.primary_cta_link} className="btn-gold">
              {hero.primary_cta_text}
            </a>
          )}
          {hero.secondary_cta_text && hero.secondary_cta_link && (
            <a href={hero.secondary_cta_link} className="btn-ghost">
              {hero.secondary_cta_text}
            </a>
          )}
        </div>

      </div>

    </section>
  );
}
