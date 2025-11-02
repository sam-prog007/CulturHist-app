-- Add preferred difficulty column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN preferred_difficulty text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN public.profiles.preferred_difficulty IS 'User preferred difficulty levels for historical facts (easy, medium, hard)';