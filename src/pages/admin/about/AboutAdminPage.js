import React, { useEffect, useReducer, useState } from 'react';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import FormField from '../../../components/admin/ui/FormField';
import ImageUpload from '../../../components/admin/ui/ImageUpload';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import FeaturesEditor from './FeaturesEditor';
import { getAbout, updateAbout, getFeatures } from '../../../services/aboutService';
import '../hero/HeroAdminPage.css';
import './AboutAdminPage.css';

// ── Form state ─────────────────────────────────────────────────────────────

const EMPTY = {
  id:           null,
  eyebrow:      '',
  title:        '',
  description:  '',
  image_url:    '',
  cta_text:     '',
  cta_link:     '',
  badge_number: '',
  badge_text:   '',
  orvis_number: '',
  orvis_text:   '',
};

function reducer(state, action) {
  if (action.type === 'SET_ALL')   return { ...action.payload };
  if (action.type === 'SET_FIELD') return { ...state, [action.field]: action.value };
  return state;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function AboutAdminPage() {
  const [fields,          dispatch]        = useReducer(reducer, EMPTY);
  const [imageFile,       setImageFile]    = useState(null);
  const [initialFeatures, setInitialFeatures] = useState([]);

  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError,  setLoadError]  = useState('');
  const [saveError,  setSaveError]  = useState('');
  const [saved,      setSaved]      = useState(false);

  useEffect(() => {
    Promise.all([getAbout(), getFeatures()])
      .then(([about, features]) => {
        dispatch({ type: 'SET_ALL', payload: { ...EMPTY, ...about } });
        setInitialFeatures(features);
      })
      .catch(e => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function set(field) {
    return e => dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError('');
    setSaved(false);
    setSubmitting(true);
    try {
      const updated = await updateAbout(fields.id, fields, imageFile, fields.image_url);
      dispatch({ type: 'SET_ALL', payload: { ...EMPTY, ...updated } });
      setImageFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render: loading / error
  if (loading) return <AdminSpinner />;

  if (loadError) {
    return (
      <div className="aap-page">
        <AdminPageHeader title="About Section" subtitle="Edit the about section content" />
        <div className="hap-banner hap-banner--error" role="alert">
          <span>⚠</span> Failed to load: {loadError}
        </div>
      </div>
    );
  }

  // ── Render: full page
  return (
    <div className="aap-page">
      <AdminPageHeader
        title="About Section"
        subtitle="Edit the captain profile, credentials, and feature list"
      />

      {/* ━━ Section 1: About Content ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="hap-section-group">
        <h2 className="hap-section-group-title">About Content</h2>

        {saveError && (
          <div className="hap-banner hap-banner--error" role="alert">
            <span>⚠</span> {saveError}
          </div>
        )}
        {saved && (
          <div className="hap-banner hap-banner--success" role="status">
            <span>✓</span> About section saved — changes are live.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="hap-form">

          {/* Image + Copy */}
          <div className="hap-two-col">
            <div className="hap-col">
              <ImageUpload
                currentUrl={fields.image_url}
                onChange={setImageFile}
                disabled={submitting}
                label="Captain Photo"
              />
            </div>

            <div className="hap-col hap-col--fields">
              <fieldset className="hap-section">
                <legend className="hap-section-title">Section Copy</legend>
                <div className="hap-stack">
                  <FormField
                    id="eyebrow"
                    label="Eyebrow Text"
                    value={fields.eyebrow}
                    onChange={set('eyebrow')}
                    placeholder="About Your Captain"
                    disabled={submitting}
                  />
                  <FormField
                    id="title"
                    label="Title"
                    as="textarea"
                    rows={2}
                    value={fields.title}
                    onChange={set('title')}
                    placeholder="Meet <em>Capt Drew</em>"
                    disabled={submitting}
                    hint="HTML rendered — use <em> for italics."
                  />
                  <FormField
                    id="description"
                    label="Description"
                    as="textarea"
                    rows={5}
                    value={fields.description}
                    onChange={set('description')}
                    placeholder="<p>Drew has spent…</p>"
                    disabled={submitting}
                    hint="HTML rendered — use <p> tags for paragraphs."
                  />
                </div>
              </fieldset>
            </div>
          </div>

          {/* Badges */}
          <fieldset className="hap-section">
            <legend className="hap-section-title">Image Badges</legend>
            <div className="hap-grid-2">
              <FormField
                id="badge_number"
                label="Badge — Number / Value"
                value={fields.badge_number}
                onChange={set('badge_number')}
                placeholder="20+"
                disabled={submitting}
              />
              <FormField
                id="badge_text"
                label="Badge — Label"
                value={fields.badge_text}
                onChange={set('badge_text')}
                placeholder="Years Experience"
                disabled={submitting}
              />
              <FormField
                id="orvis_number"
                label="Orvis Badge — Number / Value"
                value={fields.orvis_number}
                onChange={set('orvis_number')}
                placeholder="10"
                disabled={submitting}
              />
              <FormField
                id="orvis_text"
                label="Orvis Badge — Label"
                value={fields.orvis_text}
                onChange={set('orvis_text')}
                placeholder="Years Orvis<br/>Endorsed"
                disabled={submitting}
                hint="HTML rendered — use <br/> for line breaks."
              />
            </div>
          </fieldset>

          {/* CTA */}
          <fieldset className="hap-section">
            <legend className="hap-section-title">Call to Action</legend>
            <div className="hap-grid-2">
              <FormField
                id="cta_text"
                label="Button Text"
                value={fields.cta_text}
                onChange={set('cta_text')}
                placeholder="Book Your Expedition"
                disabled={submitting}
              />
              <FormField
                id="cta_link"
                label="Button Link"
                value={fields.cta_link}
                onChange={set('cta_link')}
                placeholder="https://… or #section"
                disabled={submitting}
              />
            </div>
          </fieldset>

          <div className="hap-actions">
            <button type="submit" className="hap-btn-save" disabled={submitting}>
              {submitting ? (
                <><span className="hap-spinner" aria-hidden="true" /> Saving…</>
              ) : (
                'Save About'
              )}
            </button>
          </div>

        </form>
      </div>

      {/* ━━ Section 2: Features List ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="hap-section-group">
        <h2 className="hap-section-group-title">Feature List</h2>
        <p className="hap-section-group-sub">
          The bullet points shown below the about description. Toggle the dot to show/hide.
          The public section renders active items in the order shown here.
        </p>
        <FeaturesEditor initialItems={initialFeatures} />
      </div>

    </div>
  );
}
