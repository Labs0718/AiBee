-- RPC function to get user metadata including password_start
CREATE OR REPLACE FUNCTION get_user_metadata(user_uuid UUID)
RETURNS TABLE(raw_user_meta_data JSONB) 
LANGUAGE SQL 
SECURITY DEFINER
AS $$
  SELECT raw_user_meta_data 
  FROM auth.users 
  WHERE id = user_uuid;
$$;