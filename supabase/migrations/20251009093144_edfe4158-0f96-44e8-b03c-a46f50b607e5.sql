-- Add region column to historical_facts
ALTER TABLE public.historical_facts 
ADD COLUMN region text;

-- Update existing facts with appropriate regions based on their content
UPDATE public.historical_facts 
SET region = CASE 
  WHEN title ILIKE '%egypt%' OR title ILIKE '%pyramids%' THEN 'north_africa'
  WHEN title ILIKE '%greek%' OR title ILIKE '%alexander%' THEN 'europe'
  WHEN title ILIKE '%roman%' OR title ILIKE '%colosseum%' THEN 'europe'
  WHEN title ILIKE '%china%' OR title ILIKE '%wall%' THEN 'east_asia'
  WHEN title ILIKE '%viking%' THEN 'europe'
  WHEN title ILIKE '%maya%' OR title ILIKE '%machu picchu%' THEN 'americas'
  WHEN title ILIKE '%mesopotamia%' THEN 'middle_east'
  WHEN title ILIKE '%persia%' OR title ILIKE '%persian%' THEN 'middle_east'
  WHEN title ILIKE '%phoenician%' THEN 'middle_east'
  WHEN title ILIKE '%mali%' THEN 'west_africa'
  WHEN title ILIKE '%angkor%' THEN 'southeast_asia'
  WHEN title ILIKE '%samurai%' OR title ILIKE '%japan%' THEN 'east_asia'
  WHEN title ILIKE '%medieval%' OR title ILIKE '%knights%' THEN 'europe'
  WHEN title ILIKE '%renaissance%' OR title ILIKE '%da vinci%' OR title ILIKE '%mona lisa%' THEN 'europe'
  WHEN title ILIKE '%reformation%' OR title ILIKE '%luther%' THEN 'europe'
  WHEN title ILIKE '%columbus%' THEN 'europe'
  WHEN title ILIKE '%galileo%' THEN 'europe'
  WHEN title ILIKE '%gutenberg%' THEN 'europe'
  WHEN title ILIKE '%french revolution%' OR title ILIKE '%napoleon%' THEN 'europe'
  WHEN title ILIKE '%industrial revolution%' THEN 'europe'
  WHEN title ILIKE '%curie%' THEN 'europe'
  WHEN title ILIKE '%wright%' THEN 'north_america'
  ELSE 'europe'
END
WHERE region IS NULL;