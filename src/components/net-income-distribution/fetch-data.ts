import { supabase } from '@/lib/supabase-client';
import { fetchExpenses } from '@/lib/api/expenses';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import type { OrderData, ExpenseData, SalaryPaymentData, DistributionRecord, DistributionPeriod } from './types';

export async function fetchAllData() {
  // Fetch all paid orders
  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('id, total, is_paid, created_at')
    .eq('is_paid', true)
    .order('created_at', { ascending: true });

  let orders: OrderData[] = [];
  if (ordersError) {
    console.error('Failed to load orders', ordersError);
  } else {
    orders = ordersData || [];
  }

  // Fetch expenses
  const expensesResult = await fetchExpenses();
  let expenses: ExpenseData[] = [];
  if (expensesResult.error) {
    console.error('Failed to load expenses', expensesResult.error);
  } else {
    expenses = (expensesResult.data || []).map((e: any) => ({
      id: e.id,
      amount: e.amount,
      expense_for: e.expense_for,
      reimbursement_status: e.reimbursement_status,
      incurred_on: e.incurred_on || e.created_at,
    }));
  }

  // Fetch employee salary payments
  const { data: salaryData, error: salaryError } = await supabase
    .from('daily_salary_payments')
    .select('id, employee_id, amount, is_paid, date, created_at')
    .eq('is_paid', true);

  let salaryPayments: SalaryPaymentData[] = [];
  if (salaryError) {
    console.error('Failed to load salary payments', salaryError);
  } else {
    salaryPayments = salaryData || [];
  }

  return { orders, expenses, salaryPayments };
}

export async function fetchDistributions(distributionPeriod: DistributionPeriod) {
  const now = new Date();
  let startDate: Date;
  let endDate = now;
  let periodType: string;

  if (distributionPeriod === 'monthly') {
    startDate = startOfMonth(now);
    endDate = endOfMonth(now);
    periodType = 'monthly';
  } else if (distributionPeriod === 'yearly') {
    startDate = startOfYear(now);
    endDate = endOfYear(now);
    periodType = 'yearly';
  } else {
    // For 'all', fetch all distributions
    const { data, error } = await supabase
      .from('income_distributions')
      .select('*')
      .order('period_start', { ascending: false });

    if (!error && data) {
      return data as DistributionRecord[];
    }
    return [];
  }

  const { data, error } = await supabase
    .from('income_distributions')
    .select('*')
    .eq('period_type', periodType)
    .gte('period_end', format(startDate, 'yyyy-MM-dd'))
    .lte('period_start', format(endDate, 'yyyy-MM-dd'))
    .order('period_start', { ascending: false });

  if (!error && data) {
    return data as DistributionRecord[];
  }
  return [];
}

export async function fetchBankSavings(distributionPeriod: DistributionPeriod): Promise<number> {
  const now = new Date();
  let startDate: Date;
  let endDate = now;
  let periodType: string;

  if (distributionPeriod === 'monthly') {
    startDate = startOfMonth(now);
    endDate = endOfMonth(now);
    periodType = 'monthly';
  } else if (distributionPeriod === 'yearly') {
    startDate = startOfYear(now);
    endDate = endOfYear(now);
    periodType = 'yearly';
  } else {
    // For 'all', set bank savings to 0 (not applicable for all time)
    return 0;
  }

  // Sum all deposits for this period (since each deposit is a separate record)
  const { data, error } = await supabase
    .from('bank_savings')
    .select('amount')
    .eq('period_type', periodType)
    .eq('period_start', format(startDate, 'yyyy-MM-dd'))
    .eq('period_end', format(endDate, 'yyyy-MM-dd'));

  if (!error && data && data.length > 0) {
    const totalAmount = data.reduce((sum, record) => {
      const amount = typeof record.amount === 'string' ? parseFloat(record.amount) : (record.amount || 0);
      return sum + amount;
    }, 0);
    return totalAmount;
  }
  return 0;
}

export async function fetchBankSavingsHistory() {
  try {
    const { data, error } = await supabase
      .from('bank_savings')
      .select('id, period_start, period_end, period_type, amount, notes, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      return data.map(record => ({
        id: record.id,
        period_start: record.period_start,
        period_end: record.period_end,
        period_type: record.period_type,
        amount: typeof record.amount === 'string' ? parseFloat(record.amount) : (record.amount || 0),
        notes: record.notes || null,
        created_at: record.created_at,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching bank savings history:', error);
    return [];
  }
}
