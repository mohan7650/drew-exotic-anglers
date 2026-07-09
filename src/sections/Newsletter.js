import React, { useState } from 'react';
import './Newsletter.css';

export default function Newsletter() {
  const [email, setEmail]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setSubmitted(true);
        setEmail('');
        setTimeout(() => setSubmitted(false), 6000);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
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
            Get onboard with  <em>Drewsletter.</em>
          </h2>
          <p className="newsletter-sub">
            Tips, trip openings, and dispatches from the river. No spam. Unsubscribe anytime.
          </p>
        </div>

        <form
          className="newsletter-form"
          onSubmit={handleSubmit}
        >
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
            {error}{' '}
            <a href="https://wa.me/17863425791" target="_blank" rel="noopener noreferrer">
              Message Drew directly
            </a>.
          </p>
        )}
      </div>
    </section>
  );
}
