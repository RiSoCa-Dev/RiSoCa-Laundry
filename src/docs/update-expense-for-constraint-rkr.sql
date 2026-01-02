-- Update expense_for constraint to include 'RKR' for business expenses
-- This allows expenses to be tracked for Racky, Karaya, Richard (reimbursement) or RKR (business expense)

-- Drop the existing constraint
ALTER TABLE expenses 
DROP CONSTRAINT IF EXISTS expense_for_check;

-- Add updated constraint with RKR option
ALTER TABLE expenses 
ADD CONSTRAINT expense_for_check 
CHECK (expense_for IN ('Racky', 'Karaya', 'Richard', 'RKR'));

