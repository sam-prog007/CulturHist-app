-- Redesign step 1: richer fact metadata and quotes of the day.
--
-- Language convention, shared by every content table: the base column holds
-- English and the `_fr` column holds French (title / title_fr, text / text_fr).
-- The app is French-first, so French is required on new tables.

-- ============================================================================
-- Fact metadata
-- ============================================================================

ALTER TABLE public.historical_facts
  -- Stable key so content files can be re-run as upserts (supabase/content/).
  ADD COLUMN slug TEXT UNIQUE,
  -- When it happened. Negative years are BCE (-44 = 44 av. J.-C.); there is no year 0.
  -- month/day are set when the exact date is known and feed "On this day".
  ADD COLUMN year INTEGER CHECK (year IS NULL OR year <> 0),
  ADD COLUMN month SMALLINT CHECK (month BETWEEN 1 AND 12),
  ADD COLUMN day SMALLINT CHECK (day BETWEEN 1 AND 31),
  -- Present-day countries where it happened, as ISO 3166-1 alpha-2 codes ({FR}, {EG}).
  -- Drives the progress shown on the world map.
  ADD COLUMN countries TEXT[] CHECK (
    countries IS NULL
    OR cardinality(countries) = 0
    OR array_to_string(countries, ',') ~ '^[A-Z]{2}(,[A-Z]{2})*$'
  ),
  -- Where the text can be checked (e.g. the Wikipedia article).
  ADD COLUMN source_url TEXT,
  -- Real photos, paintings or illustrations only, never AI-generated.
  -- image_credit is shown under the image; image_source_url links to the page
  -- that states author and license (e.g. the Wikimedia Commons file page).
  ADD COLUMN image_credit TEXT,
  ADD COLUMN image_source_url TEXT,
  ADD CONSTRAINT historical_facts_day_needs_month CHECK (day IS NULL OR month IS NOT NULL);

CREATE INDEX idx_historical_facts_month_day ON public.historical_facts (month, day);
CREATE INDEX idx_historical_facts_countries ON public.historical_facts USING GIN (countries);

-- ============================================================================
-- Quotes of the day
-- ============================================================================

CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  text_fr TEXT NOT NULL,
  text TEXT,
  -- Wording in the original language when it is not French or English ("Veni, vidi, vici").
  original_text TEXT,
  author TEXT NOT NULL,
  -- Where and when it was said or written ("Discours à la Chambre des communes").
  context_fr TEXT,
  context TEXT,
  year INTEGER CHECK (year IS NULL OR year <> 0),
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quotes"
  ON public.quotes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage quotes"
  ON public.quotes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.quotes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
