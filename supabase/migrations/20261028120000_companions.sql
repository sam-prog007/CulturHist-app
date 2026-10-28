-- Historical companions: Napoléon from the start, the others joining at the
-- grades' point thresholds (src/lib/companions.ts). The user picks the one
-- that goes with them. Safe to run again.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS companion TEXT DEFAULT 'napoleon',
  -- How many unlocks the user has already seen celebrated, so each unlock
  -- screen shows once. Napoléon, given at sign-up, counts as seen.
  ADD COLUMN IF NOT EXISTS companions_seen INTEGER DEFAULT 1;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_companion_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_companion_check CHECK (
  companion IN ('napoleon', 'imhotep', 'marco-polo', 'leonard', 'cesar', 'socrate', 'ramses', 'cleopatre', 'confucius', 'alexandre')
);

-- Existing users already have their points: their companions are unlocked
-- without a celebration for each one.
UPDATE public.profiles p
SET companions_seen = (
  SELECT count(*) FROM unnest(ARRAY[0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200]) AS t(points)
  WHERE coalesce(p.points, 0) >= t.points
)
WHERE companions_seen = 1;
