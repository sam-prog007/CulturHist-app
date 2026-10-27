import { supabase } from "@/integrations/supabase/client";

export interface Era {
  id: string;
  name: string;
  startYear: number | null;
  endYear: number | null;
  learned: number;
  total: number;
}

/** What the map and the timeline need to know about each fact. */
export interface MapFact {
  id: string;
  title: string;
  year: number | null;
  dateText: string | null;
  periodId: string | null;
  countries: string[];
  region: string | null;
}

export interface LearningProgress {
  /** Facts learned per country (ISO alpha-2). */
  byCountry: Record<string, number>;
  eras: Era[];
  /** Every fact, learned or not, for the map's country panel and the timeline's dots. */
  facts: MapFact[];
  learnedIds: Set<string>;
  /** The most recently learned fact: "vous êtes ici" on the timeline. */
  lastLearnedId: string | null;
  preferredRegions: string[];
  preferredEras: string[];
}

/** What the user has learned where and when, plus their region and era preferences. */
export async function getLearningProgress(userId: string): Promise<LearningProgress> {
  const [learned, facts, periods, profile] = await Promise.all([
    supabase
      .from("user_progress")
      .select("fact_id, completed_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("completed_at", { ascending: false }),
    supabase.from("historical_facts").select("id, title, title_fr, year, date_text, date_text_fr, period_id, countries, region"),
    supabase.from("historical_periods").select("id, name, start_year, end_year, order_index").order("order_index"),
    supabase.from("profiles").select("preferred_regions, preferred_eras").eq("id", userId).single(),
  ]);
  if (learned.error) throw learned.error;
  if (facts.error) throw facts.error;

  const learnedIds = new Set((learned.data ?? []).map((p) => p.fact_id));
  const allFacts: MapFact[] = (facts.data ?? []).map((f) => ({
    id: f.id,
    title: f.title_fr || f.title,
    year: f.year,
    dateText: f.date_text_fr || f.date_text,
    periodId: f.period_id,
    countries: f.countries ?? [],
    region: f.region,
  }));

  const byCountry: Record<string, number> = {};
  const learnedByEra: Record<string, number> = {};
  const totalByEra: Record<string, number> = {};
  for (const fact of allFacts) {
    if (fact.periodId) totalByEra[fact.periodId] = (totalByEra[fact.periodId] ?? 0) + 1;
    if (!learnedIds.has(fact.id)) continue;
    for (const code of fact.countries) byCountry[code] = (byCountry[code] ?? 0) + 1;
    if (fact.periodId) learnedByEra[fact.periodId] = (learnedByEra[fact.periodId] ?? 0) + 1;
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
    facts: allFacts,
    learnedIds,
    lastLearnedId: learned.data?.[0]?.fact_id ?? null,
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
