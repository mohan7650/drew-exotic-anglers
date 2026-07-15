import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import CropModal from '../../../components/admin/ui/CropModal';
import { getTour } from '../../../services/toursService';
import {
  listTourFish,
  createTourFish,
  updateTourFish,
  deleteTourFish,
  reorderTourFish,
} from '../../../services/tourFishService';
import { fetchAsSrcUrl, blobToFile } from '../../../utils/cropImage';
import './TourFishPage.css';

// Fish images are displayed at 3:2 (explicit in TourFishPage.css .tfish-img-preview)
const FISH_ASPECT = 3 / 2;

const MAX_MB    = 10;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const ACCEPTED  = 'image/jpeg,image/png,image/webp,image/gif';

const EMPTY_FISH = {
  name: '', latin_name: '', description: '', difficulty: '', stars: '0',
};

// ── Inline fish form (shared by add + edit) ────────────────────────────────
function FishForm({ initial, currentImageUrl, onSave, onCancel }) {
  const [fields,    setFields]    = useState(initial ?? EMPTY_FISH);
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState(currentImageUrl || '');

  // Crop modal state
  const [cropSrc,    setCropSrc]    = useState(null);
  const [pendingUrl, setPendingUrl] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const fileRef = useRef(null);

  function set(field) {
    return e => setFields(prev => ({ ...prev, [field]: e.target.value }));
  }

  // Image selected → open crop modal instead of direct preview
  function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError(`Image exceeds the ${MAX_MB} MB limit.`);
      return;
    }
    setError('');
    const url = URL.createObjectURL(file);
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingUrl(url);
    setCropSrc(url);
    if (fileRef.current) fileRef.current.value = '';
  }

  // Adjust Crop for current image (existing URL or previous crop result)
  async function handleAdjustCrop() {
    const src = preview || currentImageUrl;
    if (!src) return;
    const { objUrl } = await fetchAsSrcUrl(src.startsWith('blob:') ? src : src);
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    setPendingUrl(objUrl);
    setCropSrc(objUrl);
  }

  function handleCropApply(blob) {
    if (pendingUrl) { URL.revokeObjectURL(pendingUrl); setPendingUrl(null); }
    setCropSrc(null);
    const file = blobToFile(blob, 'fish');
    setImageFile(file);
    setPreview(URL.createObjectURL(blob));
  }

  function handleCropCancel() {
    if (pendingUrl) { URL.revokeObjectURL(pendingUrl); setPendingUrl(null); }
    setCropSrc(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fields.name.trim()) { setError('Name is required.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await onSave(
        {
          name:        fields.name.trim(),
          latin_name:  fields.latin_name.trim(),
          description: fields.description.trim(),
          difficulty:  fields.difficulty.trim(),
          stars:       parseFloat(fields.stars) || 0,
        },
        imageFile,
      );
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  return (
    <>
      <form className="tfish-form" onSubmit={handleSubmit} noValidate>
        <div className="tfish-form-grid">

          {/* Image column */}
          <div className="tfish-form-img-col">
            <div
              className="tfish-img-preview"
              onClick={() => !submitting && fileRef.current?.click()}
              title="Click to change image"
            >
              {preview ? (
                <img src={preview} alt="Fish preview" className="tfish-img-preview-img" />
              ) : (
                <div className="tfish-img-placeholder">
                  <span>🐟</span>
                  <p>Click to upload image</p>
                </div>
              )}
              <div className="tfish-img-overlay">Change image</div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED}
              onChange={handleImageChange}
              className="tfish-hidden-input"
              disabled={submitting}
            />
            {preview && (
              <button
                type="button"
                className="tfish-btn-adjust-crop"
                onClick={handleAdjustCrop}
                disabled={submitting}
              >
                ✂ Adjust Crop
              </button>
            )}
            <p className="tfish-img-hint">JPEG · PNG · WebP · max {MAX_MB} MB</p>
          </div>

          {/* Fields column */}
          <div className="tfish-form-fields">
            <div className="tfish-form-row">
              <div className="tfish-form-field">
                <label className="tfish-label" htmlFor="fish-name">Name *</label>
                <input
                  id="fish-name"
                  type="text"
                  className="tfish-input"
                  value={fields.name}
                  onChange={set('name')}
                  placeholder="Peacock Bass"
                  disabled={submitting}
                  autoFocus
                />
              </div>
              <div className="tfish-form-field">
                <label className="tfish-label" htmlFor="fish-latin">Scientific Name</label>
                <input
                  id="fish-latin"
                  type="text"
                  className="tfish-input"
                  value={fields.latin_name}
                  onChange={set('latin_name')}
                  placeholder="Cichla ocellaris"
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="tfish-form-field">
              <label className="tfish-label" htmlFor="fish-desc">Description</label>
              <textarea
                id="fish-desc"
                className="tfish-input tfish-textarea"
                value={fields.description}
                onChange={set('description')}
                placeholder="Describe this fish for anglers…"
                rows={3}
                disabled={submitting}
              />
            </div>

            <div className="tfish-form-row">
              <div className="tfish-form-field">
                <label className="tfish-label" htmlFor="fish-difficulty">Difficulty</label>
                <input
                  id="fish-difficulty"
                  type="text"
                  className="tfish-input"
                  value={fields.difficulty}
                  onChange={set('difficulty')}
                  placeholder="Expert"
                  disabled={submitting}
                />
              </div>
              <div className="tfish-form-field">
                <label className="tfish-label" htmlFor="fish-stars">Rating (0–5)</label>
                <input
                  id="fish-stars"
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  className="tfish-input"
                  value={fields.stars}
                  onChange={set('stars')}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
        </div>

        {error && <p className="tfish-form-error">{error}</p>}

        <div className="tfish-form-actions">
          <button type="submit" className="tfish-btn tfish-btn--save" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save Fish'}
          </button>
          <button type="button" className="tfish-btn tfish-btn--cancel" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        </div>
      </form>

      {/* Crop modal rendered outside form flow (position:fixed) */}
      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          aspect={FISH_ASPECT}
          onCancel={handleCropCancel}
          onApply={handleCropApply}
        />
      )}
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function TourFishPage() {
  const { id } = useParams();

  const [tour,        setTour]        = useState(null);
  const [fish,        setFish]        = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError,   setPageError]   = useState('');

  const [addOpen,   setAddOpen]   = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [deletingId,  setDeletingId]  = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const [reordering, setReordering] = useState(false);
  const [reorderErr, setReorderErr] = useState('');

  // ── Card-level reposition (no edit form needed) ───────────────────────
  const [repositionItem,    setRepositionItem]    = useState(null);
  const [repositionCropSrc, setRepositionCropSrc] = useState(null);
  const [repositionSaving,  setRepositionSaving]  = useState(false);
  const [repositionError,   setRepositionError]   = useState('');

  const reload = useCallback(async () => {
    setPageError('');
    try {
      const [tourData, fishData] = await Promise.all([
        getTour(id),
        listTourFish(id),
      ]);
      setTour(tourData);
      setFish(fishData);
    } catch (e) {
      setPageError(e.message);
    } finally {
      setPageLoading(false);
    }
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  // ── Add
  async function handleAdd(fields, imageFile) {
    await createTourFish(id, fields, imageFile);
    setAddOpen(false);
    await reload();
  }

  // ── Edit
  async function handleEdit(fishItem, fields, imageFile) {
    await updateTourFish(fishItem.id, fields, imageFile, fishItem.image_url);
    setEditingId(null);
    await reload();
  }

  // ── Delete
  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    setDeleteError('');
    try {
      await deleteTourFish(item.id, item.image_url);
      setFish(prev => prev.filter(f => f.id !== item.id));
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  // ── Reorder
  async function handleMove(index, direction) {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= fish.length) return;

    const newFish    = [...fish];
    [newFish[index], newFish[swapIndex]] = [newFish[swapIndex], newFish[index]];
    const updates    = newFish.map((f, i) => ({ id: f.id, sort_order: i + 1 }));
    const optimistic = newFish.map((f, i) => ({ ...f, sort_order: i + 1 }));

    const prev = fish;
    setFish(optimistic);
    setReordering(true);
    setReorderErr('');
    try {
      await reorderTourFish(updates);
    } catch (e) {
      setFish(prev);
      setReorderErr(e.message);
    } finally {
      setReordering(false);
    }
  }

  // ── Card-level reposition
  async function handleReposition(item) {
    setRepositionItem(item);
    setRepositionError('');
    const { objUrl } = await fetchAsSrcUrl(item.image_url);
    setRepositionCropSrc(objUrl);
  }

  async function handleRepositionApply(blob) {
    if (repositionCropSrc) URL.revokeObjectURL(repositionCropSrc);
    setRepositionCropSrc(null);

    setRepositionSaving(true);
    setRepositionError('');
    try {
      const file = blobToFile(blob, 'fish-reposition');
      await updateTourFish(
        repositionItem.id,
        {
          name:        repositionItem.name,
          latin_name:  repositionItem.latin_name,
          description: repositionItem.description,
          difficulty:  repositionItem.difficulty,
          stars:       repositionItem.stars,
        },
        file,
        repositionItem.image_url,
      );
      await reload();
    } catch (e) {
      setRepositionError(e.message);
    } finally {
      setRepositionSaving(false);
      setRepositionItem(null);
    }
  }

  function handleRepositionCancel() {
    if (repositionCropSrc) URL.revokeObjectURL(repositionCropSrc);
    setRepositionCropSrc(null);
    setRepositionItem(null);
  }

  if (pageLoading) return <AdminSpinner />;

  const isBusy = !!editingId || addOpen || repositionSaving;

  return (
    <div className="tfish-page">
      <AdminPageHeader
        title="Fish You'll Chase"
        subtitle={tour ? `Managing fish for: ${tour.title}` : 'Tour fish'}
        backTo="/admin/tours"
      />

      {pageError && (
        <div className="tfish-alert tfish-alert--error" role="alert">
          ⚠ {pageError}
          <button className="tfish-alert-retry" onClick={reload}>Retry</button>
        </div>
      )}
      {reorderErr && (
        <div className="tfish-alert tfish-alert--error" role="alert">
          ⚠ Reorder failed: {reorderErr}
          <button className="tfish-alert-retry" onClick={() => setReorderErr('')}>Dismiss</button>
        </div>
      )}
      {deleteError && (
        <div className="tfish-alert tfish-alert--error" role="alert">⚠ {deleteError}</div>
      )}
      {repositionError && (
        <div className="tfish-alert tfish-alert--error" role="alert">
          ⚠ Reposition failed: {repositionError}
          <button className="tfish-alert-retry" onClick={() => setRepositionError('')}>✕</button>
        </div>
      )}

      {/* ── Add button / form */}
      {!addOpen ? (
        <button
          className="tfish-add-btn"
          onClick={() => { setAddOpen(true); setEditingId(null); }}
          disabled={isBusy}
        >
          + Add Fish
        </button>
      ) : (
        <div className="tfish-add-panel">
          <h3 className="tfish-panel-title">New Fish</h3>
          <FishForm
            onSave={handleAdd}
            onCancel={() => setAddOpen(false)}
          />
        </div>
      )}

      {fish.length > 0 && (
        <div className="tfish-count">
          {fish.length} fish entr{fish.length !== 1 ? 'ies' : 'y'}
          {reordering && <span className="tfish-reorder-saving"> — saving order…</span>}
        </div>
      )}

      {fish.length === 0 && !pageLoading && (
        <div className="tfish-empty">
          <span className="tfish-empty-icon" aria-hidden="true">🐟</span>
          <p className="tfish-empty-text">No fish added yet. Click "+ Add Fish" to get started.</p>
        </div>
      )}

      {/* ── Fish list */}
      <div className="tfish-list">
        {fish.map((item, index) => {
          const isEditing      = editingId === item.id;
          const isDeleting     = deletingId === item.id;
          const isThisRepos    = repositionItem?.id === item.id;
          const stars          = Math.min(5, Math.max(0, Math.round(item.stars || 0)));

          return (
            <div
              key={item.id}
              className={`tfish-row${isEditing ? ' tfish-row--editing' : ''}${isDeleting ? ' tfish-row--deleting' : ''}${reordering ? ' tfish-row--reordering' : ''}`}
            >
              {/* Reorder controls */}
              <div className="tfish-move-group">
                <button
                  className="tfish-btn-move"
                  title="Move up"
                  disabled={reordering || isDeleting || index === 0}
                  onClick={() => handleMove(index, 'up')}
                  aria-label="Move fish up"
                >▲</button>
                <span className="tfish-order-num">{index + 1}</span>
                <button
                  className="tfish-btn-move"
                  title="Move down"
                  disabled={reordering || isDeleting || index === fish.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  aria-label="Move fish down"
                >▼</button>
              </div>

              {isEditing ? (
                <div className="tfish-row-edit">
                  <FishForm
                    initial={{
                      name:        item.name,
                      latin_name:  item.latin_name,
                      description: item.description,
                      difficulty:  item.difficulty,
                      stars:       String(item.stars ?? 0),
                    }}
                    currentImageUrl={item.image_url}
                    onSave={(fields, imageFile) => handleEdit(item, fields, imageFile)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <>
                  {/* Thumbnail */}
                  <div className="tfish-thumb-wrap">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="tfish-thumb"
                        onError={e => { e.target.style.opacity = '0.3'; }}
                      />
                    ) : (
                      <div className="tfish-thumb-empty" aria-label="No image">🐟</div>
                    )}
                    {isThisRepos && repositionSaving && (
                      <div className="tfish-thumb-saving">Saving…</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="tfish-info">
                    <span className="tfish-name">{item.name}</span>
                    {item.latin_name  && <span className="tfish-latin">{item.latin_name}</span>}
                    {item.description && <span className="tfish-desc">{item.description}</span>}
                    <div className="tfish-meta">
                      {item.difficulty && <span className="tfish-difficulty">Difficulty: {item.difficulty}</span>}
                      {stars > 0 && (
                        <span className="tfish-stars">
                          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="tfish-row-actions">
                    <button
                      className="tfish-btn tfish-btn--edit"
                      onClick={() => { setEditingId(item.id); setAddOpen(false); }}
                      disabled={isDeleting || isBusy}
                    >
                      Edit
                    </button>
                    {item.image_url && (
                      <button
                        className="tfish-btn tfish-btn--reposition"
                        onClick={() => handleReposition(item)}
                        disabled={isDeleting || isBusy}
                        title="Reposition / re-crop this image"
                      >
                        {isThisRepos && repositionSaving ? 'Saving…' : '✂ Crop'}
                      </button>
                    )}
                    <button
                      className="tfish-btn tfish-btn--delete"
                      onClick={() => handleDelete(item)}
                      disabled={isDeleting || reordering || repositionSaving}
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Card-level reposition crop modal */}
      {repositionCropSrc && (
        <CropModal
          imageSrc={repositionCropSrc}
          aspect={FISH_ASPECT}
          onCancel={handleRepositionCancel}
          onApply={handleRepositionApply}
        />
      )}
    </div>
  );
}
