import { supabase } from '../lib/supabase';
import { uploadImage, deleteImages, extractStoragePath } from './storageService';

const TABLE    = 'about';
const FT_TABLE = 'about_features';
const BUCKET   = 'about';

// ── About (single row) ─────────────────────────────────────────────────────

export async function getAbout() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateAbout(id, fields, imageFile, oldImageUrl) {
  let image_url = fields.image_url ?? oldImageUrl ?? '';

  if (imageFile) {
    const ext  = imageFile.name.split('.').pop();
    const path = `about-${Date.now()}.${ext}`;
    image_url  = await uploadImage(BUCKET, imageFile, path);

    const oldPath = extractStoragePath(oldImageUrl, BUCKET);
    if (oldPath) deleteImages(BUCKET, [oldPath]).catch(() => {});
  }

  const { id: _id, created_at: _ca, ...rest } = fields;
  const payload = { ...rest, image_url };

  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Features ───────────────────────────────────────────────────────────────

export async function getFeatures(activeOnly = false) {
  let query = supabase
    .from(FT_TABLE)
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (activeOnly) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function saveFeatures(items, deletedIds = []) {
  if (deletedIds.length) {
    const { error } = await supabase.from(FT_TABLE).delete().in('id', deletedIds);
    if (error) throw new Error(error.message);
  }
  if (!items.length) return;
  const rows = items.map((item, i) => ({
    ...(item.id ? { id: item.id } : {}),
    icon:         item.icon,
    feature_text: item.feature_text,
    sort_order:   i + 1,
    active:       item.active,
  }));
  const { error } = await supabase.from(FT_TABLE).upsert(rows);
  if (error) throw new Error(error.message);
}
