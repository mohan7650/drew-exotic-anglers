import { supabase } from '../lib/supabase';
import { uploadImage, deleteImages, extractStoragePath } from './storageService';

const TABLE  = 'tour_fish';
const BUCKET = 'tour-images';

export async function listTourFish(tourId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, tour_id, name, latin_name, description, image_url, difficulty, stars, sort_order, created_at')
    .eq('tour_id', tourId)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTourFish(tourId, fields, imageFile) {
  let image_url = '';

  if (imageFile) {
    const ext  = imageFile.name.split('.').pop();
    const path = `fish/${tourId}-${Date.now()}.${ext}`;
    image_url  = await uploadImage(BUCKET, imageFile, path);
  }

  const { data: existing } = await supabase
    .from(TABLE)
    .select('sort_order')
    .eq('tour_id', tourId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const sort_order = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ tour_id: tourId, ...fields, image_url, sort_order })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTourFish(id, fields, imageFile, oldImageUrl) {
  let image_url = fields.image_url ?? oldImageUrl ?? '';

  if (imageFile) {
    const ext  = imageFile.name.split('.').pop();
    const path = `fish/${id}-${Date.now()}.${ext}`;
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

export async function deleteTourFish(id, imageUrl) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);

  const path = extractStoragePath(imageUrl, BUCKET);
  if (path) deleteImages(BUCKET, [path]).catch(() => {});
}

export async function reorderTourFish(updates) {
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from(TABLE).update({ sort_order }).eq('id', id)
    )
  );
  const failed = results.find(r => r.error);
  if (failed) throw new Error(failed.error.message);
}
