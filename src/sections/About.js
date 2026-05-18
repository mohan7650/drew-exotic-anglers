import React from 'react';
import './About.css';

export default function About() {
  return (
    <section id="about" className="about">
      <div className="about-img-wrap">
        <img
          className="about-img"
          src="/images/gallery/About_drew.jpg"
          alt="Capt Drew Rodriguez on the Amazon"
          loading="lazy"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div className="about-badge">
          <div className="about-badge-num">22lb</div>
          <div className="about-badge-text">Personal Best</div>
        </div>
        {/* Orvis credential mark — most valuable credential per brief item #03 */}
        <div className="about-orvis">
          <div className="about-orvis-num">10</div>
          <div className="about-orvis-text">Years<br/>Orvis<br/>Endorsed</div>
        </div>
      </div>
      <div className="about-text">
        <div className="section-tag-line">Meet Your Guide</div>
        <h2 className="section-title">From the Canals<br /><em>to the World.</em></h2>

        {/* Bio rewritten in Drew's first-person voice per brief item #20 */}
        <p>I grew up in Miami with a fishing rod in my hand. By the time I was twelve I'd caught more giant Peacock Bass in the South Florida canals than most anglers will land in a lifetime. That's where this all started — and where I still run day trips today.</p>
        <p>For the last ten years I've been Orvis Endorsed — the only endorsed guide on this roster. That endorsement isn't bought; it's earned, and it gets renewed on results. I'm also a U.S. Coast Guard licensed captain and fully insured. When you book with me, I'm the one in the boat — every trip, no exceptions.</p>
        <p>The Amazon is where I take that obsession to its limit. I run week-long expeditions on the Urubaxi aboard the Kalua II — 240 miles of private river where most fish have never seen a lure. From the canals to the world. That's the whole story.</p>

        <ul className="feature-list">
          {[
            ['🏆', '10 Years Orvis Endorsed — earned, not bought, renewed on results'],
            ['⚓', 'U.S. Coast Guard Licensed Captain · Fully Insured'],
            ['🚢', 'Live aboard the Kalua II — 57ft floating hotel with A/C suites'],
            ['🏞️', 'Exclusive access to the Urubaxi River — 240 miles, max 8 anglers ever'],
            ['🐟', '99% catch-and-release in partnership with indigenous communities'],
            ['🍽️', 'Truly all-inclusive: flights, lodging, meals, drinks, tackle & licences'],
          ].map(([icon, text]) => (
            <li key={text}>
              <div className="feature-icon">{icon}</div>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
