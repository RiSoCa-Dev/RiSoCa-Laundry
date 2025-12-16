-- Add expense_for column to expenses table
-- This column tracks who the expense is for (Racky, Karaya, or Richard)
-- Required field - no null values allowed

-- First, add the column as nullable temporarily to handle existing data
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS expense_for TEXT;

-- Update existing records to have a default value (you may want to manually set these)
-- For now, setting to 'Racky' as default for existing records
UPDATE expenses 
SET expense_for = 'Karaya' 
WHERE expense_for IS NULL;

-- Now make it NOT NULL
ALTER TABLE expenses 
ALTER COLUMN expense_for SET NOT NULL;

-- Add a check constraint to ensure only valid values
ALTER TABLE expenses 
ADD CONSTRAINT expense_for_check 
CHECK (expense_for IN ('Racky', 'Karaya', 'Richard'));

