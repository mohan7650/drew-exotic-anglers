/**
 * Shared canvas-based image crop utilities.
 * Used by CropModal and any page that needs direct reposition logic.
 */

/**
 * Loads a URL into an HTMLImageElement.
 * crossOrigin is set only for non-blob URLs to prevent canvas taint.
 */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!url.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () =>
      reject(new Error('Failed to load image for cropping')),
    );
    img.src = url;
  });
}

/**
 * Crop an image to the given pixel area and return a WebP Blob.
 *
 * @param {string} imageSrc - URL or object URL of the source image
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop
 * @param {number} [quality=0.92] - WebP quality (0–1)
 * @returns {Promise<Blob>}
 */
export async function getCroppedBlob(imageSrc, pixelCrop, quality = 0.92) {
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
      blob =>
        blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
      'image/webp',
      quality,
    );
  });
}

/**
 * Fetch a remote URL as a same-origin object URL so the canvas is
 * never tainted by cross-origin restrictions.
 * Falls back to the original URL if the network request fails.
 *
 * @param {string} url
 * @returns {Promise<{ objUrl: string, isObjectUrl: boolean }>}
 */
export async function fetchAsSrcUrl(url) {
  try {
    const res  = await fetch(url);
    const blob = await res.blob();
    return { objUrl: URL.createObjectURL(blob), isObjectUrl: true };
  } catch {
    return { objUrl: url, isObjectUrl: false };
  }
}

/**
 * Wrap a Blob in a named File suitable for upload.
 *
 * @param {Blob}   blob
 * @param {string} [prefix='crop']
 * @returns {File}
 */
export function blobToFile(blob, prefix = 'crop') {
  return new File([blob], `${prefix}-${Date.now()}.webp`, {
    type: 'image/webp',
  });
}
