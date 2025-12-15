-- Create RPC function to fetch order by ID and customer name
-- This function bypasses RLS, allowing anyone (logged in or not) to search for orders
-- by providing both the order ID and customer name for verification

CREATE OR REPLACE FUNCTION get_order_by_id_and_name(
  p_order_id TEXT,
  p_customer_name TEXT
)
RETURNS TABLE (
  id TEXT,
  customer_id UUID,
  branch_id UUID,
  customer_name TEXT,
  contact_number TEXT,
  service_package TEXT,
  weight NUMERIC,
  loads INTEGER,
  distance NUMERIC,
  delivery_option TEXT,
  status TEXT,
  total NUMERIC,
  is_paid BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  order_status_history JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.customer_id,
    o.branch_id,
    o.customer_name,
    o.contact_number,
    o.service_package,
    o.weight,
    o.loads,
    o.distance,
    o.delivery_option,
    o.status,
    o.total,
    o.is_paid,
    o.created_at,
    o.updated_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
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
      '[]'::jsonb
    ) as order_status_history
  FROM orders o
  WHERE LOWER(o.id) = LOWER(p_order_id)
    AND LOWER(o.customer_name) LIKE '%' || LOWER(p_customer_name) || '%'
  LIMIT 1;
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_order_by_id_and_name(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_order_by_id_and_name(TEXT, TEXT) TO anon;

-- Add comment
COMMENT ON FUNCTION get_order_by_id_and_name IS 'Fetches an order by ID and customer name with case-insensitive matching. Bypasses RLS for public order lookup.';
