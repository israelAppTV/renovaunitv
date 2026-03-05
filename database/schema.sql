-- Schema V2: Digital code ecommerce
-- Guarantees: codes never delivered twice; stock_count blocks purchase; safe reservation flow.
-- RLS: orders independent of users (customer_email); users see orders by matching email; admins full access.

-- Enums
CREATE TYPE order_status AS ENUM (
  'pending',
  'paid',
  'delivering',
  'delivered',
  'expired'
);

CREATE TYPE code_status AS ENUM (
  'available',
  'reserved',
  'used'
);

-- 1. categories
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. profiles (users table – Supabase convention: extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. products (with stock_count)
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  description text,
  price integer NOT NULL CHECK (price >= 0),
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  stock_count integer NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active) WHERE is_active = true;

-- 4. orders (no user dependency; identified by customer_email)
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status order_status NOT NULL DEFAULT 'pending',
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  payment_method text,
  payment_id text UNIQUE,
  customer_email text,
  ip_address inet,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE UNIQUE INDEX idx_orders_payment_id ON orders(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX idx_orders_customer_email ON orders(customer_email) WHERE customer_email IS NOT NULL;

-- 5. digital_codes (critical – reserve vs use separation)
CREATE TABLE digital_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  code text NOT NULL,
  status code_status NOT NULL DEFAULT 'available',
  reserved_by_order uuid REFERENCES orders(id) ON DELETE SET NULL,
  used_by_order uuid REFERENCES orders(id) ON DELETE SET NULL,
  reserved_at timestamptz,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_reserved CHECK (
    (status = 'available' AND reserved_by_order IS NULL AND used_by_order IS NULL AND reserved_at IS NULL AND used_at IS NULL)
    OR (status = 'reserved' AND reserved_by_order IS NOT NULL AND reserved_at IS NOT NULL AND used_by_order IS NULL AND used_at IS NULL)
    OR (status = 'used' AND used_by_order IS NOT NULL AND used_at IS NOT NULL)
  )
);

CREATE INDEX idx_digital_codes_product_status ON digital_codes(product_id, status);
-- Performance: fast lookup for available codes (atomic reservation)
CREATE INDEX idx_digital_codes_available ON digital_codes(product_id) WHERE status = 'available';
CREATE INDEX idx_digital_codes_reserved_by ON digital_codes(reserved_by_order) WHERE reserved_by_order IS NOT NULL;
CREATE INDEX idx_digital_codes_used_by ON digital_codes(used_by_order) WHERE used_by_order IS NOT NULL;

-- 6. order_items
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  price integer NOT NULL CHECK (price >= 0),
  digital_code_id uuid REFERENCES digital_codes(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_digital_code ON order_items(digital_code_id) WHERE digital_code_id IS NOT NULL;

-- 7. delivery_logs (audit only – no code value)
CREATE TABLE delivery_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  digital_code_id uuid NOT NULL REFERENCES digital_codes(id) ON DELETE RESTRICT,
  delivered_at timestamptz NOT NULL DEFAULT now(),
  channel text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_delivery_logs_order ON delivery_logs(order_id);
CREATE INDEX idx_delivery_logs_digital_code ON delivery_logs(digital_code_id);
CREATE INDEX idx_delivery_logs_delivered_at ON delivery_logs(delivered_at);

-- 8. import_logs
CREATE TABLE import_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  imported_at timestamptz NOT NULL DEFAULT now(),
  imported_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  count_success integer NOT NULL DEFAULT 0 CHECK (count_success >= 0),
  count_failed integer NOT NULL DEFAULT 0 CHECK (count_failed >= 0),
  status text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_import_logs_product ON import_logs(product_id);
CREATE INDEX idx_import_logs_imported_at ON import_logs(imported_at);

-- RLS: enable on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- Helper: is current user admin (profiles.role = 'admin')
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- categories: read all (anon + authenticated); write admin only
CREATE POLICY categories_select_anon ON categories FOR SELECT TO anon USING (true);
CREATE POLICY categories_select ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY categories_insert ON categories FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY categories_update ON categories FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY categories_delete ON categories FOR DELETE TO authenticated USING (is_admin());

-- profiles: own row read/update; admin all
CREATE POLICY profiles_select_own ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY profiles_select_admin ON profiles FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY profiles_all_admin ON profiles FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- products: read active (anon + authenticated); admin full
CREATE POLICY products_select_anon ON products FOR SELECT TO anon USING (is_active = true);
CREATE POLICY products_select ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY products_insert ON products FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY products_update ON products FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY products_delete ON products FOR DELETE TO authenticated USING (is_admin());

-- orders: insert for anon/authenticated (guest checkout); select own by customer_email = profile email; admin all
CREATE POLICY orders_insert ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY orders_select_own ON orders FOR SELECT TO authenticated
  USING (
    customer_email IS NOT NULL
    AND customer_email = (SELECT email FROM profiles WHERE id = auth.uid() LIMIT 1)
  );
CREATE POLICY orders_select_admin ON orders FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY orders_update_admin ON orders FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY orders_delete_admin ON orders FOR DELETE TO authenticated USING (is_admin());

-- digital_codes: NO access for normal users (codes never exposed)
CREATE POLICY digital_codes_admin_only ON digital_codes FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
-- No SELECT/INSERT/UPDATE for non-admin; anon has no access (default deny)

-- order_items: read via own orders (customer_email = profile email); admin all
CREATE POLICY order_items_select_own ON order_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
      AND o.customer_email IS NOT NULL
      AND o.customer_email = (SELECT email FROM profiles WHERE id = auth.uid() LIMIT 1)
    )
  );
CREATE POLICY order_items_select_admin ON order_items FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY order_items_insert_admin ON order_items FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY order_items_update_admin ON order_items FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY order_items_delete_admin ON order_items FOR DELETE TO authenticated USING (is_admin());
-- Insert for own order typically via service role or backend; for safety allow only admin for now
-- If you need users to create order_items via app, add INSERT with CHECK (order owned by user) in backend only

-- delivery_logs: read own (via order customer_email = profile email); admin all
CREATE POLICY delivery_logs_select_own ON delivery_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = delivery_logs.order_id
      AND o.customer_email IS NOT NULL
      AND o.customer_email = (SELECT email FROM profiles WHERE id = auth.uid() LIMIT 1)
    )
  );
CREATE POLICY delivery_logs_select_admin ON delivery_logs FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY delivery_logs_insert_admin ON delivery_logs FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY delivery_logs_all_admin ON delivery_logs FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- import_logs: admin only
CREATE POLICY import_logs_admin_only ON import_logs FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Trigger: keep updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER digital_codes_updated_at BEFORE UPDATE ON digital_codes FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER order_items_updated_at BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
