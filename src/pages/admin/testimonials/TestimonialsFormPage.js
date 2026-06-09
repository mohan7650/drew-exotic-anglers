import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import FormField from '../../../components/admin/ui/FormField';
import ImageUpload from '../../../components/admin/ui/ImageUpload';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import {
  getTestimonial,
  createTestimonial,
  updateTestimonial,
} from '../../../services/testimonialsService';
import './TestimonialsFormPage.css';

// ── Form state ─────────────────────────────────────────────────────────────

const EMPTY = {
  name:      '',
  location:  '',
  review:    '',
  image_url: '',
  rating:    5,
  featured:  false,
  active:    true,
};

function reducer(state, action) {
  if (action.type === 'SET_ALL')   return { ...action.payload };
  if (action.type === 'SET_FIELD') return { ...state, [action.field]: action.value };
  return state;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function TestimonialsFormPage() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();

  const [fields,    dispatch]    = useReducer(reducer, EMPTY);
  const [imageFile, setImageFile] = useState(null);

  const [loading,    setLoading]    = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});
  const [saveError,  setSaveError]  = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getTestimonial(id)
      .then(data => dispatch({ type: 'SET_ALL', payload: { ...EMPTY, ...data } }))
      .catch(e => setSaveError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(field) {
    return e => dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  }

  function toggle(field) {
    dispatch({ type: 'SET_FIELD', field, value: !fields[field] });
  }

  function validate() {
    const errs = {};
    if (!fields.name.trim())   errs.name   = 'Name is required.';
    if (!fields.review.trim()) errs.review = 'Review text is required.';
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
      name:     fields.name.trim(),
      location: fields.location.trim(),
      review:   fields.review.trim(),
      rating:   Number(fields.rating) || 5,
      featured: Boolean(fields.featured),
      active:   Boolean(fields.active),
    };

    try {
      if (isEdit) {
        await updateTestimonial(id, payload, imageFile, fields.image_url);
      } else {
        await createTestimonial(payload, imageFile);
      }
      navigate('/admin/testimonials');
    } catch (err) {
      setSaveError(err.message);
      setSubmitting(false);
    }
  }

  if (loading) return <AdminSpinner />;

  return (
    <div className="tfm-page">
      <AdminPageHeader
        title={isEdit ? 'Edit Testimonial' : 'New Testimonial'}
        subtitle={isEdit ? `Editing: ${fields.name}` : 'Add a customer review'}
        backTo="/admin/testimonials"
      />

      {saveError && (
        <div className="tfm-error" role="alert">
          <span>⚠</span> {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="tfm-form">

        {/* Photo + Customer info */}
        <div className="tfm-two-col">
          <div className="tfm-col">
            <ImageUpload
              currentUrl={fields.image_url}
              onChange={setImageFile}
              disabled={submitting}
              label="Customer Photo"
            />
          </div>

          <div className="tfm-col tfm-col--fields">
            <FormField
              id="name"
              label="Customer Name"
              required
              value={fields.name}
              onChange={set('name')}
              placeholder="John Smith"
              disabled={submitting}
              error={errors.name}
            />
            <FormField
              id="location"
              label="Location"
              value={fields.location}
              onChange={set('location')}
              placeholder="Florida, USA"
              disabled={submitting}
            />
            <FormField
              id="review"
              label="Review"
              as="textarea"
              rows={6}
              required
              value={fields.review}
              onChange={set('review')}
              placeholder="Best fishing trip of my life…"
              disabled={submitting}
              error={errors.review}
            />
          </div>
        </div>

        {/* Rating + Flags */}
        <fieldset className="tfm-section">
          <legend className="tfm-section-title">Rating &amp; Visibility</legend>
          <div className="tfm-grid-3">

            {/* Stars */}
            <div className="tfm-field-group">
              <label className="tfm-label" htmlFor="rating">Star Rating</label>
              <select
                id="rating"
                className="tfm-select"
                value={fields.rating}
                onChange={set('rating')}
                disabled={submitting}
              >
                {[5, 4, 3, 2, 1].map(n => (
                  <option key={n} value={n}>
                    {'★'.repeat(n)}{'☆'.repeat(5 - n)}  ({n}/5)
                  </option>
                ))}
              </select>
              <span className="tfm-star-preview">
                {'★'.repeat(Math.min(5, Number(fields.rating) || 5))}
              </span>
            </div>

            {/* Featured */}
            <div className="tfm-field-group">
              <label className="tfm-label">Featured</label>
              <button
                type="button"
                className={`tfm-toggle${fields.featured ? ' tfm-toggle--on' : ''}`}
                onClick={() => toggle('featured')}
                disabled={submitting}
                aria-pressed={fields.featured}
              >
                <span className="tfm-toggle-track">
                  <span className="tfm-toggle-thumb" />
                </span>
                <span className="tfm-toggle-label">
                  {fields.featured ? '★ Featured review' : '☆ Not featured'}
                </span>
              </button>
              <p className="tfm-field-hint">Featured reviews may be highlighted on the site.</p>
            </div>

            {/* Active */}
            <div className="tfm-field-group">
              <label className="tfm-label">Visibility</label>
              <button
                type="button"
                className={`tfm-toggle${fields.active ? ' tfm-toggle--on tfm-toggle--green' : ''}`}
                onClick={() => toggle('active')}
                disabled={submitting}
                aria-pressed={fields.active}
              >
                <span className="tfm-toggle-track">
                  <span className="tfm-toggle-thumb" />
                </span>
                <span className="tfm-toggle-label">
                  {fields.active ? 'Live on site' : 'Hidden from site'}
                </span>
              </button>
              <p className="tfm-field-hint">Only active reviews appear on the public website.</p>
            </div>

          </div>
        </fieldset>

        {/* Actions */}
        <div className="tfm-actions">
          <button
            type="button"
            className="tfm-btn-cancel"
            onClick={() => navigate('/admin/testimonials')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="tfm-btn-save" disabled={submitting}>
            {submitting ? (
              <><span className="tfm-spinner" aria-hidden="true" /> Saving…</>
            ) : (
              isEdit ? 'Save Changes' : 'Create Testimonial'
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
