-- Create RPC function to fetch order by ID and customer name
-- This function bypasses RLS, allowing anyone (logged in or not) to search for orders
-- by providing both the order ID and customer name for verification
-- 
-- IMPORTANT: Run this in your Supabase SQL Editor

-- Drop function if it exists (to recreate)
DROP FUNCTION IF EXISTS get_order_by_id_and_name(TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_order_by_id_and_name(
  p_order_id TEXT,
  p_customer_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'id', o.id,
    'customer_id', o.customer_id,
    'branch_id', o.branch_id,
    'customer_name', o.customer_name,
    'contact_number', o.contact_number,
    'service_package', o.service_package,
    'weight', o.weight,
    'loads', o.loads,
    'distance', o.distance,
    'delivery_option', o.delivery_option,
    'status', o.status,
    'total', o.total,
    'is_paid', o.is_paid,
    'created_at', o.created_at,
    'updated_at', o.updated_at,
    'order_status_history', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', osh.id,
            'order_id', osh.order_id,
            'status', osh.status,
            'note', osh.note,
            'created_at', osh.created_at
          )
        )
        FROM order_status_history osh
        WHERE osh.order_id = o.id
        ORDER BY osh.created_at ASC
      ),
      '[]'::json
    )
  ) INTO result
  FROM orders o
  WHERE LOWER(o.id) = LOWER(p_order_id)
    AND LOWER(o.customer_name) LIKE '%' || LOWER(p_customer_name) || '%'
  LIMIT 1;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_order_by_id_and_name(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_by_id_and_name(TEXT, TEXT) TO anon;

-- Add comment
COMMENT ON FUNCTION get_order_by_id_and_name IS 'Fetches an order by ID and customer name with case-insensitive matching. Bypasses RLS for public order lookup. Returns JSON object.';
