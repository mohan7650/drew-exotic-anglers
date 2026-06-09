import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import FormField from '../../../components/admin/ui/FormField';
import ImageUpload from '../../../components/admin/ui/ImageUpload';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import { getSpecies, createSpecies, updateSpecies } from '../../../services/speciesService';
import './SpeciesFormPage.css';

// ── Form state ─────────────────────────────────────────────────────────────

const EMPTY = {
  name:        '',
  latin_name:  '',
  description: '',
  image_url:   '',
  stars:       3,
  difficulty:  '',
  active:      true,
};

function reducer(state, action) {
  if (action.type === 'SET_ALL')   return { ...action.payload };
  if (action.type === 'SET_FIELD') return { ...state, [action.field]: action.value };
  return state;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function SpeciesFormPage() {
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
    getSpecies(id)
      .then(data => dispatch({ type: 'SET_ALL', payload: { ...EMPTY, ...data } }))
      .catch(e => setSaveError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(field) {
    return e => dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  }

  function validate() {
    const errs = {};
    if (!fields.name.trim()) errs.name = 'Name is required.';
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
      name:        fields.name.trim(),
      latin_name:  fields.latin_name.trim(),
      description: fields.description.trim(),
      stars:       Number(fields.stars) || 0,
      difficulty:  fields.difficulty.trim(),
      active:      Boolean(fields.active),
    };

    try {
      if (isEdit) {
        await updateSpecies(id, payload, imageFile, fields.image_url);
      } else {
        await createSpecies(payload, imageFile);
      }
      navigate('/admin/species');
    } catch (err) {
      setSaveError(err.message);
      setSubmitting(false);
    }
  }

  if (loading) return <AdminSpinner />;

  return (
    <div className="sfp-page">
      <AdminPageHeader
        title={isEdit ? 'Edit Species' : 'New Species'}
        subtitle={isEdit ? `Editing: ${fields.name}` : 'Add a new target species'}
        backTo="/admin/species"
      />

      {saveError && (
        <div className="sfp-error" role="alert">
          <span>⚠</span> {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="sfp-form">

        {/* Image + Core fields */}
        <div className="sfp-two-col">
          <div className="sfp-col">
            <ImageUpload
              currentUrl={fields.image_url}
              onChange={setImageFile}
              disabled={submitting}
              label="Species Photo"
            />
          </div>

          <div className="sfp-col sfp-col--fields">
            <FormField
              id="name"
              label="Common Name"
              required
              value={fields.name}
              onChange={set('name')}
              placeholder="Peacock Bass"
              disabled={submitting}
              error={errors.name}
            />
            <FormField
              id="latin_name"
              label="Latin Name"
              value={fields.latin_name}
              onChange={set('latin_name')}
              placeholder="Cichla temensis"
              disabled={submitting}
            />
            <FormField
              id="description"
              label="Description"
              as="textarea"
              rows={5}
              value={fields.description}
              onChange={set('description')}
              placeholder="The apex predator of the Amazon…"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Rating + Visibility */}
        <fieldset className="sfp-section">
          <legend className="sfp-section-title">Rating &amp; Visibility</legend>
          <div className="sfp-grid-3">

            <div className="sfp-field-group">
              <label className="sfp-label" htmlFor="stars">Stars (1–5)</label>
              <select
                id="stars"
                className="sfp-select"
                value={fields.stars}
                onChange={set('stars')}
                disabled={submitting}
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>
                    {'★'.repeat(n)}{'☆'.repeat(5 - n)}  ({n})
                  </option>
                ))}
              </select>
            </div>

            <FormField
              id="difficulty"
              label="Difficulty"
              value={fields.difficulty}
              onChange={set('difficulty')}
              placeholder="Intermediate"
              disabled={submitting}
            />

            <div className="sfp-field-group">
              <label className="sfp-label">Visibility</label>
              <button
                type="button"
                className={`sfp-toggle${fields.active ? ' sfp-toggle--on' : ''}`}
                onClick={() => dispatch({ type: 'SET_FIELD', field: 'active', value: !fields.active })}
                disabled={submitting}
                aria-pressed={fields.active}
              >
                <span className="sfp-toggle-track">
                  <span className="sfp-toggle-thumb" />
                </span>
                <span className="sfp-toggle-label">
                  {fields.active ? 'Live on site' : 'Hidden from site'}
                </span>
              </button>
            </div>

          </div>
        </fieldset>

        {/* Actions */}
        <div className="sfp-actions">
          <button
            type="button"
            className="sfp-btn-cancel"
            onClick={() => navigate('/admin/species')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="sfp-btn-save" disabled={submitting}>
            {submitting ? (
              <><span className="sfp-spinner" aria-hidden="true" /> Saving…</>
            ) : (
              isEdit ? 'Save Changes' : 'Create Species'
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
