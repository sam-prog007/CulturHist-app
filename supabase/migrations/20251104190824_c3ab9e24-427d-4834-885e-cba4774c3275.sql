-- Create streak milestones table
CREATE TABLE IF NOT EXISTS public.streak_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  days INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  points_reward INTEGER NOT NULL DEFAULT 0,
  icon TEXT DEFAULT '🔥',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.streak_milestones ENABLE ROW LEVEL SECURITY;

-- Anyone can view streak milestones
CREATE POLICY "Anyone can view streak milestones"
  ON public.streak_milestones
  FOR SELECT
  USING (true);

-- Insert default streak milestones
INSERT INTO public.streak_milestones (days, name, description, points_reward, icon) VALUES
  (3, 'Débutant déterminé', 'Maintenez votre série pendant 3 jours', 50, '🌱'),
  (7, 'Apprenant régulier', 'Une semaine complète d''apprentissage', 100, '🔥'),
  (15, 'Passionné d''histoire', 'Deux semaines de constance', 200, '⭐'),
  (30, 'Expert en formation', 'Un mois entier de progression', 500, '🏆'),
  (60, 'Maître de l''histoire', 'Deux mois de dévouement', 1000, '👑'),
  (100, 'Légende vivante', 'Cent jours de savoir', 2000, '💎')
ON CONFLICT (days) DO NOTHING;