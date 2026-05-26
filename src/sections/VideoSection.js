import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import './VideoSection.css';

export default function VideoSection() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('id, image_url, alt');

      if (!error && data) setPhotos(data);
      setLoading(false);
    };

    fetchGallery();
  }, []);

  return (
    <section id="gallery" className="video-section">

      {/* GALLERY HEADER */}
      <div className="gallery-header">
        <div className="section-tag-line center">From the River</div>
        <h2 className="section-title">
          Real Catches, Real <em>Memories</em>
        </h2>
      </div>

      {/* GALLERY GRID */}
      {!loading && photos.length === 0 ? (
        <p className="gallery-note">Gallery coming soon.</p>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="gallery-item">
              <img
                src={photo.image_url}
                alt={photo.alt || ''}
                className="gallery-img"
                loading="lazy"
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.parentNode.style.background = '#111';
                }}
              />
              <div className="gallery-overlay">
                <span className="gallery-alt">{photo.alt}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="gallery-note">
        All catches on the Urubaxi River — aboard the Kalua II with Capt Drew
      </p>

      {/* VIDEO HEADER */}
      <div className="video-header center-video-header">
        <div className="section-tag-line">Watch the Action</div>
        <h2 className="section-title">
          See the <em>Urubaxi</em> in Action
        </h2>
        <p className="section-sub">
          Real footage. Real fish. Real clients having the
          time of their lives aboard the Kalua II.
        </p>
      </div>

      {/* VIDEO + FOUNDER */}
      <div className="video-section-wrapper">

        {/* VIDEO */}
        <div className="video-frame">
          <iframe
            src="https://www.youtube.com/embed/_ycYRB8875A"
            title="Voyage across the Amazon — Capt Drew Rodriguez, Drew's Guide Service"
            frameBorder="0"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* FOUNDER CARD */}
        <div className="founder-card">
          <div className="founder-small">Founder's Words</div>
          <blockquote className="founder-quote">
            "This trip is the best guarantee for double-digit
            Peacock Bass at the best price in the world.
            I couldn't stress that enough."
          </blockquote>
          <div className="founder-name">— Capt Drew Rodriguez</div>
          <div className="founder-role">
            Founder & Head Guide · 10 Years Orvis Endorsed
          </div>
          <a href="#contact" className="founder-btn">
            Plan My Expedition →
          </a>
        </div>

      </div>

    </section>
  );
}
