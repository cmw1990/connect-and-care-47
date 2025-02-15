
-- Update medication_portal_settings table
CREATE TABLE IF NOT EXISTS public.medication_portal_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID REFERENCES public.groups(id),
    reminder_preferences JSONB NOT NULL DEFAULT '{"voice_reminders": false, "preferred_channels": []}',
    accessibility_settings JSONB NOT NULL DEFAULT '{"voice_reminders": false}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update medication_schedules table to ensure frequency field exists
ALTER TABLE IF EXISTS public.medication_schedules
ADD COLUMN IF NOT EXISTS frequency TEXT;

-- Update insurance_provider_search to use numeric distance
ALTER TABLE IF EXISTS public.insurance_provider_search
ALTER COLUMN distance TYPE NUMERIC USING distance::numeric;

-- Ensure covered_services is an array in insurance_coverage
ALTER TABLE IF EXISTS public.insurance_coverage
ALTER COLUMN covered_services TYPE TEXT[] USING covered_services::TEXT[];

-- Add name column to schedule_items if not exists
ALTER TABLE IF EXISTS public.schedule_items
ADD COLUMN IF NOT EXISTS name TEXT;

-- Create type for medication status if not exists
DO $$ BEGIN
    CREATE TYPE medication_status AS ENUM ('taken', 'missed', 'pending', 'pending_verification', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update medication_logs to use the enum type
ALTER TABLE IF EXISTS public.medication_logs
ALTER COLUMN status TYPE medication_status USING status::medication_status;

