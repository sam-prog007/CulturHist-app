-- Function to update streak based on last activity
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If last_activity_date is NULL or more than 1 day ago, reset streak
  IF OLD.last_activity_date IS NULL OR 
     OLD.last_activity_date < CURRENT_DATE - INTERVAL '1 day' THEN
    NEW.current_streak = 1;
  -- If last activity was yesterday, increment streak
  ELSIF OLD.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
    NEW.current_streak = COALESCE(OLD.current_streak, 0) + 1;
  -- If last activity was today, keep current streak
  ELSIF OLD.last_activity_date = CURRENT_DATE THEN
    NEW.current_streak = COALESCE(OLD.current_streak, 0);
  ELSE
    -- More than 1 day gap, reset to 1
    NEW.current_streak = 1;
  END IF;
  
  -- Update last_activity_date to today
  NEW.last_activity_date = CURRENT_DATE;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_streak_on_profile_update ON public.profiles;

-- Create trigger for streak updates
CREATE TRIGGER update_streak_on_profile_update
BEFORE UPDATE OF points ON public.profiles
FOR EACH ROW
WHEN (OLD.points IS DISTINCT FROM NEW.points)
EXECUTE FUNCTION public.update_user_streak();