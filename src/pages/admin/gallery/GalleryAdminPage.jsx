import React, { useCallback, useEffect, useState } from 'react';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import FormField from '../../../components/admin/ui/FormField';
import ImageUpload from '../../../components/admin/ui/ImageUpload';
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
  // ── Photo list
  const [photos,    setPhotos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState('');

  // ── Add / edit form panel
  const [formOpen,   setFormOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);   // null = add, object = edit
  const [formFields, setFormFields] = useState(EMPTY_FORM);
  const [imageFile,  setImageFile]  = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState('');

  // ── Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [deleteError,  setDeleteError]  = useState('');

  // ── Load
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

  // ── Form helpers
  function openAdd() {
    setEditTarget(null);
    setFormFields(EMPTY_FORM);
    setImageFile(null);
    setSaveError('');
    setFormOpen(true);
  }

  function openEdit(photo) {
    setEditTarget(photo);
    setFormFields({ alt: photo.alt || '', image_url: photo.image_url || '' });
    setImageFile(null);
    setSaveError('');
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditTarget(null);
    setImageFile(null);
    setSaveError('');
  }

  function setField(key) {
    return e => setFormFields(prev => ({ ...prev, [key]: e.target.value }));
  }

  // ── Save
  async function handleSave(e) {
    e.preventDefault();
    setSaveError('');

    if (!editTarget && !imageFile) {
      setSaveError('Please select an image to upload.');
      return;
    }

    setSaving(true);
    try {
      if (editTarget) {
        const updated = await updateGalleryPhoto(
          editTarget.id, formFields, imageFile, editTarget.image_url
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

  // ── Delete
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

  // ── Render: loading
  if (loading) return <AdminSpinner />;

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
                  currentUrl={formFields.image_url}
                  onChange={setImageFile}
                  disabled={saving}
                  label="Photo"
                />
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
          {photos.map(photo => (
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
                >Edit</button>
                <button
                  className="gap-btn gap-btn--delete"
                  onClick={() => { setDeleteTarget(photo); setDeleteError(''); }}
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Delete error (shown after modal closes) */}
      {deleteError && (
        <div className="hap-banner hap-banner--error" role="alert" style={{ marginTop: 16 }}>
          <span>⚠</span> {deleteError}
        </div>
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
