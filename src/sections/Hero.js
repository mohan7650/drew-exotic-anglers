import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './Hero.css';

// Hardcoded fallback — renders immediately without any network request.
// Supabase data overwrites this once it arrives.
const FALLBACK = {
  eyebrow: '25+ years in the everglades - orvised endorsed guide Built In the glades exploring fisheries worldwide',
  title: "From the Glades to the <em>World. Bass</em> ",
  subtitle:
    "Canada to South America. World-class fisheries across the Americas. Access you won't get anywhere else.",
  primary_cta_text: 'Explore Tours',
  primary_cta_link: '#tours',
  secondary_cta_text: 'Book a Florida Day Trip',
  secondary_cta_link: '#florida-day-trips',
  poster_image: null,
  background_video: null,
};

const CACHE_KEY = 'dgs_hero_v1';
const CACHE_TTL = 10 * 60 * 1000; // 10 min

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data;
  } catch {}
  return null;
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export default function Hero() {
  // Initialise from cache so repeat visits render with real data instantly.
  // Falls back to FALLBACK so first-time visits still render immediately.
  const [hero, setHero] = useState(() => getCached() || FALLBACK);

  useEffect(() => {
    const fetchHero = async () => {
      const { data, error } = await supabase
        .from('hero')
        .select('*')
        .single();
      if (!error && data) {
        setHero(data);
        setCache(data);
      }
    };
    fetchHero();
  }, []);

  return (
    <section id="hero" className="hero">

      <div className="hero-bg">
        {hero.background_video && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={hero.poster_image || undefined}
            onError={(e) => { e.target.style.display = 'none'; }}
            aria-hidden="true"
          >
            <source src={hero.background_video} type="video/mp4" />
          </video>
        )}
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
