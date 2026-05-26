import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAvailability() {
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    supabase
      .from('trip_availability')
      .select('id, trip, spots, total')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setAvailability(data);
      });
  }, []);

  return availability;
}
