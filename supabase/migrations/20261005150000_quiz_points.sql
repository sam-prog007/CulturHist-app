-- Redesign step 4: quizzes on a chosen region, era and difficulty. They give
-- points only (never the streak). complete_quiz records the session and awards
-- the points in one call, with the amount computed and capped server side.

CREATE OR REPLACE FUNCTION public.complete_quiz(p_score INTEGER, p_total INTEGER, p_difficulty TEXT, p_date DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_base INTEGER;
  v_points INTEGER;
  v_total_points INTEGER;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  PERFORM public.check_activity_date(p_date);
  IF p_total NOT BETWEEN 1 AND 20 OR p_score NOT BETWEEN 0 AND p_total THEN
    RAISE EXCEPTION 'Invalid score % / %', p_score, p_total;
  END IF;

  -- Harder quizzes are worth more; "all difficulties" counts as medium.
  v_base := CASE p_difficulty WHEN 'easy' THEN 20 WHEN 'hard' THEN 40 ELSE 30 END;
  v_points := round(v_base * p_score::NUMERIC / p_total) + CASE WHEN p_score = p_total THEN 10 ELSE 0 END;

  INSERT INTO public.quiz_sessions (user_id, score, total_questions, exp_earned)
  VALUES (v_user, p_score, p_total, 0);

  IF v_points > 0 THEN
    INSERT INTO public.daily_points (user_id, date, points_earned)
    VALUES (v_user, p_date, v_points)
    ON CONFLICT (user_id, date) DO UPDATE SET points_earned = daily_points.points_earned + v_points;

    UPDATE public.profiles SET points = coalesce(points, 0) + v_points WHERE id = v_user;
  END IF;

  SELECT points INTO v_total_points FROM public.profiles WHERE id = v_user;
  RETURN jsonb_build_object('points_earned', v_points, 'points', v_total_points);
END;
$$;

REVOKE ALL ON FUNCTION public.complete_quiz(INTEGER, INTEGER, TEXT, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_quiz(INTEGER, INTEGER, TEXT, DATE) TO authenticated;
