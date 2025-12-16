import { supabase } from '../supabase-client';

export type ExpenseInsert = {
  title: string;
  amount: number;
  category?: string | null;
  expense_for: 'Racky' | 'Karaya' | 'Richard';
  incurred_on?: string; // ISO date
  branch_id?: string | null;
};

export async function updateExpense(id: string, updates: { expense_for: 'Racky' | 'Karaya' | 'Richard' }) {
  return supabase
    .from('expenses')
    .update({ expense_for: updates.expense_for })
    .eq('id', id)
    .select()
    .single();
}

export async function addExpense(expense: ExpenseInsert) {
  return supabase
    .from('expenses')
    .insert({
      title: expense.title,
      amount: expense.amount,
      category: expense.category ?? null,
      expense_for: expense.expense_for,
      incurred_on: expense.incurred_on ?? new Date().toISOString().slice(0, 10),
      branch_id: expense.branch_id ?? null,
    })
    .select()
    .single();
}

export async function deleteExpense(id: string) {
  return supabase.from('expenses').delete().eq('id', id);
}

