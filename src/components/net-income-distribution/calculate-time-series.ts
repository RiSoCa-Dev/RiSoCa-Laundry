import { startOfMonth, endOfMonth, startOfYear, endOfYear, eachMonthOfInterval, eachYearOfInterval, subMonths, format } from 'date-fns';
import type { OrderData, ExpenseData, SalaryPaymentData, DistributionPeriod } from './types';

export type TimeSeriesDataPoint = {
  period: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  distribution: number;
};

export function calculateTimeSeriesData(
  orders: OrderData[],
  expenses: ExpenseData[],
  salaryPayments: SalaryPaymentData[],
  distributionPeriod: DistributionPeriod
): TimeSeriesDataPoint[] {
  if (orders.length === 0) return [];

  const now = new Date();
  let periods: Date[];
  let dateFormatter: (date: Date) => string;
  let periodStartFn: (date: Date) => Date;
  let periodEndFn: (date: Date) => Date;

  let startDate: Date;
  let endDate = now;

  if (distributionPeriod === 'monthly') {
    // Last 12 months
    startDate = startOfMonth(subMonths(now, 11));
    periods = eachMonthOfInterval({ start: startDate, end: endDate });
    dateFormatter = (d) => format(d, 'MMM yyyy');
    periodStartFn = startOfMonth;
    periodEndFn = endOfMonth;
  } else if (distributionPeriod === 'yearly') {
    // All years
    const orderDates = orders.map(o => new Date(o.created_at).getTime());
    if (orderDates.length === 0) return [];
    startDate = startOfYear(new Date(Math.min(...orderDates)));
    periods = eachYearOfInterval({ start: startDate, end: endDate });
    dateFormatter = (d) => format(d, 'yyyy');
    periodStartFn = startOfYear;
    periodEndFn = endOfYear;
  } else {
    // All time - show monthly breakdown
    const orderDates = orders.map(o => new Date(o.created_at).getTime());
    if (orderDates.length === 0) return [];
    startDate = startOfMonth(new Date(Math.min(...orderDates)));
    periods = eachMonthOfInterval({ start: startDate, end: endDate });
    dateFormatter = (d) => format(d, 'MMM yyyy');
    periodStartFn = startOfMonth;
    periodEndFn = endOfMonth;
  }

  return periods.map((period) => {
    const periodStart = periodStartFn(period);
    const periodEnd = periodEndFn(period);
    const periodKey = dateFormatter(period);

    const periodOrders = orders.filter(o => {
      const orderDate = new Date(o.created_at);
      return orderDate >= periodStart && orderDate <= periodEnd;
    });

    const periodExpenses = expenses.filter(e => {
      const expenseDate = new Date(e.incurred_on);
      return expenseDate >= periodStart && expenseDate <= periodEnd;
    });

    const periodSalaries = salaryPayments.filter(s => {
      const salaryDate = new Date(s.date);
      return salaryDate >= periodStart && salaryDate <= periodEnd;
    });

    const periodRevenue = periodOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const rkrExpenses = periodExpenses.filter(e => 
      e.expense_for === 'RKR' || e.reimbursement_status === 'reimbursed'
    );
    const periodRegularExpenses = rkrExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const periodEmployeeSalaries = periodSalaries.reduce((sum, s) => sum + (s.amount || 0), 0);
    const periodTotalExpenses = periodRegularExpenses + periodEmployeeSalaries;
    const periodNetIncome = periodRevenue - periodTotalExpenses;
    const periodDistribution = periodNetIncome / 3;

    return {
      period: periodKey,
      revenue: periodRevenue,
      expenses: periodTotalExpenses,
      netIncome: periodNetIncome,
      distribution: periodDistribution,
    };
  }).filter(d => d.revenue > 0 || d.expenses > 0);
}
