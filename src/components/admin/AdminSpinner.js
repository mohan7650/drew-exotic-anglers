import React from 'react';
import './AdminSpinner.css';

export default function AdminSpinner() {
  return (
    <div className="admin-spinner-screen" aria-label="Loading" role="status">
      <div className="admin-spinner-ring" />
      <span className="admin-spinner-text">Loading…</span>
    </div>
  );
}
