import React from 'react';
import './WhyUs.css';

// Three hero differentiators — each anchored with a real client quote (Option C from brief)
const heroDifferentiators = [
  {
    headline: 'Drew Personally Guides — Every Trip, No Exceptions',
    body: "You fish with Drew himself. A U.S.C.G. licensed captain, 10 Years Orvis Endorsed, who's landed a 22 lb Peacock on this exact river. He knows every hole.",
    quote: "Capt Drew caught his biggest ever at 24 lbs on our trip. So many big fish.",
    attribution: 'Rich C., USA · Kalua II Full Week',
  },
  {
    headline: '240 Miles of Private River — Nobody Else Gets In',
    body: "We fish the Urubaxi. 240 miles of exclusive private water in partnership with the indigenous communities. Most fish here have never seen a lure in their life.",
    quote: "By far the best outfitter I've had since 2002. The indigenous people kept track of every single fish caught.",
    attribution: 'Gary V., USA · Urubaxi · 22.5 lb Peacock',
  },
  {
    headline: '696 Fish in One Week — Backed by Real Data',
    body: "Drew calls this the best guarantee for double-digit Peacock Bass at the best price in the world. His words — backed by a 696-fish week we can verify.",
    quote: "Our group from Japan crushed big Peacocks — 3 over 20 lbs up to 23 lbs. Capt Drew's operation is dialed in start to finish.",
    attribution: 'Takeshi K., Japan · Jurubaxi River',
  },
];

// Supporting points — smaller row, supporting details only
const supportingPoints = [
  { title: 'Max 8 Anglers · Ever', text: 'No crowds. No competition for spots.' },
  { title: '99% Catch & Release',   text: 'Indigenous community partnership.' },
  { title: 'Truly All-Inclusive',   text: 'Flights, lodging, meals, tackle, licences.' },
];

export default function WhyUs() {
  return (
    <section id="whyus" className="whyus">
      <div className="whyus-header">
        <div className="section-tag-line">Why Choose Us</div>
        <h2 className="section-title">Not Just a Fishing Trip.<br /><em>An Expedition.</em></h2>
        <p className="section-sub">There are dozens of Amazon operators. Here's what makes Capt Drew genuinely different — and the clients who'll tell you so.</p>
      </div>

      {/* Three hero differentiators with anchored client quotes */}
      <div className="whyus-grid">
        {heroDifferentiators.map((r, i) => (
          <div className="whyus-card" key={i}>
            <div className="whyus-num">{String(i + 1).padStart(2, '0')}</div>
            <h3 className="whyus-title">{r.headline}</h3>
            <p className="whyus-text">{r.body}</p>
            <div className="whyus-proof">
              <div className="whyus-proof-stars">★★★★★</div>
              <p className="whyus-proof-quote">"{r.quote}"</p>
              <p className="whyus-proof-attr">— {r.attribution}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Supporting points row */}
      <div className="whyus-supporting">
        {supportingPoints.map(p => (
          <div className="whyus-supp" key={p.title}>
            <div className="whyus-supp-title">{p.title}</div>
            <div className="whyus-supp-text">{p.text}</div>
          </div>
        ))}
      </div>

      <div className="whyus-quote">
        <p className="quote-text">"This trip is the best guarantee for double-digit Peacock Bass at the best price in the world. I couldn't stress that enough."</p>
        <p className="quote-attr">— Capt Drew Rodriguez, Founder & Head Guide · 10 Years Orvis Endorsed</p>
        <a href="#contact" className="btn-gold-sm">Plan My Expedition →</a>
      </div>
    </section>
  );
}
