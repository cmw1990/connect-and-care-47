-- Create activity logs table
CREATE TABLE activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    intensity VARCHAR(20) NOT NULL,
    calories_burned INTEGER,
    heart_rate_avg INTEGER,
    steps INTEGER,
    distance DECIMAL,
    notes TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create nutrition logs table
CREATE TABLE nutrition_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    food_items JSONB NOT NULL,
    total_calories INTEGER,
    protein DECIMAL,
    carbs DECIMAL,
    fat DECIMAL,
    fiber DECIMAL,
    water_intake DECIMAL,
    notes TEXT,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_logs
CREATE POLICY "Users can view their own activity logs"
    ON activity_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
    ON activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity logs"
    ON activity_logs FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for nutrition_logs
CREATE POLICY "Users can view their own nutrition logs"
    ON nutrition_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition logs"
    ON nutrition_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition logs"
    ON nutrition_logs FOR UPDATE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_start_time ON activity_logs(start_time);
CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_timestamp ON nutrition_logs(timestamp);
