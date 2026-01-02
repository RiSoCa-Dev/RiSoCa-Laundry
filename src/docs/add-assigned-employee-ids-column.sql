-- Add assigned_employee_ids column to orders table for multi-employee assignment
-- This column stores an array of employee IDs (JSONB) for orders assigned to multiple employees

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS assigned_employee_ids JSONB DEFAULT '[]'::jsonb;

-- Create index for better query performance when filtering by assigned employees
CREATE INDEX IF NOT EXISTS idx_orders_assigned_employee_ids 
ON public.orders USING GIN (assigned_employee_ids);

-- Add comment to document the column
COMMENT ON COLUMN public.orders.assigned_employee_ids IS 'Array of employee IDs assigned to this order. Used for multi-employee assignments where load is divided equally among selected employees.';

