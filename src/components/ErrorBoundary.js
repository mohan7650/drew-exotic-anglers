import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a1a14',
          color: '#FAF6EE',
          fontFamily: 'Source Sans Pro, sans-serif',
          textAlign: 'center',
          padding: '40px 24px',
          gap: '20px',
        }}>
          <div style={{ fontSize: '48px' }}>🎣</div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '32px', color: '#FAF6EE' }}>
            Something went wrong.
          </h1>
          <p style={{ color: 'rgba(225,245,238,0.65)', fontSize: '16px', maxWidth: '420px', lineHeight: '1.7' }}>
            An unexpected error occurred. Please refresh the page or contact Capt Drew directly.
          </p>
          <a
            href="/"
            style={{
              background: '#D4891A',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: '2px',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '700',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Return to Home
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
