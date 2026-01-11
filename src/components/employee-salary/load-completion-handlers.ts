import { format } from 'date-fns';
import { supabase } from '@/lib/supabase-client';
import { fetchDailyPayments } from './fetch-data';
import type { LoadCompletionData } from './types';

export async function saveLoadCompletion(
  employeeId: string,
  date: Date,
  loadCompletion: LoadCompletionData,
  toast: (options: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void,
  onSuccess: (dateStr: string, payments: any) => void
): Promise<void> {
  const dateStr = format(date, 'yyyy-MM-dd');

  const { data: existingData, error: fetchError } = await supabase
    .from('daily_salary_payments')
    .select('id, amount, is_paid')
    .eq('employee_id', employeeId)
    .eq('date', dateStr)
    .maybeSingle();

  let result;
  if (existingData && !fetchError) {
    result = await supabase
      .from('daily_salary_payments')
      .update({
        load_completion: loadCompletion as any,
        updated_at: new Date().toISOString(),
      })
      .eq('employee_id', employeeId)
      .eq('date', dateStr)
      .select();
  } else {
    // Create a new entry if it doesn't exist
    result = await supabase
      .from('daily_salary_payments')
      .insert({
        employee_id: employeeId,
        date: dateStr,
        amount: 0,
        is_paid: false,
        load_completion: loadCompletion as any,
        updated_at: new Date().toISOString(),
      })
      .select();
  }

  if (result.error) {
    console.error('Database error:', result.error);
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to save load completion status.',
    });
    throw result.error;
  }

  if (!result.data || (Array.isArray(result.data) && result.data.length === 0)) {
    throw new Error('Failed to save load completion status. No data returned from database.');
  }

  toast({
    title: 'Load Completion Updated',
    description: 'Load completion status has been saved.',
  });

  const payments = await fetchDailyPayments(dateStr);
  onSuccess(dateStr, payments);
}
