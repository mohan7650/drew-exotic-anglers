import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-hero">
        <span className="dashboard-wave" aria-hidden="true">🎣</span>
        <h1 className="dashboard-heading">Welcome back</h1>
        <p className="dashboard-email">{user?.email}</p>
      </header>

      <div className="dashboard-status">
        <div className="dashboard-status-card">
          <span className="dashboard-status-dot" aria-hidden="true" />
          <div>
            <p className="dashboard-status-label">Authentication</p>
            <p className="dashboard-status-value">Active session</p>
          </div>
        </div>
      </div>

      <section className="dashboard-coming-soon">
        <h2 className="dashboard-section-heading">Phase 2 — Coming Soon</h2>
        <ul className="dashboard-feature-list">
          {[
            'Gallery uploads',
            'Enquiry inbox',
            'Newsletter subscribers',
          ].map(item => (
            <li key={item} className="dashboard-feature-item">
              <span className="dashboard-feature-icon" aria-hidden="true">◈</span>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
