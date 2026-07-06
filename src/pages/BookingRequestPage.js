import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { createBookingRequest } from '../services/bookingRequestService';
import './BookingRequestPage.css';

const EXPEDITIONS = [
  'Florida Day Trip',
  'Amazon – Urubaxi',
  'Amazon – Kalua II',
  'Amazon – Jurubaxi',
  'Argentina – Don Joaquin',
  'Canada – St Jean River',
  'Other / Custom',
];

const DURATIONS = ['Half Day', '3/4 Day', 'Full Day'];
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Expert'];

const INITIAL = {
  selected_date: '',
  expedition: '',
  number_of_anglers: '',
  duration: '',
  preferred_guide: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  country: '',
  hotel: '',
  experience_level: '',
  target_species: '',
  notes: '',
  agreed: false,
};

function reducer(state, { field, value }) {
  return { ...state, [field]: value };
}

function validate(f) {
  const errors = {};
  if (!f.first_name.trim())       errors.first_name       = 'First name is required';
  if (!f.last_name.trim())        errors.last_name        = 'Last name is required';
  if (!f.expedition)              errors.expedition        = 'Please select an expedition';
  if (!f.duration)                errors.duration          = 'Please select a duration';
  if (!f.number_of_anglers || Number(f.number_of_anglers) < 1)
                                  errors.number_of_anglers = 'Enter number of anglers';
  if (!f.email.trim())            errors.email             = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
                                  errors.email             = 'Enter a valid email address';
  if (!f.phone.trim())            errors.phone             = 'Phone number is required';
  else if (!/^[+\d\s\-().]{7,20}$/.test(f.phone.trim()))
                                  errors.phone             = 'Enter a valid phone number';
  if (!f.agreed)                  errors.agreed            = 'Please accept to continue';
  return errors;
}

export default function BookingRequestPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [form,    dispatch] = useReducer(reducer, INITIAL);
  const [errors,  setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // Build expedition options — include tour title if it was passed from TourDetails
  const expeditionOptions = useMemo(() => {
    const passed = (location.state || {}).expedition || '';
    if (passed && !EXPEDITIONS.includes(passed)) {
      return [passed, ...EXPEDITIONS];
    }
    return EXPEDITIONS;
  }, [location.state]);

  // Pre-fill from navigation state passed by FloridaTrips.js or TourDetails.js
  useEffect(() => {
    const state = location.state || {};
    if (state.date)       dispatch({ field: 'selected_date', value: state.date });
    if (state.expedition) dispatch({ field: 'expedition',    value: state.expedition });
  }, [location.state]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function set(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      dispatch({ field, value });
      if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const first = document.querySelector('.brp-field--error input, .brp-field--error select, .brp-field--error textarea');
      first?.focus();
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const payload = {
        selected_date:     form.selected_date    || null,
        expedition:        form.expedition        || null,
        duration:          form.duration          || null,
        number_of_anglers: Number(form.number_of_anglers) || null,
        preferred_guide:   form.preferred_guide   || null,
        first_name:        form.first_name.trim(),
        last_name:         form.last_name.trim(),
        email:             form.email.trim().toLowerCase(),
        phone:             form.phone.trim(),
        country:           form.country           || null,
        hotel:             form.hotel             || null,
        experience_level:  form.experience_level  || null,
        target_species:    form.target_species     || null,
        notes:             form.notes             || null,
        status:            'Pending',
      };

      await createBookingRequest(payload);

      // Fire-and-forget email notification (non-blocking)
      fetch('/.netlify/functions/booking-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(err => console.warn('[BookingRequest] email notify failed:', err));

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('[BookingRequest] submit error:', err);
      setApiError('Something went wrong. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="brp-success-page">
        <nav className={`brp-nav${scrolled ? ' brp-nav--scrolled' : ''}`}>
          <Link to="/" className="brp-nav-logo">Drew Guide services</Link>
        </nav>
        <div className="brp-success-wrap">
          <div className="brp-success-card">
            <div className="brp-success-icon">🎣</div>
            <h1 className="brp-success-title">Request Received!</h1>
            <p className="brp-success-msg">
              Thanks, <strong>{form.first_name}</strong>! We received your booking request.
              Drew will personally review availability and contact you within{' '}
              <strong>24 hours</strong>.
            </p>
            <p className="brp-success-note">
              A confirmation email has been sent to <strong>{form.email}</strong>.
            </p>
            <p className="brp-success-disclaimer">
              This is an availability request — not yet a confirmed booking.
            </p>
            <Link to="/" className="brp-success-btn">← Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="brp-page">
      {/* Minimal nav */}
      <nav className={`brp-nav${scrolled ? ' brp-nav--scrolled' : ''}`}>
        <Link to="/" className="brp-nav-logo">Drew Guide services</Link>
        <Link to="/" className="brp-nav-back">← Back</Link>
      </nav>

      {/* Hero */}
      <header className="brp-hero">
        <div className="brp-hero-inner">
          <div className="brp-eyebrow">Booking Request</div>
          <h1 className="brp-hero-title">Check Availability</h1>
          <p className="brp-hero-sub">
            Fill in your details and Drew will personally review availability and
            respond within 24 hours.
          </p>
        </div>
      </header>

      <main className="brp-main">
        <form className="brp-form" onSubmit={handleSubmit} noValidate>

          {/* ── Section 1: Trip Information */}
          <fieldset className="brp-section">
            <legend className="brp-section-legend">
              <span className="brp-section-num">01</span> Trip Information
            </legend>
            <div className="brp-grid brp-grid--2">

              <Field label="Selected Date" error={errors.selected_date}>
                <input
                  type="text"
                  placeholder="e.g. Monday, Jul 14, 2025"
                  value={form.selected_date}
                  onChange={set('selected_date')}
                  className={errors.selected_date ? 'brp-input--error' : ''}
                />
              </Field>

              <Field label="Expedition *" error={errors.expedition}>
                <select
                  value={form.expedition}
                  onChange={set('expedition')}
                  className={errors.expedition ? 'brp-input--error' : ''}
                >
                  <option value="">Select expedition…</option>
                  {expeditionOptions.map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </Field>

              <Field label="Number of Anglers *" error={errors.number_of_anglers}>
                <input
                  type="number"
                  min="1"
                  max="20"
                  placeholder="e.g. 2"
                  value={form.number_of_anglers}
                  onChange={set('number_of_anglers')}
                  className={errors.number_of_anglers ? 'brp-input--error' : ''}
                />
              </Field>

              <Field label="Duration *" error={errors.duration}>
                <select
                  value={form.duration}
                  onChange={set('duration')}
                  className={errors.duration ? 'brp-input--error' : ''}
                >
                  <option value="">Select duration…</option>
                  {DURATIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </Field>

              <Field label="Preferred Guide (optional)" className="brp-grid-full">
                <input
                  type="text"
                  placeholder="Leave blank for any available guide"
                  value={form.preferred_guide}
                  onChange={set('preferred_guide')}
                />
              </Field>

            </div>
          </fieldset>

          {/* ── Section 2: Contact Information */}
          <fieldset className="brp-section">
            <legend className="brp-section-legend">
              <span className="brp-section-num">02</span> Contact Information
            </legend>
            <div className="brp-grid brp-grid--2">

              <Field label="First Name *" error={errors.first_name}>
                <input
                  type="text"
                  placeholder="John"
                  value={form.first_name}
                  onChange={set('first_name')}
                  autoComplete="given-name"
                  className={errors.first_name ? 'brp-input--error' : ''}
                />
              </Field>

              <Field label="Last Name *" error={errors.last_name}>
                <input
                  type="text"
                  placeholder="Smith"
                  value={form.last_name}
                  onChange={set('last_name')}
                  autoComplete="family-name"
                  className={errors.last_name ? 'brp-input--error' : ''}
                />
              </Field>

              <Field label="Email Address *" error={errors.email}>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  className={errors.email ? 'brp-input--error' : ''}
                />
              </Field>

              <Field label="Phone Number *" error={errors.phone}>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                  className={errors.phone ? 'brp-input--error' : ''}
                />
              </Field>

              <Field label="Country" className="brp-grid-full">
                <input
                  type="text"
                  placeholder="United States"
                  value={form.country}
                  onChange={set('country')}
                  autoComplete="country-name"
                />
              </Field>

            </div>
          </fieldset>

          {/* ── Section 3: Trip Details */}
          <fieldset className="brp-section">
            <legend className="brp-section-legend">
              <span className="brp-section-num">03</span> Trip Details
            </legend>
            <div className="brp-grid brp-grid--2">

              <Field label="Hotel / Pickup Location" className="brp-grid-full">
                <input
                  type="text"
                  placeholder="Hotel name or pickup address"
                  value={form.hotel}
                  onChange={set('hotel')}
                />
              </Field>

              <Field label="Experience Level">
                <select value={form.experience_level} onChange={set('experience_level')}>
                  <option value="">Select level…</option>
                  {EXPERIENCE_LEVELS.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </Field>

              <Field label="Target Species">
                <input
                  type="text"
                  placeholder="e.g. Peacock Bass, Golden Dorado"
                  value={form.target_species}
                  onChange={set('target_species')}
                />
              </Field>

              <Field label="Additional Notes" className="brp-grid-full">
                <textarea
                  rows={4}
                  placeholder="Any special requests, dietary needs, or questions for Drew…"
                  value={form.notes}
                  onChange={set('notes')}
                />
              </Field>

            </div>
          </fieldset>

          {/* ── Agreement + Submit */}
          <div className="brp-footer">
            <label className={`brp-agree${errors.agreed ? ' brp-agree--error' : ''}`}>
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={set('agreed')}
                aria-describedby={errors.agreed ? 'brp-agree-err' : undefined}
              />
              <span>
                I understand this is an availability request and not a confirmed booking.
              </span>
            </label>
            {errors.agreed && (
              <p id="brp-agree-err" className="brp-field-error">{errors.agreed}</p>
            )}

            {apiError && (
              <div className="brp-api-error" role="alert">
                <span>⚠</span> {apiError}
              </div>
            )}

            <button
              type="submit"
              className="brp-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="brp-submit-loading">
                  <span className="brp-spinner" aria-hidden="true" />
                  Sending Request…
                </span>
              ) : 'Request Availability'}
            </button>

            <p className="brp-trust">
              Drew personally responds to every inquiry within 24 hours.
            </p>
          </div>

        </form>
      </main>
    </div>
  );
}

function Field({ label, error, className, children }) {
  return (
    <div className={`brp-field${error ? ' brp-field--error' : ''}${className ? ' ' + className : ''}`}>
      <label className="brp-label">{label}</label>
      {children}
      {error && <span className="brp-field-error">{error}</span>}
    </div>
  );
}
