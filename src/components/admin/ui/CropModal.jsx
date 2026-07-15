import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedBlob } from '../../../utils/cropImage';
import './CropModal.css';

/**
 * Full-screen crop/position modal backed by react-easy-crop.
 *
 * Props:
 *   imageSrc  {string}           - URL or object URL of the image to crop
 *   aspect    {number}           - Crop aspect ratio (default 4/3)
 *   onCancel  {() => void}
 *   onApply   {(blob: Blob) => void}
 */
export default function CropModal({
  imageSrc,
  aspect = 4 / 3,
  onCancel,
  onApply,
}) {
  const [crop,              setCrop]              = useState({ x: 0, y: 0 });
  const [zoom,              setZoom]              = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [applying,          setApplying]          = useState(false);
  const [error,             setError]             = useState('');

  const onCropComplete = useCallback((_area, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  async function handleApply() {
    if (!croppedAreaPixels) return;
    setApplying(true);
    setError('');
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      onApply(blob);
    } catch {
      setError('Could not process the image. Try selecting the file again.');
      setApplying(false);
    }
  }

  return (
    <div
      className="cm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Position image"
    >
      <div className="cm-modal">

        <div className="cm-header">
          <h3 className="cm-title">Position Image</h3>
          <p className="cm-subtitle">
            Drag to reposition · Scroll or pinch to zoom
          </p>
        </div>

        <div className="cm-canvas">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={false}
          />
        </div>

        <div className="cm-zoom-row">
          <span className="cm-zoom-label">Zoom</span>
          <input
            className="cm-zoom-slider"
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            aria-label="Zoom level"
            disabled={applying}
          />
          <span className="cm-zoom-val">{Math.round((zoom - 1) * 100)}%</span>
        </div>

        {error && (
          <p className="cm-error" role="alert">{error}</p>
        )}

        <div className="cm-footer">
          <button
            className="cm-btn cm-btn--cancel"
            type="button"
            onClick={onCancel}
            disabled={applying}
          >
            Cancel
          </button>
          <button
            className="cm-btn cm-btn--apply"
            type="button"
            onClick={handleApply}
            disabled={applying}
          >
            {applying ? 'Processing…' : 'Apply Crop'}
          </button>
        </div>

      </div>
    </div>
  );
}
