import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveFloridaDayTrip } from '../services/floridaDayTripsService';
import { useAvailability } from '../hooks/useAvailability';
import './FloridaTrips.css';

// Fallback values shown when Supabase data is unavailable
const FB_SPECIES  = ['Peacock Bass', 'Largemouth', 'Native', 'Exotics'];
const FB_INCLUDED = [
  '8-hour full day on Miami canals',
  'Capt Drew personally guiding',
  'All tackle and bait provided',
  'Bottled water and ice',
  'Catch photography',
  'Lunch Provided',
];

export default function FloridaTrips() {
  const [trip, setTrip]   = useState(null);
  const availability      = useAvailability();
  const navigate           = useNavigate();

  // FareHarbor placeholder — date selector UI only, no backend
  const [selectedDate, setSelectedDate] = useState(null);
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });

  useEffect(() => {
    getActiveFloridaDayTrip()
      .then(data => setTrip(data))
      .catch(() => {}); // fail silently — fallbacks keep the section visible
  }, []);

  // Read from JSONB columns; fall back to hardcoded defaults
  const species  = Array.isArray(trip?.species)  ? trip.species.filter(Boolean)  : [];
  const included = Array.isArray(trip?.includes) ? trip.includes.filter(Boolean) : [];
  const pricing  = Array.isArray(trip?.pricing)  ? trip.pricing                  : [];

  const displaySpecies  = species.length  > 0 ? species  : FB_SPECIES;
  const displayIncluded = included.length > 0 ? included : FB_INCLUDED;
  const ctaText    = trip?.cta_text || 'Check Availability →';
  const availTitle = trip?.availability_title || '⚡ Live Expedition Availability';

  function handleCheckAvailability() {
    const state = { expedition: 'Florida Day Trip' };
    if (selectedDate !== null) {
      state.date = days[selectedDate].toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      });
    }
    navigate('/booking-request', { state });
  }

  return (
    <section id="florida-day-trips" className="florida-trips">

      <div className="florida-header">
        <div className="section-tag-line">
          {trip?.eyebrow || 'Tier 1 · Florida Day Trips'}
        </div>
        <h2 className="section-title">
          {trip?.title || 'Fish South Florida with Capt Drew.'}
        </h2>
        <p className="section-sub">
          {trip?.subtitle || 'Full-day freshwater trips on Miami\'s canals. Peacock Bass, Largemouth, and 20+ species. Local expertise. World-class fishing.'}
        </p>
      </div>

      <div className="florida-grid">

        {/* LEFT — what's included */}
        <div className="florida-info">
          <img
            src={trip?.main_image || '/images/gallery/captain.webp'}
            alt="Capt Drew on Miami's canals"
            className="florida-img"
            loading="lazy"
            width="400"
            height="260"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="florida-info-block">
            <div className="florida-block-label">Target Species</div>
            <div className="florida-species">
              {displaySpecies.map(s => (
                <span key={s} className="florida-pill">{s}</span>
              ))}
            </div>
          </div>
          <div className="florida-info-block">
            <div className="florida-block-label">What's Included</div>
            <ul className="florida-included">
              {displayIncluded.map(i => <li key={i}>✓ {i}</li>)}
            </ul>
          </div>
          <div className="florida-info-block">
            <div className="florida-block-label">Who It's For</div>
            <p className="florida-who">
              {trip?.description || 'All skill levels welcome — first-time anglers, families, and seasoned pros. Capt Drew matches the day to your group.'}
            </p>
          </div>
        </div>

        {/* RIGHT — booking + pricing */}
        <div className="florida-booking">

          {/* LIVE AVAILABILITY */}
          {availability.length > 0 && (
            <div className="florida-avail">
              <div className="florida-avail-label">{availTitle}</div>
              {availability.map(t => (
                <div className="florida-avail-row" key={t.id}>
                  <span className="florida-avail-trip">{t.trip}</span>
                  <span className={`florida-avail-spots ${t.spots <= 2 ? 'florida-avail-spots--urgent' : ''}`}>
                    {t.spots} of {t.total} remaining
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* PRICING */}
          <div className="florida-pricing">
            <div className="florida-pricing-label">Transparent Pricing · No Hidden Fees</div>
            {pricing.length > 0 && (
              <div className="florida-pricing-list">
                {pricing.map((p, i) => (
                  <div className="florida-price-row" key={i}>
                    <span className="florida-price-tier">{p.label}</span>
                    <span className="florida-price-amt">{p.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CALENDAR — FareHarbor placeholder */}
          <div className="florida-calendar">
            <div className="florida-cal-header">
              <span>📅</span>
              <span>Check Availability · Next 14 Days</span>
              <button
                className="florida-cal-pick-date"
                onClick={() => document.getElementById('florida-date-input').showPicker()}
              >
                📆 Pick a Date
              </button>
              <input
                type="date"
                id="florida-date-input"
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => {
                  if (!e.target.value) return;
                  const [year, month, day] = e.target.value.split('-').map(Number);
                  const picked = new Date(year, month - 1, day);
                  const formatted = picked.toLocaleDateString('en-US', {
                    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
                  });
                  navigate('/booking-request', { state: { date: formatted, expedition: 'Florida Day Trip' } });
                }}
              />
            </div>
            <div className="florida-cal-grid">
              {days.map((d, i) => {
                const day     = d.getDate();
                const month   = d.toLocaleDateString('en-US', { month: 'short' });
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

          <button type="button" className="btn-amber-full" onClick={handleCheckAvailability}>
            {selectedDate !== null
              ? `Reserve ${days[selectedDate].toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} →`
              : ctaText}
          </button>
          <p className="florida-trust">Capt Drew personally responds to every inquiry within 24 hours.</p>

        </div>
      </div>

    </section>
  );
}
