// Sends the push notifications that are due: "Ce jour-là" and the daily facts
// reminder, each once a day at the user's chosen local time.
//
// Called every 15 minutes by a Supabase cron job with the x-cron-secret header.
// Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...), CRON_SECRET.
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import webpush from "npm:web-push@3.6.7";

const WINDOW_MINUTES = 15;
const DAILY_GOAL = 5;

interface Profile {
  id: string;
  timezone: string | null;
  notify_on_this_day: boolean | null;
  notify_on_this_day_time: string | null;
  notify_daily_facts: boolean | null;
  notify_daily_facts_time: string | null;
  last_on_this_day_sent_on: string | null;
  last_daily_facts_sent_on: string | null;
}

interface Payload {
  title: string;
  body: string;
  url: string;
  tag: string;
}

const log = (step: string, details?: unknown) =>
  console.log(`[SEND-NOTIFICATIONS] ${step}${details === undefined ? "" : ` - ${JSON.stringify(details)}`}`);

/** The user's local date (YYYY-MM-DD) and minutes since local midnight. */
function localNow(timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date()).map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    month: Number(parts.month),
    day: Number(parts.day),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

const minutesOf = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** Due when the chosen time has passed today, within the cron window, and not sent yet today. */
const isDue = (enabled: boolean | null, time: string | null, lastSent: string | null, now: ReturnType<typeof localNow>) =>
  !!enabled && !!time && lastSent !== now.date &&
  now.minutes >= minutesOf(time) && now.minutes < minutesOf(time) + WINDOW_MINUTES;

const formatYear = (year: number) => (year < 0 ? `${-year} av. J.-C.` : String(year));
const truncate = (text: string, max = 140) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

Deno.serve(async (req) => {
  // Any unexpected failure still answers with its cause instead of an empty 500.
  try {
    return await handle(req);
  } catch (e) {
    log("Unexpected error", String(e));
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
});

async function handle(req: Request): Promise<Response> {
  const secret = Deno.env.get("CRON_SECRET");
  if (!secret || req.headers.get("x-cron-secret") !== secret) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    webpush.setVapidDetails(
      Deno.env.get("VAPID_SUBJECT") ?? "mailto:contact@culturhist.app",
      Deno.env.get("VAPID_PUBLIC_KEY") ?? "",
      Deno.env.get("VAPID_PRIVATE_KEY") ?? "",
    );
  } catch (e) {
    log("Invalid VAPID secrets", String(e));
    return Response.json({ error: `Invalid VAPID secrets: ${e instanceof Error ? e.message : e}` }, { status: 500 });
  }
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
    auth: { persistSession: false },
  });

  // "Ce jour-là" is the same for everyone sharing a calendar day: cache by month/day.
  const onThisDayCache = new Map<string, Payload | null>();
  async function onThisDay(month: number, day: number): Promise<Payload | null> {
    const key = `${month}-${day}`;
    if (onThisDayCache.has(key)) return onThisDayCache.get(key)!;
    let payload: Payload | null = null;

    const { data: facts } = await supabase
      .from("historical_facts")
      .select("year, title, title_fr")
      .eq("month", month)
      .eq("day", day)
      .not("year", "is", null)
      .limit(1);
    if (facts?.[0]) {
      payload = { title: `Ce jour-là, en ${formatYear(facts[0].year)}`, body: facts[0].title_fr || facts[0].title, url: "/app", tag: "on-this-day" };
    } else {
      const pad = (n: number) => String(n).padStart(2, "0");
      try {
        const res = await fetch(`https://fr.wikipedia.org/api/rest_v1/feed/onthisday/selected/${pad(month)}/${pad(day)}`, {
          headers: { "User-Agent": "CulturHist/1.0 (https://github.com/sam-prog007/CulturHist-app)" },
        });
        const event = res.ok ? (await res.json()).selected?.[0] : null;
        if (event) {
          payload = { title: `Ce jour-là, en ${formatYear(event.year)}`, body: truncate(event.text), url: "/app", tag: "on-this-day" };
        }
      } catch (e) {
        log("Wikipedia unavailable", String(e));
      }
    }
    onThisDayCache.set(key, payload);
    return payload;
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, timezone, notify_on_this_day, notify_on_this_day_time, notify_daily_facts, notify_daily_facts_time, last_on_this_day_sent_on, last_daily_facts_sent_on")
    .or("notify_on_this_day.eq.true,notify_daily_facts.eq.true");
  if (error) {
    log("Profiles query failed", error.message);
    return Response.json(
      { error: `Profiles query failed (has the notifications migration been run?): ${error.message}` },
      { status: 500 },
    );
  }

  let sent = 0;
  for (const profile of (profiles ?? []) as Profile[]) {
    let now;
    try {
      now = localNow(profile.timezone || "Europe/Paris");
    } catch {
      now = localNow("Europe/Paris");
    }

    const payloads: Payload[] = [];
    const update: Record<string, string> = {};

    if (isDue(profile.notify_on_this_day, profile.notify_on_this_day_time, profile.last_on_this_day_sent_on, now)) {
      const payload = await onThisDay(now.month, now.day);
      if (payload) payloads.push(payload);
      update.last_on_this_day_sent_on = now.date;
    }

    if (isDue(profile.notify_daily_facts, profile.notify_daily_facts_time, profile.last_daily_facts_sent_on, now)) {
      const { data: progress } = await supabase
        .from("daily_facts_progress")
        .select("facts_validated")
        .eq("user_id", profile.id)
        .eq("date", now.date)
        .maybeSingle();
      const validated = progress?.facts_validated ?? 0;
      if (validated < DAILY_GOAL) {
        payloads.push({
          title: "Vos 5 faits du jour sont là",
          body: validated === 0 ? "Découvrez-les pour garder votre série !" : `Encore ${DAILY_GOAL - validated} à valider pour garder votre série.`,
          url: "/facts",
          tag: "daily-facts",
        });
      }
      update.last_daily_facts_sent_on = now.date;
    }

    if (!Object.keys(update).length) continue;
    // Mark as sent first, so a slow or failing push never sends twice.
    await supabase.from("profiles").update(update).eq("id", profile.id);
    if (!payloads.length) continue;

    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", profile.id);

    for (const sub of subscriptions ?? []) {
      for (const payload of payloads) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(payload),
          );
          sent++;
        } catch (e) {
          const statusCode = (e as { statusCode?: number }).statusCode;
          // The device unsubscribed or the subscription expired: forget it.
          if (statusCode === 404 || statusCode === 410) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
            break;
          }
          log("Push failed", { statusCode, message: String(e) });
        }
      }
    }
  }

  log("Done", { profiles: profiles?.length ?? 0, sent });
  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } });
}
