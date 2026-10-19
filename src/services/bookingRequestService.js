import { supabase } from '../lib/supabase';

// Insert only — no .select() back, so this keeps working once the public (anon) role
// is allowed to INSERT booking requests but not read them.
export async function createBookingRequest(data) {
  const { error } = await supabase
    .from('booking_requests')
    .insert([data]);
  if (error) throw error;
}

export async function listBookingRequests() {
  const { data, error } = await supabase
    .from('booking_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function updateBookingRequestStatus(id, status) {
  const { error } = await supabase
    .from('booking_requests')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function archiveBookingRequest(id) {
  const { error } = await supabase
    .from('booking_requests')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function restoreBookingRequest(id) {
  const { error } = await supabase
    .from('booking_requests')
    .update({ archived_at: null })
    .eq('id', id);
  if (error) throw error;
}
