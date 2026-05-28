import React, { useRef, useState } from 'react';
import './ImageUpload.css';

const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_MB   = 5;

/**
 * Drag-and-drop image picker.
 * Does NOT upload — hands the raw File to the parent via onChange(file).
 * The parent (TourFormPage) passes it to the service layer on form submit.
 *
 * Props:
 *   currentUrl  {string?}         - Existing image URL (edit mode)
 *   onChange    {(File) => void}   - Called with the selected File
 *   disabled    {boolean?}
 *   label       {string?}          - Override the field label
 */
export default function ImageUpload({ currentUrl, onChange, disabled, label = 'Hero Image' }) {
  const inputRef                    = useRef(null);
  const [preview, setPreview]       = useState(null);  // local object URL
  const [dragOver, setDragOver]     = useState(false);
  const [sizeError, setSizeError]   = useState('');

  function pick(file) {
    setSizeError('');
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setSizeError(`File is too large. Maximum size is ${MAX_MB} MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file);
  }

  function handleInput(e) { pick(e.target.files?.[0]); }
  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    pick(e.dataTransfer.files?.[0]);
  }

  const displayUrl = preview || currentUrl;

  return (
    <div className="iu-root">
      <p className="iu-label">{label}</p>

      <div
        className={`iu-zone${dragOver ? ' iu-zone--over' : ''}${disabled ? ' iu-zone--disabled' : ''}`}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload image"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        {displayUrl ? (
          <div className="iu-preview-wrap">
            <img src={displayUrl} alt="Preview" className="iu-preview-img" />
            <div className="iu-preview-overlay">
              <span>Replace image</span>
            </div>
          </div>
        ) : (
          <div className="iu-placeholder">
            <span className="iu-icon" aria-hidden="true">⬆</span>
            <p className="iu-hint-text">
              Click or drag image here<br />
              <span>JPEG · PNG · WebP · GIF — max {MAX_MB} MB</span>
            </p>
          </div>
        )}
      </div>

      {sizeError && <p className="iu-error" role="alert">{sizeError}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleInput}
        className="iu-hidden-input"
        disabled={disabled}
        tabIndex={-1}
      />
    </div>
  );
}
