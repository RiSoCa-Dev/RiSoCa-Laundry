import type { Expense, PendingSummary, FilterType } from './types';

export function calculateExpenseTotals(expenses: Expense[], pendingSummary: PendingSummary | null) {
  // Calculate totals - separate pending vs reimbursed
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount ?? 0), 0);
  
  // Pending reimbursements (personal expenses not yet reimbursed)
  const pendingExpenses = expenses.filter(e => e.reimbursement_status === 'pending');
  const pendingTotal = pendingExpenses.reduce((sum, exp) => sum + (exp.amount ?? 0), 0);
  
  // Reimbursed expenses (now counted as RKR)
  const reimbursedExpenses = expenses.filter(e => e.reimbursement_status === 'reimbursed');
  const reimbursedTotal = reimbursedExpenses.reduce((sum, exp) => sum + (exp.amount ?? 0), 0);
  
  // Calculate totals per person (current expense_for, so reimbursed show as RKR)
  const totalsByPerson = expenses.reduce((acc, exp) => {
    const person = exp.expense_for || 'Unknown';
    acc[person] = (acc[person] || 0) + (exp.amount ?? 0);
    return acc;
  }, {} as Record<string, number>);

  const rackyTotal = totalsByPerson['Racky'] || 0;
  const karayaTotal = totalsByPerson['Karaya'] || 0;
  const richardTotal = totalsByPerson['Richard'] || 0;
  const rkrTotal = totalsByPerson['RKR'] || 0;

  // Get pending totals from summary or calculate
  const pendingRacky = pendingSummary?.Racky || pendingExpenses.filter(e => e.expense_for === 'Racky').reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingKaraya = pendingSummary?.Karaya || pendingExpenses.filter(e => e.expense_for === 'Karaya').reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingRichard = pendingSummary?.Richard || pendingExpenses.filter(e => e.expense_for === 'Richard').reduce((sum, e) => sum + (e.amount || 0), 0);

  return {
    totalExpenses,
    pendingTotal,
    reimbursedTotal,
    rackyTotal,
    karayaTotal,
    richardTotal,
    rkrTotal,
    pendingRacky,
    pendingKaraya,
    pendingRichard,
    pendingExpenses,
  };
}

export function filterExpenses(expenses: Expense[], filter: FilterType): Expense[] {
  return expenses.filter(expense => {
    if (filter === 'all') return true;
    if (filter === 'pending') return expense.reimbursement_status === 'pending';
    if (filter === 'reimbursed') return expense.reimbursement_status === 'reimbursed';
    if (filter === 'rkr') return expense.expense_for === 'RKR' && expense.reimbursement_status !== 'reimbursed';
    return true;
  });
}
