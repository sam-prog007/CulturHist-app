-- Add tags column to historical_facts table for more flexible categorization
ALTER TABLE public.historical_facts 
ADD COLUMN IF NOT EXISTS tags text[];

-- Create index for better performance when filtering by tags
CREATE INDEX IF NOT EXISTS idx_historical_facts_tags ON public.historical_facts USING GIN(tags);

-- Update existing facts with relevant tags based on their region and content
UPDATE public.historical_facts 
SET tags = ARRAY[
  LOWER(COALESCE(region, 'mondial')),
  LOWER(COALESCE(difficulty, 'moyen'))
]
WHERE tags IS NULL;

-- Add preferred_tags column to profiles for more granular user preferences
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_tags text[];