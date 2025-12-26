-- Fix employee assignment duplication
-- This script normalizes assigned_employee_id and assigned_employee_ids to prevent duplication

-- Step 1: Update rows where assigned_employee_id exists but assigned_employee_ids is NULL or empty
-- Set assigned_employee_ids to contain the single employee ID
UPDATE orders
SET assigned_employee_ids = jsonb_build_array(assigned_employee_id)
WHERE assigned_employee_id IS NOT NULL
  AND (assigned_employee_ids IS NULL OR assigned_employee_ids = '[]'::jsonb);

-- Step 2: Update rows where assigned_employee_ids has a single element but assigned_employee_id is NULL
-- Set assigned_employee_id to the first element for backward compatibility
UPDATE orders
SET assigned_employee_id = (assigned_employee_ids->>0)::uuid
WHERE assigned_employee_id IS NULL
  AND assigned_employee_ids IS NOT NULL
  AND jsonb_array_length(assigned_employee_ids) = 1
  AND assigned_employee_ids != '[]'::jsonb;

-- Step 3: Update rows where assigned_employee_id exists and assigned_employee_ids has a single matching element
-- Ensure they match (in case of any inconsistencies)
UPDATE orders
SET assigned_employee_id = (assigned_employee_ids->>0)::uuid
WHERE assigned_employee_id IS NOT NULL
  AND assigned_employee_ids IS NOT NULL
  AND jsonb_array_length(assigned_employee_ids) = 1
  AND assigned_employee_id::text != (assigned_employee_ids->>0);

-- Step 4: For rows with multiple employees in assigned_employee_ids, set assigned_employee_id to the first one
-- This maintains backward compatibility
UPDATE orders
SET assigned_employee_id = (assigned_employee_ids->>0)::uuid
WHERE assigned_employee_id IS NULL
  AND assigned_employee_ids IS NOT NULL
  AND jsonb_array_length(assigned_employee_ids) > 1;

-- Step 5: Clean up rows where both are NULL - set assigned_employee_ids to empty array for consistency
UPDATE orders
SET assigned_employee_ids = '[]'::jsonb
WHERE assigned_employee_id IS NULL
  AND assigned_employee_ids IS NULL;

-- Verification query: Check for any remaining inconsistencies
SELECT 
  id,
  assigned_employee_id,
  assigned_employee_ids,
  CASE 
    WHEN assigned_employee_id IS NOT NULL AND assigned_employee_ids IS NULL THEN 'Missing assigned_employee_ids'
    WHEN assigned_employee_id IS NULL AND assigned_employee_ids IS NOT NULL AND jsonb_array_length(assigned_employee_ids) > 0 THEN 'Missing assigned_employee_id'
    WHEN assigned_employee_id IS NOT NULL AND assigned_employee_ids IS NOT NULL 
         AND jsonb_array_length(assigned_employee_ids) = 1 
         AND assigned_employee_id::text != (assigned_employee_ids->>0) THEN 'Mismatch'
    ELSE 'OK'
  END as status
FROM orders
WHERE 
  (assigned_employee_id IS NOT NULL AND assigned_employee_ids IS NULL)
  OR (assigned_employee_id IS NULL AND assigned_employee_ids IS NOT NULL AND jsonb_array_length(assigned_employee_ids) > 0)
  OR (assigned_employee_id IS NOT NULL AND assigned_employee_ids IS NOT NULL 
      AND jsonb_array_length(assigned_employee_ids) = 1 
      AND assigned_employee_id::text != (assigned_employee_ids->>0))
ORDER BY created_at DESC
LIMIT 50;

