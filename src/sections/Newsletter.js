import React, { useState } from 'react';
import './Newsletter.css';

function encode(data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

export default function Newsletter() {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(false);

    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': 'newsletter', email }),
      });
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 6000);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" className="newsletter">
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

        <form
          className="newsletter-form"
          name="newsletter"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="form-name" value="newsletter" />
          <input type="hidden" name="bot-field" />

          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address for newsletter"
            disabled={loading || submitted}
          />

          <button
            type="submit"
            className="newsletter-btn"
            disabled={loading || submitted}
          >
            {submitted ? '✓ Subscribed!' : loading ? 'Subscribing…' : 'Subscribe →'}
          </button>
        </form>

        {error && (
          <p className="newsletter-error" role="alert">
            Something went wrong. Please try again or{' '}
            <a href="https://wa.me/17863425791" target="_blank" rel="noopener noreferrer">
              message Drew directly
            </a>.
          </p>
        )}
      </div>
    </section>
  );
}
