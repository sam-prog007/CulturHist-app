import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Target, Trophy } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import BottomSheet from "./BottomSheet";
import { StreakCalendar } from "./StreakCalendar";
import { cn } from "@/lib/utils";
import { effectiveStreak } from "@/lib/dates";

interface StreakIndicatorProps {
  userId: string;
}

interface StreakMilestone {
  id: string;
  days: number;
  name: string;
  description: string;
  points_reward: number;
  icon: string;
}

const days = (n: number) => `${n} jour${n > 1 ? "s" : ""}`;

const StreakIndicator = ({ userId }: StreakIndicatorProps) => {
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [milestones, setMilestones] = useState<StreakMilestone[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const [profileResult, milestonesResult] = await Promise.all([
          supabase.from("profiles").select("current_streak, last_activity_date").eq("id", userId).single(),
          supabase.from("streak_milestones").select("*").order("days", { ascending: true }),
        ]);

        if (profileResult.data) {
          setStreak(effectiveStreak(profileResult.data.current_streak, profileResult.data.last_activity_date));
        }

        if (milestonesResult.data) {
          setMilestones(milestonesResult.data);
        }
      } catch (error) {
        console.error("Error fetching streak data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreakData();
  }, [userId]);

  if (isLoading) return null;

  const nextMilestone = milestones.find((m) => m.days > streak);
  const currentMilestone = milestones.find((m) => m.days === streak);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full text-left transition-transform active:scale-[0.98]"
      >
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-orange-500 to-red-500 p-4 text-white">
          <div className="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center gap-3">
            <Flame className="h-10 w-10 shrink-0 animate-glow" />
            <div className="min-w-0">
              <p className="text-2xl font-bold">{days(streak)}</p>
              <p className="text-sm opacity-90">Série en cours</p>
            </div>
          </div>
          {streak > 0 && nextMilestone && (
            <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${Math.min((streak / nextMilestone.days) * 100, 100)}%` }}
              />
            </div>
          )}
          <p className="relative mt-2 text-xs opacity-80">
            {streak === 0 ? "Validez un fait aujourd'hui pour la lancer" : "Voir le calendrier et les objectifs"}
          </p>
        </Card>
      </button>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title={
          <>
            <Flame className="h-5 w-5 text-orange-500" />
            Votre série
          </>
        }
        description="Validez au moins un fait par jour pour faire grandir votre série."
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:from-orange-950/30 dark:to-red-950/30">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">Série actuelle</p>
              <p className="text-3xl font-bold text-orange-600">{days(streak)}</p>
              {currentMilestone ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentMilestone.icon} {currentMilestone.name} atteint !
                </p>
              ) : (
                nextMilestone && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Encore {days(nextMilestone.days - streak)} pour « {nextMilestone.name} »
                  </p>
                )
              )}
            </div>
            <Flame className="h-12 w-12 shrink-0 text-orange-500 opacity-50" />
          </div>

          <StreakCalendar userId={userId} />

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Target className="h-5 w-5 text-primary" />
              Objectifs de série
            </h3>

            <ul className="space-y-3">
              {milestones.map((milestone) => {
                const isCompleted = streak >= milestone.days;
                const isNext = nextMilestone?.id === milestone.id;

                return (
                  <li
                    key={milestone.id}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border p-4",
                      isCompleted ? "border-accent bg-accent/10" : isNext ? "border-primary/30 bg-primary/5" : "opacity-60"
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center text-3xl leading-none">
                      {isCompleted ? <Trophy className="h-8 w-8 text-accent" /> : milestone.icon}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-bold leading-tight">{milestone.name}</h4>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-bold text-accent">+{milestone.points_reward} pts</p>
                          <p className="text-xs text-muted-foreground">{days(milestone.days)}</p>
                        </div>
                      </div>

                      {isCompleted ? (
                        <p className="flex items-center gap-1.5 text-sm font-medium text-accent">
                          <Trophy className="h-4 w-4" /> Objectif atteint !
                        </p>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progression</span>
                            <span>
                              {streak}/{milestone.days} jours
                            </span>
                          </div>
                          <Progress value={(streak / milestone.days) * 100} className="h-2" />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
            💡 <strong>Astuce :</strong> revenez chaque jour découvrir les faits du jour pour garder votre série.
            Plus elle est longue, plus vous gagnez de points !
          </p>
        </div>
      </BottomSheet>
    </>
  );
};

export default StreakIndicator;
