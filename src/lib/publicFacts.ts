import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { localDayNumber } from "@/lib/dates";

/*
 * Facts anyone can read without an account (the table is readable by anon),
 * for the discovery page and the fact pages. One query loads them all: there
 * are a few hundred, and moving from one fact page to another is then instant.
 */

export interface PublicFact {
  slug: string;
  title: string;
  text: string;
  dateText: string | null;
  year: number | null;
  region: string | null;
  periodId: string | null;
  periodName: string | null;
  periodOrder: number;
  imageUrl: string | null;
  imageCredit: string | null;
  imageSourceUrl: string | null;
  sourceUrl: string | null;
}

async function fetchPublicFacts(): Promise<PublicFact[]> {
  const { data, error } = await supabase
    .from("historical_facts")
    .select(
      "slug, title, title_fr, description, description_fr, date_text, date_text_fr, year, region_fr, period_id, image_url, image_credit, image_source_url, source_url, historical_periods(name, order_index)"
    )
    .not("slug", "is", null)
    .order("slug");
  if (error) throw error;
  return (data ?? []).map((f) => ({
    slug: f.slug!,
    title: f.title_fr || f.title,
    text: f.description_fr || f.description,
    dateText: f.date_text_fr || f.date_text,
    year: f.year,
    region: f.region_fr,
    periodId: f.period_id,
    periodName: f.historical_periods?.name ?? null,
    periodOrder: f.historical_periods?.order_index ?? 99,
    imageUrl: f.image_url,
    imageCredit: f.image_credit,
    imageSourceUrl: f.image_source_url,
    sourceUrl: f.source_url,
  }));
}

export const usePublicFacts = () =>
  useQuery({ queryKey: ["public-facts"], queryFn: fetchPublicFacts, staleTime: 60 * 60 * 1000 });

/** The same few illustrated facts for everyone on a given day, a new set each day. */
export function factsOfTheDay(facts: PublicFact[], count: number, date = new Date()): PublicFact[] {
  const pool = facts.filter((f) => f.imageUrl);
  if (pool.length <= count) return pool;
  const start = (localDayNumber(date) * count) % pool.length;
  return Array.from({ length: count }, (_, i) => pool[(start + i) % pool.length]);
}

/** Every fact by period, in historical order: the table of contents of the site. */
export function factsByPeriod(facts: PublicFact[]) {
  const groups = new Map<string, { name: string; order: number; facts: PublicFact[] }>();
  for (const fact of facts) {
    const name = fact.periodName ?? "Autres époques";
    const group = groups.get(name) ?? { name, order: fact.periodOrder, facts: [] };
    group.facts.push(fact);
    groups.set(name, group);
  }
  return [...groups.values()]
    .sort((a, b) => a.order - b.order)
    .map((g) => ({ ...g, facts: g.facts.sort((a, b) => (a.year ?? 0) - (b.year ?? 0)) }));
}

/** A few facts of the same era, illustrated ones first. */
export function relatedFacts(facts: PublicFact[], fact: PublicFact, count = 3): PublicFact[] {
  return facts
    .filter((f) => f.slug !== fact.slug && f.periodId === fact.periodId)
    .sort((a, b) => Number(!!b.imageUrl) - Number(!!a.imageUrl) || Math.abs((a.year ?? 0) - (fact.year ?? 0)) - Math.abs((b.year ?? 0) - (fact.year ?? 0)))
    .slice(0, count);
}
