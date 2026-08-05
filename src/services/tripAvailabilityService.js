import { supabase } from '../lib/supabase';

export async function listTripAvailability() {
  const { data, error } = await supabase
    .from('trip_availability')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createTripAvailability(payload) {
  const { data, error } = await supabase
    .from('trip_availability')
    .insert([payload])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTripAvailability(id, payload) {
  const { data, error } = await supabase
    .from('trip_availability')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTripAvailability(id) {
  const { error } = await supabase
    .from('trip_availability')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function reorderTripAvailability(updates) {
  for (const { id, sort_order } of updates) {
    const { error } = await supabase
      .from('trip_availability')
      .update({ sort_order })
      .eq('id', id);
    if (error) throw error;
  }
}
