import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';
import {
  listSpecies,
  deleteSpecies,
  reorderSpecies,
  updateSpecies,
} from '../../../services/speciesService';
import './SpeciesListPage.css';

export default function SpeciesListPage() {
  const [species,      setSpecies]      = useState([]);
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
      setSpecies(await listSpecies());
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
    if (swapIndex < 0 || swapIndex >= species.length) return;

    const next = [...species];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];

    const updates    = next.map((s, i) => ({ id: s.id, sort_order: i + 1 }));
    const optimistic = next.map((s, i) => ({ ...s, sort_order: i + 1 }));

    const prev = species;
    setSpecies(optimistic);
    setReordering(true);
    setReorderError('');

    try {
      await reorderSpecies(updates);
    } catch (e) {
      setSpecies(prev);
      setReorderError(e.message);
    } finally {
      setReordering(false);
    }
  }

  // ── Active toggle ─────────────────────────────────────────────────────────

  async function handleToggleActive(sp) {
    const prev = species;
    setTogglingId(sp.id);
    setSpecies(species.map(s => s.id === sp.id ? { ...s, active: !s.active } : s));

    try {
      await updateSpecies(sp.id, { active: !sp.active }, null, sp.image_url);
    } catch (e) {
      setSpecies(prev);
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
      await deleteSpecies(deleteTarget.id, deleteTarget.image_url);
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
    <div className="sl-page">
      <AdminPageHeader
        title="Species"
        subtitle={`${species.length} species listed`}
        action={{ label: '+ New Species', to: '/admin/species/new' }}
      />

      {error && (
        <div className="sl-alert sl-alert--error" role="alert">
          <span>⚠</span> {error}
          <button className="sl-alert-retry" onClick={load}>Retry</button>
        </div>
      )}

      {reorderError && (
        <div className="sl-alert sl-alert--error" role="alert">
          <span>⚠</span> {reorderError}
          <button className="sl-alert-retry" onClick={() => setReorderError('')}>Dismiss</button>
        </div>
      )}

      {loading && (
        <div className="sl-skeletons">
          {[1, 2, 3].map(i => <div key={i} className="sl-skeleton" />)}
        </div>
      )}

      {!loading && !error && species.length === 0 && (
        <div className="sl-empty">
          <span className="sl-empty-icon" aria-hidden="true">🐟</span>
          <p className="sl-empty-text">No species yet.</p>
          <Link to="/admin/species/new" className="sl-empty-cta">
            Add your first species →
          </Link>
        </div>
      )}

      {!loading && species.length > 0 && (
        <div className="sl-table-wrap">
          {reordering && <div className="sl-saving-bar">Saving order…</div>}
          <table className="sl-table">
            <thead>
              <tr>
                <th className="sl-th sl-th--order">#</th>
                <th className="sl-th sl-th--img">Photo</th>
                <th className="sl-th">Name</th>
                <th className="sl-th sl-th--hide-sm">Difficulty</th>
                <th className="sl-th sl-th--active">Status</th>
                <th className="sl-th sl-th--actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {species.map((sp, index) => (
                <tr
                  key={sp.id}
                  className={`sl-tr${reordering ? ' sl-tr--dim' : ''}${!sp.active ? ' sl-tr--inactive' : ''}`}
                >
                  {/* Order */}
                  <td className="sl-td sl-td--order">
                    <div className="sl-order-controls">
                      <button
                        className="sl-move-btn"
                        title="Move up"
                        disabled={reordering || index === 0}
                        onClick={() => handleMove(index, 'up')}
                        aria-label="Move up"
                      >▲</button>
                      <span className="sl-order-num">{index + 1}</span>
                      <button
                        className="sl-move-btn"
                        title="Move down"
                        disabled={reordering || index === species.length - 1}
                        onClick={() => handleMove(index, 'down')}
                        aria-label="Move down"
                      >▼</button>
                    </div>
                  </td>

                  {/* Thumbnail */}
                  <td className="sl-td sl-td--img">
                    {sp.image_url ? (
                      <img
                        src={sp.image_url}
                        alt={sp.name}
                        className="sl-thumb"
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="sl-thumb-empty" aria-hidden="true">🐟</div>
                    )}
                  </td>

                  {/* Name */}
                  <td className="sl-td">
                    <span className="sl-name">{sp.name}</span>
                    {sp.latin_name && <span className="sl-latin">{sp.latin_name}</span>}
                  </td>

                  {/* Difficulty */}
                  <td className="sl-td sl-td--hide-sm">
                    {sp.difficulty && <span className="sl-difficulty">{sp.difficulty}</span>}
                  </td>

                  {/* Active toggle */}
                  <td className="sl-td sl-td--active">
                    <button
                      className={`sl-status-btn${sp.active ? ' sl-status-btn--live' : ''}`}
                      onClick={() => handleToggleActive(sp)}
                      disabled={togglingId === sp.id || reordering}
                      title={sp.active ? 'Visible — click to hide' : 'Hidden — click to show'}
                      aria-label={sp.active ? 'Deactivate' : 'Activate'}
                    >
                      <span className="sl-status-dot" />
                      {togglingId === sp.id ? '…' : sp.active ? 'Live' : 'Hidden'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="sl-td sl-td--actions">
                    <div className="sl-action-group">
                      <Link
                        to={`/admin/species/${sp.id}/edit`}
                        className="sl-btn sl-btn--edit"
                      >
                        Edit
                      </Link>
                      <button
                        className="sl-btn sl-btn--delete"
                        onClick={() => setDeleteTarget(sp)}
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
        <div className="sl-alert sl-alert--error" role="alert">
          <span>⚠</span> {deleteError}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Species"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete Species"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteTarget(null); setDeleteError(''); }}
        loading={deleting}
      />
    </div>
  );
}
