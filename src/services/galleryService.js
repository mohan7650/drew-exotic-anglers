import { supabase } from '../lib/supabase';
import { uploadImage, deleteImages, extractStoragePath } from './storageService';

const TABLE  = 'gallery';
const BUCKET = 'gallery';

// ── Read ───────────────────────────────────────────────────────────────────

export async function getGalleryPhotos() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, image_url, alt, size, created_at')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createGalleryPhoto(fields, imageFile) {
  if (!imageFile) throw new Error('An image is required.');

  const ext  = imageFile.name.split('.').pop();
  const path = `${Date.now()}.${ext}`;
  const image_url = await uploadImage(BUCKET, imageFile, path);

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      image_url,
      alt:  fields.alt?.trim()  ?? '',
      size: fields.size         ?? 'medium',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Update ─────────────────────────────────────────────────────────────────

export async function updateGalleryPhoto(id, fields, imageFile, oldImageUrl) {
  let image_url = oldImageUrl ?? '';

  if (imageFile) {
    const ext  = imageFile.name.split('.').pop();
    const path = `${id}-${Date.now()}.${ext}`;
    image_url  = await uploadImage(BUCKET, imageFile, path);

    // Best-effort: clean up the old file from storage
    const oldPath = extractStoragePath(oldImageUrl, BUCKET);
    if (oldPath) deleteImages(BUCKET, [oldPath]).catch(() => {});
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      image_url,
      alt:  fields.alt?.trim()  ?? '',
      size: fields.size         ?? 'medium',
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function deleteGalleryPhoto(id, imageUrl) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);

  // Best-effort storage cleanup — never blocks or surfaces an error
  const path = extractStoragePath(imageUrl, BUCKET);
  if (path) deleteImages(BUCKET, [path]).catch(() => {});
}
