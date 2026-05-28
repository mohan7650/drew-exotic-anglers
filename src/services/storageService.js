import { supabase } from '../lib/supabase';

/**
 * Upload a file to a Supabase Storage bucket.
 * Designed to be reused by tours, gallery, species, and any future section.
 *
 * @param {string} bucket  - Bucket name (e.g. 'tour-images', 'gallery-images')
 * @param {File}   file    - Browser File object
 * @param {string} path    - Storage path within the bucket (e.g. '1234-hero.webp')
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export async function uploadImage(bucket, file, path) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: '3600' });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Delete one or more files from a bucket by their storage paths.
 * Soft-fails silently — a missing file is not an error we need to surface.
 *
 * @param {string}   bucket - Bucket name
 * @param {string[]} paths  - Array of storage paths to remove
 */
export async function deleteImages(bucket, paths) {
  if (!paths.length) return;
  await supabase.storage.from(bucket).remove(paths);
}

/**
 * Extract the storage path from a public Supabase Storage URL so we can
 * delete the underlying file when an image is replaced.
 *
 * Input:  "https://<ref>.supabase.co/storage/v1/object/public/tour-images/1234-hero.webp"
 * Output: "1234-hero.webp"
 *
 * Returns null when the URL doesn't match (e.g. an external URL).
 *
 * @param {string} publicUrl
 * @param {string} bucket
 * @returns {string|null}
 */
export function extractStoragePath(publicUrl, bucket) {
  if (!publicUrl) return null;
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}
