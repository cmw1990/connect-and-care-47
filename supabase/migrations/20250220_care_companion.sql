-- Create care type enum
CREATE TYPE care_type AS ENUM (
    'eldercare',
    'childcare',
    'healthcare',
    'disability',
    'mental-health'
);

-- Create safety check type enum
CREATE TYPE safety_check_type AS ENUM (
    'check-in',
    'location',
    'activity',
    'emergency'
);

-- Create safety check frequency enum
CREATE TYPE safety_check_frequency AS ENUM (
    'hourly',
    'daily',
    'weekly'
);

-- Create care schedule type enum
CREATE TYPE care_schedule_type AS ENUM (
    'regular',
    'one-time',
    'respite'
);

-- Create care schedule status enum
CREATE TYPE care_schedule_status AS ENUM (
    'scheduled',
    'in-progress',
    'completed',
    'cancelled'
);

-- Create match status enum
CREATE TYPE match_status AS ENUM (
    'pending',
    'accepted',
    'declined',
    'completed'
);

-- Care Profiles table
CREATE TABLE care_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    care_type care_type NOT NULL,
    needs TEXT[] NOT NULL DEFAULT '{}',
    preferences JSONB NOT NULL DEFAULT '{}',
    emergency_contacts JSONB NOT NULL DEFAULT '[]',
    medical_info JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Care Matches table
CREATE TABLE care_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    caregiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    care_receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_score FLOAT NOT NULL,
    match_factors JSONB NOT NULL DEFAULT '[]',
    status match_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(caregiver_id, care_receiver_id)
);

-- Care Schedules table
CREATE TABLE care_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    caregiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type care_schedule_type NOT NULL,
    schedule JSONB NOT NULL,
    tasks JSONB NOT NULL DEFAULT '[]',
    status care_schedule_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safety Checks table
CREATE TABLE safety_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type safety_check_type NOT NULL,
    schedule JSONB NOT NULL,
    contacts UUID[] NOT NULL DEFAULT '{}',
    last_check TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Safety Check Records table
CREATE TABLE safety_check_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_id UUID NOT NULL REFERENCES safety_checks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type safety_check_type NOT NULL,
    status TEXT NOT NULL,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    location JSONB,
    activity_data JSONB,
    notes TEXT
);

-- Care Match Function
CREATE OR REPLACE FUNCTION find_care_matches(
    user_id UUID,
    care_type care_type,
    care_needs TEXT[],
    location TEXT,
    schedule JSONB
) RETURNS TABLE (
    caregiver_id UUID,
    match_score FLOAT,
    match_factors JSONB
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH caregiver_scores AS (
        SELECT 
            c.id as caregiver_id,
            -- Calculate base match score
            (
                -- Care type match
                CASE WHEN c.care_types ? care_type::TEXT THEN 20.0 ELSE 0.0 END +
                -- Skills match with care needs
                (
                    SELECT COALESCE(
                        COUNT(*) * 10.0 / GREATEST(array_length(care_needs, 1), 1),
                        0.0
                    )
                    FROM unnest(c.skills) skill
                    WHERE skill = ANY(care_needs)
                ) +
                -- Location proximity (simplified)
                CASE WHEN c.service_area ? location THEN 15.0 ELSE 0.0 END +
                -- Schedule compatibility (simplified)
                CASE WHEN c.availability @> schedule THEN 15.0 ELSE 0.0 END
            ) as base_score,
            -- Collect match factors
            jsonb_build_array(
                jsonb_build_object(
                    'factor', 'care_type_match',
                    'score', CASE WHEN c.care_types ? care_type::TEXT THEN 20.0 ELSE 0.0 END
                ),
                jsonb_build_object(
                    'factor', 'skills_match',
                    'score', (
                        SELECT COALESCE(
                            COUNT(*) * 10.0 / GREATEST(array_length(care_needs, 1), 1),
                            0.0
                        )
                        FROM unnest(c.skills) skill
                        WHERE skill = ANY(care_needs)
                    )
                ),
                jsonb_build_object(
                    'factor', 'location_match',
                    'score', CASE WHEN c.service_area ? location THEN 15.0 ELSE 0.0 END
                ),
                jsonb_build_object(
                    'factor', 'schedule_match',
                    'score', CASE WHEN c.availability @> schedule THEN 15.0 ELSE 0.0 END
                )
            ) as match_factors
        FROM caregivers c
        WHERE c.status = 'active'
        AND NOT EXISTS (
            SELECT 1 FROM care_matches m
            WHERE (m.caregiver_id = c.id AND m.care_receiver_id = user_id)
            OR (m.care_receiver_id = c.id AND m.caregiver_id = user_id)
        )
    )
    SELECT 
        cs.caregiver_id,
        cs.base_score as match_score,
        cs.match_factors
    FROM caregiver_scores cs
    WHERE cs.base_score >= 30.0  -- Minimum match threshold
    ORDER BY cs.base_score DESC
    LIMIT 10;
END;
$$;

-- Add RLS policies
ALTER TABLE care_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_check_records ENABLE ROW LEVEL SECURITY;

-- Care profiles policies
CREATE POLICY "Users can view their own care profile" ON care_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own care profile" ON care_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own care profile" ON care_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Care matches policies
CREATE POLICY "Users can view their own matches" ON care_matches
    FOR SELECT USING (
        auth.uid() = caregiver_id OR 
        auth.uid() = care_receiver_id
    );
CREATE POLICY "Users can create matches they're involved in" ON care_matches
    FOR INSERT WITH CHECK (
        auth.uid() = caregiver_id OR 
        auth.uid() = care_receiver_id
    );
CREATE POLICY "Users can update matches they're involved in" ON care_matches
    FOR UPDATE USING (
        auth.uid() = caregiver_id OR 
        auth.uid() = care_receiver_id
    );

-- Care schedules policies
CREATE POLICY "Users can view their own schedules" ON care_schedules
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() = caregiver_id
    );
CREATE POLICY "Users can create their own schedules" ON care_schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own schedules" ON care_schedules
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() = caregiver_id
    );

-- Safety checks policies
CREATE POLICY "Users can view their own safety checks" ON safety_checks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own safety checks" ON safety_checks
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own safety checks" ON safety_checks
    FOR UPDATE USING (auth.uid() = user_id);

-- Safety check records policies
CREATE POLICY "Users can view their own check records" ON safety_check_records
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own check records" ON safety_check_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX care_profiles_user_id_idx ON care_profiles(user_id);
CREATE INDEX care_matches_caregiver_id_idx ON care_matches(caregiver_id);
CREATE INDEX care_matches_care_receiver_id_idx ON care_matches(care_receiver_id);
CREATE INDEX care_schedules_user_id_idx ON care_schedules(user_id);
CREATE INDEX care_schedules_caregiver_id_idx ON care_schedules(caregiver_id);
CREATE INDEX safety_checks_user_id_idx ON safety_checks(user_id);
CREATE INDEX safety_check_records_check_id_idx ON safety_check_records(check_id);
CREATE INDEX safety_check_records_user_id_idx ON safety_check_records(user_id);
