import { supabase } from '../supabase-client';

export type ElectricityReadingInsert = {
  reading: number;
  reading_date: string; // ISO date string (YYYY-MM-DD)
};

export type ElectricityReading = {
  id: string;
  reading: number;
  reading_date: string;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
};

export async function fetchElectricityReadings() {
  return supabase
    .from('electricity_readings')
    .select('*')
    .order('reading_date', { ascending: false });
}

export async function addElectricityReading(reading: ElectricityReadingInsert) {
  return supabase
    .from('electricity_readings')
    .insert({
      reading: reading.reading,
      reading_date: reading.reading_date,
    })
    .select()
    .single();
}

export async function updateElectricityReading(
  id: string,
  reading: Partial<ElectricityReadingInsert>
) {
  return supabase
    .from('electricity_readings')
    .update(reading)
    .eq('id', id)
    .select()
    .single();
}

export async function deleteElectricityReading(id: string) {
  return supabase.from('electricity_readings').delete().eq('id', id);
}

