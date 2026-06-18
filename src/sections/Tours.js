import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listTours } from '../services/toursService';
import './Tours.css';

export default function Tours() {
  const [tours,   setTours]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    listTours()
      .then(setTours)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="tours" className="tours">

      <div className="tours-header">
        <div className="section-tag-line">Expeditions</div>
        <h2 className="section-title">Fish with <em>Capt Drew</em></h2>
        <p className="section-sub">
          Every trip runs 7 full days fishing the Urubaxi.
          Spots are strictly limited.
        </p>
      </div>

      {loading && (
        <p className="tours-status">Loading expeditions…</p>
      )}

      {error && (
        <p className="tours-status tours-status--error">
          Failed to load tours. Please try again later.
        </p>
      )}

      {!loading && !error && tours.length === 0 && (
        <p className="tours-status">No expeditions available right now.</p>
      )}

      <div className="tours-grid">
        {tours.map((t) => (
          <Link
            to={`/tour/${t.slug}`}
            className="tour-card"
            key={t.id}
            style={{ textDecoration: 'none' }}
          >
            <img
              className="tour-img"
              src={t.image_url}
              alt={t.title}
              loading="lazy"
              width="400"
              height="560"
              onError={(e) => (e.target.style.display = 'none')}
            />

            <div className="tour-overlay">
              <div className="tour-content">
                <div className="tour-tag">{t.tag}</div>
                <div className="tour-name">{t.title}</div>
                <div className="tour-meta">{t.meta}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </section>
  );
}
