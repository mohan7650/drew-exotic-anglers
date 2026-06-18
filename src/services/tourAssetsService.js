import { supabase } from '../lib/supabase';
import { uploadImage, deleteImages, extractStoragePath } from './storageService';

const TABLE  = 'tour_assets';
const BUCKET = 'tour-images';

// ── Read ───────────────────────────────────────────────────────────────────

export async function listTourAssets(tourId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, tour_id, image_url, alt, sort_order, created_at')
    .eq('tour_id', tourId)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createTourAsset(tourId, imageFile, alt = '') {
  if (!imageFile) throw new Error('An image file is required.');

  const ext  = imageFile.name.split('.').pop();
  const path = `assets/${tourId}-${Date.now()}.${ext}`;
  const image_url = await uploadImage(BUCKET, imageFile, path);

  // Place new image at the end of the current sort order
  const { data: existing } = await supabase
    .from(TABLE)
    .select('sort_order')
    .eq('tour_id', tourId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const sort_order = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ tour_id: tourId, image_url, alt: (alt ?? '').trim(), sort_order })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Update alt text ────────────────────────────────────────────────────────

export async function updateTourAssetAlt(id, alt) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ alt: (alt ?? '').trim() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Reorder ────────────────────────────────────────────────────────────────

export async function reorderTourAssets(updates) {
  // updates: [{ id, sort_order }, ...]
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from(TABLE).update({ sort_order }).eq('id', id)
    )
  );
  const failed = results.find(r => r.error);
  if (failed) throw new Error(failed.error.message);
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function deleteTourAsset(id, imageUrl) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);

  const path = extractStoragePath(imageUrl, BUCKET);
  if (path) deleteImages(BUCKET, [path]).catch(() => {});
}
