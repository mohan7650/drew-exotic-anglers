import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';
import {
  listFloridaDayTrips,
  deleteFloridaDayTrip,
  reorderFloridaDayTrips,
} from '../../../services/floridaDayTripsService';
import './FloridaDayTripsListPage.css';

export default function FloridaDayTripsListPage() {
  const [trips,        setTrips]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [reordering,   setReordering]   = useState(false);
  const [reorderError, setReorderError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState('');

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

  useEffect(() => { load(); }, [load]);

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

  return (
    <div className="fdl-page">
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
                      <button
                        className="fdl-btn-move"
                        title="Move up"
                        disabled={reordering || index === 0}
                        onClick={() => handleMove(index, 'up')}
                        aria-label="Move up"
                      >▲</button>
                      <span className="fdl-order-badge">{index + 1}</span>
                      <button
                        className="fdl-btn-move"
                        title="Move down"
                        disabled={reordering || index === trips.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        aria-label="Move down"
                      >▼</button>
                    </div>
                  </td>

                  <td className="fdl-td">
                    <span className="fdl-trip-title">{trip.title || '—'}</span>
                  </td>

                  <td className="fdl-td fdl-td--hide-sm">
                    <span className="fdl-trip-eyebrow">{trip.eyebrow || '—'}</span>
                  </td>

                  <td className="fdl-td fdl-td--status">
                    <span className={`fdl-badge ${trip.active ? 'fdl-badge--active' : 'fdl-badge--inactive'}`}>
                      {trip.active ? 'Active' : 'Draft'}
                    </span>
                  </td>

                  <td className="fdl-td fdl-td--actions">
                    <div className="fdl-action-group">
                      <Link
                        to={`/admin/florida-day-trips/${trip.id}/edit`}
                        className="fdl-btn fdl-btn--edit"
                      >
                        Edit
                      </Link>
                      <button
                        className="fdl-btn fdl-btn--delete"
                        onClick={() => setDeleteTarget(trip)}
                        disabled={reordering}
                      >
                        Delete
                      </button>
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
    </div>
  );
}
