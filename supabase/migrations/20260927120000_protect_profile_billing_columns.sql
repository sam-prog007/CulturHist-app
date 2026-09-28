-- The "Users can update own profile" policy allows a user to update every column
-- of their own row, including the billing columns. Anyone could therefore grant
-- themselves premium from the browser console. Block changes coming from end-user
-- API roles; the service role (check-subscription edge function) and direct SQL
-- (dashboard / migrations, where there is no JWT) are unaffected.
CREATE OR REPLACE FUNCTION public.protect_profile_billing_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.role() IN ('anon', 'authenticated') AND (
       NEW.is_premium IS DISTINCT FROM OLD.is_premium
    OR NEW.premium_until IS DISTINCT FROM OLD.premium_until
    OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
  ) THEN
    RAISE EXCEPTION 'Billing columns can only be updated by the server';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_billing_columns_trigger ON public.profiles;
CREATE TRIGGER protect_profile_billing_columns_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_billing_columns();
