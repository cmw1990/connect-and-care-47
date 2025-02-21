-- Provider status enum
CREATE TYPE provider_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'inactive'
);

-- Order status enum
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'in_progress',
    'completed',
    'canceled',
    'refunded'
);

-- Subscription status enum
CREATE TYPE subscription_status AS ENUM (
    'trialing',
    'active',
    'past_due',
    'canceled',
    'incomplete'
);

-- Product status enum
CREATE TYPE product_status AS ENUM (
    'draft',
    'published',
    'archived',
    'out_of_stock'
);

-- Billing cycle enum
CREATE TYPE billing_cycle AS ENUM (
    'monthly',
    'quarterly',
    'yearly'
);

-- Analytics event category enum
CREATE TYPE analytics_category AS ENUM (
    'marketplace',
    'provider',
    'customer',
    'order',
    'subscription',
    'product'
);

-- Metric unit enum
CREATE TYPE metric_unit AS ENUM (
    'currency',
    'time',
    'count',
    'percentage'
);

-- Convert existing text columns to use the new types
ALTER TABLE marketplace_providers 
    ALTER COLUMN status TYPE provider_status 
    USING status::provider_status;

ALTER TABLE marketplace_orders 
    ALTER COLUMN status TYPE order_status 
    USING status::order_status;

ALTER TABLE marketplace_subscriptions 
    ALTER COLUMN status TYPE subscription_status 
    USING status::subscription_status,
    ALTER COLUMN billing_cycle TYPE billing_cycle 
    USING billing_cycle::billing_cycle;

ALTER TABLE marketplace_products 
    ALTER COLUMN status TYPE product_status 
    USING status::product_status;

ALTER TABLE analytics_events 
    ALTER COLUMN category TYPE analytics_category 
    USING category::analytics_category;

ALTER TABLE performance_metrics 
    ALTER COLUMN unit TYPE metric_unit 
    USING unit::metric_unit;
