import { supabase } from '../lib/supabase';
import { uploadImage, deleteImages, extractStoragePath } from './storageService';

const TABLE  = 'testimonials';
const BUCKET = 'testimonials';

// ── Read ───────────────────────────────────────────────────────────────────

export async function listTestimonials() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, review, location, image_url, rating, featured, sort_order, active, created_at')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listActiveTestimonials() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, review, location, image_url, rating, featured')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTestimonial(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createTestimonial(fields, imageFile) {
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

export async function updateTestimonial(id, fields, imageFile, oldImageUrl) {
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

export async function deleteTestimonial(id, imageUrl) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);

  const path = extractStoragePath(imageUrl, BUCKET);
  if (path) deleteImages(BUCKET, [path]).catch(() => {});
}

// ── Reorder ────────────────────────────────────────────────────────────────

export async function reorderTestimonials(updates) {
  // updates: [{ id, sort_order }, ...]
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from(TABLE).update({ sort_order }).eq('id', id)
    )
  );
  const failed = results.find(r => r.error);
  if (failed) throw new Error(failed.error.message);
}
