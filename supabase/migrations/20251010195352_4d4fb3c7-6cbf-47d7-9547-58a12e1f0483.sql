-- Fix critical security issue: Restrict profiles table access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a secure policy that only allows users to view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Add check to ensure profiles.id matches auth.uid on insert
CREATE OR REPLACE FUNCTION public.validate_profile_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot create profile for another user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS validate_profile_user_id_trigger ON public.profiles;
CREATE TRIGGER validate_profile_user_id_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_user_id();

-- Ensure user_id is always set to auth.uid() for all user-specific tables
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL OR NEW.user_id != auth.uid() THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply to tables that have user_id
DROP TRIGGER IF EXISTS set_user_id_daily_fact_assignments ON public.daily_fact_assignments;
CREATE TRIGGER set_user_id_daily_fact_assignments
  BEFORE INSERT ON public.daily_fact_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_daily_facts_progress ON public.daily_facts_progress;
CREATE TRIGGER set_user_id_daily_facts_progress
  BEFORE INSERT ON public.daily_facts_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_daily_points ON public.daily_points;
CREATE TRIGGER set_user_id_daily_points
  BEFORE INSERT ON public.daily_points
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_quiz_sessions ON public.quiz_sessions;
CREATE TRIGGER set_user_id_quiz_sessions
  BEFORE INSERT ON public.quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_user_achievements ON public.user_achievements;
CREATE TRIGGER set_user_id_user_achievements
  BEFORE INSERT ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();

DROP TRIGGER IF EXISTS set_user_id_user_progress ON public.user_progress;
CREATE TRIGGER set_user_id_user_progress
  BEFORE INSERT ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_id();