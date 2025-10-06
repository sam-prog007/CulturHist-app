-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_type TEXT,
ADD COLUMN IF NOT EXISTS learning_goal TEXT,
ADD COLUMN IF NOT EXISTS preferred_regions TEXT[],
ADD COLUMN IF NOT EXISTS preferred_eras TEXT[],
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;