import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';
import {
  listFloridaDayTrips,
  deleteFloridaDayTrip,
  reorderFloridaDayTrips,
} from '../../../services/floridaDayTripsService';
import {
  listTripAvailability,
  createTripAvailability,
  updateTripAvailability,
  deleteTripAvailability,
  reorderTripAvailability,
} from '../../../services/tripAvailabilityService';
import './FloridaDayTripsListPage.css';

const AVAIL_EMPTY = { trip: '', spots: '', total: '', active: true };

export default function FloridaDayTripsListPage() {
  // ── Florida Day Trips state
  const [trips,        setTrips]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [reordering,   setReordering]   = useState(false);
  const [reorderError, setReorderError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState('');

  // ── Trip Availability state
  const [avRows,       setAvRows]       = useState([]);
  const [avLoading,    setAvLoading]    = useState(true);
  const [avError,      setAvError]      = useState('');
  const [avAddForm,    setAvAddForm]    = useState(AVAIL_EMPTY);
  const [avAdding,     setAvAdding]     = useState(false);
  const [avAddError,   setAvAddError]   = useState('');
  const [avEditId,     setAvEditId]     = useState(null);
  const [avEditForm,   setAvEditForm]   = useState(AVAIL_EMPTY);
  const [avSaving,     setAvSaving]     = useState(false);
  const [avSaveError,  setAvSaveError]  = useState('');
  const [avReordering, setAvReordering] = useState(false);
  const [avDelTarget,  setAvDelTarget]  = useState(null);
  const [avDeleting,   setAvDeleting]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setReorderError('');
    try {
      setTrips(await listFloridaDayTrips());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAv = useCallback(async () => {
    setAvLoading(true);
    setAvError('');
    try {
      setAvRows(await listTripAvailability());
    } catch (e) {
      setAvError(e.message);
    } finally {
      setAvLoading(false);
    }
  }, []);

  useEffect(() => { load(); loadAv(); }, [load, loadAv]);

  // ── Trip reorder / delete
  async function handleMove(index, direction) {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= trips.length) return;
    const next = [...trips];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    const updates    = next.map((t, i) => ({ id: t.id, sort_order: i + 1 }));
    const optimistic = next.map((t, i) => ({ ...t, sort_order: i + 1 }));
    const prev = trips;
    setTrips(optimistic);
    setReordering(true);
    setReorderError('');
    try {
      await reorderFloridaDayTrips(updates);
    } catch (e) {
      setTrips(prev);
      setReorderError(e.message);
    } finally {
      setReordering(false);
    }
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteFloridaDayTrip(deleteTarget.id, deleteTarget.main_image);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  // ── Availability: add
  async function handleAvAdd(e) {
    e.preventDefault();
    setAvAddError('');
    if (!avAddForm.trip.trim()) { setAvAddError('Trip name is required.'); return; }
    if (avAddForm.spots === '' || avAddForm.total === '') { setAvAddError('Remaining and Total are required.'); return; }
    setAvAdding(true);
    try {
      await createTripAvailability({
        trip: avAddForm.trip.trim(),
        spots: Number(avAddForm.spots),
        total: Number(avAddForm.total),
        active: avAddForm.active,
        sort_order: avRows.length + 1,
      });
      setAvAddForm(AVAIL_EMPTY);
      await loadAv();
    } catch (e) {
      setAvAddError(e.message);
    } finally {
      setAvAdding(false);
    }
  }

  // ── Availability: edit
  function startAvEdit(row) {
    setAvEditId(row.id);
    setAvEditForm({ trip: row.trip, spots: row.spots, total: row.total, active: row.active });
    setAvSaveError('');
  }

  async function handleAvSave(e) {
    e.preventDefault();
    setAvSaveError('');
    if (!avEditForm.trip.trim()) { setAvSaveError('Trip name is required.'); return; }
    setAvSaving(true);
    try {
      await updateTripAvailability(avEditId, {
        trip: avEditForm.trip.trim(),
        spots: Number(avEditForm.spots),
        total: Number(avEditForm.total),
        active: avEditForm.active,
      });
      setAvEditId(null);
      await loadAv();
    } catch (e) {
      setAvSaveError(e.message);
    } finally {
      setAvSaving(false);
    }
  }

  // ── Availability: delete
  async function handleAvDeleteConfirm() {
    setAvDeleting(true);
    try {
      await deleteTripAvailability(avDelTarget.id);
      setAvDelTarget(null);
      await loadAv();
    } catch (e) {
      setAvSaveError(e.message);
    } finally {
      setAvDeleting(false);
    }
  }

  // ── Availability: reorder
  async function handleAvMove(index, direction) {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= avRows.length) return;
    const next = [...avRows];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    const updates = next.map((r, i) => ({ id: r.id, sort_order: i + 1 }));
    const prev = avRows;
    setAvRows(next.map((r, i) => ({ ...r, sort_order: i + 1 })));
    setAvReordering(true);
    try {
      await reorderTripAvailability(updates);
    } catch {
      setAvRows(prev);
    } finally {
      setAvReordering(false);
    }
  }

  return (
    <div className="fdl-page">

      {/* ══ Florida Day Trips section ══ */}
      <AdminPageHeader
        title="Florida Day Trips"
        subtitle={`${trips.length} record${trips.length !== 1 ? 's' : ''}`}
        action={{ label: '+ New Record', to: '/admin/florida-day-trips/new' }}
      />

      {error && (
        <div className="fdl-alert fdl-alert--error" role="alert">
          <span>⚠</span> {error}
          <button className="fdl-alert-retry" onClick={load}>Retry</button>
        </div>
      )}
      {reorderError && (
        <div className="fdl-alert fdl-alert--error" role="alert">
          <span>⚠</span> Reorder failed: {reorderError}
          <button className="fdl-alert-retry" onClick={() => setReorderError('')}>Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="fdl-skeletons">
          {[1, 2].map(i => <div key={i} className="fdl-skeleton" />)}
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="fdl-empty">
          <span className="fdl-empty-icon" aria-hidden="true">🎣</span>
          <p className="fdl-empty-text">No Florida Day Trip records yet.</p>
          <Link to="/admin/florida-day-trips/new" className="fdl-empty-cta">
            Create your first record →
          </Link>
        </div>
      )}

      {!loading && trips.length > 0 && (
        <div className="fdl-table-wrap">
          {reordering && <div className="fdl-reorder-saving">Saving order…</div>}
          <table className="fdl-table">
            <thead>
              <tr>
                <th className="fdl-th fdl-th--order">#</th>
                <th className="fdl-th">Title</th>
                <th className="fdl-th fdl-th--hide-sm">Eyebrow</th>
                <th className="fdl-th fdl-th--status">Active</th>
                <th className="fdl-th fdl-th--actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip, index) => (
                <tr key={trip.id} className={`fdl-tr${reordering ? ' fdl-tr--reordering' : ''}`}>
                  <td className="fdl-td fdl-td--order">
                    <div className="fdl-order-controls">
                      <button className="fdl-btn-move" title="Move up" disabled={reordering || index === 0} onClick={() => handleMove(index, 'up')} aria-label="Move up">▲</button>
                      <span className="fdl-order-badge">{index + 1}</span>
                      <button className="fdl-btn-move" title="Move down" disabled={reordering || index === trips.length - 1} onClick={() => handleMove(index, 'down')} aria-label="Move down">▼</button>
                    </div>
                  </td>
                  <td className="fdl-td"><span className="fdl-trip-title">{trip.title || '—'}</span></td>
                  <td className="fdl-td fdl-td--hide-sm"><span className="fdl-trip-eyebrow">{trip.eyebrow || '—'}</span></td>
                  <td className="fdl-td fdl-td--status">
                    <span className={`fdl-badge ${trip.active ? 'fdl-badge--active' : 'fdl-badge--inactive'}`}>
                      {trip.active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="fdl-td fdl-td--actions">
                    <div className="fdl-action-group">
                      <Link to={`/admin/florida-day-trips/${trip.id}/edit`} className="fdl-btn fdl-btn--edit">Edit</Link>
                      <button className="fdl-btn fdl-btn--delete" onClick={() => setDeleteTarget(trip)} disabled={reordering}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteError && !deleteTarget && (
        <div className="fdl-alert fdl-alert--error" role="alert">
          <span>⚠</span> {deleteError}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Record"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteTarget(null); setDeleteError(''); }}
        loading={deleting}
      />

      {/* ══ Trip Availability section ══ */}
      <div className="fdl-avail-section">
        <div className="fdl-avail-header">
          <div>
            <div className="fdl-avail-title">⚡ Live Expedition Availability</div>
            <div className="fdl-avail-sub">
              Entries shown in the Florida Day Trips booking panel. Set the header text via the <strong>Availability Title</strong> field when editing a trip record.
            </div>
          </div>
        </div>

        {/* Add form */}
        <form className="fdl-avail-add" onSubmit={handleAvAdd}>
          <input
            className="fdl-avail-input fdl-avail-input--trip"
            type="text"
            placeholder="e.g. September 2026 · Urubaxi Full Week"
            value={avAddForm.trip}
            onChange={e => setAvAddForm(f => ({ ...f, trip: e.target.value }))}
          />
          <input
            className="fdl-avail-input fdl-avail-input--num"
            type="number"
            min="0"
            placeholder="Remaining"
            value={avAddForm.spots}
            onChange={e => setAvAddForm(f => ({ ...f, spots: e.target.value }))}
          />
          <span className="fdl-avail-of">of</span>
          <input
            className="fdl-avail-input fdl-avail-input--num"
            type="number"
            min="1"
            placeholder="Total"
            value={avAddForm.total}
            onChange={e => setAvAddForm(f => ({ ...f, total: e.target.value }))}
          />
          <label className="fdl-avail-check">
            <input
              type="checkbox"
              checked={avAddForm.active}
              onChange={e => setAvAddForm(f => ({ ...f, active: e.target.checked }))}
            />
            Active
          </label>
          <button className="fdl-btn fdl-btn--avail-add" type="submit" disabled={avAdding}>
            {avAdding ? 'Adding…' : '+ Add'}
          </button>
        </form>
        {avAddError && <div className="fdl-avail-err">{avAddError}</div>}
        {avSaveError && <div className="fdl-avail-err">{avSaveError}</div>}
        {avError && <div className="fdl-avail-err">⚠ {avError}</div>}

        {/* List */}
        {avLoading && (
          <div className="fdl-skeletons">
            {[1, 2, 3].map(i => <div key={i} className="fdl-skeleton" style={{ height: 44 }} />)}
          </div>
        )}

        {!avLoading && avRows.length === 0 && (
          <div className="fdl-avail-empty">No availability entries yet. Add one above.</div>
        )}

        {!avLoading && avRows.length > 0 && (
          <div className="fdl-table-wrap" style={{ marginTop: 12 }}>
            {avReordering && <div className="fdl-reorder-saving">Saving order…</div>}
            <table className="fdl-table">
              <thead>
                <tr>
                  <th className="fdl-th fdl-th--order">#</th>
                  <th className="fdl-th">Trip Name</th>
                  <th className="fdl-th fdl-th--num">Remaining</th>
                  <th className="fdl-th fdl-th--num">Total</th>
                  <th className="fdl-th fdl-th--status">Active</th>
                  <th className="fdl-th fdl-th--actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {avRows.map((row, index) => (
                  <tr key={row.id} className={`fdl-tr${avReordering ? ' fdl-tr--reordering' : ''}`}>
                    {avEditId === row.id ? (
                      <td className="fdl-td" colSpan={6}>
                        <form className="fdl-avail-add" onSubmit={handleAvSave}>
                          <input
                            className="fdl-avail-input fdl-avail-input--trip"
                            type="text"
                            placeholder="Trip name"
                            value={avEditForm.trip}
                            onChange={e => setAvEditForm(f => ({ ...f, trip: e.target.value }))}
                            autoFocus
                          />
                          <input
                            className="fdl-avail-input fdl-avail-input--num"
                            type="number"
                            min="0"
                            placeholder="Remaining"
                            value={avEditForm.spots}
                            onChange={e => setAvEditForm(f => ({ ...f, spots: e.target.value }))}
                          />
                          <span className="fdl-avail-of">of</span>
                          <input
                            className="fdl-avail-input fdl-avail-input--num"
                            type="number"
                            min="1"
                            placeholder="Total"
                            value={avEditForm.total}
                            onChange={e => setAvEditForm(f => ({ ...f, total: e.target.value }))}
                          />
                          <label className="fdl-avail-check">
                            <input
                              type="checkbox"
                              checked={avEditForm.active}
                              onChange={e => setAvEditForm(f => ({ ...f, active: e.target.checked }))}
                            />
                            Active
                          </label>
                          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                            <button className="fdl-btn fdl-btn--avail-save" type="submit" disabled={avSaving}>
                              {avSaving ? 'Saving…' : 'Save'}
                            </button>
                            <button className="fdl-btn fdl-btn--avail-cancel" type="button" onClick={() => setAvEditId(null)}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td className="fdl-td fdl-td--order">
                          <div className="fdl-order-controls">
                            <button className="fdl-btn-move" disabled={avReordering || index === 0} onClick={() => handleAvMove(index, 'up')}>▲</button>
                            <span className="fdl-order-badge">{index + 1}</span>
                            <button className="fdl-btn-move" disabled={avReordering || index === avRows.length - 1} onClick={() => handleAvMove(index, 'down')}>▼</button>
                          </div>
                        </td>
                        <td className="fdl-td"><span className="fdl-trip-title">{row.trip}</span></td>
                        <td className="fdl-td fdl-td--num">
                          <span className={row.spots <= 2 ? 'fdl-avail-urgent' : ''}>{row.spots}</span>
                        </td>
                        <td className="fdl-td fdl-td--num">{row.total}</td>
                        <td className="fdl-td fdl-td--status">
                          <span className={`fdl-badge ${row.active ? 'fdl-badge--active' : 'fdl-badge--inactive'}`}>
                            {row.active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="fdl-td fdl-td--actions">
                          <div className="fdl-action-group">
                            <button className="fdl-btn fdl-btn--edit" onClick={() => startAvEdit(row)} disabled={avReordering}>Edit</button>
                            <button className="fdl-btn fdl-btn--delete" onClick={() => setAvDelTarget(row)} disabled={avReordering}>Delete</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!avDelTarget}
        title="Delete Entry"
        message={`Delete "${avDelTarget?.trip}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleAvDeleteConfirm}
        onCancel={() => setAvDelTarget(null)}
        loading={avDeleting}
      />
    </div>
  );
}
