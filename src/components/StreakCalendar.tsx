import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  userId: string;
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

/** Weeks start on Monday, as in France. */
const DAY_NAMES = ["L", "M", "M", "J", "V", "S", "D"];

/**
 * Calendrier de suivi des séries d'activité
 * Affiche les jours où l'utilisateur a été actif
 */
export const StreakCalendar = ({ userId }: StreakCalendarProps) => {
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchActiveDays = async () => {
      try {
        // Fetch all days with activity (from daily_points table)
        const { data } = await supabase
          .from("daily_points")
          .select("date")
          .eq("user_id", userId)
          .gt("points_earned", 0);

        if (data) {
          setActiveDays(new Set(data.map((d) => d.date)));
        }
      } catch (error) {
        console.error("Error fetching active days:", error);
      }
    };

    fetchActiveDays();
  }, [userId]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // getDay() counts from Sunday; shift so that Monday is the first column.
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;

  const today = new Date();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const isActiveDay = (day: number) =>
    activeDays.has(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);

  const activeThisMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter(isActiveDay).length;

  return (
    <section className="space-y-3 rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex min-w-0 items-center gap-2 font-bold">
          <Calendar className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate">
            {MONTH_NAMES[month]} {year}
          </span>
        </h3>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            aria-label="Mois précédent"
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Mois suivant"
            disabled={isCurrentMonth}
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
            className="rounded-lg p-2 transition-colors hover:bg-muted disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DAY_NAMES.map((day, i) => (
          <div key={i} className="py-1 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const active = isActiveDay(day);
          const isToday = isCurrentMonth && day === today.getDate();

          return (
            <div
              key={day}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg text-sm font-medium",
                active ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/40 text-muted-foreground",
                isToday && "ring-2 ring-inset ring-accent"
              )}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary" /> Jour actif
        </span>
        <span>
          {activeThisMonth} jour{activeThisMonth > 1 ? "s" : ""} actif{activeThisMonth > 1 ? "s" : ""} ce mois-ci
        </span>
      </div>
    </section>
  );
};
