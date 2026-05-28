import { supabase } from '../lib/supabase';
import { uploadImage, deleteImages, extractStoragePath } from './storageService';

const TABLE  = 'tours';
const BUCKET = 'tour-images';

// ── Slug helper ────────────────────────────────────────────────────────────
export function slugify(str) {
  return (str ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Read ───────────────────────────────────────────────────────────────────

export async function listTours() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, slug, title, tag, meta, image_url, created_at')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTour(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createTour(fields, imageFile) {
  let image_url = fields.image_url ?? '';

  if (imageFile) {
    const ext  = imageFile.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    image_url  = await uploadImage(BUCKET, imageFile, path);
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...fields, image_url })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Update ─────────────────────────────────────────────────────────────────

export async function updateTour(id, fields, imageFile, oldImageUrl) {
  let image_url = fields.image_url ?? oldImageUrl ?? '';

  if (imageFile) {
    const ext  = imageFile.name.split('.').pop();
    const path = `${id}-${Date.now()}.${ext}`;
    image_url  = await uploadImage(BUCKET, imageFile, path);

    // Clean up old file from storage (best-effort, never blocks the update)
    const oldPath = extractStoragePath(oldImageUrl, BUCKET);
    if (oldPath) deleteImages(BUCKET, [oldPath]).catch(() => {});
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...fields, image_url })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function deleteTour(id, imageUrl) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);

  // Best-effort storage cleanup
  const path = extractStoragePath(imageUrl, BUCKET);
  if (path) deleteImages(BUCKET, [path]).catch(() => {});
}
