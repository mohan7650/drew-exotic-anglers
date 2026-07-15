import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import FormField from '../../../components/admin/ui/FormField';
import ImageUpload from '../../../components/admin/ui/ImageUpload';
import CropModal from '../../../components/admin/ui/CropModal';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import { getTour, createTour, updateTour, slugify } from '../../../services/toursService';
import { listSpecies } from '../../../services/speciesService';
import {
  listTourSpeciesIds,
  addTourSpecies,
  removeTourSpecies,
} from '../../../services/tourSpeciesService';
import { fetchAsSrcUrl, blobToFile } from '../../../utils/cropImage';
import './TourFormPage.css';

// Tour cards are displayed in a 3-column grid with fixed height 560px.
// Column width ≈ 387px at 1200px viewport → ratio ≈ 387:560, closest clean value is 5:7.
const HERO_ASPECT = 5 / 7;

const EMPTY = {
  title: '', slug: '', tag: '', meta: '',
  full_desc: '', gallery_desc: '',
  booking_url: '', image_url: '',
};

function reducer(state, action) {
  if (action.type === 'SET_ALL')   return { ...action.payload };
  if (action.type === 'SET_FIELD') return { ...state, [action.field]: action.value };
  return state;
}

// ── Species selector (edit mode only) ──────────────────────────────────────
function SpeciesSelector({ tourId }) {
  const [allSpecies,  setAllSpecies]  = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [togglingId,  setTogglingId]  = useState(null);
  const [toggleError, setToggleError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [species, selections] = await Promise.all([
        listSpecies(),
        listTourSpeciesIds(tourId),
      ]);
      setAllSpecies(species);
      setSelectedIds(new Set(selections.map(s => s.species_id)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => { load(); }, [load]);

  async function handleToggle(speciesId) {
    if (togglingId) return;
    setTogglingId(speciesId);
    setToggleError('');

    const isSelected = selectedIds.has(speciesId);
    setSelectedIds(prev => {
      const next = new Set(prev);
      isSelected ? next.delete(speciesId) : next.add(speciesId);
      return next;
    });

    try {
      if (isSelected) {
        await removeTourSpecies(tourId, speciesId);
      } else {
        await addTourSpecies(tourId, speciesId);
      }
    } catch (e) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        isSelected ? next.add(speciesId) : next.delete(speciesId);
        return next;
      });
      setToggleError(e.message);
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) return <p className="tfp-species-loading">Loading species…</p>;

  if (error) {
    return (
      <p className="tfp-species-error">
        ⚠ {error}
        <button className="tfp-species-retry" onClick={load}>Retry</button>
      </p>
    );
  }

  const count = selectedIds.size;

  return (
    <div className="tfp-species-selector">
      <p className="tfp-species-hint">
        Select the species to feature in "The Fish You'll Chase" section on this tour's page.
        Recommended: 2–3 species. {count > 0 && <strong>{count} selected</strong>}
      </p>

      {toggleError && <p className="tfp-species-error">⚠ {toggleError}</p>}

      <div className="tfp-species-list">
        {allSpecies.map(sp => {
          const checked    = selectedIds.has(sp.id);
          const isToggling = togglingId === sp.id;
          const stars      = Math.min(5, Math.max(0, Math.round(sp.stars || 0)));

          return (
            <label
              key={sp.id}
              className={`tfp-species-row${checked ? ' tfp-species-row--checked' : ''}${isToggling ? ' tfp-species-row--toggling' : ''}`}
            >
              <input
                type="checkbox"
                className="tfp-species-checkbox"
                checked={checked}
                onChange={() => handleToggle(sp.id)}
                disabled={!!togglingId}
              />
              {sp.image_url && (
                <img
                  src={sp.image_url}
                  alt={sp.name}
                  className="tfp-species-thumb"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              )}
              <div className="tfp-species-info">
                <span className="tfp-species-name">{sp.name}</span>
                {sp.latin_name && (
                  <span className="tfp-species-latin">{sp.latin_name}</span>
                )}
                {stars > 0 && (
                  <span className="tfp-species-stars" aria-label={`${stars} stars`}>
                    {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                  </span>
                )}
                {sp.difficulty && (
                  <span className="tfp-species-diff">Difficulty: {sp.difficulty}</span>
                )}
              </div>
              {isToggling && <span className="tfp-species-saving" aria-label="Saving">…</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function TourFormPage() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();

  const [fields,       dispatch]       = useReducer(reducer, EMPTY);
  const [imageFile,    setImageFile]   = useState(null);
  const [slugTouched,  setSlugTouched] = useState(false);

  const [loading,    setLoading]    = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});
  const [saveError,  setSaveError]  = useState('');

  // ── Crop state ─────────────────────────────────────────────────────────
  const [cropSrc,        setCropSrc]        = useState(null);
  const [pendingObjUrl,  setPendingObjUrl]  = useState(null);
  const [cropPreviewUrl, setCropPreviewUrl] = useState(null);
  const [imgKey,         setImgKey]         = useState(0);

  useEffect(() => {
    if (!isEdit) return;
    getTour(id)
      .then(tour => {
        dispatch({ type: 'SET_ALL', payload: { ...EMPTY, ...tour } });
        setSlugTouched(true);
      })
      .catch(e => setSaveError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleTitleChange(value) {
    dispatch({ type: 'SET_FIELD', field: 'title', value });
    if (!slugTouched) {
      dispatch({ type: 'SET_FIELD', field: 'slug', value: slugify(value) });
    }
  }

  function set(field) {
    return e => dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  }

  // ── Crop handlers ──────────────────────────────────────────────────────
  function handleImageSelect(file) {
    const url = URL.createObjectURL(file);
    if (pendingObjUrl) URL.revokeObjectURL(pendingObjUrl);
    setPendingObjUrl(url);
    setCropSrc(url);
  }

  async function handleAdjustCrop() {
    const src = cropPreviewUrl || fields.image_url;
    if (!src) return;
    const { objUrl } = await fetchAsSrcUrl(src);
    if (pendingObjUrl) URL.revokeObjectURL(pendingObjUrl);
    setPendingObjUrl(objUrl);
    setCropSrc(objUrl);
  }

  function handleCropApply(blob) {
    if (pendingObjUrl) { URL.revokeObjectURL(pendingObjUrl); setPendingObjUrl(null); }
    setCropSrc(null);

    setImageFile(blobToFile(blob, 'tour-hero'));
    if (cropPreviewUrl) URL.revokeObjectURL(cropPreviewUrl);
    setCropPreviewUrl(URL.createObjectURL(blob));
    setImgKey(k => k + 1);
  }

  function handleCropCancel() {
    if (pendingObjUrl) { URL.revokeObjectURL(pendingObjUrl); setPendingObjUrl(null); }
    setCropSrc(null);
    setImgKey(k => k + 1);
  }

  // ── Form submit ────────────────────────────────────────────────────────
  function validate() {
    const errs = {};
    if (!fields.title.trim()) errs.title = 'Title is required.';
    if (!fields.slug.trim())  errs.slug  = 'Slug is required.';
    if (!/^[a-z0-9-]+$/.test(fields.slug.trim())) {
      errs.slug = 'Slug may only contain lowercase letters, numbers, and hyphens.';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    const payload = {
      title:        fields.title.trim(),
      slug:         fields.slug.trim(),
      tag:          fields.tag.trim(),
      meta:         fields.meta.trim(),
      full_desc:    fields.full_desc.trim(),
      gallery_desc: fields.gallery_desc.trim(),
      booking_url:  fields.booking_url.trim(),
    };

    try {
      if (isEdit) {
        await updateTour(id, payload, imageFile, fields.image_url);
      } else {
        await createTour(payload, imageFile);
      }
      navigate('/admin/tours');
    } catch (e) {
      setSaveError(e.message);
      setSubmitting(false);
    }
  }

  if (loading) return <AdminSpinner />;

  const currentImageSrc = cropPreviewUrl || fields.image_url;

  return (
    <div className="tfp-page">
      <AdminPageHeader
        title={isEdit ? 'Edit Tour' : 'New Tour'}
        subtitle={isEdit ? `Editing: ${fields.title}` : 'Add a new expedition'}
        backTo="/admin/tours"
      />

      {saveError && (
        <div className="tfp-save-error" role="alert">
          <span>⚠</span> {saveError}
        </div>
      )}

      {/* Sub-page navigation (edit mode only) */}
      {isEdit && (
        <div className="tfp-subpages">
          <Link to={`/admin/tours/${id}/gallery`} className="tfp-subpage-link">
            <span className="tfp-subpage-icon">🖼</span>
            <div>
              <strong>Expedition Gallery</strong>
              <span>Upload &amp; reorder gallery photos</span>
            </div>
          </Link>
          <Link to={`/admin/tours/${id}/details`} className="tfp-subpage-link">
            <span className="tfp-subpage-icon">📋</span>
            <div>
              <strong>Trip Details</strong>
              <span>Add, edit &amp; reorder detail rows</span>
            </div>
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="tfp-form">

        {/* ── Row: Image + Listing fields */}
        <div className="tfp-two-col">
          <div className="tfp-col">
            <ImageUpload
              key={imgKey}
              currentUrl={currentImageSrc}
              onChange={handleImageSelect}
              disabled={submitting}
            />
            {currentImageSrc && (
              <button
                type="button"
                className="tfp-btn-adjust-crop"
                onClick={handleAdjustCrop}
                disabled={submitting}
              >
                ✂ Adjust Crop
              </button>
            )}
          </div>

          <div className="tfp-col tfp-col--fields">
            <FormField
              id="title"
              label="Title"
              required
              value={fields.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Amazon Peacock Bass Expedition"
              disabled={submitting}
              error={errors.title}
            />
            <FormField
              id="slug"
              label="URL Slug"
              required
              value={fields.slug}
              onChange={e => {
                setSlugTouched(true);
                set('slug')(e);
              }}
              placeholder="amazon-peacock-bass"
              disabled={submitting}
              error={errors.slug}
              hint="Used in the public URL: /tour/your-slug"
            />
            <FormField
              id="tag"
              label="Tag"
              value={fields.tag}
              onChange={set('tag')}
              placeholder="Tier 2 · Amazon"
              disabled={submitting}
            />
            <FormField
              id="meta"
              label="Short Description (listing card)"
              value={fields.meta}
              onChange={set('meta')}
              placeholder="6 days • Peacock Bass • Jurubaxi River"
              disabled={submitting}
            />
          </div>
        </div>

        {/* ── Section: Detail page copy */}
        <fieldset className="tfp-section">
          <legend className="tfp-section-title">Detail Page Copy</legend>
          <div className="tfp-stack">
            <FormField
              id="full_desc"
              label="Full Description"
              as="textarea"
              rows={5}
              value={fields.full_desc}
              onChange={set('full_desc')}
              placeholder="Describe the expedition in full…"
              disabled={submitting}
            />
            <FormField
              id="gallery_desc"
              label="Gallery Description"
              as="textarea"
              rows={2}
              value={fields.gallery_desc}
              onChange={set('gallery_desc')}
              placeholder="Optional caption displayed above the gallery grid"
              disabled={submitting}
            />
          </div>
        </fieldset>

        {/* ── Section: Booking */}
        <fieldset className="tfp-section">
          <legend className="tfp-section-title">Booking</legend>
          <FormField
            id="booking_url"
            label="Booking URL"
            type="url"
            value={fields.booking_url}
            onChange={set('booking_url')}
            placeholder="https://fareharbor.com/…"
            disabled={submitting}
          />
        </fieldset>

        {/* ── Section: Fish You'll Chase (edit mode only) */}
        {isEdit && (
          <fieldset className="tfp-section">
            <legend className="tfp-section-title">Fish You'll Chase</legend>
            <SpeciesSelector tourId={id} />
          </fieldset>
        )}

        {/* ── Actions */}
        <div className="tfp-actions">
          <button
            type="button"
            className="tfp-btn-cancel"
            onClick={() => navigate('/admin/tours')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="tfp-btn-save"
            disabled={submitting}
          >
            {submitting ? (
              <><span className="tfp-spinner" aria-hidden="true" /> Saving…</>
            ) : (
              isEdit ? 'Save Changes' : 'Create Tour'
            )}
          </button>
        </div>

      </form>

      {/* ── Crop modal */}
      {cropSrc && (
        <CropModal
          imageSrc={cropSrc}
          aspect={HERO_ASPECT}
          onCancel={handleCropCancel}
          onApply={handleCropApply}
        />
      )}
    </div>
  );
}
