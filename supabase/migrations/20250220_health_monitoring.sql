-- Create vital signs table
CREATE TABLE vital_signs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type VARCHAR(50) NOT NULL,
    value DECIMAL NOT NULL,
    unit VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'normal',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medications table
CREATE TABLE medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(50) NOT NULL,
    time_of_day TEXT[] NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    refill_reminder BOOLEAN DEFAULT false,
    refill_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    adherence INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medication logs table
CREATE TABLE medication_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id UUID REFERENCES medications(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    taken BOOLEAN NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    taken_time TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create symptoms table
CREATE TABLE symptoms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    symptom VARCHAR(100) NOT NULL,
    severity INTEGER NOT NULL,
    duration VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sleep logs table
CREATE TABLE sleep_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    sleep_start TIMESTAMPTZ NOT NULL,
    sleep_end TIMESTAMPTZ NOT NULL,
    quality INTEGER,
    interruptions INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own vital signs"
    ON vital_signs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vital signs"
    ON vital_signs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vital signs"
    ON vital_signs FOR UPDATE
    USING (auth.uid() = user_id);

-- Repeat similar policies for other tables
CREATE POLICY "Users can view their own medications"
    ON medications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
    ON medications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
    ON medications FOR UPDATE
    USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_vital_signs_user_id ON vital_signs(user_id);
CREATE INDEX idx_vital_signs_type ON vital_signs(type);
CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_medication_logs_medication_id ON medication_logs(medication_id);
CREATE INDEX idx_symptoms_user_id ON symptoms(user_id);
CREATE INDEX idx_sleep_logs_user_id ON sleep_logs(user_id);
