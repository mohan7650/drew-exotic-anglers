import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './CropModal.css';

const ASPECT = 4 / 3;

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () => reject(new Error('Failed to load image for cropping')));
    img.src = url;
  });
}

async function getCroppedBlob(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('Canvas export failed'))),
      'image/webp',
      0.92,
    );
  });
}

export default function CropModal({ imageSrc, onCancel, onApply }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');

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
            aspect={ASPECT}
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
