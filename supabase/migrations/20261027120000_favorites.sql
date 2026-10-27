-- Favorites: facts and quotes a user keeps, shown on the /favoris page.
-- Each row holds either a fact or a quote. Safe to run again.

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fact_id UUID REFERENCES public.historical_facts(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT favorites_one_item CHECK ((fact_id IS NULL) <> (quote_id IS NULL)),
  CONSTRAINT favorites_unique_fact UNIQUE (user_id, fact_id),
  CONSTRAINT favorites_unique_quote UNIQUE (user_id, quote_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_created ON public.favorites (user_id, created_at DESC);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_user_id_favorites ON public.favorites;
CREATE TRIGGER set_user_id_favorites
  BEFORE INSERT ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
