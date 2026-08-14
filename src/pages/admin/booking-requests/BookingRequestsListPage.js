import React, { useCallback, useEffect, useState } from 'react';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import {
  listBookingRequests,
  updateBookingRequestStatus,
  archiveBookingRequest,
  restoreBookingRequest,
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
  const [filterTrip, setFilterTrip] = useState('');
  const [selected,   setSelected]   = useState(null);
  const [updating,   setUpdating]   = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [archiving,  setArchiving]  = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [checked,    setChecked]    = useState(() => new Set());
  const [view,       setView]       = useState('active'); // 'active' | 'archived'

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

  // ── Active / archived split ──────────────────────────────────────────────

  const active   = all.filter(r => !r.archived_at);
  const archived = all.filter(r => r.archived_at);
  const viewRows = view === 'archived' ? archived : active;

  // ── Trip type tabs ───────────────────────────────────────────────────────

  const tripTypes = Array.from(new Set(viewRows.map(r => r.expedition).filter(Boolean))).sort();

  // ── Status summary ───────────────────────────────────────────────────────

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = active.filter(r => r.status === s).length;
    return acc;
  }, {});

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filtered = viewRows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || [
      r.first_name, r.last_name, r.email, r.phone, r.expedition, r.selected_date,
    ].some(v => (v || '').toLowerCase().includes(q));
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchTrip = !filterTrip || r.expedition === filterTrip;
    return matchSearch && matchStatus && matchTrip;
  });

  // ── Group by month, chronological ────────────────────────────────────────

  const sorted = [...filtered].sort((a, b) => {
    const da = a.selected_date ? new Date(a.selected_date).getTime() : Infinity;
    const db = b.selected_date ? new Date(b.selected_date).getTime() : Infinity;
    return da - db;
  });

  const groups = [];
  for (const r of sorted) {
    const label = r.selected_date
      ? new Date(r.selected_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'No Date Given';
    let group = groups.find(g => g.label === label);
    if (!group) {
      group = { label, rows: [] };
      groups.push(group);
    }
    group.rows.push(r);
  }

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

  // ── Archive / restore ────────────────────────────────────────────────────

  async function handleArchiveOne(id) {
    if (!window.confirm('Archive this booking request? You can restore it later from the Archived tab.')) return;
    setArchiving(true);
    setUpdateError('');
    try {
      await archiveBookingRequest(id);
      const now = new Date().toISOString();
      setAll(prev => prev.map(r => r.id === id ? { ...r, archived_at: now } : r));
      if (selected?.id === id) setSelected(prev => ({ ...prev, archived_at: now }));
      setChecked(prev => { const next = new Set(prev); next.delete(id); return next; });
    } catch (e) {
      setUpdateError(e.message);
    } finally {
      setArchiving(false);
    }
  }

  async function handleRestoreOne(id) {
    setArchiving(true);
    setUpdateError('');
    try {
      await restoreBookingRequest(id);
      setAll(prev => prev.map(r => r.id === id ? { ...r, archived_at: null } : r));
      if (selected?.id === id) setSelected(prev => ({ ...prev, archived_at: null }));
      setChecked(prev => { const next = new Set(prev); next.delete(id); return next; });
    } catch (e) {
      setUpdateError(e.message);
    } finally {
      setArchiving(false);
    }
  }

  function toggleChecked(id) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleBulkAction() {
    if (checked.size === 0) return;
    const isArchiving = view === 'active';
    if (isArchiving && !window.confirm(`Archive ${checked.size} booking request${checked.size !== 1 ? 's' : ''}? You can restore them later.`)) return;
    setArchiving(true);
    setUpdateError('');
    try {
      const ids = Array.from(checked);
      const fn = isArchiving ? archiveBookingRequest : restoreBookingRequest;
      await Promise.all(ids.map(id => fn(id)));
      const now = isArchiving ? new Date().toISOString() : null;
      setAll(prev => prev.map(r => checked.has(r.id) ? { ...r, archived_at: now } : r));
      if (selected && checked.has(selected.id)) setSelected(null);
      setChecked(new Set());
      setSelectMode(false);
    } catch (e) {
      setUpdateError(e.message);
    } finally {
      setArchiving(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="brl-page">
      <AdminPageHeader
        title="Booking Requests"
        subtitle={`${active.length} request${active.length !== 1 ? 's' : ''}`}
      />

      {/* Active / Archived view toggle */}
      {!loading && all.length > 0 && (
        <div className="brl-view-toggle">
          <button
            className={`brl-view-btn${view === 'active' ? ' brl-view-btn--active' : ''}`}
            onClick={() => { setView('active'); setSelected(null); setSelectMode(false); setChecked(new Set()); }}
          >
            Active ({active.length})
          </button>
          <button
            className={`brl-view-btn${view === 'archived' ? ' brl-view-btn--active' : ''}`}
            onClick={() => { setView('archived'); setSelected(null); setSelectMode(false); setChecked(new Set()); }}
          >
            Archived ({archived.length})
          </button>
        </div>
      )}

      {/* Status summary */}
      {!loading && view === 'active' && all.length > 0 && (
        <div className="brl-status-summary">
          <button
            className={`brl-status-card brl-status-card--all${!filterStatus ? ' brl-status-card--active' : ''}`}
            onClick={() => setFilterStatus('')}
          >
            <span className="brl-status-card-count">{active.length}</span>
            <span className="brl-status-card-label">All</span>
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              className={`brl-status-card ${STATUS_STYLES[s] || ''}${filterStatus === s ? ' brl-status-card--active' : ''}`}
              onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
            >
              <span className="brl-status-card-count">{statusCounts[s]}</span>
              <span className="brl-status-card-label">{s}</span>
            </button>
          ))}
        </div>
      )}

      {/* Trip type tabs */}
      {!loading && tripTypes.length > 0 && (
        <div className="brl-trip-tabs" role="tablist" aria-label="Filter by trip type">
          <button
            className={`brl-trip-tab${!filterTrip ? ' brl-trip-tab--active' : ''}`}
            onClick={() => setFilterTrip('')}
          >
            All Trips
          </button>
          {tripTypes.map(t => (
            <button
              key={t}
              className={`brl-trip-tab${filterTrip === t ? ' brl-trip-tab--active' : ''}`}
              onClick={() => setFilterTrip(filterTrip === t ? '' : t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

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
        {!selectMode ? (
          <button
            className="brl-select-toggle"
            onClick={() => setSelectMode(true)}
          >
            Select
          </button>
        ) : (
          <>
            <span className="brl-select-count">{checked.size} selected</span>
            <button
              className="brl-delete-selected-btn"
              onClick={handleBulkAction}
              disabled={checked.size === 0 || archiving}
            >
              {view === 'active' ? 'Archive' : 'Restore'}
            </button>
            <button
              className="brl-select-toggle"
              onClick={() => { setSelectMode(false); setChecked(new Set()); }}
            >
              Cancel
            </button>
          </>
        )}
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

      {/* Empty archived view */}
      {!loading && all.length > 0 && view === 'archived' && viewRows.length === 0 && (
        <div className="brl-empty">
          <span className="brl-empty-icon">🗄</span>
          <p className="brl-empty-text">No archived requests.</p>
          <p className="brl-empty-sub">Requests you archive will show up here.</p>
        </div>
      )}

      {/* No results from filter */}
      {!loading && viewRows.length > 0 && filtered.length === 0 && (
        <div className="brl-empty">
          <span className="brl-empty-icon">🔍</span>
          <p className="brl-empty-text">No matching requests.</p>
          <button className="brl-clear-btn" onClick={() => { setSearch(''); setFilterStatus(''); setFilterTrip(''); }}>
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
                  {selectMode && <th className="brl-th brl-th--check"></th>}
                  <th className="brl-th">Customer</th>
                  <th className="brl-th brl-th--hide-sm">Date Requested</th>
                  <th className="brl-th brl-th--hide-md">Expedition</th>
                  <th className="brl-th brl-th--hide-md">Anglers</th>
                  <th className="brl-th brl-th--hide-sm">Contact</th>
                  <th className="brl-th">Status</th>
                  <th className="brl-th brl-th--hide-sm">Submitted</th>
                  <th className="brl-th"></th>
                </tr>
              </thead>
              <tbody>
                {groups.map(group => (
                  <React.Fragment key={group.label}>
                    <tr className="brl-group-row">
                      <td className="brl-group-th" colSpan={selectMode ? 9 : 8}>{group.label}</td>
                    </tr>
                    {group.rows.map(r => (
                      <tr
                        key={r.id}
                        className={`brl-tr${selected?.id === r.id ? ' brl-tr--selected' : ''}`}
                        onClick={() => selectMode ? toggleChecked(r.id) : setSelected(r.id === selected?.id ? null : r)}
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setSelected(r.id === selected?.id ? null : r)}
                        aria-label={`View request from ${r.first_name} ${r.last_name}`}
                      >
                        {selectMode && (
                          <td className="brl-td brl-td--check" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={checked.has(r.id)}
                              onChange={() => toggleChecked(r.id)}
                              aria-label={`Select ${r.first_name} ${r.last_name}`}
                            />
                          </td>
                        )}
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
                        <td className="brl-td brl-td--center" onClick={e => e.stopPropagation()}>
                          {view === 'active' ? (
                            <button
                              className="brl-row-delete-btn"
                              onClick={() => handleArchiveOne(r.id)}
                              disabled={archiving}
                              aria-label={`Archive request from ${r.first_name} ${r.last_name}`}
                              title="Archive"
                            >
                              🗄
                            </button>
                          ) : (
                            <button
                              className="brl-row-restore-btn"
                              onClick={() => handleRestoreOne(r.id)}
                              disabled={archiving}
                              aria-label={`Restore request from ${r.first_name} ${r.last_name}`}
                              title="Restore"
                            >
                              ↺
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
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
                href={`mailto:${selected.email}?subject=Re: Your Drew's Guide Services Booking Request`}
                className="brl-reply-btn"
              >
                Reply to {selected.first_name} →
              </a>

              {selected.archived_at ? (
                <button
                  className="brl-detail-restore-btn"
                  onClick={() => handleRestoreOne(selected.id)}
                  disabled={archiving}
                >
                  Restore Request
                </button>
              ) : (
                <button
                  className="brl-detail-delete-btn"
                  onClick={() => handleArchiveOne(selected.id)}
                  disabled={archiving}
                >
                  Archive Request
                </button>
              )}

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
