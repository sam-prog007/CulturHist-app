// Streak notifications, in the style of Duolingo. Pure functions (no I/O) so
// that they can be checked outside of Deno.
//
// - "Série en danger": at the user's chosen time, when the streak is alive
//   (last completed day = yesterday) and today's facts are not done yet.
// - "Dernière chance": at 22:00, for streaks of 3 days or more, still not done.
// - "Série perdue": once, the day after a missed day, for streaks of 3 or more.
// - "Vous nous manquez": after 3 and after 7 days without a completed day, then
//   silence, so that nobody is spammed.
// Texts use "vous", like the rest of the app.

export interface StreakProfile {
  current_streak: number | null;
  last_activity_date: string | null;
  longest_streak: number | null;
  notify_streak: boolean | null;
  notify_streak_time: string | null;
  last_streak_reminder_sent_on: string | null;
  last_last_chance_sent_on: string | null;
  last_streak_lost_sent_on: string | null;
  last_comeback_sent_on: string | null;
}

export interface LocalNow {
  /** YYYY-MM-DD in the user's time zone. */
  date: string;
  /** Minutes since local midnight. */
  minutes: number;
}

export interface StreakPayload {
  title: string;
  body: string;
  url: string;
  tag: string;
}

export type SentColumn =
  | "last_streak_reminder_sent_on"
  | "last_last_chance_sent_on"
  | "last_streak_lost_sent_on"
  | "last_comeback_sent_on";

export const WINDOW_MINUTES = 15;
const LAST_CHANCE_TIME = "22:00";
const COMEBACK_DAYS = [3, 7];

export const minutesOf = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** Within the cron window that follows the chosen time. */
const inWindow = (time: string, now: LocalNow) =>
  now.minutes >= minutesOf(time) && now.minutes < minutesOf(time) + WINDOW_MINUTES;

/** Whole days from `from` to `to`, both YYYY-MM-DD. */
export const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

const days = (n: number) => `${n} jour${n > 1 ? "s" : ""}`;

/** One of the variants, the same all day for a given streak (no flip-flopping between runs). */
const pick = <T,>(variants: T[], seed: string) => {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return variants[h % variants.length];
};

const atRisk = (streak: number, remaining: number, date: string): StreakPayload => {
  const facts = remaining > 0 && remaining < 5 ? `Plus que ${remaining} fait${remaining > 1 ? "s" : ""} à valider.` : "Vos 5 faits du jour vous attendent.";
  const title =
    streak >= 30
      ? `🔥 ${days(streak)} de série, ne lâche rien !`
      : pick(
          [
            `🔥 Votre série de ${days(streak)} est en danger !`,
            `🦉 Minerve s'inquiète pour votre série de ${days(streak)}`,
            `🔥 ${days(streak)} d'affilée… et aujourd'hui ?`,
          ],
          `${date}-${streak}`
        );
  return { title, body: `${facts} Quelques minutes suffisent pour la garder.`, url: "/facts", tag: "streak" };
};

const lastChance = (streak: number): StreakPayload => ({
  title: `⏳ Dernière chance pour votre série de ${days(streak)}`,
  body: "Il reste moins de deux heures avant minuit. Validez vos faits du jour pour ne pas tout perdre !",
  url: "/facts",
  tag: "streak",
});

const streakLost = (streak: number, longest: number): StreakPayload => ({
  title: `💔 Votre série s'est arrêtée à ${days(streak)}`,
  body:
    longest > streak
      ? `Votre record reste ${days(longest)}. On repart aujourd'hui ?`
      : "C'était votre record ! Une nouvelle série commence aujourd'hui, Minerve vous attend.",
  url: "/facts",
  tag: "streak",
});

const comeback = (absentDays: number): StreakPayload =>
  absentDays >= 7
    ? {
        title: "🦉 Minerve vous garde une place",
        body: "L'histoire continue sans vous depuis une semaine. 5 faits, et c'est reparti !",
        url: "/facts",
        tag: "comeback",
      }
    : {
        title: "🦉 Vous nous manquez !",
        body: "De nouveaux faits historiques vous attendent. Quelques minutes pour relancer votre série ?",
        url: "/facts",
        tag: "comeback",
      };

/**
 * The streak notification due now, if any, and the column that records its
 * sending. `validated` is how many of today's facts the user has validated.
 */
export function streakNotification(
  profile: StreakProfile,
  now: LocalNow,
  validated: number,
  goal = 5
): { payload: StreakPayload; sent: SentColumn } | null {
  if (!profile.notify_streak || !profile.last_activity_date) return null;
  const time = profile.notify_streak_time || "20:00";
  const streak = profile.current_streak ?? 0;
  const absent = daysBetween(profile.last_activity_date, now.date);

  // Today's facts are done: nothing to remind.
  if (absent <= 0) return null;

  if (absent === 1 && streak > 0) {
    if (inWindow(time, now) && profile.last_streak_reminder_sent_on !== now.date) {
      return { payload: atRisk(streak, goal - validated, now.date), sent: "last_streak_reminder_sent_on" };
    }
    // Only when the chosen time leaves room for a second, later push.
    const roomForLastChance = minutesOf(time) <= minutesOf(LAST_CHANCE_TIME) - 60;
    if (
      streak >= 3 &&
      roomForLastChance &&
      inWindow(LAST_CHANCE_TIME, now) &&
      profile.last_last_chance_sent_on !== now.date
    ) {
      return { payload: lastChance(streak), sent: "last_last_chance_sent_on" };
    }
    return null;
  }

  if (!inWindow(time, now)) return null;

  if (absent === 2 && streak >= 3 && profile.last_streak_lost_sent_on !== now.date) {
    return { payload: streakLost(streak, profile.longest_streak ?? streak), sent: "last_streak_lost_sent_on" };
  }

  if (COMEBACK_DAYS.includes(absent) && profile.last_comeback_sent_on !== now.date) {
    return { payload: comeback(absent), sent: "last_comeback_sent_on" };
  }

  return null;
}
