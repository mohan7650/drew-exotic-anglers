import React, { useState } from 'react';
import './Contact.css';

// Live spot availability per brief item #06 — manually updatable scarcity signal
const liveAvailability = [
  { trip: 'September 2026 · Urubaxi Full Week', spots: 2, total: 8 },
  { trip: 'November 2026 · Kalua II Trophy Hunt', spots: 4, total: 8 },
  { trip: 'January 2027 · Jurubaxi Special', spots: 6, total: 8 },
];

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <section id="contact" className="contact">
      <div className="contact-info">
        <div className="section-tag-line">Get in Touch</div>
        <h2 className="section-title">Reserve Your <em>Expedition.</em></h2>
        <p className="section-sub">Ready to fish the Urubaxi? Call Capt Drew directly, message on WhatsApp, or fill out the form — Drew personally responds within 24 hours.</p>

        {[
          { icon:'📍', text:'Barcelos, Amazonas, Brazil — Base for Urubaxi River' },
          { icon:'📞', text:'(786) 342-5791 — Capt Drew Direct' },
          { icon:'💬', text:'WhatsApp: +1 (786) 342-5791 — Preferred for international clients', whatsapp: true },
          { icon:'🌐', text:'drewsguideservice.com · Capt Drew Rodriguez' },
          { icon:'🗓️', text:'Trips run Friday to Friday' },
        ].map(d => (
          <div className={`contact-detail ${d.whatsapp ? 'contact-detail--whatsapp' : ''}`} key={d.text}>
            <div className="contact-icon">{d.icon}</div>
            <span>{d.text}</span>
          </div>
        ))}
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        {/* Spot Availability scarcity trigger per brief item #06 */}
        <div className="contact-scarcity">
          <div className="scarcity-label">⚡ Live Spots Available</div>
          {liveAvailability.map(t => (
            <div className="scarcity-row" key={t.trip}>
              <span className="scarcity-trip">{t.trip}</span>
              <span className={`scarcity-count ${t.spots <= 2 ? 'urgent' : ''}`}>
                {t.spots} of {t.total} spots remaining
              </span>
            </div>
          ))}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input type="text" placeholder="John" required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input type="text" placeholder="Smith" required />
          </div>
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" placeholder="john@example.com" required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Trip Type</label>
            <select>
              <option>Urubaxi Full Week (Fri–Fri)</option>
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
            <label>Group Size</label>
            <select>
              <option>Solo (1 angler)</option>
              <option>2 Anglers</option>
              <option>3–4 Anglers</option>
              <option>5–6 Anglers</option>
              <option>7–8 Anglers (Full Boat)</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Message</label>
          <textarea placeholder="Tell Capt Drew your target species, preferred dates, and any questions…" rows={5} />
        </div>

        {/* Button text changed from 'Send Enquiry' to 'Reserve My Spot' per brief item #06 */}
        <button className="form-submit" type="submit">
          {sent ? '✓ Reservation Request Sent!' : 'Reserve My Spot →'}
        </button>

        {/* Trust line per brief item #06 */}
        <p className="form-trust">
          Drew personally responds to every inquiry within 24 hours.
        </p>

        {sent && <p className="form-success">Thank you! Capt Drew will be in touch within 24 hours.</p>}
      </form>
    </section>
  );
}
