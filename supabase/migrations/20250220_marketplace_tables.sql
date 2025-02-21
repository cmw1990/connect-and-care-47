-- Create enum types
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'out_of_stock');
CREATE TYPE service_status AS ENUM ('active', 'inactive', 'booked');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE target_type AS ENUM ('product', 'service', 'provider');

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    stock INTEGER NOT NULL DEFAULT 0,
    images JSONB NOT NULL DEFAULT '[]',
    specifications JSONB,
    features TEXT[],
    brand TEXT,
    rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    status product_status NOT NULL DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    provider_id UUID NOT NULL REFERENCES auth.users(id),
    pricing JSONB NOT NULL,
    availability JSONB,
    requirements TEXT[],
    features TEXT[],
    rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    status service_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    type TEXT NOT NULL CHECK (type IN ('product', 'service')),
    items JSONB NOT NULL,
    status order_status NOT NULL DEFAULT 'pending',
    shipping JSONB,
    payment JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    target_id UUID NOT NULL,
    target_type target_type NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    images JSONB,
    verified BOOLEAN NOT NULL DEFAULT false,
    helpful INTEGER NOT NULL DEFAULT 0,
    response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Review helpful tracking
CREATE TABLE review_helpful (
    review_id UUID NOT NULL REFERENCES reviews(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (review_id, user_id)
);

-- Functions
CREATE OR REPLACE FUNCTION decrease_product_stock(product_id UUID, quantity INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE products
    SET stock = stock - quantity,
        status = CASE 
            WHEN stock - quantity <= 0 THEN 'out_of_stock'::product_status
            ELSE status
        END
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_review_helpful(review_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE reviews
    SET helpful = helpful + 1
    WHERE id = review_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies

-- Products policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
ON products FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Products can be created by admin users"
ON products FOR INSERT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

CREATE POLICY "Products can be updated by admin users"
ON products FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

-- Services policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are viewable by everyone"
ON services FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Services can be created by providers"
ON services FOR INSERT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'provider'
    )
);

CREATE POLICY "Services can be updated by their providers"
ON services FOR UPDATE
TO authenticated
USING (provider_id = auth.uid());

-- Orders policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admin can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

CREATE POLICY "Users can create their own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can update any order"
ON orders FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.role = 'admin'
    )
);

-- Reviews policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
ON reviews FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews"
ON reviews FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Review helpful policies
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Review helpful entries are viewable by everyone"
ON review_helpful FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Authenticated users can mark reviews as helpful"
ON review_helpful FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_provider_id ON services(provider_id);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_rating ON services(rating);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_reviews_target_id_type ON reviews(target_id, target_type);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
