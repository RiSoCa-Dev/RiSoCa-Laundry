-- IMPORTANT: This is a template for checking if orders exist
-- DO NOT run this unless you need to check the current state

-- Check if orders table exists and has data
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN is_paid = true THEN 1 END) as paid_orders,
  COUNT(CASE WHEN is_paid = false THEN 1 END) as unpaid_orders,
  MIN(created_at) as earliest_order,
  MAX(created_at) as latest_order
FROM public.orders;

-- Check recent orders (last 10)
SELECT 
  id,
  customer_name,
  total,
  is_paid,
  status,
  created_at
FROM public.orders
ORDER BY created_at DESC
LIMIT 10;

-- If orders are missing, you may need to:
-- 1. Check if there was a backup before the deletion
-- 2. Restore from a database backup
-- 3. Check if there's a soft delete mechanism (check for deleted_at column)
-- 4. Check RLS policies that might be hiding the data

-- Check RLS policies on orders table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'orders';

