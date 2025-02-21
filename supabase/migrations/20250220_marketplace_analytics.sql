-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id uuid NOT NULL,
    category text NOT NULL,
    action text NOT NULL,
    label text,
    value numeric,
    metadata jsonb,
    timestamp timestamptz DEFAULT now() NOT NULL
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id uuid NOT NULL,
    name text NOT NULL,
    value numeric NOT NULL,
    unit text NOT NULL,
    metadata jsonb,
    timestamp timestamptz DEFAULT now() NOT NULL
);

-- Marketplace Orders Table
CREATE TABLE IF NOT EXISTS marketplace_orders (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id uuid REFERENCES auth.users(id),
    provider_id uuid REFERENCES marketplace_providers(id),
    product_id uuid REFERENCES marketplace_products(id),
    status text NOT NULL,
    total_amount numeric NOT NULL,
    rating numeric CHECK (rating >= 0 AND rating <= 5),
    has_issues boolean DEFAULT false,
    issue_resolved boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL,
    completed_at timestamptz,
    metadata jsonb
);

-- Marketplace Providers Table
CREATE TABLE IF NOT EXISTS marketplace_providers (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    status text NOT NULL,
    date_of_birth date,
    satisfaction_score numeric CHECK (satisfaction_score >= 0 AND satisfaction_score <= 5),
    created_at timestamptz DEFAULT now() NOT NULL,
    last_active_at timestamptz DEFAULT now(),
    metadata jsonb
);

-- Marketplace Products Table
CREATE TABLE IF NOT EXISTS marketplace_products (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    category text NOT NULL,
    price numeric NOT NULL,
    provider_id uuid REFERENCES marketplace_providers(id),
    status text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now(),
    metadata jsonb
);

-- Marketplace Subscriptions Table
CREATE TABLE IF NOT EXISTS marketplace_subscriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id uuid REFERENCES auth.users(id),
    provider_id uuid REFERENCES marketplace_providers(id),
    plan_id text NOT NULL,
    status text NOT NULL,
    amount numeric NOT NULL,
    billing_cycle text NOT NULL,
    start_date timestamptz NOT NULL,
    end_date timestamptz,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now(),
    metadata jsonb
);

-- Marketplace Customers Table
CREATE TABLE IF NOT EXISTS marketplace_customers (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    name text NOT NULL,
    email text NOT NULL,
    date_of_birth date,
    satisfaction_score numeric CHECK (satisfaction_score >= 0 AND satisfaction_score <= 5),
    acquisition_cost numeric,
    created_at timestamptz DEFAULT now() NOT NULL,
    last_active_at timestamptz DEFAULT now(),
    metadata jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_customer ON marketplace_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_provider ON marketplace_orders(provider_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_created ON marketplace_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_providers_status ON marketplace_providers(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_subscriptions_status ON marketplace_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_subscriptions_customer ON marketplace_subscriptions(customer_id);

-- RLS Policies

-- Analytics Events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Analytics events are viewable by authenticated users with admin role"
ON analytics_events FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

CREATE POLICY "Analytics events are insertable by any authenticated user"
ON analytics_events FOR INSERT
TO authenticated
WITH CHECK (true);

-- Performance Metrics
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Performance metrics are viewable by authenticated users with admin role"
ON performance_metrics FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

CREATE POLICY "Performance metrics are insertable by any authenticated user"
ON performance_metrics FOR INSERT
TO authenticated
WITH CHECK (true);

-- Marketplace Orders
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders are viewable by admin users"
ON marketplace_orders FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
    OR customer_id = auth.uid()
    OR provider_id IN (
        SELECT id FROM marketplace_providers
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Orders are insertable by customers"
ON marketplace_orders FOR INSERT
TO authenticated
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Orders are updatable by involved parties"
ON marketplace_orders FOR UPDATE
TO authenticated
USING (
    customer_id = auth.uid()
    OR provider_id IN (
        SELECT id FROM marketplace_providers
        WHERE user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

-- Marketplace Providers
ALTER TABLE marketplace_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers are viewable by all authenticated users"
ON marketplace_providers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Providers can be managed by admin users"
ON marketplace_providers FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

CREATE POLICY "Providers can update their own profile"
ON marketplace_providers FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Marketplace Products
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by all authenticated users"
ON marketplace_products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Products can be managed by admin users and their providers"
ON marketplace_products FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
    OR provider_id IN (
        SELECT id FROM marketplace_providers
        WHERE user_id = auth.uid()
    )
);

-- Marketplace Subscriptions
ALTER TABLE marketplace_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subscriptions are viewable by admin users"
ON marketplace_subscriptions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
    OR customer_id = auth.uid()
    OR provider_id IN (
        SELECT id FROM marketplace_providers
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Subscriptions can be managed by admin users"
ON marketplace_subscriptions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

-- Marketplace Customers
ALTER TABLE marketplace_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers are viewable by admin users"
ON marketplace_customers FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
    OR user_id = auth.uid()
);

CREATE POLICY "Customers can update their own profile"
ON marketplace_customers FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Customers can be managed by admin users"
ON marketplace_customers FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

-- Functions for analytics

-- Function to calculate provider performance metrics
CREATE OR REPLACE FUNCTION get_provider_performance(
    provider_id uuid,
    start_date timestamptz,
    end_date timestamptz
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'orders_completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'total_revenue', COALESCE(SUM(total_amount) FILTER (WHERE status = 'completed'), 0),
        'average_rating', COALESCE(AVG(rating) FILTER (WHERE rating IS NOT NULL), 0),
        'response_time', COALESCE(
            AVG(
                EXTRACT(EPOCH FROM (completed_at - created_at)) / 60
            ) FILTER (WHERE status = 'completed'),
            0
        ),
        'issue_rate', COALESCE(
            COUNT(*) FILTER (WHERE has_issues) * 100.0 / NULLIF(COUNT(*), 0),
            0
        )
    )
    INTO result
    FROM marketplace_orders
    WHERE provider_id = get_provider_performance.provider_id
    AND created_at >= start_date
    AND created_at <= end_date;

    RETURN result;
END;
$$;

-- Function to calculate subscription metrics
CREATE OR REPLACE FUNCTION get_subscription_metrics(
    start_date timestamptz,
    end_date timestamptz
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
    total_active int;
    total_subscriptions int;
    mrr numeric;
BEGIN
    SELECT COUNT(*), COALESCE(SUM(amount), 0)
    INTO total_active, mrr
    FROM marketplace_subscriptions
    WHERE status IN ('active', 'trialing')
    AND start_date <= end_date
    AND (end_date IS NULL OR end_date >= start_date);

    SELECT COUNT(*)
    INTO total_subscriptions
    FROM marketplace_subscriptions
    WHERE start_date <= end_date
    AND (end_date IS NULL OR end_date >= start_date);

    SELECT jsonb_build_object(
        'total_active', total_active,
        'total_subscriptions', total_subscriptions,
        'mrr', mrr,
        'arpu', CASE WHEN total_active > 0 THEN mrr / total_active ELSE 0 END,
        'churn_rate', CASE 
            WHEN total_active > 0 THEN
                (SELECT COUNT(*) * 100.0 / total_active
                FROM marketplace_subscriptions
                WHERE status = 'canceled'
                AND end_date BETWEEN start_date AND end_date)
            ELSE 0
        END
    )
    INTO result;

    RETURN result;
END;
$$;
