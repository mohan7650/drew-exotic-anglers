import React, { useEffect, useState } from 'react';
import { getAbout, getFeatures } from '../services/aboutService';
import './About.css';

export default function About() {
  const [about,    setAbout]    = useState(null);
  const [features, setFeatures] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([getAbout(), getFeatures(true)])
      .then(([aboutData, featureData]) => {
        setAbout(aboutData);
        setFeatures(featureData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
          width="400"
          height="500"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div className="about-badge">
          <div className="about-badge-num">{about.badge_number}</div>
          <div className="about-badge-text">{about.badge_text}</div>
        </div>
        <div className="about-orvis">
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

        {features.length > 0 && (
          <ul className="feature-list">
            {features.map(f => (
              <li key={f.id}>
                <div className="feature-icon">{f.icon}</div>
                <span>{f.feature_text}</span>
              </li>
            ))}
          </ul>
        )}

        {about.cta_text && about.cta_link && (
          <a href={about.cta_link} className="btn-gold">
            {about.cta_text}
          </a>
        )}
      </div>

    </section>
  );
}
