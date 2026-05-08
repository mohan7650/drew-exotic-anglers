import React from 'react';
import './VideoSection.css';

const galleryPhotos = [
  { url: '/images/gallery/catch-1.jpg', alt: 'Trophy Peacock Bass — Urubaxi River', big: true },
  { url: '/images/gallery/catch-2.jpg', alt: 'Giant catch on the Kalua II' },
  { url: '/images/gallery/catch-3.jpg', alt: 'Double digit Peacock Bass' },
  { url: '/images/gallery/catch-4.jpg', alt: 'Capt Drew with trophy fish' },
  { url: '/images/gallery/catch-5.jpg', alt: 'Monster Peacock Bass' },
  { url: '/images/gallery/catch-6.jpg', alt: 'Urubaxi River catch' },
  { url: '/images/gallery/catch-7.jpg', alt: 'Amazon fishing expedition' },
];

export default function VideoSection() {
  return (
    <section id="gallery" className="video-section">

      <div className="gallery-header">
        <div className="section-tag-line center">From the River</div>
        <h2 className="section-title">Real Catches, Real <em>Memories</em></h2>
      </div>

      <div className="gallery-grid">
        {galleryPhotos.map((photo, i) => (
          <div key={i} className={`gallery-item ${photo.big ? 'gallery-item--big' : ''}`}>
            <img
              src={photo.url}
              alt={photo.alt}
              className="gallery-img"
              onError={e => {
                e.target.style.display = 'none';
                e.target.parentNode.style.background = '#0F6E56';
              }}
            />
            <div className="gallery-overlay">
              <span className="gallery-alt">{photo.alt}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="gallery-note">
        All catches on the Urubaxi River — aboard the Kalua II with Capt Drew
      </p>

      <div className="video-header">
        <div className="section-tag-line center">Watch the Action</div>
        <h2 className="section-title">See the <em>Urubaxi</em> in Action</h2>
        <p className="section-sub">
          Real footage. Real fish. Real clients having the time of their lives aboard the Kalua II.
        </p>
      </div>

      <div className="video-frame">
        <iframe
          width="100%"
          height="480"
          src="https://www.youtube.com/embed/_ycYRB8875A"
          title="Voyage across the Amazon — Capt Drew"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="video-footer">
        
          
          
        <a>
          ▶ Subscribe to Capt Drew on YouTube
        </a>
      </div>

    </section>
  );
}