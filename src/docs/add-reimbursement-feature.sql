-- Add reimbursement tracking feature to expenses table
-- This allows tracking when personal expenses (Racky, Karaya, Richard) are reimbursed and transferred to RKR

-- Step 1: Add reimbursement_status column
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS reimbursement_status TEXT 
  CHECK (reimbursement_status IN ('pending', 'reimbursed')) 
  DEFAULT NULL;

-- Step 2: Add reimbursed_at timestamp
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS reimbursed_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Add reimbursed_by user reference
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS reimbursed_by UUID REFERENCES auth.users(id);

-- Step 4: Add index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_expenses_reimbursement_status 
ON expenses(reimbursement_status) 
WHERE reimbursement_status IS NOT NULL;

-- Step 5: Update existing personal expenses to 'pending' status
-- Only update expenses that are for Racky, Karaya, or Richard and don't have a status yet
UPDATE expenses 
SET reimbursement_status = 'pending' 
WHERE expense_for IN ('Racky', 'Karaya', 'Richard') 
  AND reimbursement_status IS NULL;

-- Step 6: Add comment to document the feature
COMMENT ON COLUMN expenses.reimbursement_status IS 'Tracks reimbursement status: NULL for RKR expenses, ''pending'' for personal expenses awaiting reimbursement, ''reimbursed'' for expenses that have been reimbursed and transferred to RKR';
COMMENT ON COLUMN expenses.reimbursed_at IS 'Timestamp when the expense was marked as reimbursed';
COMMENT ON COLUMN expenses.reimbursed_by IS 'User ID of the admin who processed the reimbursement';

