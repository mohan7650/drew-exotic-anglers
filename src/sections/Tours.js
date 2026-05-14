import React from 'react';
import { Link } from 'react-router-dom';
import tours from '../data/tours';
import './Tours.css';

export default function Tours() {
  return (
    <section id="tours" className="tours">
      <div className="tours-header">
        <div className="section-tag-line">Expeditions</div>
        <h2 className="section-title">Fish with <em>Capt Drew</em></h2>
        <p className="section-sub">Every trip runs Friday to Friday — 6 full days fishing the Urubaxi. Spots are strictly limited.</p>
      </div>
      <div className="tours-grid">
        {tours.map(t => (
          <Link
            to={`/tour/${t.slug}`}
            className={`tour-card ${t.big ? 'tour-card--big' : ''}`}
            key={t.name}
            style={{ textDecoration: 'none' }}
          >
            <img className="tour-img" src={t.img} alt={t.name} onError={e => e.target.style.display = 'none'} />
            <div className="tour-overlay">
              <div className="tour-tag">{t.tag}</div>
              <div className="tour-name">{t.name}</div>
              <div className="tour-desc">{t.desc}</div>
              <div className="tour-meta">{t.meta}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
