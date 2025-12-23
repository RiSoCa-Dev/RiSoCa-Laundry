import { supabase } from '../supabase-client';

export type ExpenseInsert = {
  title: string;
  amount: number;
  category?: string | null;
  expense_for: 'Racky' | 'Karaya' | 'Richard' | 'RKR';
  incurred_on?: string; // ISO date
  branch_id?: string | null;
};

// src/lib/api/expenses.ts

export async function fetchExpenses() {
  return supabase
    .from('expenses')
    .select('*')
    .order('incurred_on', { ascending: false })
    .order('created_at', { ascending: false });
}

export async function updateExpense(id: string, updates: { expense_for?: 'Racky' | 'Karaya' | 'Richard' | 'RKR'; incurred_on?: string }) {
  return supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

export async function addExpense(expense: ExpenseInsert) {
  // Automatically set reimbursement_status based on expense_for
  const reimbursement_status = expense.expense_for === 'RKR' 
    ? null 
    : 'pending'; // Personal expenses default to pending
  
  return supabase
    .from('expenses')
    .insert({
      title: expense.title,
      amount: expense.amount,
      category: expense.category ?? null,
      expense_for: expense.expense_for,
      incurred_on: expense.incurred_on ?? new Date().toISOString().slice(0, 10),
      branch_id: expense.branch_id ?? null,
      reimbursement_status: reimbursement_status,
    })
    .select()
    .single();
}

export async function deleteExpense(id: string) {
  return supabase.from('expenses').delete().eq('id', id);
}

// Reimburse a single expense
export async function reimburseExpense(expenseId: string, userId: string) {
  return supabase
    .from('expenses')
    .update({
      expense_for: 'RKR',
      reimbursement_status: 'reimbursed',
      reimbursed_at: new Date().toISOString(),
      reimbursed_by: userId,
    })
    .eq('id', expenseId)
    .eq('reimbursement_status', 'pending') // Only allow if pending
    .select()
    .single();
}

// Bulk reimburse multiple expenses
export async function bulkReimburseExpenses(expenseIds: string[], userId: string) {
  if (expenseIds.length === 0) {
    return { data: null, error: { message: 'No expenses selected' } };
  }
  
  return supabase
    .from('expenses')
    .update({
      expense_for: 'RKR',
      reimbursement_status: 'reimbursed',
      reimbursed_at: new Date().toISOString(),
      reimbursed_by: userId,
    })
    .in('id', expenseIds)
    .eq('reimbursement_status', 'pending') // Only allow if pending
    .select();
}

// Get pending reimbursements summary
export async function getPendingReimbursements() {
  const { data, error } = await supabase
    .from('expenses')
    .select('expense_for, amount')
    .eq('reimbursement_status', 'pending');
  
  if (error) return { data: null, error };
  
  const summary = {
    Racky: 0,
    Karaya: 0,
    Richard: 0,
    total: 0,
  };
  
  data?.forEach((exp) => {
    const person = exp.expense_for as keyof typeof summary;
    if (summary.hasOwnProperty(person)) {
      summary[person] += exp.amount || 0;
      summary.total += exp.amount || 0;
    }
  });
  
  return { data: summary, error: null };
}

