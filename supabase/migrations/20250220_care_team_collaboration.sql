-- Create care teams table
CREATE TABLE care_teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    primary_caregiver UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create care team members table
CREATE TABLE care_team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES care_teams(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role VARCHAR(50) NOT NULL,
    permissions JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Create care tasks table
CREATE TABLE care_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES care_teams(id) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    assigned_to UUID REFERENCES auth.users(id),
    due_date TIMESTAMPTZ,
    completion_notes TEXT,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id),
    recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create care notes table
CREATE TABLE care_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES care_teams(id) NOT NULL,
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    category VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[],
    visibility VARCHAR(20) DEFAULT 'team',
    attachments JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create care team chat messages table
CREATE TABLE care_team_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES care_teams(id) NOT NULL,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    content TEXT NOT NULL,
    attachments JSONB,
    read_by UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create care schedules table
CREATE TABLE care_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES care_teams(id) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    schedule_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    assigned_to UUID[] REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE care_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE care_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Team members can view their care teams"
    ON care_teams FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM care_team_members
            WHERE team_id = care_teams.id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

CREATE POLICY "Team members can view team members"
    ON care_team_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM care_team_members AS member
            WHERE member.team_id = care_team_members.team_id
            AND member.user_id = auth.uid()
            AND member.status = 'active'
        )
    );

CREATE POLICY "Team members can view tasks"
    ON care_tasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM care_team_members
            WHERE team_id = care_tasks.team_id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

CREATE POLICY "Team members can create tasks"
    ON care_tasks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM care_team_members
            WHERE team_id = care_tasks.team_id
            AND user_id = auth.uid()
            AND status = 'active'
            AND permissions->>'can_create_tasks' = 'true'
        )
    );

CREATE POLICY "Team members can view notes"
    ON care_notes FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM care_team_members
            WHERE team_id = care_notes.team_id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

CREATE POLICY "Team members can view messages"
    ON care_team_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM care_team_members
            WHERE team_id = care_team_messages.team_id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

-- Create indexes
CREATE INDEX idx_care_team_members_team ON care_team_members(team_id);
CREATE INDEX idx_care_team_members_user ON care_team_members(user_id);
CREATE INDEX idx_care_tasks_team ON care_tasks(team_id);
CREATE INDEX idx_care_tasks_assigned ON care_tasks(assigned_to);
CREATE INDEX idx_care_notes_team ON care_notes(team_id);
CREATE INDEX idx_care_team_messages_team ON care_team_messages(team_id);
CREATE INDEX idx_care_schedules_team ON care_schedules(team_id);
