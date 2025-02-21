-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create caregiver_profiles table
CREATE TABLE IF NOT EXISTS caregiver_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  bio TEXT,
  location TEXT,
  specialties TEXT[],
  availability TEXT[],
  hourly_rate DECIMAL(10,2),
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  image_url TEXT,
  years_of_experience INTEGER,
  languages TEXT[],
  certifications TEXT[],
  background_check BOOLEAN DEFAULT false,
  last_active TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create specialties table
CREATE TABLE IF NOT EXISTS specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial specialties
INSERT INTO specialties (name) VALUES
  ('Elderly Care'),
  ('Dementia Care'),
  ('Alzheimer''s Care'),
  ('Disability Support'),
  ('Palliative Care'),
  ('Post-Surgery Care'),
  ('Respite Care'),
  ('Medication Management'),
  ('Physical Therapy'),
  ('Mental Health Support')
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_caregiver_profiles_location ON caregiver_profiles (location);
CREATE INDEX IF NOT EXISTS idx_caregiver_profiles_specialties ON caregiver_profiles USING GIN (specialties);
CREATE INDEX IF NOT EXISTS idx_caregiver_profiles_name ON caregiver_profiles (name);

-- Add RLS policies
ALTER TABLE caregiver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE specialties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON caregiver_profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON specialties
  FOR SELECT USING (true);
