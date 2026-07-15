import React, { useCallback, useEffect, useState } from 'react';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import FormField from '../../../components/admin/ui/FormField';
import ImageUpload from '../../../components/admin/ui/ImageUpload';
import CropModal from '../../../components/admin/ui/CropModal';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import ConfirmModal from '../../../components/admin/ui/ConfirmModal';
import {
  getGalleryPhotos,
  createGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto,
} from '../../../services/galleryService';
import '../hero/HeroAdminPage.css';
import './GalleryAdminPage.css';

const EMPTY_FORM = { alt: '', image_url: '' };

export default function GalleryAdminPage() {
  // ── Photo list ───────────────────────────────────────────────────────────
  const [photos,    setPhotos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState('');

  // ── Add / edit form panel ────────────────────────────────────────────────
  const [formOpen,       setFormOpen]       = useState(false);
  const [editTarget,     setEditTarget]     = useState(null);   // null = add
  const [formFields,     setFormFields]     = useState(EMPTY_FORM);
  const [imageFile,      setImageFile]      = useState(null);   // cropped File to upload
  const [cropPreviewUrl, setCropPreviewUrl] = useState(null);   // local blob URL for preview
  const [imgKey,         setImgKey]         = useState(0);      // force-reset ImageUpload
  const [saving,         setSaving]         = useState(false);
  const [saveError,      setSaveError]      = useState('');

  // ── Crop modal (shared by new-upload flow and reposition flow) ───────────
  const [cropOpen,      setCropOpen]      = useState(false);
  const [cropSrc,       setCropSrc]       = useState(null);
  const [pendingObjUrl, setPendingObjUrl] = useState(null);  // obj URL to revoke later
  const [cropForRepos,  setCropForRepos]  = useState(false); // true = reposition, not form

  // ── Card-level reposition (no form) ─────────────────────────────────────
  const [repositionTarget,  setRepositionTarget]  = useState(null);
  const [repositionLoading, setRepositionLoading] = useState(false);
  const [repositionSaving,  setRepositionSaving]  = useState(false);
  const [repositionError,   setRepositionError]   = useState('');

  // ── Delete ───────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState('');

  // ── Load ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setPhotos(await getGalleryPhotos());
    } catch (e) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Revoke all blob URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (pendingObjUrl) URL.revokeObjectURL(pendingObjUrl);
      if (cropPreviewUrl) URL.revokeObjectURL(cropPreviewUrl);
    };
  }, []); // eslint-disable-line

  // ── Form helpers ─────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null);
    setFormFields(EMPTY_FORM);
    setImageFile(null);
    if (cropPreviewUrl) { URL.revokeObjectURL(cropPreviewUrl); setCropPreviewUrl(null); }
    setImgKey(k => k + 1);
    setSaveError('');
    setFormOpen(true);
  }

  function openEdit(photo) {
    setEditTarget(photo);
    setFormFields({ alt: photo.alt || '', image_url: photo.image_url || '' });
    setImageFile(null);
    if (cropPreviewUrl) { URL.revokeObjectURL(cropPreviewUrl); setCropPreviewUrl(null); }
    setImgKey(k => k + 1);
    setSaveError('');
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditTarget(null);
    setImageFile(null);
    if (cropPreviewUrl) { URL.revokeObjectURL(cropPreviewUrl); setCropPreviewUrl(null); }
    setSaveError('');
  }

  function setField(key) {
    return e => setFormFields(prev => ({ ...prev, [key]: e.target.value }));
  }

  // ── Image selected in ImageUpload → open crop modal ──────────────────────
  function handleImageSelect(file) {
    const objUrl = URL.createObjectURL(file);
    if (pendingObjUrl) URL.revokeObjectURL(pendingObjUrl);
    setPendingObjUrl(objUrl);
    setCropSrc(objUrl);
    setCropForRepos(false);
    setCropOpen(true);
  }

  // ── "Adjust Crop" in form panel: re-crop the current preview or existing image
  async function handleAdjustCrop() {
    const src = cropPreviewUrl || formFields.image_url;
    if (!src) return;

    try {
      // Fetch as blob so the canvas doesn't get tainted by CORS
      const res = await fetch(src);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      if (pendingObjUrl) URL.revokeObjectURL(pendingObjUrl);
      setPendingObjUrl(objUrl);
      setCropSrc(objUrl);
    } catch {
      // Fallback: pass URL directly (works when Supabase CORS headers allow it)
      setCropSrc(src);
    }
    setCropForRepos(false);
    setCropOpen(true);
  }

  // ── Crop modal: apply ─────────────────────────────────────────────────────
  function handleCropApply(blob) {
    // Clean up pending URL
    if (pendingObjUrl) { URL.revokeObjectURL(pendingObjUrl); setPendingObjUrl(null); }
    setCropOpen(false);
    setCropSrc(null);

    if (cropForRepos) {
      handleRepositionCropApply(blob);
      return;
    }

    // Form flow: store cropped file and update preview
    const file = new File([blob], `crop-${Date.now()}.webp`, { type: 'image/webp' });
    setImageFile(file);

    if (cropPreviewUrl) URL.revokeObjectURL(cropPreviewUrl);
    setCropPreviewUrl(URL.createObjectURL(blob));
    setImgKey(k => k + 1); // reset ImageUpload's internal preview state
  }

  // ── Crop modal: cancel ────────────────────────────────────────────────────
  function handleCropCancel() {
    if (pendingObjUrl) { URL.revokeObjectURL(pendingObjUrl); setPendingObjUrl(null); }
    setCropOpen(false);
    setCropSrc(null);
    setImgKey(k => k + 1); // reset any partial file selection in ImageUpload
  }

  // ── Card-level reposition: open ───────────────────────────────────────────
  async function handleReposition(photo) {
    setRepositionTarget(photo);
    setRepositionError('');
    setRepositionLoading(true);

    try {
      const res = await fetch(photo.image_url);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      if (pendingObjUrl) URL.revokeObjectURL(pendingObjUrl);
      setPendingObjUrl(objUrl);
      setCropSrc(objUrl);
    } catch {
      // Fallback: pass URL directly
      setCropSrc(photo.image_url);
    }

    setCropForRepos(true);
    setCropOpen(true);
    setRepositionLoading(false);
  }

  // ── Card-level reposition: apply ──────────────────────────────────────────
  async function handleRepositionCropApply(blob) {
    if (!repositionTarget) return;

    setRepositionSaving(true);
    setRepositionError('');

    try {
      const file = new File(
        [blob],
        `reposition-${Date.now()}.webp`,
        { type: 'image/webp' },
      );
      const updated = await updateGalleryPhoto(
        repositionTarget.id,
        { alt: repositionTarget.alt },
        file,
        repositionTarget.image_url,
      );
      setPhotos(prev => prev.map(p => p.id === updated.id ? updated : p));
    } catch (err) {
      setRepositionError(err.message);
    } finally {
      setRepositionSaving(false);
      setRepositionTarget(null);
      setCropForRepos(false);
    }
  }

  // ── Form: save ────────────────────────────────────────────────────────────
  async function handleSave(e) {
    e.preventDefault();
    setSaveError('');

    if (!editTarget && !imageFile) {
      setSaveError('Please select and crop an image.');
      return;
    }

    setSaving(true);
    try {
      if (editTarget) {
        const updated = await updateGalleryPhoto(
          editTarget.id, formFields, imageFile, editTarget.image_url,
        );
        setPhotos(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
        const created = await createGalleryPhoto(formFields, imageFile);
        setPhotos(prev => [created, ...prev]);
      }
      closeForm();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDeleteConfirm() {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteGalleryPhoto(deleteTarget.id, deleteTarget.image_url);
      setPhotos(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setDeleteError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <AdminSpinner />;

  const currentImageSrc  = cropPreviewUrl || formFields.image_url;
  const isRepositioning  = repositionLoading || repositionSaving;

  return (
    <div className="gap-page">
      <AdminPageHeader
        title="Gallery"
        subtitle={`${photos.length} photo${photos.length !== 1 ? 's' : ''}`}
        action={{ label: '+ Add Photo', onClick: openAdd }}
      />

      {/* ── Load error */}
      {loadError && (
        <div className="hap-banner hap-banner--error" role="alert">
          <span>⚠</span> {loadError}
          <button className="gap-retry" onClick={load}>Retry</button>
        </div>
      )}

      {/* ── Reposition error */}
      {repositionError && (
        <div className="hap-banner hap-banner--error" role="alert" style={{ marginBottom: 16 }}>
          <span>⚠</span> Reposition failed: {repositionError}
          <button className="gap-retry" onClick={() => setRepositionError('')}>✕</button>
        </div>
      )}

      {/* ── Add / Edit form panel */}
      {formOpen && (
        <div className="gap-form-panel">
          <div className="gap-form-head">
            <span className="gap-form-head-title">
              {editTarget ? `Edit — ${editTarget.alt || 'untitled'}` : 'Add New Photo'}
            </span>
            <button
              type="button"
              className="gap-form-close"
              onClick={closeForm}
              aria-label="Close form"
            >✕</button>
          </div>

          {saveError && (
            <div className="gap-save-error" role="alert">
              <span>⚠</span> {saveError}
            </div>
          )}

          <form onSubmit={handleSave} noValidate>
            <div className="gap-form-body">

              <div className="gap-form-image">
                <ImageUpload
                  key={imgKey}
                  currentUrl={currentImageSrc}
                  onChange={handleImageSelect}
                  disabled={saving}
                  label="Photo"
                />
                {currentImageSrc && (
                  <button
                    type="button"
                    className="gap-btn-adjust-crop"
                    onClick={handleAdjustCrop}
                    disabled={saving}
                  >
                    ✂ Adjust Crop
                  </button>
                )}
              </div>

              <div className="gap-form-fields">
                <FormField
                  id="alt"
                  label="Alt Text"
                  value={formFields.alt}
                  onChange={setField('alt')}
                  placeholder="Peacock Bass catch on the Jurubaxi River"
                  disabled={saving}
                  hint="Describe the photo for accessibility and captions."
                />
              </div>

            </div>

            <div className="gap-form-footer">
              <button
                type="button"
                className="gap-btn-cancel"
                onClick={closeForm}
                disabled={saving}
              >Cancel</button>
              <button
                type="submit"
                className="hap-btn-save"
                disabled={saving}
              >
                {saving ? (
                  <><span className="hap-spinner" aria-hidden="true" /> Saving…</>
                ) : (
                  editTarget ? 'Save Changes' : 'Upload Photo'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Empty state */}
      {!loadError && photos.length === 0 && (
        <div className="gap-empty">
          <span className="gap-empty-icon" aria-hidden="true">🖼</span>
          <p className="gap-empty-text">No photos yet.</p>
          <button className="gap-empty-cta" onClick={openAdd}>
            Upload your first photo →
          </button>
        </div>
      )}

      {/* ── Photo grid */}
      {photos.length > 0 && (
        <div className="gap-grid">
          {photos.map(photo => {
            const isThisRepos = repositionTarget?.id === photo.id;
            return (
              <div key={photo.id} className="gap-card">
                <div className="gap-card-img-wrap">
                  {photo.image_url ? (
                    <img
                      src={photo.image_url}
                      alt={photo.alt || ''}
                      className="gap-card-img"
                      loading="lazy"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="gap-card-img-empty" aria-label="No image">◈</div>
                  )}
                  {isThisRepos && (repositionLoading || repositionSaving) && (
                    <div className="gap-card-repos-overlay">
                      {repositionLoading ? 'Loading…' : 'Saving…'}
                    </div>
                  )}
                </div>

                <div className="gap-card-info">
                  <p className={`gap-card-alt${!photo.alt ? ' gap-card-alt--empty' : ''}`}>
                    {photo.alt || 'No alt text'}
                  </p>
                </div>

                <div className="gap-card-actions">
                  <button
                    className="gap-btn gap-btn--edit"
                    onClick={() => openEdit(photo)}
                    disabled={isRepositioning}
                  >Edit</button>
                  <button
                    className="gap-btn gap-btn--reposition"
                    onClick={() => handleReposition(photo)}
                    disabled={isRepositioning || !photo.image_url}
                    title="Reposition / re-crop this image"
                  >
                    {isThisRepos ? '…' : '✂ Crop'}
                  </button>
                  <button
                    className="gap-btn gap-btn--delete"
                    onClick={() => { setDeleteTarget(photo); setDeleteError(''); }}
                    disabled={isRepositioning}
                  >Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete error */}
      {deleteError && (
        <div className="hap-banner hap-banner--error" role="alert" style={{ marginTop: 16 }}>
          <span>⚠</span> {deleteError}
        </div>
      )}

      {/* ── Crop modal */}
      {cropOpen && cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          onCancel={handleCropCancel}
          onApply={handleCropApply}
        />
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Photo"
        message={`Delete "${deleteTarget?.alt || 'this photo'}"? This cannot be undone.`}
        confirmLabel="Delete Photo"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteTarget(null); setDeleteError(''); }}
        loading={deleting}
      />
    </div>
  );
}
