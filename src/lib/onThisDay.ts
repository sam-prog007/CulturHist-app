import { supabase } from "@/integrations/supabase/client";

export interface OnThisDayEvent {
  year: number;
  text: string;
  imageUrl: string | null;
  credit: string | null;
  sourceUrl: string | null;
  /** Where the event comes from: one of our facts, or Wikipedia. */
  origin: "fact" | "wikipedia";
}

interface WikiPage {
  thumbnail?: { source: string };
  content_urls?: { desktop?: { page: string } };
}
interface WikiEvent {
  text: string;
  year: number;
  pages?: WikiPage[];
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * An event that happened on today's month and day, in the user's time zone.
 * Our own facts dated to this day come first; otherwise Wikipedia's selection
 * (real events, real images), preferring an event that has an image.
 */
export async function getOnThisDay(date = new Date()): Promise<OnThisDayEvent | null> {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const { data: facts } = await supabase
    .from("historical_facts")
    .select("year, title, title_fr, description, description_fr, image_url, image_credit, image_source_url")
    .eq("month", month)
    .eq("day", day)
    .not("year", "is", null)
    .limit(1);

  const fact = facts?.[0];
  if (fact?.year) {
    return {
      year: fact.year,
      text: fact.description_fr || fact.description,
      imageUrl: fact.image_url,
      credit: fact.image_credit,
      sourceUrl: fact.image_source_url,
      origin: "fact",
    };
  }

  const events = await fetchWikipediaSelected(month, day);
  if (!events.length) return null;
  const event = events.find((e) => e.pages?.[0]?.thumbnail) ?? events[0];
  const page = event.pages?.[0];
  return {
    year: event.year,
    text: event.text,
    imageUrl: page?.thumbnail?.source ?? null,
    credit: "Texte et image : Wikipédia",
    sourceUrl: page?.content_urls?.desktop?.page ?? null,
    origin: "wikipedia",
  };
}

async function fetchWikipediaSelected(month: number, day: number): Promise<WikiEvent[]> {
  const path = `onthisday/selected/${pad(month)}/${pad(day)}`;
  const urls = [
    `https://fr.wikipedia.org/api/rest_v1/feed/${path}`,
    `https://api.wikimedia.org/feed/v1/wikipedia/fr/${path}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      if (Array.isArray(json?.selected) && json.selected.length) return json.selected;
    } catch {
      // Try the next endpoint.
    }
  }
  return [];
}
