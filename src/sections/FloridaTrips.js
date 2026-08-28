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
  today.setHours(0, 0, 0, 0);

  const WEEKS_VISIBLE = 4;
  const DAYS_VISIBLE  = WEEKS_VISIBLE * 7;
  const [viewStart, setViewStart] = useState(today);

  const ALL_WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  // Rotate so the header lines up with viewStart's weekday, since the grid always
  // begins on viewStart (today, or today + a 4-week jump) rather than a Sunday.
  const weekdayLabels = [
    ...ALL_WEEKDAY_LABELS.slice(viewStart.getDay()),
    ...ALL_WEEKDAY_LABELS.slice(0, viewStart.getDay()),
  ];

  const calendarCells = Array.from({ length: DAYS_VISIBLE }, (_, i) => {
    const d = new Date(viewStart.getFullYear(), viewStart.getMonth(), viewStart.getDate() + i);
    return { date: d, inMonth: true };
  });

  function goPrevWeeks() {
    setViewStart(prev => {
      const next = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - DAYS_VISIBLE);
      return next < today ? today : next;
    });
  }

  function goNextWeeks() {
    setViewStart(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + DAYS_VISIBLE));
  }

  function isPastDate(d) {
    return d < today;
  }

  function isSameDate(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  const rangeLabel = `${viewStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${
    calendarCells[calendarCells.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }`;

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
    if (selectedDate) {
      state.date = selectedDate.toLocaleDateString('en-US', {
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
              <button
                type="button"
                className="florida-cal-nav"
                onClick={goPrevWeeks}
                aria-label="Previous 4 weeks"
                disabled={isSameDate(viewStart, today)}
              >
                ←
              </button>
              <div className="florida-cal-title">
                <span className="florida-cal-title-eyebrow">📅 Select Your Trip Date</span>
                <span className="florida-cal-title-month">{rangeLabel}</span>
              </div>
              <button type="button" className="florida-cal-nav" onClick={goNextWeeks} aria-label="Next 4 weeks">→</button>
            </div>

            <div className="florida-cal-weekdays">
              {weekdayLabels.map((w, i) => <div key={`${w}-${i}`} className="florida-cal-weekday-label">{w}</div>)}
            </div>

            <div className="florida-cal-grid">
              {calendarCells.map(({ date, inMonth }, i) => {
                const disabled   = !inMonth || isPastDate(date);
                const isSelected = !disabled && isSameDate(date, selectedDate);
                return (
                  <button
                    key={i}
                    type="button"
                    className={`florida-cal-day ${isSelected ? 'selected' : ''} ${disabled ? 'unavailable' : ''}`}
                    disabled={disabled}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="cal-date">{date.getDate()}</div>
                    <div className="cal-month">{date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                  </button>
                );
              })}
            </div>

            <div className="florida-cal-legend">
              <span className="florida-cal-legend-item"><span className="florida-cal-swatch available" /> Available</span>
              <span className="florida-cal-legend-item"><span className="florida-cal-swatch unavailable" /> Unavailable</span>
            </div>

            <div className="florida-cal-note">Bookings are open year-round. Use the arrows to view the next 4 weeks.</div>
          </div>

          <button type="button" className="btn-amber-full" onClick={handleCheckAvailability}>
            {selectedDate
              ? `Reserve ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} →`
              : ctaText}
          </button>
          <p className="florida-trust">Capt Drew personally responds to every inquiry within 24 hours.</p>

        </div>
      </div>

    </section>
  );
}
