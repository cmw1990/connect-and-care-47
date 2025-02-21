-- Create mood tracking table
CREATE TABLE mood_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
    energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
    stress_level INTEGER NOT NULL CHECK (stress_level BETWEEN 1 AND 10),
    anxiety_level INTEGER NOT NULL CHECK (anxiety_level BETWEEN 1 AND 10),
    activities TEXT[],
    triggers TEXT[],
    coping_strategies TEXT[],
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wellness goals table
CREATE TABLE wellness_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL,
    current_value DECIMAL,
    unit VARCHAR(50),
    start_date DATE NOT NULL,
    target_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    reminders BOOLEAN DEFAULT false,
    reminder_frequency VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create emergency contacts table
CREATE TABLE emergency_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    primary_phone VARCHAR(20) NOT NULL,
    secondary_phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    is_primary BOOLEAN DEFAULT false,
    notification_preferences JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create emergency incidents table
CREATE TABLE emergency_incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    incident_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    location_data JSONB,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    contacts_notified UUID[] REFERENCES emergency_contacts(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wellness resources table
CREATE TABLE wellness_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    content_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    author VARCHAR(100),
    external_url TEXT,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user resource interactions table
CREATE TABLE user_resource_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    resource_id UUID REFERENCES wellness_resources(id) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resource_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own mood logs"
    ON mood_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood logs"
    ON mood_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their wellness goals"
    ON wellness_goals FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their emergency contacts"
    ON emergency_contacts FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their emergency incidents"
    ON emergency_incidents FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view wellness resources"
    ON wellness_resources FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage their resource interactions"
    ON user_resource_interactions FOR ALL
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_mood_logs_user_timestamp ON mood_logs(user_id, timestamp);
CREATE INDEX idx_wellness_goals_user_status ON wellness_goals(user_id, status);
CREATE INDEX idx_emergency_contacts_user ON emergency_contacts(user_id);
CREATE INDEX idx_emergency_incidents_user_status ON emergency_incidents(user_id, status);
CREATE INDEX idx_wellness_resources_category ON wellness_resources(category);
CREATE INDEX idx_user_resource_interactions_user ON user_resource_interactions(user_id);
