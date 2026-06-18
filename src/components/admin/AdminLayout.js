import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin',        label: 'Dashboard', icon: '◈',  end: true },
  { to: '/admin/hero',   label: 'Hero',      icon: '◎' },
  { to: '/admin/tours',  label: 'Tours',     icon: '🎣' },
  { to: '/admin/about',   label: 'About',   icon: '👤' },
  { to: '/admin/species',       label: 'Species',      icon: '🐟' },
  { to: '/admin/testimonials',        label: 'Testimonials',     icon: '⭐' },
  { to: '/admin/florida-day-trips',  label: 'Florida Day Trips', icon: '🌴' },
  { to: '/admin/video-section',      label: 'Video Section',     icon: '🎬' },
  { to: '/admin/gallery',            label: 'Gallery',           icon: '🖼' },
  // Phase 3+ — uncomment as CRUD pages are built
  // { to: '/admin/species',  label: 'Species',  icon: '🐟' },
  // { to: '/admin/gallery',  label: 'Gallery',  icon: '🖼' },
  // { to: '/admin/messages', label: 'Messages', icon: '✉' },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/admin/login', { replace: true });
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <div className={`admin-shell${sidebarOpen ? ' sidebar-open' : ''}`}>
      {/* Mobile overlay */}
      <div
        className="admin-overlay"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar */}
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-brand">
          <span className="admin-brand-icon">⚓</span>
          <div>
            <p className="admin-brand-name">Drew's Exotic Anglers</p>
            <p className="admin-brand-sub">Admin Portal</p>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-nav-item${isActive ? ' active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav-icon" aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <p className="admin-user-email" title={user?.email}>{user?.email}</p>
          <button
            className="admin-signout-btn"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── Main area */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(s => !s)}
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
          >
            <span /><span /><span />
          </button>
          <span className="admin-topbar-title">Content Management</span>
          <span className="admin-topbar-user" aria-label="Logged in as">
            {user?.email?.split('@')[0]}
          </span>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
