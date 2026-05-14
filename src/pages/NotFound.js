import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-inner">
        <div className="not-found-icon">🎣</div>
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">
          Lost on the <em>River?</em>
        </h1>
        <p className="not-found-sub">
          This page doesn't exist — but the Urubaxi does.
          Let's get you back on the water.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-btn">← Back to Home</Link>
          <Link to="/#contact" className="not-found-link">Contact Capt Drew</Link>
        </div>
      </div>
    </div>
  );
}
