import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';
import {
  listTestimonials,
  deleteTestimonial,
  reorderTestimonials,
  updateTestimonial,
} from '../../../services/testimonialsService';
import './TestimonialsListPage.css';

function StarDisplay({ rating }) {
  const n = Math.min(5, Math.max(0, Math.round(rating || 0)));
  return (
    <span className="tlp-stars" aria-label={`${n} out of 5 stars`}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  );
}

export default function TestimonialsListPage() {
  const [items,        setItems]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [reordering,   setReordering]   = useState(false);
  const [reorderError, setReorderError] = useState('');
  const [togglingId,   setTogglingId]   = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setReorderError('');
    try {
      setItems(await listTestimonials());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Reorder ──────────────────────────────────────────────────────────────

  async function handleMove(index, direction) {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;

    const next = [...items];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];

    const updates    = next.map((t, i) => ({ id: t.id, sort_order: i + 1 }));
    const optimistic = next.map((t, i) => ({ ...t, sort_order: i + 1 }));

    const prev = items;
    setItems(optimistic);
    setReordering(true);
    setReorderError('');

    try {
      await reorderTestimonials(updates);
    } catch (e) {
      setItems(prev);
      setReorderError(e.message);
    } finally {
      setReordering(false);
    }
  }

  // ── Active toggle ─────────────────────────────────────────────────────────

  async function handleToggleActive(t) {
    const prev = items;
    setTogglingId(t.id);
    setItems(items.map(i => i.id === t.id ? { ...i, active: !i.active } : i));

    try {
      await updateTestimonial(t.id, { active: !t.active }, null, t.image_url);
    } catch (e) {
      setItems(prev);
      setReorderError(e.message);
    } finally {
      setTogglingId(null);
    }
  }

  // ── Featured toggle ───────────────────────────────────────────────────────

  async function handleToggleFeatured(t) {
    const prev = items;
    setTogglingId(t.id);
    setItems(items.map(i => i.id === t.id ? { ...i, featured: !i.featured } : i));

    try {
      await updateTestimonial(t.id, { featured: !t.featured }, null, t.image_url);
    } catch (e) {
      setItems(prev);
      setReorderError(e.message);
    } finally {
      setTogglingId(null);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDeleteConfirm() {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteTestimonial(deleteTarget.id, deleteTarget.image_url);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="tlp-page">
      <AdminPageHeader
        title="Testimonials"
        subtitle={`${items.length} review${items.length !== 1 ? 's' : ''}`}
        action={{ label: '+ New Testimonial', to: '/admin/testimonials/new' }}
      />

      {error && (
        <div className="tlp-alert tlp-alert--error" role="alert">
          <span>⚠</span> {error}
          <button className="tlp-alert-retry" onClick={load}>Retry</button>
        </div>
      )}

      {reorderError && (
        <div className="tlp-alert tlp-alert--error" role="alert">
          <span>⚠</span> {reorderError}
          <button className="tlp-alert-retry" onClick={() => setReorderError('')}>Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="tlp-skeletons">
          {[1, 2, 3].map(i => <div key={i} className="tlp-skeleton" />)}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="tlp-empty">
          <span className="tlp-empty-icon" aria-hidden="true">⭐</span>
          <p className="tlp-empty-text">No testimonials yet.</p>
          <Link to="/admin/testimonials/new" className="tlp-empty-cta">
            Add your first testimonial →
          </Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="tlp-table-wrap">
          {reordering && <div className="tlp-saving-bar">Saving order…</div>}
          <table className="tlp-table">
            <thead>
              <tr>
                <th className="tlp-th tlp-th--order">#</th>
                <th className="tlp-th tlp-th--img">Photo</th>
                <th className="tlp-th">Customer</th>
                <th className="tlp-th tlp-th--rating tlp-th--hide-sm">Rating</th>
                <th className="tlp-th tlp-th--feat tlp-th--hide-sm">Featured</th>
                <th className="tlp-th tlp-th--status">Status</th>
                <th className="tlp-th tlp-th--actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t, index) => (
                <tr
                  key={t.id}
                  className={`tlp-tr${reordering ? ' tlp-tr--dim' : ''}${!t.active ? ' tlp-tr--inactive' : ''}`}
                >
                  {/* Order */}
                  <td className="tlp-td tlp-td--order">
                    <div className="tlp-order-controls">
                      <button
                        className="tlp-move-btn"
                        title="Move up"
                        disabled={reordering || index === 0}
                        onClick={() => handleMove(index, 'up')}
                        aria-label="Move up"
                      >▲</button>
                      <span className="tlp-order-num">{index + 1}</span>
                      <button
                        className="tlp-move-btn"
                        title="Move down"
                        disabled={reordering || index === items.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        aria-label="Move down"
                      >▼</button>
                    </div>
                  </td>

                  {/* Photo */}
                  <td className="tlp-td tlp-td--img">
                    {t.image_url ? (
                      <img
                        src={t.image_url}
                        alt={t.name}
                        className="tlp-thumb"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="tlp-thumb-empty" aria-hidden="true">👤</div>
                    )}
                  </td>

                  {/* Customer info */}
                  <td className="tlp-td">
                    <span className="tlp-name">{t.name}</span>
                    {t.location && <span className="tlp-location">{t.location}</span>}
                    {t.review && (
                      <span className="tlp-review-preview">
                        {t.review.length > 80 ? t.review.slice(0, 80) + '…' : t.review}
                      </span>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="tlp-td tlp-td--hide-sm">
                    <StarDisplay rating={t.rating} />
                  </td>

                  {/* Featured */}
                  <td className="tlp-td tlp-td--hide-sm">
                    <button
                      className={`tlp-feat-btn${t.featured ? ' tlp-feat-btn--on' : ''}`}
                      onClick={() => handleToggleFeatured(t)}
                      disabled={togglingId === t.id || reordering}
                      title={t.featured ? 'Featured — click to unfeature' : 'Not featured — click to feature'}
                      aria-label={t.featured ? 'Unfeature' : 'Feature'}
                    >
                      {t.featured ? '★ Featured' : '☆ Feature'}
                    </button>
                  </td>

                  {/* Active */}
                  <td className="tlp-td tlp-td--status">
                    <button
                      className={`tlp-status-btn${t.active ? ' tlp-status-btn--live' : ''}`}
                      onClick={() => handleToggleActive(t)}
                      disabled={togglingId === t.id || reordering}
                      title={t.active ? 'Visible — click to hide' : 'Hidden — click to show'}
                      aria-label={t.active ? 'Deactivate' : 'Activate'}
                    >
                      <span className="tlp-status-dot" />
                      {togglingId === t.id ? '…' : t.active ? 'Live' : 'Hidden'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="tlp-td tlp-td--actions">
                    <div className="tlp-action-group">
                      <Link
                        to={`/admin/testimonials/${t.id}/edit`}
                        className="tlp-btn tlp-btn--edit"
                      >
                        Edit
                      </Link>
                      <button
                        className="tlp-btn tlp-btn--delete"
                        onClick={() => setDeleteTarget(t)}
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
        <div className="tlp-alert tlp-alert--error" role="alert">
          <span>⚠</span> {deleteError}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Testimonial"
        message={`Are you sure you want to delete the review from "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete Testimonial"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteTarget(null); setDeleteError(''); }}
        loading={deleting}
      />
    </div>
  );
}
