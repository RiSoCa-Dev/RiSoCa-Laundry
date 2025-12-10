-- =================================================================
-- RKR Laundry - Complete Database Schema
-- 
-- This file contains all table definitions, triggers, functions, and RLS policies
-- =================================================================

-- =================================================================
-- TRIGGER FUNCTION
-- =================================================================
CREATE OR REPLACE FUNCTION set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- PROFILES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT NULL,
  last_name TEXT NULL,
  role TEXT NOT NULL DEFAULT 'customer'::text,
  phone TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_role_check CHECK (
    role = ANY (
      ARRAY[
        'customer'::text,
        'admin'::text,
        'rider'::text,
        'staff'::text
      ]
    )
  )
) TABLESPACE pg_default;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
CREATE POLICY "Allow users to view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
CREATE POLICY "Allow users to insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
CREATE POLICY "Allow users to update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Allow admin to view all profiles" ON public.profiles;
CREATE POLICY "Allow admin to view all profiles"
ON public.profiles FOR SELECT
USING (is_admin());

DROP POLICY IF EXISTS "Allow admin to insert profiles" ON public.profiles;
CREATE POLICY "Allow admin to insert profiles"
ON public.profiles FOR INSERT
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Allow admin to update all profiles" ON public.profiles;
CREATE POLICY "Allow admin to update all profiles"
ON public.profiles FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- =================================================================
-- BRANCHES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NULL,
  latitude NUMERIC NULL,
  longitude NUMERIC NULL,
  phone TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT branches_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

DROP TRIGGER IF EXISTS branches_updated_at ON public.branches;
CREATE TRIGGER branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW
  EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Enable RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for branches (public read, admin write)
DROP POLICY IF EXISTS "Allow public read access on branches" ON public.branches;
CREATE POLICY "Allow public read access on branches"
ON public.branches FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin to manage branches" ON public.branches;
CREATE POLICY "Allow admin to manage branches"
ON public.branches FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =================================================================
-- SERVICE_RATES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS public.service_rates (
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT service_rates_pkey PRIMARY KEY (id),
  CONSTRAINT service_rates_type_check CHECK (
    type = ANY (ARRAY['service'::text, 'delivery'::text])
  )
) TABLESPACE pg_default;

DROP TRIGGER IF EXISTS service_rates_updated_at ON public.service_rates;
CREATE TRIGGER service_rates_updated_at
  BEFORE UPDATE ON public.service_rates
  FOR EACH ROW
  EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Enable RLS
ALTER TABLE public.service_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_rates
DROP POLICY IF EXISTS "Allow public read access on service_rates" ON public.service_rates;
CREATE POLICY "Allow public read access on service_rates"
ON public.service_rates FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin to update service_rates" ON public.service_rates;
CREATE POLICY "Allow admin to update service_rates"
ON public.service_rates FOR UPDATE
USING (is_admin());

DROP POLICY IF EXISTS "Allow admin to insert service_rates" ON public.service_rates;
CREATE POLICY "Allow admin to insert service_rates"
ON public.service_rates FOR INSERT
WITH CHECK (is_admin());

-- =================================================================
-- ORDERS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT NOT NULL,
  customer_id UUID NOT NULL,
  branch_id UUID NULL,
  customer_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  service_package TEXT NOT NULL,
  weight NUMERIC NOT NULL,
  loads INTEGER NOT NULL,
  distance NUMERIC NULL,
  delivery_option TEXT NULL,
  status TEXT NOT NULL,
  total NUMERIC NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT orders_service_package_check CHECK (
    service_package = ANY (
      ARRAY[
        'package1'::text,
        'package2'::text,
        'package3'::text
      ]
    )
  )
) TABLESPACE pg_default;

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF auth.role() != 'authenticated' THEN
    RETURN FALSE;
  END IF;
  
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, '') = 'admin';
END;
$$;

-- RLS Policies for orders
DROP POLICY IF EXISTS "Allow customer to view their own orders" ON public.orders;
CREATE POLICY "Allow customer to view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Allow customer to insert their own orders" ON public.orders;
CREATE POLICY "Allow customer to insert their own orders"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Allow customer to update their own orders" ON public.orders;
CREATE POLICY "Allow customer to update their own orders"
ON public.orders FOR UPDATE
USING (auth.uid() = customer_id)
WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Allow admin to view all orders" ON public.orders;
CREATE POLICY "Allow admin to view all orders"
ON public.orders FOR SELECT
USING (is_admin());

DROP POLICY IF EXISTS "Allow admin to update all orders" ON public.orders;
CREATE POLICY "Allow admin to update all orders"
ON public.orders FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Allow admin to insert orders" ON public.orders;
CREATE POLICY "Allow admin to insert orders"
ON public.orders FOR INSERT
WITH CHECK (is_admin());

-- =================================================================
-- ORDER_STATUS_HISTORY TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT order_status_history_pkey PRIMARY KEY (id),
  CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_status_history
DROP POLICY IF EXISTS "Allow users to view their order history" ON public.order_status_history;
CREATE POLICY "Allow users to view their order history"
ON public.order_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_status_history.order_id
    AND orders.customer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Allow users to insert their order history" ON public.order_status_history;
CREATE POLICY "Allow users to insert their order history"
ON public.order_status_history FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_status_history.order_id
    AND orders.customer_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Allow admin to manage order history" ON public.order_status_history;
CREATE POLICY "Allow admin to manage order history"
ON public.order_status_history FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =================================================================
-- EXPENSES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  branch_id UUID NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NULL,
  incurred_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for expenses (admin only)
DROP POLICY IF EXISTS "Allow admin to manage expenses" ON public.expenses;
CREATE POLICY "Allow admin to manage expenses"
ON public.expenses FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =================================================================
-- SALARIES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS public.salaries (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  staff_id UUID NULL,
  branch_id UUID NULL,
  amount NUMERIC NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT salaries_pkey PRIMARY KEY (id),
  CONSTRAINT salaries_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  CONSTRAINT salaries_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES profiles(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for salaries (admin only)
DROP POLICY IF EXISTS "Allow admin to manage salaries" ON public.salaries;
CREATE POLICY "Allow admin to manage salaries"
ON public.salaries FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =================================================================
-- NOTIFICATIONS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NULL,
  title TEXT NOT NULL,
  body TEXT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Allow users to view their own notifications" ON public.notifications;
CREATE POLICY "Allow users to view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow users to update their own notifications" ON public.notifications;
CREATE POLICY "Allow users to update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow admin to manage all notifications" ON public.notifications;
CREATE POLICY "Allow admin to manage all notifications"
ON public.notifications FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- =================================================================
-- HELPER FUNCTION: Get Latest Order ID
-- =================================================================
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
  SELECT id INTO latest_id
  FROM public.orders
  WHERE created_at IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN latest_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION get_latest_order_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_latest_order_id() TO anon;
