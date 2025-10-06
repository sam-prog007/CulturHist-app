-- Créer une table pour suivre les faits validés par jour
CREATE TABLE IF NOT EXISTS public.daily_facts_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  facts_validated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_facts_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own daily progress
CREATE POLICY "Users can view own daily progress"
ON public.daily_facts_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own daily progress
CREATE POLICY "Users can insert own daily progress"
ON public.daily_facts_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own daily progress
CREATE POLICY "Users can update own daily progress"
ON public.daily_facts_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Créer une table pour les sessions de quiz
CREATE TABLE IF NOT EXISTS public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  exp_earned INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own quiz sessions
CREATE POLICY "Users can view own quiz sessions"
ON public.quiz_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own quiz sessions
CREATE POLICY "Users can insert own quiz sessions"
ON public.quiz_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);