import { useEffect, useMemo, useState } from "react";
import { Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGradeLevel } from "@/lib/mascot";
import Mascot from "@/components/mascot/Mascot";

interface StreakCelebrationProps {
  streak: number;
  newRecord?: boolean;
  milestone?: { name: string; icon: string; points_reward: number } | null;
  onClose: () => void;
}

const CONFETTI_COLORS = ["hsl(var(--gold))", "#f97316", "#ef4444", "hsl(var(--primary))", "#fde68a"];
const WEEK = ["L", "M", "M", "J", "V", "S", "D"];

/**
 * Full-screen celebration once the day's facts are all validated, in the
 * spirit of Duolingo: the streak counts up, the week fills, and a record or a
 * milestone gets its own badge.
 */
const StreakCelebration = ({ streak, newRecord, milestone, onClose }: StreakCelebrationProps) => {
  const [shown, setShown] = useState(Math.max(streak - 1, 0));
  const grade = useGradeLevel();

  useEffect(() => {
    const timer = setTimeout(() => setShown(streak), 650);
    return () => clearTimeout(timer);
  }, [streak]);

  // Confetti pieces, placed once.
  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 2.4 + Math.random() * 1.6,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
        round: i % 3 === 0,
      })),
    []
  );

  // This week, Monday first: the days of the streak that fall in it are lit.
  const todayIndex = (new Date().getDay() + 6) % 7;
  const week = WEEK.map((label, i) => ({
    label,
    lit: i <= todayIndex && todayIndex - i < streak,
    today: i === todayIndex,
  }));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Série de ${streak} jours`}
      className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-gradient-to-b from-orange-500 via-orange-500 to-red-600 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] text-white animate-fade-in"
    >
      <div className="pointer-events-none absolute inset-0 motion-reduce:hidden" aria-hidden="true">
        {confetti.map((c, i) => (
          <span
            key={i}
            className="absolute top-0 animate-confetti-fall"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.round ? c.size : c.size * 1.6,
              background: c.color,
              borderRadius: c.round ? "9999px" : "2px",
              animationDelay: `${c.delay}s`,
              animationDuration: `${c.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="flex items-end justify-center gap-1">
          <Mascot mood="cheer" grade={grade} className="h-28 w-28 animate-flame-burst" />
          <div className="relative animate-flame-burst" style={{ animationDelay: "0.15s" }}>
            <span className="absolute inset-0 rounded-full bg-yellow-300/40 blur-2xl" aria-hidden="true" />
            <Flame className="relative h-24 w-24 fill-yellow-300 text-yellow-100 drop-shadow-lg" strokeWidth={1.5} />
          </div>
        </div>

        <div>
          <p key={shown} className="font-serif text-7xl font-bold leading-none animate-count-up">
            {shown}
          </p>
          <p className="mt-2 text-xl font-semibold">{streak > 1 ? "jours de série !" : "jour de série !"}</p>
        </div>

        <div className="flex w-full justify-between rounded-2xl bg-white/15 p-3">
          {week.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className={cn("text-xs font-semibold", d.today ? "text-white" : "text-white/70")}>{d.label}</span>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full",
                  d.lit ? "bg-yellow-300 text-orange-600" : "bg-white/20"
                )}
              >
                {d.lit && <Flame className="h-4 w-4 fill-orange-500 text-orange-600" />}
              </span>
            </div>
          ))}
        </div>

        {(newRecord || milestone) && (
          <div className="w-full space-y-2 animate-scale-in">
            {newRecord && (
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-bold text-orange-600">
                <Trophy className="h-4 w-4" /> Nouveau record !
              </p>
            )}
            {milestone && (
              <div className="rounded-2xl bg-white/15 p-4">
                <p className="text-3xl">{milestone.icon}</p>
                <p className="font-bold">Objectif atteint : {milestone.name}</p>
                <p className="text-sm opacity-90">+{milestone.points_reward} points de bonus</p>
              </div>
            )}
          </div>
        )}

        <p className="text-sm opacity-90">Revenez demain pour garder la flamme allumée.</p>
      </div>

      <Button size="lg" className="relative mx-auto w-full max-w-sm bg-white text-orange-600 hover:bg-white/90" onClick={onClose}>
        Continuer
      </Button>
    </div>
  );
};

export default StreakCelebration;
