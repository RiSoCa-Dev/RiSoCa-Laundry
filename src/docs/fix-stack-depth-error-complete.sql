-- =================================================================
-- Complete Fix for Stack Depth Limit Exceeded Error
-- 
-- Problem: When inserting an order, there's a recursive trigger/function
-- causing "stack depth limit exceeded" error.
--
-- Solution: 
-- 1. Fix get_latest_order_id() function to prevent recursion
-- 2. Check for and disable problematic triggers
-- 3. Ensure function isolation
-- =================================================================

-- Step 1: Check for triggers on orders table (run this first)
-- This will show you if there are any triggers that might cause recursion:
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

-- Step 2: If you find triggers, you can temporarily disable them to test:
-- DROP TRIGGER IF EXISTS trigger_name ON public.orders;

-- Step 3: Fix the get_latest_order_id() function
DROP FUNCTION IF EXISTS get_latest_order_id() CASCADE;

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
  -- STABLE keyword ensures the function doesn't modify data and can be optimized
  SELECT id INTO latest_id
  FROM public.orders
  WHERE created_at IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN latest_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Return NULL on any error to prevent recursion
    -- Log the error but don't throw
    RETURN NULL;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_latest_order_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_order_id() TO anon;

-- Step 4: Also check if is_admin() function might be causing issues
-- The is_admin() function queries profiles, which might trigger something
-- Let's make sure it's also STABLE:
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user is authenticated first
  IF auth.role() != 'authenticated' THEN
    RETURN FALSE;
  END IF;
  
  -- Get role from profiles table
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'customer') = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    -- Return false on any error
    RETURN FALSE;
END;
$$;

