-- New accounts also come from Apple and Google now, without a chosen username.
-- The profile's username is UNIQUE, so the old trigger (e-mail prefix as is)
-- made the whole sign-up fail as soon as two people shared a prefix, as
-- jean@gmail.com and jean@yahoo.fr do. Build a name the app accepts
-- (letters, digits, - and _, 3 to 30 characters) and add digits until it is free.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base TEXT;
  candidate TEXT;
BEGIN
  base := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'username', ''),
    -- Apple's hidden addresses have a random prefix: the name reads better.
    CASE WHEN NEW.email NOT LIKE '%@privaterelay.appleid.com' THEN split_part(NEW.email, '@', 1) END,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );
  base := regexp_replace(regexp_replace(base, '[.\s]+', '_', 'g'), '[^A-Za-z0-9_-]', '', 'g');
  base := left(base, 24);
  IF length(base) < 3 THEN
    base := 'historien';
  END IF;

  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    candidate := base || '_' || (1000 + floor(random() * 9000))::INT;
  END LOOP;

  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, candidate);
  RETURN NEW;
END;
$$;
