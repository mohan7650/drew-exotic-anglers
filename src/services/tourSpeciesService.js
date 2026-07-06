import { supabase } from '../lib/supabase';

const TABLE = 'tour_species';

// Returns full species objects for a given tour, ordered by sort_order.
// Used by the frontend tour detail page.
export async function listTourSpecies(tourId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('sort_order, species(*)')
    .eq('tour_id', tourId)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(row => row.species).filter(Boolean);
}

// Returns just { species_id, sort_order } rows.
// Used by the admin selector to know which species are currently checked.
export async function listTourSpeciesIds(tourId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('species_id, sort_order')
    .eq('tour_id', tourId)
    .order('sort_order', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

// Add one species to a tour. sort_order = next after existing entries.
export async function addTourSpecies(tourId, speciesId) {
  const { data: existing } = await supabase
    .from(TABLE)
    .select('sort_order')
    .eq('tour_id', tourId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const sort_order = (existing?.[0]?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ tour_id: tourId, species_id: speciesId, sort_order })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Remove one species from a tour.
export async function removeTourSpecies(tourId, speciesId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('tour_id', tourId)
    .eq('species_id', speciesId);
  if (error) throw new Error(error.message);
}
