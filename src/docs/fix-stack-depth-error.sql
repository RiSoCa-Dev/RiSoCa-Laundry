-- =================================================================
-- Fix for Stack Depth Limit Exceeded Error
-- 
-- Problem: When inserting an order, there might be a recursive trigger
-- or the get_latest_order_id() function is being called during INSERT
-- which causes infinite recursion.
--
-- Solution: 
-- 1. Check for any triggers on orders table that might cause recursion
-- 2. Modify the function to use SET search_path and ensure isolation
-- 3. Make sure the function doesn't trigger any other functions
-- =================================================================

-- First, check for triggers on orders table (run this to see what triggers exist)
-- SELECT trigger_name, event_manipulation, event_object_table, action_statement 
-- FROM information_schema.triggers 
-- WHERE event_object_table = 'orders';

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_latest_order_id();

-- Recreate with better isolation and no function calls
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

-- Also check if there are any triggers that might be causing recursion
-- If you find triggers, you may need to disable or modify them temporarily
-- to test if they're causing the issue
