-- Redesign step 3: five daily facts on one theme (a region and an era), and a
-- streak that only grows when all of the day's facts are validated.
--
-- Both rules live in two functions the app calls (get_daily_facts,
-- validate_daily_fact) so they are applied atomically and can't be skipped
-- from the browser. Days are the user's local date, sent by the app and
-- accepted within a day of the server's date.

-- ============================================================================
-- Schema
-- ============================================================================

-- Several facts per day instead of one.
ALTER TABLE public.daily_fact_assignments
  DROP CONSTRAINT IF EXISTS daily_fact_assignments_user_id_date_key,
  ADD COLUMN slot SMALLINT,
  ADD CONSTRAINT daily_fact_assignments_user_date_fact_key UNIQUE (user_id, date, fact_id);

-- The day's theme.
ALTER TABLE public.daily_facts_progress
  ADD COLUMN region TEXT,
  ADD COLUMN period_id UUID REFERENCES public.historical_periods(id) ON DELETE SET NULL;

-- The streak used to follow any points change, quizzes included. It is now
-- set by validate_daily_fact only.
DROP TRIGGER IF EXISTS update_streak_on_profile_update ON public.profiles;
DROP FUNCTION IF EXISTS public.update_user_streak();

-- ============================================================================
-- Helpers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_activity_date(p_date DATE)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_date IS NULL OR p_date NOT BETWEEN CURRENT_DATE - 1 AND CURRENT_DATE + 1 THEN
    RAISE EXCEPTION 'Invalid date %', p_date;
  END IF;
END;
$$;

-- ============================================================================
-- get_daily_facts: the user's facts for a day, choosing them on first call
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_daily_facts(p_date DATE)
RETURNS TABLE (fact_id UUID, slot SMALLINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_regions TEXT[];
  v_periods UUID[];
  v_theme RECORD;
  v_previous RECORD;
  v_day_number INTEGER := p_date - DATE '1970-01-01';
  v_goal CONSTANT INTEGER := 5;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  PERFORM public.check_activity_date(p_date);

  -- Already chosen (and not left over from the old one-fact-per-day logic).
  IF EXISTS (
    SELECT 1 FROM public.daily_facts_progress dp
    WHERE dp.user_id = v_user AND dp.date = p_date AND dp.region IS NOT NULL
  ) THEN
    RETURN QUERY
      SELECT a.fact_id, a.slot FROM public.daily_fact_assignments a
      WHERE a.user_id = v_user AND a.date = p_date
      ORDER BY a.slot;
    RETURN;
  END IF;

  DELETE FROM public.daily_fact_assignments a WHERE a.user_id = v_user AND a.date = p_date;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user;

  -- Preferred regions ('worldwide' or nothing = all) and eras. Era preferences
  -- are free labels from onboarding ("Antiquité grecque et romaine"), matched
  -- to period names in either direction.
  v_regions := CASE
    WHEN v_profile.preferred_regions IS NULL
      OR cardinality(v_profile.preferred_regions) = 0
      OR 'worldwide' = ANY (v_profile.preferred_regions) THEN NULL
    ELSE v_profile.preferred_regions
  END;

  SELECT array_agg(p.id) INTO v_periods
  FROM public.historical_periods p
  WHERE EXISTS (
    SELECT 1 FROM unnest(v_profile.preferred_eras) AS e(name)
    WHERE position(lower(p.name) IN lower(e.name)) > 0
       OR position(lower(e.name) IN lower(p.name)) > 0
  );

  -- Facts the user hasn't learned or been given yet.
  CREATE TEMP TABLE IF NOT EXISTS _unseen (id UUID, region TEXT, period_id UUID, difficulty TEXT) ON COMMIT DROP;
  TRUNCATE _unseen;
  INSERT INTO _unseen
  SELECT f.id, f.region, f.period_id, f.difficulty
  FROM public.historical_facts f
  WHERE NOT EXISTS (SELECT 1 FROM public.user_progress up WHERE up.user_id = v_user AND up.fact_id = f.id AND up.completed)
    AND NOT EXISTS (SELECT 1 FROM public.daily_fact_assignments a WHERE a.user_id = v_user AND a.fact_id = f.id);

  -- Yesterday's theme, avoided when another one is possible.
  SELECT dp.region, dp.period_id INTO v_previous
  FROM public.daily_facts_progress dp
  WHERE dp.user_id = v_user AND dp.date = p_date - 1;

  -- Theme: a preferred (region, era) pair. Pairs with a full day of facts come
  -- first, then the day number rotates through them; otherwise the fullest pair.
  SELECT u.region, u.period_id, count(*) AS n INTO v_theme
  FROM _unseen u
  WHERE u.region IS NOT NULL AND u.period_id IS NOT NULL
    AND (v_regions IS NULL OR u.region = ANY (v_regions))
    AND (v_periods IS NULL OR u.period_id = ANY (v_periods))
  GROUP BY u.region, u.period_id
  ORDER BY
    (count(*) >= v_goal) DESC,
    (u.region IS NOT DISTINCT FROM v_previous.region AND u.period_id IS NOT DISTINCT FROM v_previous.period_id),
    CASE WHEN count(*) >= v_goal THEN md5(u.region || u.period_id::text || v_day_number::text) END,
    count(*) DESC,
    md5(u.region || u.period_id::text || v_day_number::text)
  LIMIT 1;

  -- No preferred pair left: any pair.
  IF v_theme.region IS NULL THEN
    SELECT u.region, u.period_id, count(*) AS n INTO v_theme
    FROM _unseen u
    WHERE u.region IS NOT NULL AND u.period_id IS NOT NULL
    GROUP BY u.region, u.period_id
    ORDER BY count(*) DESC, md5(u.region || u.period_id::text || v_day_number::text)
    LIMIT 1;
  END IF;

  IF v_theme.region IS NULL THEN
    RETURN; -- Nothing left to learn.
  END IF;

  -- Five facts: the theme first, then the same region, then the same era,
  -- then anything; preferred difficulties first within each group.
  INSERT INTO public.daily_fact_assignments (user_id, fact_id, date, slot)
  SELECT v_user, picked.id, p_date, row_number() OVER (ORDER BY picked.rank)::SMALLINT
  FROM (
    SELECT u.id,
      row_number() OVER (ORDER BY
        CASE
          WHEN u.region = v_theme.region AND u.period_id = v_theme.period_id THEN 0
          WHEN u.region = v_theme.region THEN 1
          WHEN u.period_id = v_theme.period_id THEN 2
          ELSE 3
        END,
        (u.difficulty = ANY (coalesce(v_profile.preferred_difficulty, ARRAY[]::TEXT[]))) DESC,
        md5(u.id::text || v_day_number::text)
      ) AS rank
    FROM _unseen u
  ) picked
  WHERE picked.rank <= v_goal;

  INSERT INTO public.daily_facts_progress (user_id, date, facts_validated, region, period_id)
  VALUES (v_user, p_date, 0, v_theme.region, v_theme.period_id)
  ON CONFLICT (user_id, date) DO UPDATE
    SET region = EXCLUDED.region, period_id = EXCLUDED.period_id;

  RETURN QUERY
    SELECT a.fact_id, a.slot FROM public.daily_fact_assignments a
    WHERE a.user_id = v_user AND a.date = p_date
    ORDER BY a.slot;
END;
$$;

-- ============================================================================
-- validate_daily_fact: learn one of the day's facts
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_daily_fact(p_fact_id UUID, p_date DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_reward INTEGER;
  v_validated INTEGER;
  v_goal INTEGER;
  v_already BOOLEAN;
  v_day_completed BOOLEAN := false;
  v_profile public.profiles%ROWTYPE;
  v_streak INTEGER;
  v_facts_learned INTEGER;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  PERFORM public.check_activity_date(p_date);

  IF NOT EXISTS (
    SELECT 1 FROM public.daily_fact_assignments
    WHERE user_id = v_user AND date = p_date AND fact_id = p_fact_id
  ) THEN
    RAISE EXCEPTION 'This fact is not one of today''s facts';
  END IF;

  SELECT coalesce(points_reward, 10) INTO v_reward FROM public.historical_facts WHERE id = p_fact_id;
  SELECT count(*) INTO v_goal FROM public.daily_fact_assignments WHERE user_id = v_user AND date = p_date;

  SELECT EXISTS (
    SELECT 1 FROM public.user_progress WHERE user_id = v_user AND fact_id = p_fact_id AND completed
  ) INTO v_already;

  IF NOT v_already THEN
    INSERT INTO public.user_progress (user_id, fact_id, completed, completed_at, attempts)
    VALUES (v_user, p_fact_id, true, now(), 1)
    ON CONFLICT (user_id, fact_id) DO UPDATE SET completed = true, completed_at = now();

    INSERT INTO public.daily_points (user_id, date, points_earned)
    VALUES (v_user, p_date, v_reward)
    ON CONFLICT (user_id, date) DO UPDATE SET points_earned = daily_points.points_earned + v_reward;

    UPDATE public.profiles SET points = coalesce(points, 0) + v_reward WHERE id = v_user;
  END IF;

  -- Recount from the facts themselves, so the counter can't drift.
  SELECT count(*) INTO v_validated
  FROM public.daily_fact_assignments a
  JOIN public.user_progress up ON up.user_id = a.user_id AND up.fact_id = a.fact_id AND up.completed
  WHERE a.user_id = v_user AND a.date = p_date;

  UPDATE public.daily_facts_progress SET facts_validated = v_validated
  WHERE user_id = v_user AND date = p_date;

  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user;
  v_streak := coalesce(v_profile.current_streak, 0);

  -- All of the day's facts learned: the day counts for the streak (once).
  IF v_validated >= v_goal AND v_profile.last_activity_date IS DISTINCT FROM p_date THEN
    v_streak := CASE
      WHEN v_profile.last_activity_date = p_date - 1 THEN v_streak + 1
      ELSE 1
    END;
    v_day_completed := true;
  END IF;

  SELECT count(*) INTO v_facts_learned FROM public.user_progress WHERE user_id = v_user AND completed;

  UPDATE public.profiles SET
    current_streak = v_streak,
    last_activity_date = CASE WHEN v_day_completed THEN p_date ELSE last_activity_date END,
    exp = coalesce(points, 0) * 2 + v_streak * 10 + v_facts_learned * 5
  WHERE id = v_user;

  -- Read back after the streak milestone trigger, which may add bonus points.
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user;

  RETURN jsonb_build_object(
    'facts_validated', v_validated,
    'goal', v_goal,
    'day_completed', v_validated >= v_goal,
    'points', v_profile.points,
    'current_streak', v_profile.current_streak,
    'already_validated', v_already
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_daily_facts(DATE) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_daily_fact(UUID, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_daily_facts(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_daily_fact(UUID, DATE) TO authenticated;
