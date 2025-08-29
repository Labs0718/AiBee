-- Create table for storing encrypted groupware passwords
CREATE TABLE IF NOT EXISTS groupware_passwords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE groupware_passwords ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own passwords
CREATE POLICY "Users can only access their own groupware passwords" ON groupware_passwords
    FOR ALL USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_groupware_passwords_user_id ON groupware_passwords(user_id);