import { supabase } from "@/integrations/supabase/client";

export interface Era {
  id: string;
  name: string;
  startYear: number | null;
  endYear: number | null;
  learned: number;
  total: number;
}

export interface LearningProgress {
  /** Facts learned per country (ISO alpha-2). */
  byCountry: Record<string, number>;
  eras: Era[];
  preferredRegions: string[];
  preferredEras: string[];
}

/** What the user has learned where and when, plus their region and era preferences. */
export async function getLearningProgress(userId: string): Promise<LearningProgress> {
  const [learned, facts, periods, profile] = await Promise.all([
    supabase
      .from("user_progress")
      .select("historical_facts (countries, period_id)")
      .eq("user_id", userId)
      .eq("completed", true),
    supabase.from("historical_facts").select("period_id"),
    supabase.from("historical_periods").select("id, name, start_year, end_year, order_index").order("order_index"),
    supabase.from("profiles").select("preferred_regions, preferred_eras").eq("id", userId).single(),
  ]);
  if (learned.error) throw learned.error;

  const byCountry: Record<string, number> = {};
  const learnedByEra: Record<string, number> = {};
  for (const row of learned.data ?? []) {
    const fact = row.historical_facts;
    if (!fact) continue;
    for (const code of fact.countries ?? []) byCountry[code] = (byCountry[code] ?? 0) + 1;
    if (fact.period_id) learnedByEra[fact.period_id] = (learnedByEra[fact.period_id] ?? 0) + 1;
  }

  const totalByEra: Record<string, number> = {};
  for (const f of facts.data ?? []) {
    if (f.period_id) totalByEra[f.period_id] = (totalByEra[f.period_id] ?? 0) + 1;
  }

  return {
    byCountry,
    eras: (periods.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      startYear: p.start_year,
      endYear: p.end_year,
      learned: learnedByEra[p.id] ?? 0,
      total: totalByEra[p.id] ?? 0,
    })),
    // "worldwide" (from onboarding) means no region filter.
    preferredRegions: (profile.data?.preferred_regions ?? []).filter((r) => r !== "worldwide"),
    preferredEras: profile.data?.preferred_eras ?? [],
  };
}

/** Saves region and/or era preferences; they shape the daily facts from the next day. */
export async function savePreferences(userId: string, prefs: { regions?: string[]; eras?: string[] }) {
  const { error } = await supabase
    .from("profiles")
    .update({
      ...(prefs.regions && { preferred_regions: prefs.regions }),
      ...(prefs.eras && { preferred_eras: prefs.eras }),
    })
    .eq("id", userId);
  if (error) throw error;
}
