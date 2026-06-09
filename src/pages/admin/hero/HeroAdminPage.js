import React, { useEffect, useReducer, useRef, useState } from 'react';
import AdminPageHeader from '../../../components/admin/ui/AdminPageHeader';
import FormField from '../../../components/admin/ui/FormField';
import ImageUpload from '../../../components/admin/ui/ImageUpload';
import AdminSpinner from '../../../components/admin/AdminSpinner';
import StatsEditor from './StatsEditor';
import PartnersEditor from './PartnersEditor';
import { getHero, updateHero, getStats, getPartners } from '../../../services/heroService';
import './HeroAdminPage.css';

// ── Form state ─────────────────────────────────────────────────────────────

const EMPTY = {
  id:                 null,
  eyebrow:            '',
  title:              '',
  subtitle:           '',
  background_video:   '',
  poster_image:       '',
  primary_cta_text:   '',
  primary_cta_link:   '',
  secondary_cta_text: '',
  secondary_cta_link: '',
};

function reducer(state, action) {
  if (action.type === 'SET_ALL')   return { ...action.payload };
  if (action.type === 'SET_FIELD') return { ...state, [action.field]: action.value };
  return state;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function HeroAdminPage() {
  const [fields,     dispatch]     = useReducer(reducer, EMPTY);
  const [posterFile, setPosterFile] = useState(null);
  const [videoFile,  setVideoFile]  = useState(null);
  const videoInputRef               = useRef(null);

  const [initialStats,    setInitialStats]    = useState([]);
  const [initialPartners, setInitialPartners] = useState([]);

  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError,  setLoadError]  = useState('');
  const [saveError,  setSaveError]  = useState('');
  const [saved,      setSaved]      = useState(false);

  // ── Load all three datasets in parallel
  useEffect(() => {
    Promise.all([getHero(), getStats(), getPartners()])
      .then(([hero, stats, partners]) => {
        dispatch({ type: 'SET_ALL', payload: { ...EMPTY, ...hero } });
        setInitialStats(stats);
        setInitialPartners(partners);
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function set(field) {
    return (e) => dispatch({ type: 'SET_FIELD', field, value: e.target.value });
  }

  function handleVideoFilePick(e) {
    const file = e.target.files?.[0];
    if (file) setVideoFile(file);
  }

  // ── Submit (hero content only — stats/partners have their own save)
  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError('');
    setSaved(false);
    setSubmitting(true);

    try {
      const updated = await updateHero(fields.id, fields, posterFile, videoFile);
      dispatch({ type: 'SET_ALL', payload: { ...EMPTY, ...updated } });
      setPosterFile(null);
      setVideoFile(null);
      if (videoInputRef.current) videoInputRef.current.value = '';
      setSaved(true);
      setTimeout(() => setSaved(false), 5000);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render: loading / error
  if (loading) return <AdminSpinner />;

  if (loadError) {
    return (
      <div className="hap-page">
        <AdminPageHeader title="Hero Section" subtitle="Edit the homepage hero banner" />
        <div className="hap-banner hap-banner--error" role="alert">
          <span>⚠</span> Failed to load: {loadError}
        </div>
      </div>
    );
  }

  // ── Render: full page
  return (
    <div className="hap-page">
      <AdminPageHeader
        title="Hero Section"
        subtitle="Edit the homepage hero banner, stats bar, and credentials bar"
      />

      {/* ━━ Section 1: Hero Content ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="hap-section-group">
        <h2 className="hap-section-group-title">Hero Banner</h2>

        {saveError && (
          <div className="hap-banner hap-banner--error" role="alert">
            <span>⚠</span> {saveError}
          </div>
        )}
        {saved && (
          <div className="hap-banner hap-banner--success" role="status">
            <span>✓</span> Hero banner saved — changes are live.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="hap-form">

          {/* Media */}
          <div className="hap-two-col">
            <div className="hap-col">
              <ImageUpload
                currentUrl={fields.poster_image}
                onChange={setPosterFile}
                disabled={submitting}
                label="Poster / Background Image"
              />
            </div>

            <div className="hap-col hap-col--fields">
              <fieldset className="hap-section">
                <legend className="hap-section-title">Background Video</legend>
                <div className="hap-stack">
                  <FormField
                    id="background_video"
                    label="Video URL"
                    value={fields.background_video}
                    onChange={set('background_video')}
                    placeholder="https://…/hero-background.mp4"
                    disabled={submitting}
                    hint="Paste a hosted MP4 URL, or upload a file below (upload takes priority)."
                  />
                  <div className="hap-video-pick">
                    <button
                      type="button"
                      className="hap-video-btn"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={submitting}
                      aria-label="Pick a video file to upload"
                    >
                      ⬆ {videoFile ? 'Replace selected file' : 'Upload video file'}
                    </button>
                    {videoFile && (
                      <p className="hap-video-name">
                        {videoFile.name}{' '}
                        <span className="hap-video-size">
                          ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                      </p>
                    )}
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={handleVideoFilePick}
                      className="hap-hidden-input"
                      disabled={submitting}
                      tabIndex={-1}
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

          {/* Copy */}
          <fieldset className="hap-section">
            <legend className="hap-section-title">Hero Copy</legend>
            <div className="hap-stack">
              <FormField
                id="eyebrow"
                label="Eyebrow Text"
                value={fields.eyebrow}
                onChange={set('eyebrow')}
                placeholder="World-Class Fly Fishing Adventures"
                disabled={submitting}
              />
              <FormField
                id="title"
                label="Title"
                as="textarea"
                rows={3}
                value={fields.title}
                onChange={set('title')}
                placeholder="Catch Trophy Fish<br/>in Pristine Waters"
                disabled={submitting}
                hint="HTML is rendered — use <br/> for line breaks, <em> for italics."
              />
              <FormField
                id="subtitle"
                label="Subtitle"
                as="textarea"
                rows={2}
                value={fields.subtitle}
                onChange={set('subtitle')}
                placeholder="Join Drew on exclusive expeditions…"
                disabled={submitting}
                hint="HTML is rendered on the public site."
              />
            </div>
          </fieldset>

          {/* CTA */}
          <fieldset className="hap-section">
            <legend className="hap-section-title">Call to Action Buttons</legend>
            <div className="hap-grid-2">
              <FormField
                id="primary_cta_text"
                label="Primary Button — Text"
                value={fields.primary_cta_text}
                onChange={set('primary_cta_text')}
                placeholder="Book Your Trip"
                disabled={submitting}
              />
              <FormField
                id="primary_cta_link"
                label="Primary Button — Link"
                value={fields.primary_cta_link}
                onChange={set('primary_cta_link')}
                placeholder="https://… or #section"
                disabled={submitting}
              />
              <FormField
                id="secondary_cta_text"
                label="Secondary Button — Text"
                value={fields.secondary_cta_text}
                onChange={set('secondary_cta_text')}
                placeholder="View Our Expeditions"
                disabled={submitting}
              />
              <FormField
                id="secondary_cta_link"
                label="Secondary Button — Link"
                value={fields.secondary_cta_link}
                onChange={set('secondary_cta_link')}
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
                'Save Banner'
              )}
            </button>
          </div>

        </form>
      </div>

      {/* ━━ Section 2: Stats Bar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="hap-section-group">
        <h2 className="hap-section-group-title">Stats Bar</h2>
        <p className="hap-section-group-sub">
          Displayed directly below the hero. Toggle active to show/hide individual stats.
          The public bar renders items in the order shown here.
        </p>
        <StatsEditor initialItems={initialStats} />
      </div>

      {/* ━━ Section 3: Partners & Credentials ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="hap-section-group">
        <h2 className="hap-section-group-title">Trusted Partners &amp; Credentials</h2>
        <p className="hap-section-group-sub">
          The pill strip beneath the stats bar. Use <strong>Orvis</strong> or <strong>Gold</strong> style
          for featured credentials; <strong>Default</strong> for regular partners.
        </p>
        <PartnersEditor initialItems={initialPartners} />
      </div>

    </div>
  );
}
