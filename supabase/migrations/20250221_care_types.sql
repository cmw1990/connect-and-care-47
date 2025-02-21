-- Enhanced Care Types and Specialized Care Support

-- Care Types
CREATE TYPE care_recipient_type AS ENUM (
    'elderly',
    'child',
    'adult',
    'pet',
    'partner',
    'family_member',
    'friend'
);

CREATE TYPE specialized_condition AS ENUM (
    'dementia',
    'alzheimers',
    'parkinsons',
    'diabetes',
    'heart_disease',
    'stroke',
    'cancer',
    'mental_health',
    'addiction',
    'physical_disability',
    'developmental_disability',
    'chronic_pain',
    'respiratory_disease',
    'arthritis',
    'vision_impairment',
    'hearing_impairment',
    'autism',
    'adhd',
    'special_needs',
    'post_surgery',
    'pregnancy',
    'postpartum'
);

-- Care Profiles Table Enhancement
ALTER TABLE care_profiles
ADD COLUMN recipient_type care_recipient_type,
ADD COLUMN specialized_conditions specialized_condition[],
ADD COLUMN age_group TEXT,
ADD COLUMN care_needs JSONB,
ADD COLUMN emergency_contacts JSONB[],
ADD COLUMN medical_history JSONB,
ADD COLUMN care_preferences JSONB,
ADD COLUMN dietary_restrictions TEXT[],
ADD COLUMN allergies TEXT[],
ADD COLUMN mobility_status TEXT,
ADD COLUMN communication_preferences JSONB;

-- Specialized Care Resources
CREATE TABLE specialized_care_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condition specialized_condition NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL,
    content JSONB NOT NULL,
    metadata JSONB,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care Tips and Guides
CREATE TABLE care_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_type care_recipient_type,
    condition specialized_condition,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    difficulty_level TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care Tools
CREATE TABLE care_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    tool_type TEXT NOT NULL,
    recipient_types care_recipient_type[],
    conditions specialized_condition[],
    configuration JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care Assessment Templates
CREATE TABLE care_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    recipient_type care_recipient_type,
    condition specialized_condition,
    questions JSONB NOT NULL,
    scoring_logic JSONB,
    recommendations JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Care Progress Tracking
CREATE TABLE care_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES care_profiles(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES care_assessments(id),
    metrics JSONB NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet Care Specific
CREATE TABLE pet_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_profile_id UUID REFERENCES care_profiles(id) ON DELETE CASCADE,
    species TEXT NOT NULL,
    breed TEXT,
    age INTEGER,
    weight NUMERIC,
    medical_history JSONB,
    vaccination_records JSONB[],
    dietary_needs TEXT[],
    exercise_needs TEXT,
    behavioral_notes TEXT,
    grooming_needs TEXT[],
    veterinarian_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Child Care Specific
CREATE TABLE child_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    care_profile_id UUID REFERENCES care_profiles(id) ON DELETE CASCADE,
    age INTEGER,
    grade TEXT,
    school_info JSONB,
    activities TEXT[],
    developmental_notes TEXT,
    educational_needs TEXT[],
    behavioral_notes TEXT,
    medical_needs JSONB,
    dietary_needs TEXT[],
    schedule JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Specialized Condition Care Plans
CREATE TABLE condition_care_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES care_profiles(id) ON DELETE CASCADE,
    condition specialized_condition NOT NULL,
    care_plan JSONB NOT NULL,
    medications JSONB[],
    treatments JSONB[],
    monitoring_requirements JSONB[],
    emergency_procedures JSONB,
    specialist_contacts JSONB[],
    progress_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE specialized_care_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_care_plans ENABLE ROW LEVEL SECURITY;

-- Access Policies
CREATE POLICY "Public resources are viewable by all"
    ON specialized_care_resources FOR SELECT
    USING (true);

CREATE POLICY "Care team members can view care progress"
    ON care_progress FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM care_team_members
        WHERE user_id = auth.uid()
        AND team_id IN (
            SELECT team_id FROM care_profiles
            WHERE id = care_progress.profile_id
        )
    ));

CREATE POLICY "Care team members can create progress records"
    ON care_progress FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM care_team_members
        WHERE user_id = auth.uid()
        AND team_id IN (
            SELECT team_id FROM care_profiles
            WHERE id = care_progress.profile_id
        )
    ));

-- Similar policies for other tables...

-- Indexes for Performance
CREATE INDEX idx_specialized_resources_condition ON specialized_care_resources(condition);
CREATE INDEX idx_care_tips_recipient ON care_tips(recipient_type);
CREATE INDEX idx_care_tips_condition ON care_tips(condition);
CREATE INDEX idx_care_tools_types ON care_tools USING GIN(recipient_types);
CREATE INDEX idx_care_tools_conditions ON care_tools USING GIN(conditions);
CREATE INDEX idx_care_progress_profile ON care_progress(profile_id);
CREATE INDEX idx_condition_plans_profile ON condition_care_plans(profile_id);
CREATE INDEX idx_condition_plans_condition ON condition_care_plans(condition);

-- Full Text Search
CREATE INDEX idx_care_tips_search ON care_tips USING GIN (
    to_tsvector('english',
        coalesce(title,'') || ' ' ||
        coalesce(content,'') || ' ' ||
        coalesce(array_to_string(tags, ' '),'')
    )
);

CREATE INDEX idx_specialized_resources_search ON specialized_care_resources USING GIN (
    to_tsvector('english',
        coalesce(title,'') || ' ' ||
        coalesce(description,'') || ' ' ||
        coalesce(array_to_string(tags, ' '),'')
    )
);
