-- Create user_profiles table for storing user information
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  department_id uuid REFERENCES public.departments(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_user_profiles_department_id ON public.user_profiles(department_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Migrate existing users from auth.users.raw_user_meta_data to user_profiles
-- Only if they have name and dept_name in metadata
INSERT INTO public.user_profiles (id, name, department_id)
SELECT 
  u.id,
  u.raw_user_meta_data->>'name' as name,
  d.id as department_id
FROM auth.users u
JOIN public.departments d ON d.name = u.raw_user_meta_data->>'dept_name'
WHERE u.raw_user_meta_data->>'name' IS NOT NULL
  AND u.raw_user_meta_data->>'dept_name' IS NOT NULL
ON CONFLICT (id) DO NOTHING;