import { supabase } from '../lib/supabase';
import { uploadImage, deleteImages, extractStoragePath } from './storageService';

const TABLE  = 'florida_day_trips';
const BUCKET = 'gallery';

// ── Read ───────────────────────────────────────────────────────────────────

export async function listFloridaDayTrips() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, eyebrow, title, active, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getFloridaDayTrip(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getActiveFloridaDayTrip() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? null;
}

// ── Reorder ────────────────────────────────────────────────────────────────

export async function reorderFloridaDayTrips(updates) {
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from(TABLE).update({ sort_order }).eq('id', id)
    )
  );
  const failed = results.find(r => r.error);
  if (failed) throw new Error(failed.error.message);
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createFloridaDayTrip(fields, imageFile) {
  let main_image = fields.main_image ?? '';
  if (imageFile) {
    const ext  = imageFile.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    main_image = await uploadImage(BUCKET, imageFile, path);
  }
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...fields, main_image })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Update ─────────────────────────────────────────────────────────────────

export async function updateFloridaDayTrip(id, fields, imageFile, oldImageUrl) {
  let main_image = fields.main_image ?? oldImageUrl ?? '';
  if (imageFile) {
    const ext  = imageFile.name.split('.').pop();
    const path = `${id}-${Date.now()}.${ext}`;
    main_image = await uploadImage(BUCKET, imageFile, path);
    const oldPath = extractStoragePath(oldImageUrl, BUCKET);
    if (oldPath) deleteImages(BUCKET, [oldPath]).catch(() => {});
  }
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...fields, main_image })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function deleteFloridaDayTrip(id, imageUrl) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
  const path = extractStoragePath(imageUrl, BUCKET);
  if (path) deleteImages(BUCKET, [path]).catch(() => {});
}
