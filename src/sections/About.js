import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './About.css';

export default function About() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAbout = async () => {
      const { data, error } = await supabase
        .from('about')
        .select('*')
        .single();

      if (!error && data) setAbout(data);
      setLoading(false);
    };

    fetchAbout();
  }, []);

  if (loading || !about) {
    return <section id="about" className="about" />;
  }

  return (
    <section id="about" className="about">

      <div className="about-img-wrap">
        <img
          className="about-img"
          src={about.image_url}
          alt="Capt Drew Rodriguez on the Amazon"
          loading="lazy"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div className="about-badge">
          <div className="about-badge-num">{about.badge_number}</div>
          <div className="about-badge-text">{about.badge_text}</div>
        </div>
        <div className="about-orvis">
          <div className="about-orvis-num">{about.orvis_number}</div>
          <div
            className="about-orvis-text"
            dangerouslySetInnerHTML={{ __html: about.orvis_text }}
          />
        </div>
      </div>

      <div className="about-text">
        <div className="section-tag-line">{about.eyebrow}</div>
        <h2
          className="section-title"
          dangerouslySetInnerHTML={{ __html: about.title }}
        />
        <div dangerouslySetInnerHTML={{ __html: about.description }} />

        <ul className="feature-list">
          {[
            ['🏆', '10 Years Orvis Endorsed — earned, not bought, renewed on results'],
            ['⚓', 'U.S. Coast Guard Licensed Captain · Fully Insured'],
            ['🚢', 'Live aboard the Kalua II — 57ft floating hotel with A/C suites'],
            ['🏞️', 'Exclusive access to the Urubaxi River — 240 miles, max 8 anglers ever'],
            ['🐟', '99% catch-and-release in partnership with indigenous communities'],
            ['🍽️', 'Truly all-inclusive: flights, lodging, meals, drinks, tackle & licences'],
          ].map(([icon, text]) => (
            <li key={text}>
              <div className="feature-icon">{icon}</div>
              <span>{text}</span>
            </li>
          ))}
        </ul>

        {about.cta_text && about.cta_link && (
          <a href={about.cta_link} className="btn-gold">
            {about.cta_text}
          </a>
        )}
      </div>

    </section>
  );
}
