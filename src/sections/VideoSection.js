import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getVideoSection } from '../services/videoSectionService';
import './VideoSection.css';

// Hardcoded fallbacks — shown when Supabase data is unavailable
const FB = {
  eyebrow:     'Watch the Action',
  title:       'See the <em>Jurubaxi</em> in Action',
  subtitle:    'Real footage. Real fish. Real clients having the time of their lives aboard the Kalua II.',
  video_url:   'https://www.youtube.com/embed/_ycYRB8875A',
  video_url_2: 'https://www.youtube.com/embed/TSkPYETQXLI', // right-hand video (no admin field yet)
  description: '"This trip is the best guarantee for double-digit Peacock Bass at the best price in the world. I couldn\'t stress that enough."',
  cta_text:    'Plan My Expedition →',
  cta_link:    '#contact',
};

export default function VideoSection() {
  const [photos,  setPhotos]  = useState([]);
  const [vsData,  setVsData]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gallery fetch — unchanged
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('id, image_url, alt');
      if (!error && data) setPhotos(data);
      setLoading(false);
    };

    fetchGallery();

    // Video section content — fail silently, fallbacks handle missing data
    getVideoSection()
      .then(data => setVsData(data))
      .catch(() => {});
  }, []);

  const vs = vsData ?? {};

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
                width="400"
                height="300"
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
        All catches on the River with Drew
      </p>

      {/* VIDEO HEADER */}
      <div className="video-header center-video-header">
        <div className="section-tag-line">{vs.eyebrow || FB.eyebrow}</div>
        <h2
          className="section-title"
          dangerouslySetInnerHTML={{ __html: vs.title || FB.title }}
        />
        <p className="section-sub">{vs.subtitle || FB.subtitle}</p>
      </div>

      {/* VIDEO + FOUNDER */}
      <div className="video-section-wrapper">

        {/* VIDEOS — two side by side in the one frame */}
        <div className="video-frame video-frame--pair">
          {[
            { src: vs.video_url || FB.video_url, title: "Voyage across the Amazon — Capt Drew Rodriguez, Drew's Guide Service" },
            { src: FB.video_url_2, title: "Amazon fly fishing with Capt Drew Rodriguez, Drew's Guide Service" },
          ].map(v => (
            <iframe
              key={v.src}
              src={v.src}
              title={v.title}
              frameBorder="0"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ))}
        </div>

        {/* FOUNDER CARD */}
        <div className="founder-card">
          <div className="founder-small">Founder's Words</div>
          <blockquote className="founder-quote">
            {vs.description || FB.description}
          </blockquote>
          <div className="founder-name">— Capt Drew Rodriguez</div>
          <div className="founder-role">
            Founder &amp; Head Guide · 10 Years Orvis Endorsed
          </div>
          <a href={vs.cta_link || FB.cta_link} className="founder-btn">
            {vs.cta_text || FB.cta_text}
          </a>
        </div>

      </div>

    </section>
  );
}
