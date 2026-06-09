import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already authenticated → send to dashboard
  const from = location.state?.from?.pathname || '/admin';
  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, navigate, from]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
      // onAuthStateChange in AuthContext will update user → useEffect above navigates
    } catch (err) {
      setError(normaliseError(err));
      setSubmitting(false);
    }
  }

  if (loading) return null; // AuthSpinner shown by ProtectedRoute; avoid flash here

  return (
    <div className="login-page">
      {/* Background accent */}
      <div className="login-bg-gradient" aria-hidden="true" />

      <div className="login-card">
        {/* Brand header */}
        <div className="login-header">
          <span className="login-brand-icon" aria-hidden="true">⚓</span>
          <h1 className="login-title">Drew's Exotic Anglers</h1>
          <p className="login-subtitle">Admin Portal</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="login-error" role="alert">
            <span className="login-error-icon" aria-hidden="true">⚠</span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="login-form">
          <div className="login-field">
            <label htmlFor="login-email" className="login-label">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="login-input"
              placeholder="admin@example.com"
              autoComplete="email"
              required
              disabled={submitting}
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password" className="login-label">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="login-input"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={submitting || !email || !password}
          >
            {submitting ? (
              <span className="login-submit-spinner" aria-hidden="true" />
            ) : null}
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="login-footer-note">
          Authorised personnel only
        </p>
      </div>
    </div>
  );
}

function normaliseError(err) {
  const msg = err?.message ?? '';
  if (msg.toLowerCase().includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.toLowerCase().includes('email not confirmed')) {
    return 'Your email address has not been confirmed yet.';
  }
  if (msg.toLowerCase().includes('too many requests')) {
    return 'Too many sign-in attempts. Please wait a few minutes.';
  }
  return msg || 'An unexpected error occurred. Please try again.';
}
