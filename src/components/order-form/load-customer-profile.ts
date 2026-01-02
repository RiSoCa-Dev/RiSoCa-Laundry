import { supabase } from '@/lib/supabase-client';
import { UseFormSetValue } from 'react-hook-form';
import { CustomerFormValues } from './types';
import type { User } from '@supabase/supabase-js';

/**
 * Loads customer profile data and auto-fills the customer form.
 */
export async function loadCustomerProfile(
  user: User | null,
  setValue: UseFormSetValue<CustomerFormValues>
): Promise<void> {
  if (!user) return;
  
  try {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('first_name, contact_number')
      .eq('id', user.id)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return;
    }
    
    // Auto-fill form with profile data
    if (profileData) {
      if (profileData.first_name) {
        setValue('customerName', profileData.first_name);
      }
      if (profileData.contact_number) {
        setValue('contactNumber', profileData.contact_number);
      }
    } else {
      // Fallback to user metadata if profile doesn't exist
      const firstName = user.user_metadata?.first_name || 
                       user.user_metadata?.firstName || 
                       '';
      if (firstName) {
        setValue('customerName', firstName);
      }
    }
  } catch (error) {
    console.error('Error loading customer profile:', error);
  }
}
