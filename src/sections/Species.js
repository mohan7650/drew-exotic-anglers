import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './Species.css';

export default function Species() {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecies = async () => {
      const { data, error } = await supabase
        .from('species')
        .select('id, name, latin_name, image_url, description, stars, difficulty')
        .order('created_at', { ascending: true });

      if (!error && data) setSpecies(data);
      setLoading(false);
    };

    fetchSpecies();
  }, []);

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

      <div className="species-grid">
        {species.map((s) => {
          const stars = Math.min(5, Math.max(0, Math.round(s.stars || 0)));
          return (
            <div className="species-card" key={s.id}>

              {/* PHOTO */}
              <div className="species-img-wrap">
                <img
                  src={s.image_url}
                  alt={s.name}
                  className="species-img"
                  loading="lazy"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.parentNode.style.background = '#0F6E56';
                  }}
                />
                <div className="species-img-overlay" />
              </div>

              {/* INFO */}
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

    </section>
  );
}
