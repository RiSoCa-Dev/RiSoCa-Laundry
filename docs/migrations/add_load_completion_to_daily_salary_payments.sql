-- Migration: Add load_completion field to daily_salary_payments table
-- Description: Add JSONB column to track load completion status for salary calculation
-- Date: 2026-01-XX

ALTER TABLE daily_salary_payments 
ADD COLUMN IF NOT EXISTS load_completion JSONB DEFAULT '{}'::jsonb;

-- Structure of load_completion JSONB:
-- {
--   "order_id": {
--     "completed_loads": [1, 2],  // Array of load indices (1-based) that are completed
--     "incomplete_loads": [3],    // Array of load indices (1-based) that are not done
--     "next_day_employee_id": "employee_id"  // Optional: employee assigned for next day
--   }
-- }
