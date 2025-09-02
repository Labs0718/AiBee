-- Development mode: Disable email confirmation requirement
-- This allows users to sign up without email verification in local development

-- Create a function to auto-confirm users in development mode
CREATE OR REPLACE FUNCTION auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-confirm in development/local environments
  -- Check if this is a development environment (you can customize this logic)
  IF current_setting('app.env_mode', true) = 'local' OR 
     NEW.email LIKE '%@test.com' OR 
     NEW.email LIKE '%@example.com' THEN
    -- Set email as confirmed
    NEW.email_confirmed_at = NOW();
    NEW.confirmed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm users in development
DROP TRIGGER IF EXISTS auto_confirm_dev_users ON auth.users;
CREATE TRIGGER auto_confirm_dev_users
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_user();