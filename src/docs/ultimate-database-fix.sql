-- ============================================================================
-- ULTIMATE DATABASE FIX FOR EMPLOYEE ASSIGNMENTS
-- ============================================================================
-- This script will:
-- 1. Add the assigned_employee_ids column if it doesn't exist
-- 2. Normalize all existing data to prevent duplication
-- 3. Ensure both assigned_employee_id and assigned_employee_ids are in sync
-- 4. Create necessary indexes for performance
-- ============================================================================

-- Step 1: Add the assigned_employee_ids column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'assigned_employee_ids'
    ) THEN
        ALTER TABLE public.orders 
        ADD COLUMN assigned_employee_ids JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE 'Column assigned_employee_ids added successfully';
    ELSE
        RAISE NOTICE 'Column assigned_employee_ids already exists';
    END IF;
END $$;

-- Step 2: Create index for better query performance (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_orders_assigned_employee_ids 
ON public.orders USING GIN (assigned_employee_ids);

-- Step 3: Normalize existing data
-- Update rows where assigned_employee_id exists but assigned_employee_ids is NULL or empty
UPDATE orders
SET assigned_employee_ids = jsonb_build_array(assigned_employee_id)
WHERE assigned_employee_id IS NOT NULL
  AND (assigned_employee_ids IS NULL OR assigned_employee_ids = '[]'::jsonb OR assigned_employee_ids = 'null'::jsonb);

-- Step 4: Update rows where assigned_employee_ids has a single element but assigned_employee_id is NULL
UPDATE orders
SET assigned_employee_id = (assigned_employee_ids->>0)::uuid
WHERE assigned_employee_id IS NULL
  AND assigned_employee_ids IS NOT NULL
  AND jsonb_typeof(assigned_employee_ids) = 'array'
  AND jsonb_array_length(assigned_employee_ids) = 1
  AND assigned_employee_ids != '[]'::jsonb
  AND (assigned_employee_ids->>0) IS NOT NULL;

-- Step 5: Fix mismatches where assigned_employee_id doesn't match the first element in assigned_employee_ids
UPDATE orders
SET assigned_employee_id = (assigned_employee_ids->>0)::uuid
WHERE assigned_employee_id IS NOT NULL
  AND assigned_employee_ids IS NOT NULL
  AND jsonb_typeof(assigned_employee_ids) = 'array'
  AND jsonb_array_length(assigned_employee_ids) = 1
  AND assigned_employee_id::text != (assigned_employee_ids->>0);

-- Step 6: For rows with multiple employees in assigned_employee_ids, set assigned_employee_id to the first one
UPDATE orders
SET assigned_employee_id = (assigned_employee_ids->>0)::uuid
WHERE assigned_employee_id IS NULL
  AND assigned_employee_ids IS NOT NULL
  AND jsonb_typeof(assigned_employee_ids) = 'array'
  AND jsonb_array_length(assigned_employee_ids) > 1
  AND (assigned_employee_ids->>0) IS NOT NULL;

-- Step 7: Clean up rows where both are NULL - set assigned_employee_ids to empty array for consistency
UPDATE orders
SET assigned_employee_ids = '[]'::jsonb
WHERE assigned_employee_id IS NULL
  AND (assigned_employee_ids IS NULL OR assigned_employee_ids = 'null'::jsonb);

-- Step 8: Remove any invalid JSONB values (null strings, etc.)
UPDATE orders
SET assigned_employee_ids = '[]'::jsonb
WHERE assigned_employee_ids IS NOT NULL
  AND jsonb_typeof(assigned_employee_ids) != 'array';

-- Step 9: Add comment to document the column
COMMENT ON COLUMN public.orders.assigned_employee_ids IS 'Array of employee IDs assigned to this order. Used for multi-employee assignments where load is divided equally among selected employees. This is the source of truth for employee assignments.';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check for any remaining inconsistencies
SELECT 
  'Inconsistencies Found' as check_type,
  COUNT(*) as count
FROM orders
WHERE 
  (assigned_employee_id IS NOT NULL AND (assigned_employee_ids IS NULL OR assigned_employee_ids = '[]'::jsonb))
  OR (assigned_employee_id IS NULL AND assigned_employee_ids IS NOT NULL 
      AND jsonb_typeof(assigned_employee_ids) = 'array'
      AND jsonb_array_length(assigned_employee_ids) > 0)
  OR (assigned_employee_id IS NOT NULL AND assigned_employee_ids IS NOT NULL 
      AND jsonb_typeof(assigned_employee_ids) = 'array'
      AND jsonb_array_length(assigned_employee_ids) = 1 
      AND assigned_employee_id::text != (assigned_employee_ids->>0));

-- Summary of employee assignments
SELECT 
  'Summary' as info,
  COUNT(*) FILTER (WHERE assigned_employee_id IS NOT NULL) as orders_with_single_employee,
  COUNT(*) FILTER (WHERE assigned_employee_ids IS NOT NULL 
                    AND jsonb_typeof(assigned_employee_ids) = 'array'
                    AND jsonb_array_length(assigned_employee_ids) > 1) as orders_with_multiple_employees,
  COUNT(*) FILTER (WHERE assigned_employee_id IS NULL 
                   AND (assigned_employee_ids IS NULL OR assigned_employee_ids = '[]'::jsonb)) as unassigned_orders,
  COUNT(*) as total_orders
FROM orders;

-- Sample of fixed records (first 10)
SELECT 
  id,
  assigned_employee_id,
  assigned_employee_ids,
  CASE 
    WHEN assigned_employee_id IS NOT NULL 
         AND assigned_employee_ids IS NOT NULL 
         AND jsonb_typeof(assigned_employee_ids) = 'array'
         AND jsonb_array_length(assigned_employee_ids) = 1 
         AND assigned_employee_id::text = (assigned_employee_ids->>0) THEN 'OK - Single Employee'
    WHEN assigned_employee_id IS NOT NULL 
         AND assigned_employee_ids IS NOT NULL 
         AND jsonb_typeof(assigned_employee_ids) = 'array'
         AND jsonb_array_length(assigned_employee_ids) > 1 
         AND assigned_employee_id::text = (assigned_employee_ids->>0) THEN 'OK - Multiple Employees'
    WHEN assigned_employee_id IS NULL 
         AND (assigned_employee_ids IS NULL OR assigned_employee_ids = '[]'::jsonb) THEN 'OK - Unassigned'
    ELSE 'NEEDS REVIEW'
  END as status
FROM orders
ORDER BY created_at DESC
LIMIT 10;

