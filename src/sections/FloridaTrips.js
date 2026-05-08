import React, { useState } from 'react';
import './FloridaTrips.css';

// Pricing tiers per brief item #05
const pricing = [
  { tier: 'Full Day · 1–2 Anglers',  price: '$900',  note: 'Standard rate' },
  { tier: '3 Anglers',               price: '$1,000', note: '+$100' },
  { tier: '4 Anglers (2 boats)',     price: '$1,100', note: 'Split boats' },
  { tier: '5 Anglers (2 boats)',     price: '$1,200', note: 'Split boats' },
  { tier: '6 Anglers (2 boats)',     price: '$1,300', note: 'Split boats' },
];

const included = [
  '8-hour full day on Miami canals',
  'Capt Drew personally guiding',
  'All tackle and bait provided',
  'Bottled water and ice',
  'Catch photography',
  'Fishing licence covered',
];

export default function FloridaTrips() {
  // Simple month-based date selector — placeholder for FareHarbor live calendar embed
  const [selectedDate, setSelectedDate] = useState(null);

  // Generate next 14 days
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });

  return (
    <section id="florida-day-trips" className="florida-trips">
      <div className="florida-header">
        <div className="section-tag-line">Tier 1 · Florida Day Trips</div>
        <h2 className="section-title">Fish South Florida<br /><em>with Capt Drew.</em></h2>
        <p className="section-sub">Full-day freshwater trips on Miami's canals. Peacock Bass, Largemouth, and 20+ species. Local expertise. World-class fishing.</p>
      </div>

      <div className="florida-grid">
        {/* LEFT — what's included */}
        <div className="florida-info">
          <img
            src="/images/gallery/captain.jpg"
            alt="Capt Drew on Miami's canals"
            className="florida-img"
            onError={e => { e.target.style.display='none'; }}
          />
          <div className="florida-info-block">
            <div className="florida-block-label">Target Species</div>
            <div className="florida-species">
              <span className="florida-pill">Peacock Bass</span>
              <span className="florida-pill">Largemouth</span>
              <span className="florida-pill">Snakehead</span>
              <span className="florida-pill">Clown Knifefish</span>
              <span className="florida-pill">+20 More</span>
            </div>
          </div>
          <div className="florida-info-block">
            <div className="florida-block-label">What's Included</div>
            <ul className="florida-included">
              {included.map(i => <li key={i}>✓ {i}</li>)}
            </ul>
          </div>
          <div className="florida-info-block">
            <div className="florida-block-label">Who It's For</div>
            <p className="florida-who">All skill levels welcome — first-time anglers, families, and seasoned pros. Capt Drew matches the day to your group.</p>
          </div>
        </div>

        {/* RIGHT — booking + pricing */}
        <div className="florida-booking">
          <div className="florida-pricing">
            <div className="florida-pricing-label">Transparent Pricing · No Hidden Fees</div>
            <div className="florida-pricing-list">
              {pricing.map(p => (
                <div className="florida-price-row" key={p.tier}>
                  <span className="florida-price-tier">{p.tier}</span>
                  <span className="florida-price-amt">{p.price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FareHarbor calendar placeholder — to be replaced with live embed at launch */}
          <div className="florida-calendar">
            <div className="florida-cal-header">
              <span>📅</span>
              <span>Check Availability · Next 14 Days</span>
            </div>
            <div className="florida-cal-grid">
              {days.map((d, i) => {
                const day = d.getDate();
                const month = d.toLocaleDateString('en-US', { month: 'short' });
                const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
                const isSelected = selectedDate === i;
                return (
                  <button
                    key={i}
                    className={`florida-cal-day ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(i)}
                  >
                    <div className="cal-weekday">{weekday}</div>
                    <div className="cal-date">{day}</div>
                    <div className="cal-month">{month}</div>
                  </button>
                );
              })}
            </div>
            <div className="florida-cal-note">Live booking calendar — instant confirmation via FareHarbor at launch.</div>
          </div>

          <a href="#contact" className="btn-amber-full">
            {selectedDate !== null
              ? `Reserve ${days[selectedDate].toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })} →`
              : 'Check Availability →'}
          </a>
          <p className="florida-trust">Capt Drew personally responds to every inquiry within 24 hours.</p>
        </div>
      </div>
    </section>
  );
}
