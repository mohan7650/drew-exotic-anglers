import React, { useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import FormField from '../../../components/admin/ui/FormField';
import ImageUpload from '../../../components/admin/ui/ImageUpload';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import {
  getFloridaDayTrip,
  createFloridaDayTrip,
  updateFloridaDayTrip,
} from '../../../services/floridaDayTripsService';
import './FloridaDayTripsFormPage.css';

// Scalar fields only — species/includes/pricing are separate arrays
const EMPTY = {
  eyebrow: '', title: '', subtitle: '', description: '',
  main_image: '',
  cta_text: '', cta_link: '',
  availability_title: '',
  active: true,
  sort_order: 1,
};

function reducer(state, action) {
  if (action.type === 'SET_ALL')   return { ...action.payload };
  if (action.type === 'SET_FIELD') return { ...state, [action.field]: action.value };
  return state;
}

function moveItem(arr, index, dir) {
  const next = [...arr];
  const swap = index + dir;
  if (swap < 0 || swap >= next.length) return arr;
  [next[index], next[swap]] = [next[swap], next[index]];
  return next;
}

export default function FloridaDayTripsFormPage() {
  const { id }   = useParams();
  const isEdit   = Boolean(id);
  const navigate = useNavigate();

  const [fields,       dispatch]       = useReducer(reducer, EMPTY);
  const [speciesList,  setSpeciesList]  = useState(['']);
  const [includesList, setIncludesList] = useState(['']);
  const [pricingList,  setPricingList]  = useState([{ label: '', price: '' }]);
  const [imageFile,    setImageFile]    = useState(null);
  const [loading,      setLoading]      = useState(isEdit);
  const [submitting,   setSubmitting]   = useState(false);
  const [errors,       setErrors]       = useState({});
  const [saveError,    setSaveError]    = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getFloridaDayTrip(id)
      .then(data => {
        dispatch({ type: 'SET_ALL', payload: { ...EMPTY, ...data } });
        setSpeciesList(
          Array.isArray(data.species)  && data.species.length  ? data.species  : ['']
        );
        setIncludesList(
          Array.isArray(data.includes) && data.includes.length ? data.includes : ['']
        );
        setPricingList(
          Array.isArray(data.pricing)  && data.pricing.length
            ? data.pricing
            : [{ label: '', price: '' }]
        );
      })
      .catch(e => setSaveError(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function set(field) {
    return e => dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  }
  function setCheck(field) {
    return e => dispatch({ type: 'SET_FIELD', field, value: e.target.checked });
  }

  // ── Species
  function updateSpecies(i, val) { setSpeciesList(a => a.map((s, j) => j === i ? val : s)); }
  function removeSpecies(i)      { setSpeciesList(a => a.filter((_, j) => j !== i)); }
  function addSpecies()          { setSpeciesList(a => [...a, '']); }
  function moveSpecies(i, dir)   { setSpeciesList(a => moveItem(a, i, dir)); }

  // ── Includes
  function updateInclude(i, val) { setIncludesList(a => a.map((s, j) => j === i ? val : s)); }
  function removeInclude(i)      { setIncludesList(a => a.filter((_, j) => j !== i)); }
  function addInclude()          { setIncludesList(a => [...a, '']); }
  function moveInclude(i, dir)   { setIncludesList(a => moveItem(a, i, dir)); }

  // ── Pricing
  function updatePricing(i, key, val) {
    setPricingList(a => a.map((p, j) => j === i ? { ...p, [key]: val } : p));
  }
  function removePricing(i)    { setPricingList(a => a.filter((_, j) => j !== i)); }
  function addPricing()        { setPricingList(a => [...a, { label: '', price: '' }]); }
  function movePricing(i, dir) { setPricingList(a => moveItem(a, i, dir)); }

  function validate() {
    const errs = {};
    if (!fields.title.trim()) errs.title = 'Title is required.';
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
      eyebrow:            fields.eyebrow.trim(),
      title:              fields.title.trim(),
      subtitle:           fields.subtitle.trim(),
      description:        fields.description.trim(),
      species:            speciesList.map(s => s.trim()).filter(Boolean),
      includes:           includesList.map(s => s.trim()).filter(Boolean),
      pricing:            pricingList
                            .filter(p => p.label.trim() || p.price.trim())
                            .map(p => ({ label: p.label.trim(), price: p.price.trim() })),
      cta_text:           fields.cta_text.trim(),
      cta_link:           fields.cta_link.trim(),
      availability_title: fields.availability_title.trim(),
      active:             fields.active,
      sort_order:         Number(fields.sort_order) || 1,
    };

    try {
      if (isEdit) {
        await updateFloridaDayTrip(id, payload, imageFile, fields.main_image);
      } else {
        await createFloridaDayTrip(payload, imageFile);
      }
      navigate('/admin/florida-day-trips');
    } catch (e) {
      setSaveError(e.message);
      setSubmitting(false);
    }
  }

  if (loading) return <AdminSpinner />;

  return (
    <div className="fdf-page">
      <AdminPageHeader
        title={isEdit ? 'Edit Florida Day Trip' : 'New Florida Day Trip'}
        subtitle={isEdit ? `Editing: ${fields.title}` : 'Add a new record'}
        backTo="/admin/florida-day-trips"
      />

      {saveError && (
        <div className="fdf-save-error" role="alert">
          <span>⚠</span> {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="fdf-form">

        {/* ── Image + Header */}
        <div className="fdf-two-col">
          <div className="fdf-col">
            <ImageUpload
              currentUrl={fields.main_image}
              onChange={setImageFile}
              disabled={submitting}
            />
          </div>
          <div className="fdf-col fdf-col--fields">
            <FormField
              id="eyebrow"
              label="Eyebrow Tag"
              value={fields.eyebrow}
              onChange={set('eyebrow')}
              placeholder="Tier 1 · Florida Day Trips"
              disabled={submitting}
            />
            <FormField
              id="title"
              label="Title"
              required
              value={fields.title}
              onChange={set('title')}
              placeholder="Fish South Florida with Capt Drew."
              disabled={submitting}
              error={errors.title}
            />
            <FormField
              id="subtitle"
              label="Subtitle"
              value={fields.subtitle}
              onChange={set('subtitle')}
              placeholder="Full-day freshwater trips on Miami's canals…"
              disabled={submitting}
            />
          </div>
        </div>

        {/* ── Description */}
        <fieldset className="fdf-section">
          <legend className="fdf-section-title">Who It's For</legend>
          <FormField
            id="description"
            label="Description"
            as="textarea"
            rows={3}
            value={fields.description}
            onChange={set('description')}
            placeholder="All skill levels welcome — first-time anglers, families, and seasoned pros…"
            disabled={submitting}
          />
        </fieldset>

        {/* ── Species — dynamic repeater */}
        <fieldset className="fdf-section">
          <legend className="fdf-section-title">Target Species</legend>
          <div className="fdf-stack">
            {speciesList.map((s, i) => (
              <div key={i} className="fdf-rep-row">
                <div className="fdf-rep-field">
                  <FormField
                    id={`species_${i}`}
                    label={`Species ${i + 1}`}
                    value={s}
                    onChange={e => updateSpecies(i, e.target.value)}
                    placeholder={
                      ['Peacock Bass', 'Largemouth', 'Native', 'Exotics'][i] ?? 'Species name'
                    }
                    disabled={submitting}
                  />
                </div>
                <div className="fdf-rep-controls">
                  <button
                    type="button" className="fdf-rep-btn fdf-rep-btn--move"
                    onClick={() => moveSpecies(i, -1)}
                    disabled={i === 0 || submitting}
                    aria-label="Move up"
                  >▲</button>
                  <button
                    type="button" className="fdf-rep-btn fdf-rep-btn--move"
                    onClick={() => moveSpecies(i, 1)}
                    disabled={i === speciesList.length - 1 || submitting}
                    aria-label="Move down"
                  >▼</button>
                  <button
                    type="button" className="fdf-rep-btn fdf-rep-btn--remove"
                    onClick={() => removeSpecies(i)}
                    disabled={speciesList.length <= 1 || submitting}
                    aria-label="Remove"
                  >✕</button>
                </div>
              </div>
            ))}
            <button type="button" className="fdf-rep-add" onClick={addSpecies} disabled={submitting}>
              + Add Species
            </button>
          </div>
        </fieldset>

        {/* ── What's Included — dynamic repeater */}
        <fieldset className="fdf-section">
          <legend className="fdf-section-title">What's Included</legend>
          <div className="fdf-stack">
            {includesList.map((item, i) => (
              <div key={i} className="fdf-rep-row">
                <div className="fdf-rep-field">
                  <FormField
                    id={`include_${i}`}
                    label={`Item ${i + 1}`}
                    value={item}
                    onChange={e => updateInclude(i, e.target.value)}
                    placeholder={[
                      '8-hour full day on Miami canals',
                      'Capt Drew personally guiding',
                      'All tackle and bait provided',
                      'Bottled water and ice',
                      'Catch photography',
                      'Lunch Provided',
                    ][i] ?? "What's included…"}
                    disabled={submitting}
                  />
                </div>
                <div className="fdf-rep-controls">
                  <button
                    type="button" className="fdf-rep-btn fdf-rep-btn--move"
                    onClick={() => moveInclude(i, -1)}
                    disabled={i === 0 || submitting}
                    aria-label="Move up"
                  >▲</button>
                  <button
                    type="button" className="fdf-rep-btn fdf-rep-btn--move"
                    onClick={() => moveInclude(i, 1)}
                    disabled={i === includesList.length - 1 || submitting}
                    aria-label="Move down"
                  >▼</button>
                  <button
                    type="button" className="fdf-rep-btn fdf-rep-btn--remove"
                    onClick={() => removeInclude(i)}
                    disabled={includesList.length <= 1 || submitting}
                    aria-label="Remove"
                  >✕</button>
                </div>
              </div>
            ))}
            <button type="button" className="fdf-rep-add" onClick={addInclude} disabled={submitting}>
              + Add Item
            </button>
          </div>
        </fieldset>

        {/* ── Pricing — dynamic repeater */}
        <fieldset className="fdf-section">
          <legend className="fdf-section-title">Pricing</legend>
          <div className="fdf-stack">
            {pricingList.map((p, i) => (
              <div key={i} className="fdf-rep-row">
                <div className="fdf-rep-pricing">
                  <div className="fdf-rep-pricing-label">
                    <FormField
                      id={`pricing_label_${i}`}
                      label={`Tier ${i + 1} Label`}
                      value={p.label}
                      onChange={e => updatePricing(i, 'label', e.target.value)}
                      placeholder={
                        ['Solo Angler', '2 Anglers', '3–4 Anglers'][i] ?? 'Tier label'
                      }
                      disabled={submitting}
                    />
                  </div>
                  <div className="fdf-rep-pricing-price">
                    <FormField
                      id={`pricing_price_${i}`}
                      label="Price"
                      value={p.price}
                      onChange={e => updatePricing(i, 'price', e.target.value)}
                      placeholder={['$450', '$550', '$650'][i] ?? '$0'}
                      disabled={submitting}
                    />
                  </div>
                </div>
                <div className="fdf-rep-controls">
                  <button
                    type="button" className="fdf-rep-btn fdf-rep-btn--move"
                    onClick={() => movePricing(i, -1)}
                    disabled={i === 0 || submitting}
                    aria-label="Move up"
                  >▲</button>
                  <button
                    type="button" className="fdf-rep-btn fdf-rep-btn--move"
                    onClick={() => movePricing(i, 1)}
                    disabled={i === pricingList.length - 1 || submitting}
                    aria-label="Move down"
                  >▼</button>
                  <button
                    type="button" className="fdf-rep-btn fdf-rep-btn--remove"
                    onClick={() => removePricing(i)}
                    disabled={pricingList.length <= 1 || submitting}
                    aria-label="Remove"
                  >✕</button>
                </div>
              </div>
            ))}
            <button type="button" className="fdf-rep-add" onClick={addPricing} disabled={submitting}>
              + Add Pricing Row
            </button>
          </div>
        </fieldset>

        {/* ── CTA & Availability */}
        <fieldset className="fdf-section">
          <legend className="fdf-section-title">CTA &amp; Availability</legend>
          <div className="fdf-grid-2">
            <FormField
              id="cta_text"
              label="CTA Button Text"
              value={fields.cta_text}
              onChange={set('cta_text')}
              placeholder="Check Availability →"
              disabled={submitting}
            />
            <FormField
              id="cta_link"
              label="CTA Link"
              value={fields.cta_link}
              onChange={set('cta_link')}
              placeholder="#contact"
              disabled={submitting}
            />
          </div>
          <div className="fdf-mt">
            <FormField
              id="availability_title"
              label="Availability Section Title"
              value={fields.availability_title}
              onChange={set('availability_title')}
              placeholder="⚡ Live Expedition Availability"
              disabled={submitting}
            />
          </div>
        </fieldset>

        {/* ── Settings */}
        <fieldset className="fdf-section">
          <legend className="fdf-section-title">Settings</legend>
          <div className="fdf-grid-2">
            <FormField
              id="sort_order"
              label="Sort Order"
              type="number"
              value={String(fields.sort_order)}
              onChange={set('sort_order')}
              placeholder="1"
              disabled={submitting}
            />
            <div className="fdf-checkbox-wrap">
              <label className="fdf-checkbox-label" htmlFor="active">
                <input
                  id="active"
                  type="checkbox"
                  className="fdf-checkbox"
                  checked={!!fields.active}
                  onChange={setCheck('active')}
                  disabled={submitting}
                />
                Active (visible on site)
              </label>
            </div>
          </div>
        </fieldset>

        {/* ── Actions */}
        <div className="fdf-actions">
          <button
            type="button"
            className="fdf-btn-cancel"
            onClick={() => navigate('/admin/florida-day-trips')}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="fdf-btn-save" disabled={submitting}>
            {submitting ? (
              <><span className="fdf-spinner" aria-hidden="true" /> Saving…</>
            ) : (
              isEdit ? 'Save Changes' : 'Create Record'
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
