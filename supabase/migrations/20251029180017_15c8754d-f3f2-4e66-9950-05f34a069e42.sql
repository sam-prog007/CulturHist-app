-- Add French columns to historical_facts table
ALTER TABLE public.historical_facts
ADD COLUMN title_fr TEXT,
ADD COLUMN description_fr TEXT,
ADD COLUMN date_text_fr TEXT,
ADD COLUMN region_fr TEXT,
ADD COLUMN tags_fr TEXT[];