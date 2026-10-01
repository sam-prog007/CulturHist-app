-- CulturHist baseline schema.
-- Replaces the 25 incremental Lovable migrations with one clean script for a
-- fresh Supabase project. Table and column names are unchanged so the frontend
-- (src/integrations/supabase/types.ts) keeps working.
--
-- Value conventions shared with the frontend:
--   historical_facts.region      europe | asia | africa | americas | oceania | middle-east
--                                (same keys as the onboarding screen)
--   historical_facts.difficulty  easy | medium | hard
--                                (same keys as profiles.preferred_difficulty)
--
-- Demo facts live in supabase/seed.sql, not here.

-- ============================================================================
-- Roles
-- ============================================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- Profiles
-- ============================================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  -- Onboarding / preferences
  profile_type TEXT,
  learning_goal TEXT,
  preferred_regions TEXT[],
  preferred_eras TEXT[],
  preferred_tags TEXT[],
  preferred_difficulty TEXT[] DEFAULT ARRAY[]::TEXT[],
  onboarding_completed BOOLEAN DEFAULT false,
  -- Billing (written only by the check-subscription edge function)
  is_premium BOOLEAN DEFAULT false,
  stripe_customer_id TEXT,
  premium_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create a profile row when a user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- The update policy lets a user change every column of their own row. Block the
-- billing columns for end-user API roles so nobody can grant themselves premium
-- from the browser console. The service role and direct SQL are unaffected.
CREATE OR REPLACE FUNCTION public.protect_profile_billing_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.role() IN ('anon', 'authenticated') AND (
       NEW.is_premium IS DISTINCT FROM OLD.is_premium
    OR NEW.premium_until IS DISTINCT FROM OLD.premium_until
    OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
  ) THEN
    RAISE EXCEPTION 'Billing columns can only be updated by the server';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_billing_columns_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_billing_columns();

-- Streak: recomputed whenever points change.
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.last_activity_date = CURRENT_DATE THEN
    NEW.current_streak = COALESCE(OLD.current_streak, 0);
  ELSIF OLD.last_activity_date = CURRENT_DATE - 1 THEN
    NEW.current_streak = COALESCE(OLD.current_streak, 0) + 1;
  ELSE
    NEW.current_streak = 1;
  END IF;

  NEW.last_activity_date = CURRENT_DATE;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_streak_on_profile_update
  BEFORE UPDATE OF points ON public.profiles
  FOR EACH ROW
  WHEN (OLD.points IS DISTINCT FROM NEW.points)
  EXECUTE FUNCTION public.update_user_streak();

-- ============================================================================
-- Content: periods, facts, grades, achievements, streak milestones
-- ============================================================================

CREATE TABLE public.historical_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_year INTEGER,
  end_year INTEGER,
  image_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.historical_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id UUID REFERENCES public.historical_periods(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date_text TEXT,
  region TEXT CHECK (region IN ('europe', 'asia', 'africa', 'americas', 'oceania', 'middle-east')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  points_reward INTEGER DEFAULT 10,
  -- Either a key from src/assets/factsImages.ts (e.g. 'pyramids-egypt') or a full URL.
  image_url TEXT,
  -- French versions shown by the UI (falls back to the base columns when NULL).
  title_fr TEXT,
  description_fr TEXT,
  date_text_fr TEXT,
  region_fr TEXT,
  tags_fr TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_historical_facts_tags ON public.historical_facts USING GIN (tags);

CREATE TABLE public.grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  historical_figure TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  max_points INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  -- facts_learned | streak | points | quiz_completed | perfect_quizzes
  -- (see src/components/AchievementsList.tsx)
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.streak_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  days INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  points_reward INTEGER NOT NULL DEFAULT 0,
  icon TEXT DEFAULT '🔥',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Everyone can read content; only admins can change it.
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['historical_periods', 'historical_facts', 'grades', 'achievements', 'streak_milestones']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Anyone can view %s" ON public.%I FOR SELECT USING (true)', t, t);
    EXECUTE format(
      'CREATE POLICY "Admins can manage %s" ON public.%I FOR ALL TO authenticated '
      'USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))',
      t, t
    );
  END LOOP;
END;
$$;

-- ============================================================================
-- Per-user activity
-- ============================================================================

CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fact_id UUID NOT NULL REFERENCES public.historical_facts(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, fact_id)
);

CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE public.daily_facts_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  facts_validated INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE TABLE public.daily_fact_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fact_id UUID NOT NULL REFERENCES public.historical_facts(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE TABLE public.daily_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE TABLE public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  exp_earned INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_streak_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.streak_milestones(id) ON DELETE CASCADE,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, milestone_id)
);

-- Force user_id to the caller on insert, whatever the client sent.
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- Users can read and insert their own rows; some tables also allow updates.
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'user_progress', 'user_achievements', 'daily_facts_progress', 'daily_fact_assignments',
    'daily_points', 'quiz_sessions', 'user_streak_milestones'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Users can view own %s" ON public.%I FOR SELECT USING (auth.uid() = user_id)', t, t);
    EXECUTE format('CREATE POLICY "Users can insert own %s" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)', t, t);
    EXECUTE format(
      'CREATE TRIGGER set_user_id_%s BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_user_id()',
      t, t
    );
  END LOOP;

  FOREACH t IN ARRAY ARRAY['user_progress', 'daily_facts_progress', 'daily_points']
  LOOP
    EXECUTE format(
      'CREATE POLICY "Users can update own %s" ON public.%I FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)',
      t, t
    );
  END LOOP;
END;
$$;

CREATE INDEX idx_daily_fact_assignments_user_date ON public.daily_fact_assignments (user_id, date);

-- Award streak milestones (and their points) when the streak goes up.
CREATE OR REPLACE FUNCTION public.check_streak_milestones()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  milestone RECORD;
BEGIN
  FOR milestone IN
    SELECT m.* FROM public.streak_milestones m
    WHERE m.days <= NEW.current_streak
      AND NOT EXISTS (
        SELECT 1 FROM public.user_streak_milestones u
        WHERE u.user_id = NEW.id AND u.milestone_id = m.id
      )
    ORDER BY m.days
  LOOP
    INSERT INTO public.user_streak_milestones (user_id, milestone_id)
    VALUES (NEW.id, milestone.id);

    UPDATE public.profiles
    SET points = COALESCE(points, 0) + milestone.points_reward
    WHERE id = NEW.id;
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER check_streak_milestones_trigger
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.current_streak > COALESCE(OLD.current_streak, 0))
  EXECUTE FUNCTION public.check_streak_milestones();

-- ============================================================================
-- API grants (RLS above still decides which rows are visible)
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON public.historical_periods, public.historical_facts, public.grades,
  public.achievements, public.streak_milestones TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO anon, authenticated, service_role;

-- ============================================================================
-- Storage: public bucket for AI-generated fact images
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('fact-images', 'fact-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Reference data
-- ============================================================================

-- Names match the "Monde entier" eras offered at onboarding (src/pages/Onboarding.tsx).
INSERT INTO public.historical_periods (name, description, start_year, end_year, order_index) VALUES
  ('Préhistoire', 'Des premiers humains à l''invention de l''écriture', -3000000, -3300, 1),
  ('Antiquité', 'De l''invention de l''écriture à la chute de Rome', -3300, 476, 2),
  ('Moyen Âge', 'De la chute de Rome à la fin du XVe siècle', 476, 1492, 3),
  ('Renaissance', 'Renouveau des arts, des sciences et grandes découvertes', 1400, 1600, 4),
  ('Époque moderne', 'Des grandes découvertes à la Révolution française', 1492, 1789, 5),
  ('Époque contemporaine', 'De la Révolution française à nos jours', 1789, NULL, 6);

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

INSERT INTO public.streak_milestones (days, name, description, points_reward, icon) VALUES
  (3, 'Débutant déterminé', 'Maintenez votre série pendant 3 jours', 50, '🌱'),
  (7, 'Apprenant régulier', 'Une semaine complète d''apprentissage', 100, '🔥'),
  (15, 'Passionné d''histoire', 'Deux semaines de constance', 200, '⭐'),
  (30, 'Expert en formation', 'Un mois entier de progression', 500, '🏆'),
  (60, 'Maître de l''histoire', 'Deux mois de dévouement', 1000, '👑'),
  (100, 'Légende vivante', 'Cent jours de savoir', 2000, '💎');

INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value, points_reward) VALUES
  ('Premier pas', 'Apprenez votre premier fait historique', '📜', 'facts_learned', 1, 10),
  ('Curieux', 'Apprenez 10 faits historiques', '📚', 'facts_learned', 10, 50),
  ('Encyclopédiste', 'Apprenez 50 faits historiques', '🏛️', 'facts_learned', 50, 200),
  ('Régulier', 'Atteignez une série de 7 jours', '🔥', 'streak', 7, 50),
  ('Collectionneur', 'Cumulez 500 points', '💰', 'points', 500, 100),
  ('Premier quiz', 'Terminez votre premier quiz', '❓', 'quiz_completed', 1, 10),
  ('Sans faute', 'Réussissez un quiz parfait', '🎯', 'perfect_quizzes', 1, 50);
