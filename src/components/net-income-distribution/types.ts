export type OrderData = {
  id: string;
  total: number;
  is_paid: boolean;
  created_at: string;
};

export type ExpenseData = {
  id: string;
  amount: number;
  expense_for: string;
  reimbursement_status: string | null;
  incurred_on: string;
};

export type SalaryPaymentData = {
  id: string;
  employee_id: string;
  amount: number;
  is_paid: boolean;
  date: string;
};

export type DistributionRecord = {
  id: string;
  owner_name: string;
  share_amount: number;
  net_share: number;
  is_claimed: boolean;
  claimed_at: string | null;
  period_start: string;
  period_end: string;
  period_type: string;
};

export type BankSavingsHistory = {
  period_start: string;
  period_end: string;
  period_type: string;
  amount: number;
  created_at: string;
};

export const OWNERS = ['Racky', 'Karaya', 'Richard'] as const;
export const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export type DistributionPeriod = 'monthly' | 'yearly' | 'all';

export type OwnerDistribution = {
  name: string;
  share: number;
  percentage: number;
  personalExpenses: number;
  netShare: number;
  color: string;
  isSelected: boolean;
  isDisabled: boolean;
  isClaimed: boolean;
  claimedAt: string | null;
  distributionId: string | null;
};

export type DistributionData = {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalPersonalExpenses: number;
  availableForDistribution: number;
  distribution: OwnerDistribution[];
  period: string;
  startDate: Date;
  endDate: Date;
};
