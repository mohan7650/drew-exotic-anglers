import { supabase } from '../lib/supabase';
import { uploadImage, deleteImages, extractStoragePath } from './storageService';

const TABLE  = 'hero';
const BUCKET = 'hero';

// ── Read ───────────────────────────────────────────────────────────────────

export async function getHero() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// ── Update ─────────────────────────────────────────────────────────────────
// posterFile and videoFile are optional File objects.
// When provided, they are uploaded and their resulting public URLs replace
// the current values in fields.poster_image / fields.background_video.

export async function updateHero(id, fields, posterFile, videoFile) {
  let poster_image     = fields.poster_image     ?? '';
  let background_video = fields.background_video ?? '';

  if (posterFile) {
    const oldPath = extractStoragePath(poster_image, BUCKET);
    poster_image  = await uploadHeroImage(posterFile);
    if (oldPath) deleteImages(BUCKET, [oldPath]).catch(() => {});
  }

  if (videoFile) {
    const oldPath    = extractStoragePath(background_video, BUCKET);
    background_video = await uploadHeroVideo(videoFile);
    if (oldPath) deleteImages(BUCKET, [oldPath]).catch(() => {});
  }

  // Strip auto-managed columns before sending to Supabase
  const { id: _id, created_at: _ca, ...rest } = fields;
  const payload = { ...rest, poster_image, background_video };

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Stats ──────────────────────────────────────────────────────────────────

export async function getStats(activeOnly = false) {
  let query = supabase
    .from('hero_stats')
    .select('*')
    .order('sort_order', { ascending: true });
  if (activeOnly) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Saves the full stats list: deletes removed ids, upserts the rest.
// sort_order is recomputed from array position so the caller never has to manage it.
export async function saveStats(items, deletedIds = []) {
  if (deletedIds.length) {
    const { error } = await supabase.from('hero_stats').delete().in('id', deletedIds);
    if (error) throw new Error(error.message);
  }
  if (!items.length) return;
  const rows = items.map((item, i) => ({
    ...(item.id ? { id: item.id } : {}),
    stat_number: item.stat_number,
    stat_label:  item.stat_label,
    sort_order:  i + 1,
    active:      item.active,
  }));
  const { error } = await supabase.from('hero_stats').upsert(rows);
  if (error) throw new Error(error.message);
}

// ── Partners ────────────────────────────────────────────────────────────────

export async function getPartners(activeOnly = false) {
  let query = supabase
    .from('hero_partners')
    .select('*')
    .order('sort_order', { ascending: true });
  if (activeOnly) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function savePartners(items, deletedIds = []) {
  if (deletedIds.length) {
    const { error } = await supabase.from('hero_partners').delete().in('id', deletedIds);
    if (error) throw new Error(error.message);
  }
  if (!items.length) return;
  const rows = items.map((item, i) => ({
    ...(item.id ? { id: item.id } : {}),
    partner_text:  item.partner_text,
    style_variant: item.style_variant ?? 'default',
    sort_order:    i + 1,
    active:        item.active,
  }));
  const { error } = await supabase.from('hero_partners').upsert(rows);
  if (error) throw new Error(error.message);
}

// ── Storage helpers ────────────────────────────────────────────────────────

export async function uploadHeroImage(file) {
  const ext  = file.name.split('.').pop();
  const path = `poster-${Date.now()}.${ext}`;
  return uploadImage(BUCKET, file, path);
}

export async function uploadHeroVideo(file) {
  const ext  = file.name.split('.').pop();
  const path = `video-${Date.now()}.${ext}`;
  return uploadImage(BUCKET, file, path);
}
