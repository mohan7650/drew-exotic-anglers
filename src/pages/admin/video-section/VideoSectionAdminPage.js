import React, { useEffect, useReducer, useState } from 'react';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import FormField from '../../../components/admin/ui/FormField';
import ImageUpload from '../../../components/admin/ui/ImageUpload';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import { getVideoSectionRecord, saveVideoSection } from '../../../services/videoSectionService';
import '../hero/HeroAdminPage.css';
import './VideoSectionAdminPage.css';

const EMPTY = {
  id:           null,
  eyebrow:      '',
  title:        '',
  subtitle:     '',
  description:  '',
  video_url:    '',
  poster_image: '',
  cta_text:     '',
  cta_link:     '',
  active:       true,
};

function reducer(state, action) {
  if (action.type === 'SET_ALL')   return { ...action.payload };
  if (action.type === 'SET_FIELD') return { ...state, [action.field]: action.value };
  return state;
}

export default function VideoSectionAdminPage() {
  const [fields,    dispatch]     = useReducer(reducer, EMPTY);
  const [imageFile, setImageFile] = useState(null);

  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError,  setLoadError]  = useState('');
  const [saveError,  setSaveError]  = useState('');
  const [saved,      setSaved]      = useState(false);

  useEffect(() => {
    getVideoSectionRecord()
      .then(data => {
        if (data) dispatch({ type: 'SET_ALL', payload: { ...EMPTY, ...data } });
      })
      .catch(e => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function set(field) {
    return e => dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  }
  function setCheck(field) {
    return e => dispatch({ type: 'SET_FIELD', field, value: e.target.checked });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError('');
    setSaved(false);
    setSubmitting(true);
    try {
      const updated = await saveVideoSection(
        fields.id,
        fields,
        imageFile,
        fields.poster_image
      );
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

  if (loading) return <AdminSpinner />;

  if (loadError) {
    return (
      <div className="vsp-page">
        <AdminPageHeader title="Video Section" subtitle="Edit video content and founder card" />
        <div className="hap-banner hap-banner--error" role="alert">
          <span>⚠</span> Failed to load: {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="vsp-page">
      <AdminPageHeader
        title="Video Section"
        subtitle="Edit the video header, YouTube embed, and founder quote"
      />

      {saveError && (
        <div className="hap-banner hap-banner--error" role="alert">
          <span>⚠</span> {saveError}
        </div>
      )}
      {saved && (
        <div className="hap-banner hap-banner--success" role="status">
          <span>✓</span> Video section saved — changes are live.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="hap-form">

        {/* ── Poster image + Header copy */}
        <div className="hap-two-col">
          <div className="hap-col">
            <ImageUpload
              currentUrl={fields.poster_image}
              onChange={setImageFile}
              disabled={submitting}
              label="Poster / Thumbnail"
            />
          </div>

          <div className="hap-col hap-col--fields">
            <fieldset className="hap-section">
              <legend className="hap-section-title">Video Header</legend>
              <div className="hap-stack">
                <FormField
                  id="eyebrow"
                  label="Eyebrow Tag"
                  value={fields.eyebrow}
                  onChange={set('eyebrow')}
                  placeholder="Watch the Action"
                  disabled={submitting}
                />
                <FormField
                  id="title"
                  label="Title"
                  value={fields.title}
                  onChange={set('title')}
                  placeholder="See the <em>Urubaxi</em> in Action"
                  disabled={submitting}
                  hint="HTML rendered — wrap words in <em> for italics."
                />
                <FormField
                  id="subtitle"
                  label="Subtitle"
                  as="textarea"
                  rows={2}
                  value={fields.subtitle}
                  onChange={set('subtitle')}
                  placeholder="Real footage. Real fish. Real clients…"
                  disabled={submitting}
                />
              </div>
            </fieldset>
          </div>
        </div>

        {/* ── Video embed */}
        <fieldset className="hap-section">
          <legend className="hap-section-title">YouTube Embed</legend>
          <FormField
            id="video_url"
            label="YouTube Embed URL"
            value={fields.video_url}
            onChange={set('video_url')}
            placeholder="https://www.youtube.com/embed/_ycYRB8875A"
            disabled={submitting}
            hint="Use the /embed/ URL format from YouTube's share → embed option."
          />
        </fieldset>

        {/* ── Founder quote */}
        <fieldset className="hap-section">
          <legend className="hap-section-title">Founder Quote</legend>
          <FormField
            id="description"
            label="Quote Text"
            as="textarea"
            rows={4}
            value={fields.description}
            onChange={set('description')}
            placeholder='"This trip is the best guarantee for double-digit Peacock Bass at the best price in the world."'
            disabled={submitting}
            hint="Displayed as the blockquote in the founder card. Include surrounding quotes if desired."
          />
        </fieldset>

        {/* ── CTA */}
        <fieldset className="hap-section">
          <legend className="hap-section-title">Call to Action</legend>
          <div className="hap-grid-2">
            <FormField
              id="cta_text"
              label="Button Text"
              value={fields.cta_text}
              onChange={set('cta_text')}
              placeholder="Plan My Expedition →"
              disabled={submitting}
            />
            <FormField
              id="cta_link"
              label="Button Link"
              value={fields.cta_link}
              onChange={set('cta_link')}
              placeholder="#contact"
              disabled={submitting}
            />
          </div>
        </fieldset>

        {/* ── Settings */}
        <fieldset className="hap-section">
          <legend className="hap-section-title">Settings</legend>
          <label className="vsp-checkbox-label" htmlFor="active">
            <input
              id="active"
              type="checkbox"
              className="vsp-checkbox"
              checked={!!fields.active}
              onChange={setCheck('active')}
              disabled={submitting}
            />
            Active — use this record's content on the public site
          </label>
        </fieldset>

        {/* ── Save */}
        <div className="hap-actions">
          <button type="submit" className="hap-btn-save" disabled={submitting}>
            {submitting ? (
              <><span className="hap-spinner" aria-hidden="true" /> Saving…</>
            ) : (
              fields.id ? 'Save Changes' : 'Create Record'
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
