-- Enhanced Care Platform Database Schema

-- Health and Wellness
CREATE TABLE IF NOT EXISTS wellness_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),
    sleep_score INTEGER CHECK (sleep_score BETWEEN 0 AND 100),
    activity_score INTEGER CHECK (activity_score BETWEEN 0 AND 100),
    mood_score INTEGER CHECK (mood_score BETWEEN 0 AND 100),
    medication_score INTEGER CHECK (medication_score BETWEEN 0 AND 100),
    vitals_score INTEGER CHECK (vitals_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    category TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    target_value NUMERIC,
    current_value NUMERIC,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'in_progress',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wellness_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    insight TEXT NOT NULL,
    category TEXT NOT NULL,
    importance INTEGER CHECK (importance BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace
CREATE TABLE IF NOT EXISTS marketplace_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    rating NUMERIC CHECK (rating BETWEEN 0 AND 5),
    location TEXT,
    features JSONB,
    availability JSONB,
    specialties TEXT[],
    certifications TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES marketplace_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketplace_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES marketplace_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

CREATE TABLE IF NOT EXISTS marketplace_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    items UUID[] NOT NULL,
    notes JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Companion
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    messages JSONB NOT NULL,
    context JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_data JSONB,
    status TEXT DEFAULT 'pending',
    result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE wellness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;

-- Wellness Data Policies
CREATE POLICY "Users can view their own wellness data"
    ON wellness_scores FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own wellness data"
    ON wellness_scores FOR ALL
    USING (auth.uid() = user_id);

-- Similar policies for other wellness tables...

-- Marketplace Policies
CREATE POLICY "Anyone can view marketplace items"
    ON marketplace_items FOR SELECT
    USING (true);

CREATE POLICY "Users can create reviews"
    ON marketplace_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all reviews"
    ON marketplace_reviews FOR SELECT
    USING (true);

-- AI Conversation Policies
CREATE POLICY "Users can view their own conversations"
    ON ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
    ON ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_wellness_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate new wellness score based on various factors
    INSERT INTO wellness_scores (
        user_id,
        overall_score,
        sleep_score,
        activity_score,
        mood_score,
        medication_score,
        vitals_score
    )
    SELECT
        NEW.user_id,
        (
            COALESCE(avg_sleep, 0) +
            COALESCE(avg_activity, 0) +
            COALESCE(avg_mood, 0) +
            COALESCE(avg_medication, 0) +
            COALESCE(avg_vitals, 0)
        ) / 5 as overall_score,
        COALESCE(avg_sleep, 0) as sleep_score,
        COALESCE(avg_activity, 0) as activity_score,
        COALESCE(avg_mood, 0) as mood_score,
        COALESCE(avg_medication, 0) as medication_score,
        COALESCE(avg_vitals, 0) as vitals_score
    FROM (
        SELECT
            AVG(sleep_quality) as avg_sleep,
            AVG(activity_level) as avg_activity,
            AVG(mood_score) as avg_mood,
            AVG(medication_adherence) as avg_medication,
            AVG(vital_signs_score) as avg_vitals
        FROM user_health_data
        WHERE user_id = NEW.user_id
        AND created_at >= NOW() - INTERVAL '7 days'
    ) scores;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wellness_score_trigger
    AFTER INSERT OR UPDATE ON user_health_data
    FOR EACH ROW
    EXECUTE FUNCTION update_wellness_score();

-- Indexes for Performance
CREATE INDEX idx_wellness_scores_user_date ON wellness_scores(user_id, created_at);
CREATE INDEX idx_wellness_trends_user_date ON wellness_trends(user_id, date);
CREATE INDEX idx_marketplace_items_type_rating ON marketplace_items(type, rating);
CREATE INDEX idx_marketplace_items_search ON marketplace_items USING GIN (
    to_tsvector('english',
        coalesce(name,'') || ' ' ||
        coalesce(description,'') || ' ' ||
        coalesce(array_to_string(specialties, ' '),'')
    )
);
