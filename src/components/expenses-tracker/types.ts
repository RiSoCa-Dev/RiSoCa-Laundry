import { z } from 'zod';

export const expenseSchema = z.object({
  title: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().optional(),
  expense_for: z.enum(['Racky', 'Karaya', 'Richard', 'RKR'], {
    required_error: 'Please select who this expense is for',
  }),
  incurred_on: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
export type FilterType = 'all' | 'pending' | 'reimbursed' | 'rkr';

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category?: string | null;
  expense_for: string;
  reimbursement_status: string | null;
  incurred_on?: string;
  created_at?: string;
  reimbursed_at?: string;
  date?: Date;
};

export type PendingSummary = {
  Racky: number;
  Karaya: number;
  Richard: number;
  total: number;
};
