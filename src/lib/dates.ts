/** A date as YYYY-MM-DD in the user's time zone: the day key of daily facts and streaks. */
export function todayKey(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The streak still alive today: it is lost once a whole day was missed. */
export function effectiveStreak(streak: number | null | undefined, lastActivityDate: string | null | undefined): number {
  if (!streak || !lastActivityDate) return 0;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return lastActivityDate >= todayKey(yesterday) ? streak : 0;
}

/** Days since 1970-01-01 in the user's time zone: changes at local midnight. */
export function localDayNumber(date = new Date()): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/** -44 -> "44 av. J.-C.", 1789 -> "1789", -3000000 -> "3 000 000 av. J.-C.". */
export function formatYear(year: number): string {
  // Group thousands only for very old dates: "3 000 000 av. J.-C.", but "1789".
  const n = Math.abs(year);
  const text = n >= 10_000 ? n.toLocaleString("fr-FR") : String(n);
  return year < 0 ? `${text} av. J.-C.` : text;
}
