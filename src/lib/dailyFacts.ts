import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { todayKey } from "@/lib/dates";

export type DailyFact = Tables<"historical_facts"> & {
  historical_periods: { name: string } | null;
  validated: boolean;
};

export interface DailyFacts {
  facts: DailyFact[];
  /** The day's theme, e.g. region "europe" and era "Moyen Âge". */
  region: string | null;
  era: string | null;
  validated: number;
}

export interface ValidationResult {
  facts_validated: number;
  goal: number;
  day_completed: boolean;
  points: number;
  current_streak: number;
  already_validated: boolean;
}

/** The user's facts for today, chosen by the server on the first call of the day. */
export async function getDailyFacts(userId: string, date = todayKey()): Promise<DailyFacts> {
  const { data: slots, error } = await supabase.rpc("get_daily_facts", { p_date: date });
  if (error) throw error;
  const ids = (slots ?? []).map((s) => s.fact_id);

  const [factsResult, progressResult, learnedResult] = await Promise.all([
    ids.length
      ? supabase.from("historical_facts").select("*, historical_periods(name)").in("id", ids)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("daily_facts_progress")
      .select("region, period_id, facts_validated")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle(),
    ids.length
      ? supabase.from("user_progress").select("fact_id").eq("user_id", userId).eq("completed", true).in("fact_id", ids)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (factsResult.error) throw factsResult.error;

  const learned = new Set((learnedResult.data ?? []).map((p) => p.fact_id));
  const byId = new Map((factsResult.data ?? []).map((f) => [f.id, f]));
  const facts = ids
    .map((id) => byId.get(id))
    .filter((f): f is NonNullable<typeof f> => !!f)
    .map((f) => ({ ...f, validated: learned.has(f.id) }));

  const progress = progressResult.data;
  let era: string | null = null;
  if (progress?.period_id) {
    const { data } = await supabase.from("historical_periods").select("name").eq("id", progress.period_id).maybeSingle();
    era = data?.name ?? null;
  }

  return { facts, region: progress?.region ?? null, era, validated: learned.size };
}

/** Learn one of today's facts: points, and the streak once all of them are learned. */
export async function validateDailyFact(factId: string, date = todayKey()): Promise<ValidationResult> {
  const { data, error } = await supabase.rpc("validate_daily_fact", { p_fact_id: factId, p_date: date });
  if (error) throw error;
  return data as unknown as ValidationResult;
}

export const REGION_LABELS: Record<string, string> = {
  europe: "Europe",
  asia: "Asie",
  africa: "Afrique",
  americas: "Amériques",
  oceania: "Océanie",
  "middle-east": "Moyen-Orient",
};
