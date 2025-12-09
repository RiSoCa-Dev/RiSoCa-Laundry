-- =================================================================
-- Fix for Stack Depth Limit Exceeded Error and Column Mismatch
-- 
-- Issues:
-- 1. Stack depth error suggests recursive trigger/function
-- 2. Schema shows customer/contact/load but code uses customer_name/contact_number/loads
--
-- Solution:
-- 1. Check and fix the get_latest_order_id() function
-- 2. Check for triggers that might cause recursion
-- 3. Ensure column names match between schema and code
-- =================================================================

-- Step 1: Check what triggers exist on orders table
-- Run this first to see if there are any triggers:
/*
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'orders';
*/

-- Step 2: Check actual column names in orders table
-- Run this to see the actual columns:
/*
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND table_schema = 'public'
ORDER BY ordinal_position;
*/

-- Step 3: Fix the get_latest_order_id() function to prevent recursion
DROP FUNCTION IF EXISTS get_latest_order_id();

CREATE OR REPLACE FUNCTION get_latest_order_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  latest_id TEXT;
BEGIN
  -- Direct query without any function calls that might trigger recursion
  -- Use NULLS LAST to handle NULL created_at values
  SELECT id INTO latest_id
  FROM public.orders
  WHERE created_at IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN latest_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Return NULL on any error to prevent recursion
    RETURN NULL;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_latest_order_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_order_id() TO anon;

-- Step 4: If your database has different column names, you may need to:
-- Option A: Update the database to match the code (customer_name, contact_number, loads)
-- Option B: Update the code to match the database (customer, contact, load)

-- If you need to rename columns in the database, use:
/*
ALTER TABLE public.orders RENAME COLUMN customer TO customer_name;
ALTER TABLE public.orders RENAME COLUMN contact TO contact_number;
ALTER TABLE public.orders RENAME COLUMN load TO loads;
*/

-- Or if you need to add missing columns:
/*
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS contact_number TEXT,
  ADD COLUMN IF NOT EXISTS loads INTEGER,
  ADD COLUMN IF NOT EXISTS service_package TEXT,
  ADD COLUMN IF NOT EXISTS distance NUMERIC,
  ADD COLUMN IF NOT EXISTS delivery_option TEXT,
  ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS branch_id UUID;
*/

