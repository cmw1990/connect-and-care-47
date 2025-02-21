-- Create care guide difficulty enum
CREATE TYPE care_guide_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create resource type enum
CREATE TYPE resource_type AS ENUM ('article', 'video', 'checklist', 'template', 'tool');

-- Create community resource type enum
CREATE TYPE community_resource_type AS ENUM ('support_group', 'organization', 'program', 'event');

-- Care Guides table
CREATE TABLE care_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    difficulty care_guide_difficulty NOT NULL,
    content TEXT NOT NULL,
    resources TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    estimated_time INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Care Resources table
CREATE TABLE care_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type resource_type NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Legal Resources table
CREATE TABLE legal_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    content TEXT NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    citations TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}'
);

-- Community Resources table
CREATE TABLE community_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type community_resource_type NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    contact JSONB NOT NULL DEFAULT '{}',
    schedule JSONB,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resource Collections table
CREATE TABLE resource_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    resource_ids UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Resource Progress table
CREATE TABLE resource_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_id UUID NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, resource_id)
);

-- Resource recommendations function
CREATE OR REPLACE FUNCTION get_resource_recommendations(
    user_care_needs TEXT[],
    user_interests TEXT[],
    user_location TEXT
) RETURNS TABLE (
    id UUID,
    title TEXT,
    type TEXT,
    relevance_score FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.title,
        'care_resource' as type,
        (
            -- Calculate relevance score based on matching tags and location
            CASE WHEN r.tags && user_care_needs THEN 2.0 ELSE 0.0 END +
            CASE WHEN r.tags && user_interests THEN 1.0 ELSE 0.0 END
        ) as relevance_score
    FROM care_resources r
    WHERE r.tags && user_care_needs OR r.tags && user_interests
    UNION ALL
    SELECT 
        c.id,
        c.name as title,
        'community_resource' as type,
        (
            -- Calculate relevance score based on matching tags and location
            CASE WHEN c.tags && user_care_needs THEN 2.0 ELSE 0.0 END +
            CASE WHEN c.tags && user_interests THEN 1.0 ELSE 0.0 END +
            CASE WHEN c.location ILIKE '%' || user_location || '%' THEN 1.5 ELSE 0.0 END
        ) as relevance_score
    FROM community_resources c
    WHERE c.tags && user_care_needs OR c.tags && user_interests
    ORDER BY relevance_score DESC
    LIMIT 10;
END;
$$;

-- Add RLS policies
ALTER TABLE care_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_progress ENABLE ROW LEVEL SECURITY;

-- Care guides policies
CREATE POLICY "Care guides are viewable by everyone" ON care_guides
    FOR SELECT USING (true);

-- Care resources policies
CREATE POLICY "Care resources are viewable by everyone" ON care_resources
    FOR SELECT USING (true);

-- Legal resources policies
CREATE POLICY "Legal resources are viewable by everyone" ON legal_resources
    FOR SELECT USING (true);

-- Community resources policies
CREATE POLICY "Community resources are viewable by everyone" ON community_resources
    FOR SELECT USING (true);

-- Resource collections policies
CREATE POLICY "Users can view their own collections" ON resource_collections
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own collections" ON resource_collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own collections" ON resource_collections
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own collections" ON resource_collections
    FOR DELETE USING (auth.uid() = user_id);

-- Resource progress policies
CREATE POLICY "Users can view their own progress" ON resource_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own progress" ON resource_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON resource_progress
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own progress" ON resource_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX care_guides_category_idx ON care_guides(category);
CREATE INDEX care_guides_tags_idx ON care_guides USING GIN(tags);
CREATE INDEX care_resources_type_idx ON care_resources(type);
CREATE INDEX care_resources_category_idx ON care_resources(category);
CREATE INDEX care_resources_tags_idx ON care_resources USING GIN(tags);
CREATE INDEX legal_resources_jurisdiction_idx ON legal_resources(jurisdiction);
CREATE INDEX legal_resources_tags_idx ON legal_resources USING GIN(tags);
CREATE INDEX community_resources_type_idx ON community_resources(type);
CREATE INDEX community_resources_location_idx ON community_resources(location);
CREATE INDEX community_resources_tags_idx ON community_resources USING GIN(tags);
CREATE INDEX resource_collections_user_id_idx ON resource_collections(user_id);
CREATE INDEX resource_progress_user_resource_idx ON resource_progress(user_id, resource_id);
