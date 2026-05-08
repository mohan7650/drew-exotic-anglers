import React from 'react';
import './Testimonials.css';

const reviews = [
  {
    initials: 'RC', name: 'Rich C.',
    flag: '🇺🇸', country: 'USA',
    detail: 'Kalua II Full Week · 25 lb Peacock Bass',
    quote: 'Just wanted to let you know I had a great time on the Kalua II and caught about 50–60 fish during the week. Rich caught a 25 lb, 90 cm fish. Capt Drew caught his biggest ever at 24 lbs. So many big fish on this trip.',
  },
  {
    initials: 'GV', name: 'Gary V.',
    flag: '🇺🇸', country: 'USA',
    detail: 'Urubaxi River · 22.5 lb Peacock Bass',
    quote: 'Well, this by far was my new and best outfitter I ever had since 2002. The indigenous people kept track of every single fish caught. We ate like kings, slept like babies on that 57ft yacht. Absolutely incredible.',
  },
  {
    initials: 'TK', name: 'Takeshi K.',
    flag: '🇯🇵', country: 'Japan',
    detail: 'Jurubaxi River · 3 Fish over 20 lbs',
    quote: "Our group from Japan crushed big Peacocks — catching 3 over 20 lbs up to 23 lbs, several over 12 lbs. Capt Drew's operation is dialed in from start to finish. We will be back.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="testimonials">
      <div className="testi-header">
        <div className="section-tag-line center">What Anglers Say</div>
        <h2 className="section-title center">Stories from the <em>River.</em></h2>
      </div>
      <div className="testi-grid">
        {reviews.map(r => (
          <div className="testi-card" key={r.name}>
            <div className="testi-stars">★★★★★</div>
            <p className="testi-quote">"{r.quote}"</p>
            <div className="testi-author">
              <div className="testi-avatar">{r.initials}</div>
              <div className="testi-author-info">
                <div className="testi-name">{r.name}</div>
                <div className="testi-loc">
                  <span className="testi-flag" aria-label={r.country}>{r.flag}</span>
                  <span>{r.country} · {r.detail}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
