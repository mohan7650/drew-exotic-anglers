import React, { useCallback, useEffect, useState } from 'react';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import {
  listBookingRequests,
  updateBookingRequestStatus,
} from '../../../services/bookingRequestService';
import './BookingRequestsListPage.css';

const STATUSES = ['Pending', 'Contacted', 'Confirmed', 'Cancelled'];

const STATUS_STYLES = {
  Pending:   'brl-badge--pending',
  Contacted: 'brl-badge--contacted',
  Confirmed: 'brl-badge--confirmed',
  Cancelled: 'brl-badge--cancelled',
};

function fmt(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function BookingRequestsListPage() {
  const [all,        setAll]        = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected,   setSelected]   = useState(null);
  const [updating,   setUpdating]   = useState(false);
  const [updateError, setUpdateError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setAll(await listBookingRequests());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filtered = all.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || [
      r.first_name, r.last_name, r.email, r.phone, r.expedition, r.selected_date,
    ].some(v => (v || '').toLowerCase().includes(q));
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Status update ─────────────────────────────────────────────────────────

  async function handleStatusChange(id, status) {
    setUpdating(true);
    setUpdateError('');
    try {
      await updateBookingRequestStatus(id, status);
      setAll(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    } catch (e) {
      setUpdateError(e.message);
    } finally {
      setUpdating(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="brl-page">
      <AdminPageHeader
        title="Booking Requests"
        subtitle={`${all.length} request${all.length !== 1 ? 's' : ''}`}
      />

      {/* Toolbar */}
      <div className="brl-toolbar">
        <input
          className="brl-search"
          type="search"
          placeholder="Search by name, email, expedition…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search booking requests"
        />
        <select
          className="brl-filter"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="brl-alert" role="alert">
          <span>⚠</span> {error}
          <button className="brl-alert-retry" onClick={load}>Retry</button>
        </div>
      )}

      {/* Update error */}
      {updateError && (
        <div className="brl-alert" role="alert">
          <span>⚠</span> {updateError}
          <button className="brl-alert-retry" onClick={() => setUpdateError('')}>Dismiss</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="brl-skeletons">
          {[1,2,3,4,5].map(i => <div key={i} className="brl-skeleton" />)}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && all.length === 0 && (
        <div className="brl-empty">
          <span className="brl-empty-icon">📋</span>
          <p className="brl-empty-text">No booking requests yet.</p>
          <p className="brl-empty-sub">Requests will appear here once guests submit the form.</p>
        </div>
      )}

      {/* No results from filter */}
      {!loading && all.length > 0 && filtered.length === 0 && (
        <div className="brl-empty">
          <span className="brl-empty-icon">🔍</span>
          <p className="brl-empty-text">No matching requests.</p>
          <button className="brl-clear-btn" onClick={() => { setSearch(''); setFilterStatus(''); }}>
            Clear filters
          </button>
        </div>
      )}

      {/* Two-panel layout when detail is open */}
      <div className={`brl-layout${selected ? ' brl-layout--split' : ''}`}>

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="brl-table-wrap">
            <table className="brl-table">
              <thead>
                <tr>
                  <th className="brl-th">Customer</th>
                  <th className="brl-th brl-th--hide-sm">Date Requested</th>
                  <th className="brl-th brl-th--hide-md">Expedition</th>
                  <th className="brl-th brl-th--hide-md">Anglers</th>
                  <th className="brl-th brl-th--hide-sm">Contact</th>
                  <th className="brl-th">Status</th>
                  <th className="brl-th brl-th--hide-sm">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr
                    key={r.id}
                    className={`brl-tr${selected?.id === r.id ? ' brl-tr--selected' : ''}`}
                    onClick={() => setSelected(r.id === selected?.id ? null : r)}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setSelected(r.id === selected?.id ? null : r)}
                    aria-label={`View request from ${r.first_name} ${r.last_name}`}
                  >
                    <td className="brl-td">
                      <span className="brl-name">{r.first_name} {r.last_name}</span>
                      <span className="brl-country">{r.country || ''}</span>
                    </td>
                    <td className="brl-td brl-td--hide-sm">
                      {r.selected_date || '—'}
                    </td>
                    <td className="brl-td brl-td--hide-md">
                      <span className="brl-expedition">{r.expedition || '—'}</span>
                    </td>
                    <td className="brl-td brl-td--hide-md brl-td--center">
                      {r.number_of_anglers || '—'}
                    </td>
                    <td className="brl-td brl-td--hide-sm">
                      <a href={`mailto:${r.email}`} className="brl-link" onClick={e => e.stopPropagation()}>
                        {r.email}
                      </a>
                      <span className="brl-phone">{r.phone}</span>
                    </td>
                    <td className="brl-td">
                      <span className={`brl-badge ${STATUS_STYLES[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="brl-td brl-td--hide-sm brl-td--muted">
                      {fmt(r.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail panel */}
        {selected && (
          <aside className="brl-detail">
            <div className="brl-detail-header">
              <h2 className="brl-detail-name">
                {selected.first_name} {selected.last_name}
              </h2>
              <button
                className="brl-detail-close"
                onClick={() => setSelected(null)}
                aria-label="Close detail panel"
              >
                ✕
              </button>
            </div>

            {/* Status updater */}
            <div className="brl-detail-status-row">
              <span className="brl-detail-label">Status</span>
              <select
                className="brl-status-select"
                value={selected.status}
                onChange={e => handleStatusChange(selected.id, e.target.value)}
                disabled={updating}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {updating && <span className="brl-updating-msg">Saving…</span>}
            </div>

            <div className="brl-detail-body">

              <Section title="Trip Information">
                <Row label="Selected Date"   value={selected.selected_date} />
                <Row label="Expedition"       value={selected.expedition} />
                <Row label="Duration"         value={selected.duration} />
                <Row label="Anglers"          value={selected.number_of_anglers} />
                <Row label="Preferred Guide"  value={selected.preferred_guide} />
              </Section>

              <Section title="Contact Information">
                <Row label="Name"    value={`${selected.first_name} ${selected.last_name}`} />
                <Row label="Email"   value={
                  <a href={`mailto:${selected.email}`} className="brl-link">{selected.email}</a>
                } />
                <Row label="Phone"   value={selected.phone} />
                <Row label="Country" value={selected.country} />
              </Section>

              <Section title="Trip Details">
                <Row label="Hotel / Pickup"    value={selected.hotel} />
                <Row label="Experience Level"  value={selected.experience_level} />
                <Row label="Target Species"    value={selected.target_species} />
              </Section>

              {selected.notes && (
                <Section title="Additional Notes">
                  <p className="brl-detail-notes">{selected.notes}</p>
                </Section>
              )}

              <div className="brl-detail-meta">
                Submitted: {fmt(selected.created_at)}
              </div>

              <a
                href={`mailto:${selected.email}?subject=Re: Your Drew Exotic Anglers Booking Request`}
                className="brl-reply-btn"
              >
                Reply to {selected.first_name} →
              </a>

            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="brl-detail-section">
      <p className="brl-detail-section-title">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="brl-detail-row">
      <span className="brl-detail-row-label">{label}</span>
      <span className="brl-detail-row-value">{value || '—'}</span>
    </div>
  );
}
