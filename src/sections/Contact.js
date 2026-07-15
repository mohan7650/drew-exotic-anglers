import React, { useState } from 'react';
import { useAvailability } from '../hooks/useAvailability';
import './Contact.css';

export default function Contact() {
  const availability = useAvailability();
  const [fields, setFields] = useState({
    firstName: '',
    lastName: '',
    email: '',
    tripType: 'Jurubaxi Full Week',
    groupSize: 'Solo (1 angler)',
    message: '',
  });
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(false);

  const handleChange = (e) => {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      if (!res.ok) throw new Error('Request failed');
      setSent(true);
      setFields({
        firstName: '', lastName: '', email: '',
        tripType: 'Jurubaxi',
        groupSize: 'Solo (1 angler)', message: '',
      });
      setTimeout(() => setSent(false), 8000);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-info">
        <div className="section-tag-line">Get in Touch</div>
        <h2 className="section-title">Reserve Your <em>Expedition.</em></h2>
        <p className="section-sub">
          Call Capt Drew directly, message on WhatsApp,
          or fill out the form — Drew personally responds within 24 hours.
        </p>

        {[
          { icon: '📍', text: 'Miami, FL' },
          { icon: '📞', text: '+1 (786) 342-5791 — Capt Drew Direct', href: 'tel:7863425791' },
          { icon: '💬', text: 'WhatsApp: +1 (786) 342-5791 — Preferred for international clients', whatsapp: true, href: 'https://wa.me/17863425791' },
          { icon: '🌐', text: 'drewsguideservice.com · Capt Drew Rodriguez' },
          { icon: '🗓️', text: 'Trips run 7 days' },
        ].map(d => (
          <div
            className={`contact-detail ${d.whatsapp ? 'contact-detail--whatsapp' : ''}`}
            key={d.text}
          >
            <div className="contact-icon" aria-hidden="true">{d.icon}</div>
            {d.href ? (
              <a
                href={d.href}
                target={d.whatsapp ? '_blank' : undefined}
                rel={d.whatsapp ? 'noopener noreferrer' : undefined}
              >
                {d.text}
              </a>
            ) : (
              <span>{d.text}</span>
            )}
          </div>
        ))}
      </div>

      <form
        className="contact-form"
        onSubmit={handleSubmit}
        noValidate
      >

        {/* Spot Availability scarcity trigger per brief item #06 */}
        {availability.length > 0 && (
          <div className="contact-scarcity" aria-label="Live trip availability">
            <div className="scarcity-label">⚡ Live Spots Available</div>
            {availability.map(t => (
              <div className="scarcity-row" key={t.id}>
                <span className="scarcity-trip">{t.trip}</span>
                <span className={`scarcity-count ${t.spots <= 2 ? 'urgent' : ''}`}>
                  {t.spots} of {t.total} spots remaining
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              placeholder="John"
              value={fields.firstName}
              onChange={handleChange}
              required
              autoComplete="given-name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              placeholder="Smith"
              value={fields.lastName}
              onChange={handleChange}
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Email Address</label>
          <input
            id="contactEmail"
            type="email"
            name="email"
            placeholder="john@example.com"
            value={fields.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tripType">Trip Type</label>
            <select
              id="tripType"
              name="tripType"
              value={fields.tripType}
              onChange={handleChange}
            >
              <option>Jurubaxi Full Week</option>
              <option>Kalua II Trophy Hunt</option>
              <option>Jurubaxi River Special</option>
              <option>Argentina Don Joaquin (Golden Dorado)</option>
              <option>Canada St Jean Salmon</option>
              <option>Florida Day Trip</option>
              <option>Private Group Charter (up to 8)</option>
              <option>Custom / Ask Capt Drew</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="groupSize">Group Size</label>
            <select
              id="groupSize"
              name="groupSize"
              value={fields.groupSize}
              onChange={handleChange}
            >
              <option>Solo (1 angler)</option>
              <option>2 Anglers</option>
              <option>3–4 Anglers</option>
              <option>5–6 Anglers</option>
              <option>7–8 Anglers (Full Boat)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell Capt Drew your target species, preferred dates, and any questions…"
            rows={5}
            value={fields.message}
            onChange={handleChange}
          />
        </div>

        {/* Button text per brief item #06 */}
        <button
          className="form-submit"
          type="submit"
          disabled={loading || sent}
        >
          {sent ? '✓ Reservation Request Sent!' : loading ? 'Sending…' : 'Reserve My Spot →'}
        </button>

        {/* Trust line per brief item #06 */}
        <p className="form-trust">
          Drew personally responds to every inquiry within 24 hours.
        </p>

        {sent && (
          <p className="form-success" role="alert">
            Thank you! Capt Drew will be in touch within 24 hours.
          </p>
        )}

        {error && (
          <p className="form-error" role="alert">
            Something went wrong. Please{' '}
            <a href="https://wa.me/17863425791" target="_blank" rel="noopener noreferrer">
              message Drew on WhatsApp
            </a>{' '}
            or call <a href="tel:7863425791">(786) 342-5791</a> directly.
          </p>
        )}
      </form>
    </section>
  );
}
