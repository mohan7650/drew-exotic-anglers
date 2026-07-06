import { supabase } from '../lib/supabase';

export async function createBookingRequest(data) {
  const { data: result, error } = await supabase
    .from('booking_requests')
    .insert([data])
    .select()
    .single();
  if (error) throw error;
  return result;
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
