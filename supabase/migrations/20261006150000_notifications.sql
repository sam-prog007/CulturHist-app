-- Redesign step 7: push notifications ("Ce jour-là" and the daily facts reminder).
-- Devices subscribe through the browser Push API; the send-notifications edge
-- function, called every 15 minutes, sends each enabled notification once a
-- day at the user's chosen local time. Safe to run again.

-- Per-user settings. Times are local to `timezone` (IANA name sent by the app).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Paris',
  ADD COLUMN IF NOT EXISTS notify_on_this_day BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_on_this_day_time TIME DEFAULT '08:00',
  ADD COLUMN IF NOT EXISTS notify_daily_facts BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_daily_facts_time TIME DEFAULT '18:00',
  -- Local dates of the last sends, so each notification goes out once a day.
  ADD COLUMN IF NOT EXISTS last_on_this_day_sent_on DATE,
  ADD COLUMN IF NOT EXISTS last_daily_facts_sent_on DATE;

-- One row per device that accepted notifications.
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can insert own push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view own push_subscriptions" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own push_subscriptions" ON public.push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own push_subscriptions" ON public.push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own push_subscriptions" ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS set_user_id_push_subscriptions ON public.push_subscriptions;
CREATE TRIGGER set_user_id_push_subscriptions
  BEFORE INSERT ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
