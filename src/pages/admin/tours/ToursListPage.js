import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';
import { listTours, deleteTour, reorderTours } from '../../../services/toursService';
import './ToursListPage.css';

export default function ToursListPage() {
  const [tours,        setTours]        = useState([]);
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
      setTours(await listTours());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleMove(index, direction) {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= tours.length) return;

    const newTours = [...tours];
    [newTours[index], newTours[swapIndex]] = [newTours[swapIndex], newTours[index]];

    // Normalise sort_order to 1-based sequential values across all items
    const updates = newTours.map((t, i) => ({ id: t.id, sort_order: i + 1 }));
    const optimistic = newTours.map((t, i) => ({ ...t, sort_order: i + 1 }));

    const prev = tours;
    setTours(optimistic);
    setReordering(true);
    setReorderError('');

    try {
      await reorderTours(updates);
    } catch (e) {
      setTours(prev);
      setReorderError(e.message);
    } finally {
      setReordering(false);
    }
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteTour(deleteTarget.id, deleteTarget.image_url);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="tl-page">
      <AdminPageHeader
        title="Tours"
        subtitle={`${tours.length} expedition${tours.length !== 1 ? 's' : ''}`}
        action={{ label: '+ New Tour', to: '/admin/tours/new' }}
      />

      {error && (
        <div className="tl-alert tl-alert--error" role="alert">
          <span>⚠</span> {error}
          <button className="tl-alert-retry" onClick={load}>Retry</button>
        </div>
      )}

      {reorderError && (
        <div className="tl-alert tl-alert--error" role="alert">
          <span>⚠</span> Reorder failed: {reorderError}
          <button className="tl-alert-retry" onClick={() => setReorderError('')}>Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="tl-skeletons">
          {[1, 2, 3].map(i => <div key={i} className="tl-skeleton" />)}
        </div>
      )}

      {!loading && !error && tours.length === 0 && (
        <div className="tl-empty">
          <span className="tl-empty-icon" aria-hidden="true">🎣</span>
          <p className="tl-empty-text">No tours yet.</p>
          <Link to="/admin/tours/new" className="tl-empty-cta">
            Create your first tour →
          </Link>
        </div>
      )}

      {!loading && tours.length > 0 && (
        <div className="tl-table-wrap">
          {reordering && <div className="tl-reorder-saving">Saving order…</div>}
          <table className="tl-table">
            <thead>
              <tr>
                <th className="tl-th tl-th--order">#</th>
                <th className="tl-th tl-th--img">Image</th>
                <th className="tl-th">Title</th>
                <th className="tl-th tl-th--hide-sm">Tag</th>
                <th className="tl-th tl-th--hide-md">Slug</th>
                <th className="tl-th tl-th--actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour, index) => (
                <tr key={tour.id} className={`tl-tr${reordering ? ' tl-tr--reordering' : ''}`}>

                  {/* Sort order */}
                  <td className="tl-td tl-td--order">
                    <div className="tl-order-controls">
                      <button
                        className="tl-btn-move"
                        title="Move up"
                        disabled={reordering || index === 0}
                        onClick={() => handleMove(index, 'up')}
                        aria-label="Move tour up"
                      >
                        ▲
                      </button>
                      <span className="tl-order-badge">{index + 1}</span>
                      <button
                        className="tl-btn-move"
                        title="Move down"
                        disabled={reordering || index === tours.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        aria-label="Move tour down"
                      >
                        ▼
                      </button>
                    </div>
                  </td>

                  {/* Thumbnail */}
                  <td className="tl-td tl-td--img">
                    {tour.image_url ? (
                      <img
                        src={tour.image_url}
                        alt={tour.title}
                        className="tl-thumb"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="tl-thumb-empty" aria-label="No image">◈</div>
                    )}
                  </td>

                  <td className="tl-td">
                    <span className="tl-tour-title">{tour.title}</span>
                    {tour.meta && (
                      <span className="tl-tour-meta">{tour.meta}</span>
                    )}
                  </td>

                  <td className="tl-td tl-td--hide-sm">
                    {tour.tag && <span className="tl-tag">{tour.tag}</span>}
                  </td>

                  <td className="tl-td tl-td--hide-md">
                    <code className="tl-slug">{tour.slug}</code>
                  </td>

                  <td className="tl-td tl-td--actions">
                    <div className="tl-action-group">
                      <Link
                        to={`/admin/tours/${tour.id}/edit`}
                        className="tl-btn tl-btn--edit"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/admin/tours/${tour.id}/gallery`}
                        className="tl-btn tl-btn--gallery"
                      >
                        Gallery
                      </Link>
                      <Link
                        to={`/admin/tours/${tour.id}/details`}
                        className="tl-btn tl-btn--details"
                      >
                        Details
                      </Link>
                      <button
                        className="tl-btn tl-btn--delete"
                        onClick={() => setDeleteTarget(tour)}
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
        <div className="tl-alert tl-alert--error" role="alert">
          <span>⚠</span> {deleteError}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Tour"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete Tour"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteTarget(null); setDeleteError(''); }}
        loading={deleting}
      />
    </div>
  );
}
