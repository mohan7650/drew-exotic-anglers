import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import { getTour } from '../../../services/toursService';
import {
  listTourAssets,
  createTourAsset,
  updateTourAssetAlt,
  deleteTourAsset,
  reorderTourAssets,
} from '../../../services/tourAssetsService';
import './TourGalleryPage.css';

const MAX_MB      = 10;
const ACCEPTED    = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_BYTES   = MAX_MB * 1024 * 1024;

export default function TourGalleryPage() {
  const { id } = useParams();

  const [tour,        setTour]        = useState(null);
  const [assets,      setAssets]      = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError,   setPageError]   = useState('');

  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver,    setDragOver]    = useState(false);

  const [savingId,    setSavingId]    = useState(null);
  const [saveErrors,  setSaveErrors]  = useState({});

  const [deletingId,  setDeletingId]  = useState(null);
  const [deleteError, setDeleteError] = useState('');

  const [reordering,  setReordering]  = useState(false);
  const [reorderErr,  setReorderErr]  = useState('');

  const fileInputRef = useRef(null);

  // Track inline alt text edits without touching the main assets array until saved
  const [altDrafts, setAltDrafts] = useState({});

  // ── Initial load ───────────────────────────────────────────────────────

  const reload = useCallback(async () => {
    setPageError('');
    try {
      const [tourData, assetData] = await Promise.all([
        getTour(id),
        listTourAssets(id),
      ]);
      setTour(tourData);
      setAssets(assetData);
      // Seed alt drafts from DB
      const drafts = {};
      assetData.forEach(a => { drafts[a.id] = a.alt ?? ''; });
      setAltDrafts(drafts);
    } catch (e) {
      setPageError(e.message);
    } finally {
      setPageLoading(false);
    }
  }, [id]);

  useEffect(() => { reload(); }, [reload]);

  // ── Upload ─────────────────────────────────────────────────────────────

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    setUploadError('');

    const oversize = Array.from(files).find(f => f.size > MAX_BYTES);
    if (oversize) {
      setUploadError(`"${oversize.name}" exceeds the ${MAX_MB} MB limit.`);
      return;
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await createTourAsset(id, file, '');
      }
      await reload();
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleInputChange(e)  { handleFiles(e.target.files); }
  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  // ── Alt text ───────────────────────────────────────────────────────────

  function handleAltChange(assetId, value) {
    setAltDrafts(prev => ({ ...prev, [assetId]: value }));
    setSaveErrors(prev => ({ ...prev, [assetId]: '' }));
  }

  async function handleAltSave(assetId) {
    setSavingId(assetId);
    setSaveErrors(prev => ({ ...prev, [assetId]: '' }));
    try {
      await updateTourAssetAlt(assetId, altDrafts[assetId] ?? '');
      setAssets(prev =>
        prev.map(a => a.id === assetId ? { ...a, alt: altDrafts[assetId] ?? '' } : a)
      );
    } catch (e) {
      setSaveErrors(prev => ({ ...prev, [assetId]: e.message }));
    } finally {
      setSavingId(null);
    }
  }

  function altDirty(assetId) {
    const asset = assets.find(a => a.id === assetId);
    return (altDrafts[assetId] ?? '') !== (asset?.alt ?? '');
  }

  // ── Delete ─────────────────────────────────────────────────────────────

  async function handleDelete(asset) {
    if (!window.confirm(`Delete this image? This cannot be undone.`)) return;
    setDeletingId(asset.id);
    setDeleteError('');
    try {
      await deleteTourAsset(asset.id, asset.image_url);
      await reload();
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeletingId(null);
    }
  }

  // ── Reorder ────────────────────────────────────────────────────────────

  async function handleMove(index, direction) {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= assets.length) return;

    const newAssets = [...assets];
    [newAssets[index], newAssets[swapIndex]] = [newAssets[swapIndex], newAssets[index]];
    const updates = newAssets.map((a, i) => ({ id: a.id, sort_order: i + 1 }));
    const optimistic = newAssets.map((a, i) => ({ ...a, sort_order: i + 1 }));

    const prev = assets;
    setAssets(optimistic);
    setReordering(true);
    setReorderErr('');

    try {
      await reorderTourAssets(updates);
    } catch (e) {
      setAssets(prev);
      setReorderErr(e.message);
    } finally {
      setReordering(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  if (pageLoading) return <AdminSpinner />;

  return (
    <div className="tgp-page">
      <AdminPageHeader
        title="Expedition Gallery"
        subtitle={tour ? `Managing photos for: ${tour.title}` : 'Tour gallery'}
        backTo="/admin/tours"
      />

      {pageError && (
        <div className="tgp-alert tgp-alert--error" role="alert">
          ⚠ {pageError}
          <button className="tgp-alert-retry" onClick={reload}>Retry</button>
        </div>
      )}

      {/* ── Upload zone ──────────────────────────────────────────────── */}
      <div
        className={`tgp-upload-zone${dragOver ? ' tgp-upload-zone--over' : ''}${uploading ? ' tgp-upload-zone--busy' : ''}`}
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={uploading ? -1 : 0}
        aria-label="Upload images"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        {uploading ? (
          <div className="tgp-uploading-msg">
            <span className="tgp-spinner" aria-hidden="true" />
            Uploading images…
          </div>
        ) : (
          <>
            <span className="tgp-upload-icon" aria-hidden="true">⬆</span>
            <p className="tgp-upload-hint">
              Click or drag images here to upload
              <span>JPEG · PNG · WebP · GIF — max {MAX_MB} MB each — multiple files supported</span>
            </p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        onChange={handleInputChange}
        className="tgp-hidden-input"
        disabled={uploading}
        tabIndex={-1}
      />

      {uploadError && (
        <div className="tgp-alert tgp-alert--error" role="alert">⚠ {uploadError}</div>
      )}

      {/* ── Errors ──────────────────────────────────────────────────── */}
      {reorderErr && (
        <div className="tgp-alert tgp-alert--error" role="alert">
          ⚠ Reorder failed: {reorderErr}
          <button className="tgp-alert-retry" onClick={() => setReorderErr('')}>Dismiss</button>
        </div>
      )}
      {deleteError && (
        <div className="tgp-alert tgp-alert--error" role="alert">⚠ {deleteError}</div>
      )}

      {/* ── Image list ───────────────────────────────────────────────── */}
      {assets.length === 0 && !pageLoading && (
        <div className="tgp-empty">
          <span className="tgp-empty-icon" aria-hidden="true">🖼</span>
          <p className="tgp-empty-text">No gallery images yet. Upload your first photo above.</p>
        </div>
      )}

      {assets.length > 0 && (
        <div className="tgp-count">
          {assets.length} image{assets.length !== 1 ? 's' : ''}
          {reordering && <span className="tgp-reorder-saving"> — saving order…</span>}
        </div>
      )}

      <div className="tgp-list">
        {assets.map((asset, index) => {
          const isDeleting = deletingId === asset.id;
          const isSaving   = savingId   === asset.id;
          const saveErr    = saveErrors[asset.id];
          const dirty      = altDirty(asset.id);

          return (
            <div
              key={asset.id}
              className={`tgp-row${isDeleting ? ' tgp-row--deleting' : ''}${reordering ? ' tgp-row--reordering' : ''}`}
            >
              {/* Thumbnail */}
              <div className="tgp-thumb-wrap">
                <img
                  src={asset.image_url}
                  alt={asset.alt || 'Gallery image'}
                  className="tgp-thumb"
                  onError={e => { e.target.style.opacity = '0.3'; }}
                />
              </div>

              {/* Alt text */}
              <div className="tgp-alt-wrap">
                <label className="tgp-alt-label" htmlFor={`alt-${asset.id}`}>
                  Alt text
                </label>
                <div className="tgp-alt-row">
                  <input
                    id={`alt-${asset.id}`}
                    type="text"
                    className="tgp-alt-input"
                    value={altDrafts[asset.id] ?? ''}
                    onChange={e => handleAltChange(asset.id, e.target.value)}
                    placeholder="Describe the image for accessibility…"
                    disabled={isSaving || isDeleting}
                  />
                  {dirty && (
                    <button
                      className="tgp-btn tgp-btn--save"
                      onClick={() => handleAltSave(asset.id)}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving…' : 'Save'}
                    </button>
                  )}
                </div>
                {saveErr && (
                  <p className="tgp-field-error" role="alert">{saveErr}</p>
                )}
              </div>

              {/* Reorder + Delete */}
              <div className="tgp-actions">
                <div className="tgp-move-group">
                  <button
                    className="tgp-btn-move"
                    title="Move up"
                    disabled={reordering || isDeleting || index === 0}
                    onClick={() => handleMove(index, 'up')}
                    aria-label="Move image up"
                  >▲</button>
                  <span className="tgp-order-num">{index + 1}</span>
                  <button
                    className="tgp-btn-move"
                    title="Move down"
                    disabled={reordering || isDeleting || index === assets.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    aria-label="Move image down"
                  >▼</button>
                </div>
                <button
                  className="tgp-btn tgp-btn--delete"
                  onClick={() => handleDelete(asset)}
                  disabled={isDeleting || reordering}
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
