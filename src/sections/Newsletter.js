import React, { useState } from 'react';
import './Newsletter.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    // TODO: connect to Brevo list with Tier 3 segment tag per brief item #11
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="newsletter">
      <div className="newsletter-inner">
        <div className="newsletter-text">
          <div className="section-tag-line">Stay In the Loop</div>
          <h2 className="newsletter-title">
            Get Drew's <em>Fishing Intel.</em>
          </h2>
          <p className="newsletter-sub">
            Tips, trip openings, and dispatches from the river. No spam. Unsubscribe anytime.
          </p>
        </div>
        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address"
          />
          <button type="submit" className="newsletter-btn">
            {submitted ? '✓ Subscribed!' : 'Subscribe →'}
          </button>
        </form>
      </div>
    </section>
  );
}
