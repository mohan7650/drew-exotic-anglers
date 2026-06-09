import { supabase } from '../lib/supabase';
import { uploadImage, deleteImages, extractStoragePath } from './storageService';

const TABLE  = 'species';
const BUCKET = 'species-images';

// ── Read ───────────────────────────────────────────────────────────────────

export async function listSpecies() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, latin_name, description, image_url, sort_order, active, stars, difficulty, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listActiveSpecies() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, latin_name, description, image_url, stars, difficulty')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getSpecies(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createSpecies(fields, imageFile) {
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

export async function updateSpecies(id, fields, imageFile, oldImageUrl) {
  let image_url = fields.image_url ?? oldImageUrl ?? '';

  if (imageFile) {
    const ext  = imageFile.name.split('.').pop();
    const path = `${id}-${Date.now()}.${ext}`;
    image_url  = await uploadImage(BUCKET, imageFile, path);

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

export async function deleteSpecies(id, imageUrl) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);

  const path = extractStoragePath(imageUrl, BUCKET);
  if (path) deleteImages(BUCKET, [path]).catch(() => {});
}

// ── Reorder ────────────────────────────────────────────────────────────────

export async function reorderSpecies(updates) {
  // updates: [{ id, sort_order }, ...]
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from(TABLE).update({ sort_order }).eq('id', id)
    )
  );
  const failed = results.find(r => r.error);
  if (failed) throw new Error(failed.error.message);
}
