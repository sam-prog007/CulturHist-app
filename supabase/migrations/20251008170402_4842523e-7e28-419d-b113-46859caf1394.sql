-- Create grades table with historical figures
CREATE TABLE public.grades (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level integer NOT NULL UNIQUE,
  name text NOT NULL,
  historical_figure text NOT NULL,
  min_points integer NOT NULL,
  max_points integer NOT NULL,
  description text,
  image_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- Anyone can view grades
CREATE POLICY "Anyone can view grades"
ON public.grades
FOR SELECT
USING (true);

-- Admins can manage grades
CREATE POLICY "Admins can manage grades"
ON public.grades
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert 10 historical grades
INSERT INTO public.grades (level, name, historical_figure, min_points, max_points, description) VALUES
(1, 'Apprenti Historien', 'Scribe Égyptien', 0, 100, 'Vous commencez votre voyage dans l''histoire'),
(2, 'Explorateur', 'Marco Polo', 100, 250, 'Vous explorez les premières civilisations'),
(3, 'Érudit', 'Léonard de Vinci', 250, 450, 'Votre soif de connaissance grandit'),
(4, 'Stratège', 'Jules César', 450, 700, 'Vous maîtrisez l''art de la stratégie historique'),
(5, 'Conquérant', 'Napoléon Bonaparte', 700, 1000, 'Vous dominez les grandes périodes de l''histoire'),
(6, 'Philosophe', 'Socrate', 1000, 1400, 'Votre sagesse historique s''approfondit'),
(7, 'Bâtisseur', 'Ramsès II', 1400, 1900, 'Vous construisez un empire de connaissances'),
(8, 'Visionnaire', 'Cléopâtre', 1900, 2500, 'Vous voyez au-delà des époques'),
(9, 'Sage', 'Confucius', 2500, 3200, 'Votre maîtrise de l''histoire est légendaire'),
(10, 'Maître du Temps', 'Alexandre le Grand', 3200, 999999, 'Vous avez conquis toutes les époques');

-- Create table to track daily points for graphs
CREATE TABLE public.daily_points (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  points_earned integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_points ENABLE ROW LEVEL SECURITY;

-- Users can view own daily points
CREATE POLICY "Users can view own daily points"
ON public.daily_points
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert own daily points
CREATE POLICY "Users can insert own daily points"
ON public.daily_points
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own daily points
CREATE POLICY "Users can update own daily points"
ON public.daily_points
FOR UPDATE
USING (auth.uid() = user_id);

-- Function to update streak based on last activity
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If last_activity_date is NULL or more than 1 day ago, reset streak
  IF NEW.last_activity_date IS NULL OR 
     NEW.last_activity_date < CURRENT_DATE - INTERVAL '1 day' THEN
    NEW.current_streak = 1;
  -- If last activity was yesterday, increment streak
  ELSIF NEW.last_activity_date = CURRENT_DATE - INTERVAL '1 day' THEN
    NEW.current_streak = NEW.current_streak + 1;
  -- If last activity was today, keep current streak
  ELSIF NEW.last_activity_date = CURRENT_DATE THEN
    -- Do nothing, keep current streak
  END IF;
  
  -- Update last_activity_date to today
  NEW.last_activity_date = CURRENT_DATE;
  
  RETURN NEW;
END;
$$;

-- Create trigger for streak updates
CREATE TRIGGER update_streak_on_profile_update
BEFORE UPDATE OF points ON public.profiles
FOR EACH ROW
WHEN (OLD.points IS DISTINCT FROM NEW.points)
EXECUTE FUNCTION public.update_user_streak();