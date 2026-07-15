import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import CropModal from '../../../components/admin/ui/CropModal';
import { getTour } from '../../../services/toursService';
import {
  listTourAssets,
  createTourAsset,
  updateTourAssetAlt,
  updateTourAssetImage,
  deleteTourAsset,
  reorderTourAssets,
} from '../../../services/tourAssetsService';
import { fetchAsSrcUrl, blobToFile } from '../../../utils/cropImage';
import './TourGalleryPage.css';

// Gallery images are displayed at 4:3 in TourDetails (explicit in mobile CSS
// and inferred from the 380×260 carousel slide ratio ≈ 3:2, but 4:3 is the
// prescribed aspect-ratio for the grid view).
const GALLERY_ASPECT = 4 / 3;

const MAX_MB    = 10;
const ACCEPTED  = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_BYTES = MAX_MB * 1024 * 1024;

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

  const [reordering, setReordering] = useState(false);
  const [reorderErr, setReorderErr] = useState('');

  const fileInputRef = useRef(null);

  // Inline alt-text edits
  const [altDrafts, setAltDrafts] = useState({});

  // ── Crop state ──────────────────────────────────────────────────────────
  // cropQueue: files waiting to be cropped before upload
  const [cropQueue,  setCropQueue]  = useState([]);
  const [cropSrc,    setCropSrc]    = useState(null); // object URL for modal
  const [cropMode,   setCropMode]   = useState('upload'); // 'upload' | 'reposition'

  // Reposition state (existing asset re-crop)
  const [repositionAsset,   setRepositionAsset]   = useState(null);
  const [repositionSaving,  setRepositionSaving]  = useState(false);
  const [repositionError,   setRepositionError]   = useState('');

  // ── Initial load ────────────────────────────────────────────────────────
  const reload = useCallback(async () => {
    setPageError('');
    try {
      const [tourData, assetData] = await Promise.all([
        getTour(id),
        listTourAssets(id),
      ]);
      setTour(tourData);
      setAssets(assetData);
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

  // ── Upload — opens crop modal for each file in sequence ─────────────────
  function handleFiles(files) {
    if (!files || files.length === 0) return;
    setUploadError('');

    const oversize = Array.from(files).find(f => f.size > MAX_BYTES);
    if (oversize) {
      setUploadError(`"${oversize.name}" exceeds the ${MAX_MB} MB limit.`);
      return;
    }

    const fileArray = Array.from(files);
    setCropMode('upload');
    setCropQueue(fileArray);

    // Open modal for the first file
    const url = URL.createObjectURL(fileArray[0]);
    setCropSrc(url);
  }

  function handleInputChange(e) { handleFiles(e.target.files); }
  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  // ── Crop: upload flow ──────────────────────────────────────────────────
  async function handleCropApply(blob) {
    if (cropMode === 'reposition') {
      handleRepositionApply(blob);
      return;
    }

    // Close modal and revoke current object URL
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);

    // Upload the cropped blob
    setUploading(true);
    setUploadError('');
    try {
      const file = blobToFile(blob, 'gallery');
      await createTourAsset(id, file, '');
    } catch (e) {
      setUploadError(e.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

    // Advance the queue
    const remaining = cropQueue.slice(1);
    setCropQueue(remaining);
    if (remaining.length > 0) {
      const url = URL.createObjectURL(remaining[0]);
      setCropSrc(url);
    } else {
      reload();
    }
  }

  function handleCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);

    // Skip this file and move to next
    const remaining = cropQueue.slice(1);
    setCropQueue(remaining);
    if (remaining.length > 0) {
      const url = URL.createObjectURL(remaining[0]);
      setCropSrc(url);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ── Reposition existing asset ──────────────────────────────────────────
  async function handleReposition(asset) {
    setRepositionAsset(asset);
    setRepositionError('');
    const { objUrl } = await fetchAsSrcUrl(asset.image_url);
    setCropMode('reposition');
    setCropSrc(objUrl);
  }

  async function handleRepositionApply(blob) {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);

    setRepositionSaving(true);
    setRepositionError('');
    try {
      const file = blobToFile(blob, 'gallery-reposition');
      const updated = await updateTourAssetImage(
        repositionAsset.id,
        file,
        repositionAsset.image_url,
      );
      setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
    } catch (e) {
      setRepositionError(e.message);
    } finally {
      setRepositionSaving(false);
      setRepositionAsset(null);
      setCropMode('upload');
    }
  }

  // ── Alt text ────────────────────────────────────────────────────────────
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

  // ── Delete ──────────────────────────────────────────────────────────────
  async function handleDelete(asset) {
    if (!window.confirm('Delete this image? This cannot be undone.')) return;
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

  // ── Reorder ─────────────────────────────────────────────────────────────
  async function handleMove(index, direction) {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= assets.length) return;

    const newAssets  = [...assets];
    [newAssets[index], newAssets[swapIndex]] = [newAssets[swapIndex], newAssets[index]];
    const updates    = newAssets.map((a, i) => ({ id: a.id, sort_order: i + 1 }));
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

  // ── Render ──────────────────────────────────────────────────────────────
  if (pageLoading) return <AdminSpinner />;

  const queueLen        = cropQueue.length;
  const isRepositioning = repositionSaving;

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

      {repositionError && (
        <div className="tgp-alert tgp-alert--error" role="alert">
          ⚠ Reposition failed: {repositionError}
          <button className="tgp-alert-retry" onClick={() => setRepositionError('')}>✕</button>
        </div>
      )}

      {/* ── Upload zone */}
      <div
        className={`tgp-upload-zone${dragOver ? ' tgp-upload-zone--over' : ''}${uploading ? ' tgp-upload-zone--busy' : ''}`}
        onClick={() => !uploading && !cropSrc && fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={uploading || !!cropSrc ? -1 : 0}
        aria-label="Upload images"
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        {uploading ? (
          <div className="tgp-uploading-msg">
            <span className="tgp-spinner" aria-hidden="true" />
            Uploading image…
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
        disabled={uploading || !!cropSrc}
        tabIndex={-1}
      />

      {uploadError && (
        <div className="tgp-alert tgp-alert--error" role="alert">⚠ {uploadError}</div>
      )}
      {reorderErr && (
        <div className="tgp-alert tgp-alert--error" role="alert">
          ⚠ Reorder failed: {reorderErr}
          <button className="tgp-alert-retry" onClick={() => setReorderErr('')}>Dismiss</button>
        </div>
      )}
      {deleteError && (
        <div className="tgp-alert tgp-alert--error" role="alert">⚠ {deleteError}</div>
      )}

      {/* ── Image list */}
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
          const isDeleting     = deletingId === asset.id;
          const isSaving       = savingId   === asset.id;
          const saveErr        = saveErrors[asset.id];
          const dirty          = altDirty(asset.id);
          const isThisRepos    = repositionAsset?.id === asset.id;

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
                {isThisRepos && isRepositioning && (
                  <div className="tgp-thumb-saving">Saving…</div>
                )}
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

              {/* Reorder + Reposition + Delete */}
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
                  className="tgp-btn tgp-btn--reposition"
                  onClick={() => handleReposition(asset)}
                  disabled={isDeleting || isRepositioning || !!cropSrc}
                  title="Reposition / re-crop this image"
                >
                  {isThisRepos && isRepositioning ? 'Saving…' : '✂ Crop'}
                </button>
                <button
                  className="tgp-btn tgp-btn--delete"
                  onClick={() => handleDelete(asset)}
                  disabled={isDeleting || reordering || isRepositioning}
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Crop modal */}
      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          aspect={GALLERY_ASPECT}
          onCancel={handleCropCancel}
          onApply={handleCropApply}
          key={cropSrc}
        />
      )}
      {queueLen > 1 && cropSrc && (
        <div className="tgp-queue-badge" aria-live="polite">
          {cropQueue.length} image{cropQueue.length !== 1 ? 's' : ''} remaining
        </div>
      )}
    </div>
  );
}
