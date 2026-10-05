/** Today's date as YYYY-MM-DD in UTC, the key used by daily tables (daily_facts_progress...). */
export function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

/** Days since 1970-01-01 in the user's time zone: changes at local midnight. */
export function localDayNumber(date = new Date()): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/** -44 -> "44 av. J.-C.", 1789 -> "1789". */
export function formatYear(year: number): string {
  return year < 0 ? `${-year} av. J.-C.` : String(year);
}
