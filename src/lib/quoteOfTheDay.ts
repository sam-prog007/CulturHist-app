import { supabase } from "@/integrations/supabase/client";
import { localDayNumber } from "@/lib/dates";

/** The same quote for everyone on a given day, cycling through all quotes. */
export async function getQuoteOfTheDay(date = new Date()) {
  const { data, error } = await supabase.from("quotes").select("*").order("slug");
  if (error) throw error;
  if (!data?.length) return null;
  return data[localDayNumber(date) % data.length];
}
