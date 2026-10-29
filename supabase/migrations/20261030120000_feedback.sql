-- Feedback: what testers and users write from "Donner mon avis" (Profil and
-- Réglages). They can only send; read the messages in the Supabase dashboard
-- (Table Editor → feedback). Deleted with the account. Safe to run again.

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 1 = pas convaincu ... 4 = adore, or none.
  mood SMALLINT CHECK (mood BETWEEN 1 AND 4),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 4000),
  -- Where it was sent from, the app version and the device, to reproduce a bug.
  page TEXT,
  app_version TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.feedback (created_at DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can send feedback" ON public.feedback;
CREATE POLICY "Users can send feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_user_id_feedback ON public.feedback;
CREATE TRIGGER set_user_id_feedback
  BEFORE INSERT ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

GRANT INSERT ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
