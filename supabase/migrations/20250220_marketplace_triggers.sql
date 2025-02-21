-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update provider satisfaction score
CREATE OR REPLACE FUNCTION update_provider_satisfaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketplace_providers
    SET satisfaction_score = (
        SELECT AVG(rating)
        FROM marketplace_orders
        WHERE provider_id = NEW.provider_id
        AND rating IS NOT NULL
    )
    WHERE id = NEW.provider_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer satisfaction score
CREATE OR REPLACE FUNCTION update_customer_satisfaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketplace_customers
    SET satisfaction_score = (
        SELECT AVG(rating)
        FROM marketplace_orders
        WHERE customer_id = NEW.customer_id
        AND rating IS NOT NULL
    )
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to track provider activity
CREATE OR REPLACE FUNCTION update_provider_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketplace_providers
    SET last_active_at = now()
    WHERE id = NEW.provider_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to track customer activity
CREATE OR REPLACE FUNCTION update_customer_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketplace_customers
    SET last_active_at = now()
    WHERE id = NEW.customer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle subscription status changes
CREATE OR REPLACE FUNCTION handle_subscription_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Track the status change in analytics_events
    IF NEW.status != OLD.status THEN
        INSERT INTO analytics_events (
            session_id,
            category,
            action,
            label,
            metadata
        ) VALUES (
            uuid_generate_v4(),
            'subscription'::analytics_category,
            'status_changed',
            NEW.status::text,
            jsonb_build_object(
                'subscription_id', NEW.id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'customer_id', NEW.customer_id,
                'provider_id', NEW.provider_id
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle order status changes
CREATE OR REPLACE FUNCTION handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Track the status change in analytics_events
    IF NEW.status != OLD.status THEN
        INSERT INTO analytics_events (
            session_id,
            category,
            action,
            label,
            metadata
        ) VALUES (
            uuid_generate_v4(),
            'order'::analytics_category,
            'status_changed',
            NEW.status::text,
            jsonb_build_object(
                'order_id', NEW.id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'customer_id', NEW.customer_id,
                'provider_id', NEW.provider_id
            )
        );
        
        -- Update completion time if order is completed
        IF NEW.status = 'completed' THEN
            NEW.completed_at = now();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_marketplace_products_updated_at
    BEFORE UPDATE ON marketplace_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_marketplace_subscriptions_updated_at
    BEFORE UPDATE ON marketplace_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create triggers for updating satisfaction scores
CREATE TRIGGER update_provider_satisfaction_score
    AFTER INSERT OR UPDATE OF rating ON marketplace_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_satisfaction();

CREATE TRIGGER update_customer_satisfaction_score
    AFTER INSERT OR UPDATE OF rating ON marketplace_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_satisfaction();

-- Create triggers for tracking activity
CREATE TRIGGER track_provider_activity
    AFTER INSERT OR UPDATE ON marketplace_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_last_active();

CREATE TRIGGER track_customer_activity
    AFTER INSERT OR UPDATE ON marketplace_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_last_active();

-- Create triggers for status changes
CREATE TRIGGER track_subscription_status_changes
    BEFORE UPDATE OF status ON marketplace_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION handle_subscription_status_change();

CREATE TRIGGER track_order_status_changes
    BEFORE UPDATE OF status ON marketplace_orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_status_change();
