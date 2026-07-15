import { supabase } from '../lib/supabase';
import { uploadImage, deleteImages, extractStoragePath } from './storageService';

const TABLE  = 'video_section';
const BUCKET = 'video';

// ── Public ─────────────────────────────────────────────────────────────────
// Returns the single active record, or null if none exists.

export async function getVideoSection() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

// ── Admin ──────────────────────────────────────────────────────────────────
// Returns the first record regardless of active status (for the editor).

export async function getVideoSectionRecord() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? null;
}

// ── Save (upsert) ──────────────────────────────────────────────────────────
// Pass id=null to create the first record; pass existing id to update.

export async function saveVideoSection(id, fields, imageFile, oldImageUrl) {
  let poster_image = fields.poster_image ?? oldImageUrl ?? '';

  if (imageFile) {
    const ext  = imageFile.name.split('.').pop();
    const path = id ? `${id}-${Date.now()}.${ext}` : `${Date.now()}.${ext}`;
    poster_image = await uploadImage(BUCKET, imageFile, path);

    const oldPath = extractStoragePath(oldImageUrl, BUCKET);
    if (oldPath) deleteImages(BUCKET, [oldPath]).catch(() => {});
  }

  // Strip non-column keys before sending to Supabase
  const { id: _id, created_at: _ca, ...rest } = fields;
  const payload = { ...rest, poster_image };

  if (id) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}
