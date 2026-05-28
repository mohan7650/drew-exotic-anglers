import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import FormField from '../../../components/admin/ui/FormField';
import ImageUpload from '../../../components/admin/ui/ImageUpload';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import { getTour, createTour, updateTour, slugify } from '../../../services/toursService';
import './TourFormPage.css';

// ── Form field definitions ─────────────────────────────────────────────────

const EMPTY = {
  title: '', slug: '', tag: '', meta: '',
  full_desc: '', gallery_desc: '',
  duration: '', departs: '', max_anglers: '', target_species: '',
  style: '', includes: '', booking_url: '', image_url: '',
};

function reducer(state, action) {
  if (action.type === 'SET_ALL')   return { ...action.payload };
  if (action.type === 'SET_FIELD') return { ...state, [action.field]: action.value };
  return state;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function TourFormPage() {
  const { id }    = useParams();          // undefined on /admin/tours/new
  const isEdit    = Boolean(id);
  const navigate  = useNavigate();

  const [fields,      dispatch]      = useReducer(reducer, EMPTY);
  const [imageFile,   setImageFile]  = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);

  const [loading,     setLoading]    = useState(isEdit);
  const [submitting,  setSubmitting] = useState(false);
  const [errors,      setErrors]     = useState({});
  const [saveError,   setSaveError]  = useState('');

  // ── Load existing tour in edit mode
  useEffect(() => {
    if (!isEdit) return;
    getTour(id)
      .then((tour) => {
        dispatch({ type: 'SET_ALL', payload: { ...EMPTY, ...tour } });
        setSlugTouched(true); // don't auto-overwrite existing slug
      })
      .catch((e) => setSaveError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  // ── Auto-generate slug from title (create mode only)
  function handleTitleChange(value) {
    dispatch({ type: 'SET_FIELD', field: 'title', value });
    if (!slugTouched) {
      dispatch({ type: 'SET_FIELD', field: 'slug', value: slugify(value) });
    }
  }

  function set(field) {
    return (e) => dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  }

  // ── Validation
  function validate() {
    const errs = {};
    if (!fields.title.trim())  errs.title = 'Title is required.';
    if (!fields.slug.trim())   errs.slug  = 'Slug is required.';
    if (!/^[a-z0-9-]+$/.test(fields.slug.trim())) {
      errs.slug = 'Slug may only contain lowercase letters, numbers, and hyphens.';
    }
    return errs;
  }

  // ── Submit
  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);

    const payload = {
      title:          fields.title.trim(),
      slug:           fields.slug.trim(),
      tag:            fields.tag.trim(),
      meta:           fields.meta.trim(),
      full_desc:      fields.full_desc.trim(),
      gallery_desc:   fields.gallery_desc.trim(),
      duration:       fields.duration.trim(),
      departs:        fields.departs.trim(),
      max_anglers:    fields.max_anglers.trim(),
      target_species: fields.target_species.trim(),
      style:          fields.style.trim(),
      includes:       fields.includes.trim(),
      booking_url:    fields.booking_url.trim(),
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

      <form onSubmit={handleSubmit} noValidate className="tfp-form">

        {/* ── Row: Image + Listing fields */}
        <div className="tfp-two-col">
          <div className="tfp-col">
            <ImageUpload
              currentUrl={fields.image_url}
              onChange={setImageFile}
              disabled={submitting}
            />
          </div>

          <div className="tfp-col tfp-col--fields">
            <FormField
              id="title"
              label="Title"
              required
              value={fields.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Amazon Peacock Bass Expedition"
              disabled={submitting}
              error={errors.title}
            />
            <FormField
              id="slug"
              label="URL Slug"
              required
              value={fields.slug}
              onChange={(e) => {
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
              placeholder="6 days • Peacock Bass • Urubaxi River"
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

        {/* ── Section: Trip logistics */}
        <fieldset className="tfp-section">
          <legend className="tfp-section-title">Trip Details</legend>
          <div className="tfp-grid-3">
            <FormField
              id="duration"
              label="Duration"
              value={fields.duration}
              onChange={set('duration')}
              placeholder="7 nights / 6 days fishing"
              disabled={submitting}
            />
            <FormField
              id="departs"
              label="Departs"
              value={fields.departs}
              onChange={set('departs')}
              placeholder="Manaus, Brazil"
              disabled={submitting}
            />
            <FormField
              id="max_anglers"
              label="Max Anglers"
              value={fields.max_anglers}
              onChange={set('max_anglers')}
              placeholder="6"
              disabled={submitting}
            />
            <FormField
              id="target_species"
              label="Target Species"
              value={fields.target_species}
              onChange={set('target_species')}
              placeholder="Peacock Bass, Arapaima, Payara"
              disabled={submitting}
            />
            <FormField
              id="style"
              label="Style"
              value={fields.style}
              onChange={set('style')}
              placeholder="Fly & Conventional"
              disabled={submitting}
            />
            <FormField
              id="includes"
              label="Includes"
              value={fields.includes}
              onChange={set('includes')}
              placeholder="Accommodation, meals, guides…"
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
    </div>
  );
}
