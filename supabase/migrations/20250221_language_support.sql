-- Language Support for User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own preferences"
    ON user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
    ON user_preferences FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
    ON user_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_user_preferences_language ON user_preferences(language);

-- Insert supported languages into a reference table
CREATE TABLE supported_languages (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    direction VARCHAR(3) NOT NULL DEFAULT 'ltr',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert supported languages
INSERT INTO supported_languages (code, name, native_name, direction) VALUES
    ('en', 'English', 'English', 'ltr'),
    ('es', 'Spanish', 'Español', 'ltr'),
    ('zh-CN', 'Chinese (Simplified)', '简体中文', 'ltr'),
    ('zh-TW', 'Chinese (Traditional)', '繁體中文', 'ltr'),
    ('hi', 'Hindi', 'हिन्दी', 'ltr'),
    ('ar', 'Arabic', 'العربية', 'rtl'),
    ('fr', 'French', 'Français', 'ltr'),
    ('de', 'German', 'Deutsch', 'ltr'),
    ('it', 'Italian', 'Italiano', 'ltr'),
    ('ja', 'Japanese', '日本語', 'ltr'),
    ('ko', 'Korean', '한국어', 'ltr'),
    ('pt', 'Portuguese', 'Português', 'ltr'),
    ('ru', 'Russian', 'Русский', 'ltr'),
    ('tr', 'Turkish', 'Türkçe', 'ltr'),
    ('vi', 'Vietnamese', 'Tiếng Việt', 'ltr'),
    ('th', 'Thai', 'ไทย', 'ltr')
ON CONFLICT (code) DO UPDATE
SET 
    name = EXCLUDED.name,
    native_name = EXCLUDED.native_name,
    direction = EXCLUDED.direction;
