import React, { useEffect, useState } from 'react';
import { listActiveSpecies } from '../services/speciesService';
import './Species.css';

function SpeciesCards({ species }) {
  const useCarousel = species.length > 2;
  const gridClass = useCarousel ? 'species-grid' : 'species-grid species-grid--static';
  return (
    <div className={gridClass}>
      {species.map((s) => {
        const stars = Math.min(5, Math.max(0, Math.round(s.stars || 0)));
        return (
          <div className="species-card" key={s.id}>

            <div className="species-img-wrap">
              <img
                src={s.image_url}
                alt={s.name}
                className="species-img"
                loading="lazy"
                width="320"
                height="213"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.parentNode.style.background = '#0F6E56';
                }}
              />
              <div className="species-img-overlay" />
            </div>

            <div className="species-info">
              <div className="species-name">{s.name}</div>
              <div className="species-latin">{s.latin_name}</div>
              <div className="species-desc">{s.description}</div>
              <div className="species-rating">
                <span className="stars">
                  {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                </span>
                <span className="diff">Difficulty: {s.difficulty}</span>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
}

export default function Species({ embedded = false, speciesList }) {
  const [species, setSpecies] = useState(speciesList ?? []);
  const [loading, setLoading] = useState(!speciesList);

  useEffect(() => {
    if (speciesList) return;
    listActiveSpecies()
      .then(setSpecies)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [speciesList]);

  if (embedded) {
    return (
      <section className="tds-species">
        <h2>The Fish You'll <em>Chase</em></h2>
        {loading && <p className="species-status">Loading species…</p>}
        {!loading && species.length === 0 && (
          <p className="species-status">No species listed yet.</p>
        )}
        <SpeciesCards species={species} />
      </section>
    );
  }

  return (
    <section id="species" className="species">

      <div className="species-header">
        <div>
          <div className="section-tag-line">Target Species</div>
          <h2 className="section-title">The Fish You'll <em>Chase</em></h2>
        </div>
        <a href="#contact" className="btn-gold-sm">Plan Your Trip</a>
      </div>

      {loading && (
        <p className="species-status">Loading species…</p>
      )}

      {!loading && species.length === 0 && (
        <p className="species-status">No species listed yet.</p>
      )}

      <SpeciesCards species={species} />

    </section>
  );
}
