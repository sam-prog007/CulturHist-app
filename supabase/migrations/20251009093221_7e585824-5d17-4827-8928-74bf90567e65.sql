-- Update region values to match preference regions
UPDATE public.historical_facts 
SET region = CASE 
  WHEN region = 'north_africa' THEN 'africa'
  WHEN region = 'west_africa' THEN 'africa'
  WHEN region = 'east_asia' THEN 'asia'
  WHEN region = 'southeast_asia' THEN 'asia'
  WHEN region = 'north_america' THEN 'americas'
  WHEN region = 'middle_east' THEN 'middle-east'
  ELSE region
END;