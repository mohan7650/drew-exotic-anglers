import { supabase } from '../lib/supabase';

const TABLE = 'tour_details';

export async function listTourDetails(tourId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, tour_id, label, value, sort_order, created_at')
    .eq('tour_id', tourId)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTourDetail(tourId, label, value) {
  const { data: existing } = await supabase
    .from(TABLE)
    .select('sort_order')
    .eq('tour_id', tourId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const sort_order = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ tour_id: tourId, label: label.trim(), value: value.trim(), sort_order })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTourDetail(id, label, value) {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ label: label.trim(), value: value.trim() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTourDetail(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function reorderTourDetails(updates) {
  const results = await Promise.all(
    updates.map(({ id, sort_order }) =>
      supabase.from(TABLE).update({ sort_order }).eq('id', id)
    )
  );
  const failed = results.find(r => r.error);
  if (failed) throw new Error(failed.error.message);
}
