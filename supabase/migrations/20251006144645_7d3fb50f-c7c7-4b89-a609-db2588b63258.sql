-- Add tracking fields to profiles table for streak and experience
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS exp INTEGER DEFAULT 0;

-- Update existing historical facts with image URLs
UPDATE public.historical_facts
SET image_url = 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800'
WHERE title = 'La prise de la Bastille';

UPDATE public.historical_facts
SET image_url = 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800'
WHERE title = 'Le couronnement de Napoléon';

UPDATE public.historical_facts
SET image_url = 'https://images.unsplash.com/photo-1568864123469-99d3c8eb6e6e?w=800'
WHERE title = 'La découverte de l''Amérique';

UPDATE public.historical_facts
SET image_url = 'https://images.unsplash.com/photo-1529243856184-fd5465488984?w=800'
WHERE title = 'La construction de la Tour Eiffel';

UPDATE public.historical_facts
SET image_url = 'https://images.unsplash.com/photo-1574109577284-7190e3e6b0dc?w=800'
WHERE title = 'Le premier pas sur la Lune';

UPDATE public.historical_facts
SET image_url = 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=800'
WHERE title = 'La chute du mur de Berlin';

UPDATE public.historical_facts
SET image_url = 'https://images.unsplash.com/photo-1548113980-0c1cf9d48101?w=800'
WHERE title = 'L''invention de l''imprimerie';

UPDATE public.historical_facts
SET image_url = 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=800'
WHERE title = 'La Renaissance italienne';

UPDATE public.historical_facts
SET image_url = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800'
WHERE title = 'L''ère des grandes découvertes';

UPDATE public.historical_facts
SET image_url = 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?w=800'
WHERE title = 'La Révolution industrielle';