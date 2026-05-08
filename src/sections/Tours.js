import React from 'react';
import './Tours.css';

const tours = [
  {
    tag: '🥇 Flagship Trip', name: 'Urubaxi Full Week',
    desc: 'The full Capt Drew experience. 6 days fishing 240 miles of exclusive private river on the Kalua II. 696 fish in one week is our record.',
    meta: 'Fri → Fri · 8 Days  •  Max 8 Anglers  •  Call for Pricing',
    img: '/images/gallery/Flagship Trip.jpg',
  },
  {
    tag: 'Trophy Fishing', name: 'Kalua II Trophy Hunt',
    desc: 'Targeting double-digit giants on the Urubaxi. Average 20–35 Peacocks per boat per day — including fish over 20 lbs.',
    meta: '6 Fishing Days  •  All-Inclusive',
    img: '/images/gallery/Trophy Fishing.jpg',
  },
  {
    tag: 'Exclusive Access', name: 'Jurubaxi River Special',
    desc: 'Our exclusive Jurubaxi package — considered one of the most viable areas in the world to break a world record.',
    meta: '6 Fishing Days  •  Record Waters',
    img: '/images/gallery/Jurubaxi River Special.jpg',
  },
  {
    tag: 'Private Group', name: 'Private Charter',
    desc: 'Book the entire Kalua II for your crew. Up to 8 anglers, full boat, full river, full week. Perfect for clubs or corporate groups.',
    meta: 'Full Charter  •  Call (786) 342-5791',
    img: '/images/gallery/catch-6.jpg',
  },
];

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
          <div className={`tour-card ${t.big ? 'tour-card--big' : ''}`} key={t.name}>
            <img className="tour-img" src={t.img} alt={t.name} onError={e => e.target.style.display='none'} />
            <div className="tour-overlay">
              <div className="tour-tag">{t.tag}</div>
              <div className="tour-name">{t.name}</div>
              <div className="tour-desc">{t.desc}</div>
              <div className="tour-meta">{t.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
