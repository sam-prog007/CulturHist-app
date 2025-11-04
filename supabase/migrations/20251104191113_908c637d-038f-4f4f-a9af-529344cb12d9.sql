-- Create table to track achieved streak milestones
CREATE TABLE IF NOT EXISTS public.user_streak_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.streak_milestones(id) ON DELETE CASCADE,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

-- Enable RLS
ALTER TABLE public.user_streak_milestones ENABLE ROW LEVEL SECURITY;

-- Users can view their own achieved milestones
CREATE POLICY "Users can view own achieved milestones"
  ON public.user_streak_milestones
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own achieved milestones
CREATE POLICY "Users can insert own achieved milestones"
  ON public.user_streak_milestones
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to check and reward streak milestones
CREATE OR REPLACE FUNCTION public.check_streak_milestones()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  milestone RECORD;
  already_achieved BOOLEAN;
BEGIN
  -- Check each milestone
  FOR milestone IN 
    SELECT * FROM public.streak_milestones 
    WHERE days <= NEW.current_streak
    ORDER BY days ASC
  LOOP
    -- Check if user already achieved this milestone
    SELECT EXISTS (
      SELECT 1 FROM public.user_streak_milestones
      WHERE user_id = NEW.id AND milestone_id = milestone.id
    ) INTO already_achieved;

    -- If not achieved, record it and award points
    IF NOT already_achieved THEN
      -- Insert achievement record
      INSERT INTO public.user_streak_milestones (user_id, milestone_id)
      VALUES (NEW.id, milestone.id);

      -- Award points
      UPDATE public.profiles
      SET points = points + milestone.points_reward
      WHERE id = NEW.id;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger on profiles table to check milestones when streak is updated
DROP TRIGGER IF EXISTS check_streak_milestones_trigger ON public.profiles;
CREATE TRIGGER check_streak_milestones_trigger
  AFTER UPDATE OF current_streak ON public.profiles
  FOR EACH ROW
  WHEN (NEW.current_streak > OLD.current_streak OR OLD.current_streak IS NULL)
  EXECUTE FUNCTION public.check_streak_milestones();