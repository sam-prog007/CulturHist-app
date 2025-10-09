-- Create table for daily fact assignments
CREATE TABLE IF NOT EXISTS public.daily_fact_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  fact_id uuid NOT NULL REFERENCES public.historical_facts(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_fact_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own daily facts"
ON public.daily_fact_assignments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily facts"
ON public.daily_fact_assignments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_daily_fact_assignments_user_date ON public.daily_fact_assignments(user_id, date);