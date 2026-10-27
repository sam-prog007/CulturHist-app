-- Streak engagement, in the style of Duolingo: best streak record, milestone and
-- record details returned when a day is completed, and the settings of the
-- streak notifications sent by the send-notifications edge function
-- ("série en danger", "dernière chance", "série perdue", "tu nous manques").
-- Safe to run again.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
  -- Streak reminder: at the chosen local time when today's facts are not done.
  ADD COLUMN IF NOT EXISTS notify_streak BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_streak_time TIME DEFAULT '20:00',
  -- Local dates of the last sends, so each one goes out once.
  ADD COLUMN IF NOT EXISTS last_streak_reminder_sent_on DATE,
  ADD COLUMN IF NOT EXISTS last_last_chance_sent_on DATE,
  ADD COLUMN IF NOT EXISTS last_streak_lost_sent_on DATE,
  ADD COLUMN IF NOT EXISTS last_comeback_sent_on DATE;

-- Best streak so far: at least the current one.
UPDATE public.profiles
SET longest_streak = greatest(coalesce(longest_streak, 0), coalesce(current_streak, 0));

-- ============================================================================
-- validate_daily_fact: same as in 20261005120000_daily_themed_facts.sql, plus
-- longest_streak, and what the celebration screen shows: whether the streak
-- grew today, a new record, the milestone reached.
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
  v_new_record BOOLEAN := false;
  v_milestone JSONB;
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

  -- A new record only counts once the streak beats the previous best.
  v_new_record := v_day_completed AND v_streak > coalesce(v_profile.longest_streak, 0) AND v_streak > 1;

  UPDATE public.profiles SET
    current_streak = v_streak,
    longest_streak = greatest(coalesce(longest_streak, 0), v_streak),
    last_activity_date = CASE WHEN v_day_completed THEN p_date ELSE last_activity_date END,
    exp = coalesce(points, 0) * 2 + v_streak * 10 + v_facts_learned * 5
  WHERE id = v_user;

  -- Read back after the streak milestone trigger, which may add bonus points.
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_user;

  IF v_day_completed THEN
    SELECT jsonb_build_object('days', days, 'name', name, 'icon', icon, 'points_reward', points_reward)
    INTO v_milestone
    FROM public.streak_milestones WHERE days = v_streak;
  END IF;

  RETURN jsonb_build_object(
    'facts_validated', v_validated,
    'goal', v_goal,
    'day_completed', v_validated >= v_goal,
    'points', v_profile.points,
    'current_streak', v_profile.current_streak,
    'longest_streak', v_profile.longest_streak,
    'streak_increased', v_day_completed,
    'new_record', v_new_record,
    'milestone', v_milestone,
    'already_validated', v_already
  );
END;
$$;

REVOKE ALL ON FUNCTION public.validate_daily_fact(UUID, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.validate_daily_fact(UUID, DATE) TO authenticated;
