import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CheckCircle2, Flame, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { effectiveStreak, todayKey } from "@/lib/dates";
import { homeLine, useCompanion } from "@/lib/companions";
import CompanionBubble from "@/components/companions/CompanionBubble";
import CompanionUnlock from "@/components/companions/CompanionUnlock";
import { OnThisDayCard, QuoteCard } from "@/components/DailyCards";

const DAILY_FACTS_GOAL = 5;

const HomePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const { data: profile, isPending: profilePending } = useQuery({
    queryKey: ["home-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, points, current_streak, last_activity_date, onboarding_completed")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile && !profile.onboarding_completed) navigate("/onboarding", { replace: true });
  }, [profile, navigate]);

  const { data: factsValidated = 0 } = useQuery({
    queryKey: ["home-daily-progress", user?.id, todayKey()],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_facts_progress")
        .select("facts_validated")
        .eq("user_id", user!.id)
        .eq("date", todayKey())
        .maybeSingle();
      return data?.facts_validated ?? 0;
    },
  });

  const { companion, newlyUnlocked, choose, markSeen } = useCompanion();
  const streakNow = effectiveStreak(profile?.current_streak, profile?.last_activity_date);
  const doneToday = factsValidated >= DAILY_FACTS_GOAL;
  // Picked once per state, so the line does not change on every render.
  const line = useMemo(() => homeLine(companion, { streak: streakNow, doneToday }), [companion, streakNow, doneToday]);

  // A new account goes to the onboarding questions without a glimpse of the home screen.
  if (loading || !user || profilePending || profile?.onboarding_completed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const streak = effectiveStreak(profile?.current_streak, profile?.last_activity_date);
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen subtle-gradient">
      <main className="mx-auto max-w-md space-y-5 px-4 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <header className="space-y-3 animate-fade-in">
          <p className="text-sm font-medium text-muted-foreground first-letter:uppercase">{today}</p>
          <h1 className="text-3xl font-bold leading-tight">
            Bon retour{profile?.username ? `, ${profile.username}` : ""}
          </h1>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-sm font-semibold card-shadow">
              <Flame className="h-4 w-4 text-orange-500" />
              {streak} {streak > 1 ? "jours" : "jour"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-sm font-semibold card-shadow">
              <Star className="h-4 w-4 fill-gold text-gold" />
              {profile?.points ?? 0} points
            </span>
          </div>
        </header>

        {profile && <CompanionBubble companion={companion} mood={line.mood} text={line.text} />}

        <DailyFactsCard validated={factsValidated} streak={streak} onOpen={() => navigate("/facts")} />
        <OnThisDayCard />
        <QuoteCard />
      </main>
      <BottomNav />
      {newlyUnlocked && (
        <CompanionUnlock
          companion={newlyUnlocked}
          onChoose={() => {
            choose(newlyUnlocked.id);
            markSeen();
          }}
          onLater={markSeen}
        />
      )}
    </div>
  );
};

/** From this hour, an unfinished day puts the streak "en danger", as the evening push says. */
const AT_RISK_HOUR = 18;

const DailyFactsCard = ({ validated, streak, onOpen }: { validated: number; streak: number; onOpen: () => void }) => {
  const done = validated >= DAILY_FACTS_GOAL;
  const remaining = DAILY_FACTS_GOAL - validated;
  const atRisk = !done && streak > 0 && new Date().getHours() >= AT_RISK_HOUR;

  return (
    <Card className="overflow-hidden border-0 accent-gradient p-5 text-accent-foreground elegant-shadow animate-fade-in-up">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gold" />
          <h2 className="text-lg font-bold">Vos 5 faits du jour</h2>
        </div>
        <span className="text-sm font-semibold">
          {Math.min(validated, DAILY_FACTS_GOAL)}/{DAILY_FACTS_GOAL}
        </span>
      </div>
      <Progress
        value={(Math.min(validated, DAILY_FACTS_GOAL) / DAILY_FACTS_GOAL) * 100}
        className="mt-3 h-2 bg-white/20 [&>div]:bg-gold"
      />
      {atRisk && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold">
          <Flame className="h-4 w-4 shrink-0 animate-pulse text-orange-300" />
          Votre série de {streak} {streak > 1 ? "jours" : "jour"} est en danger : validez vos faits avant minuit.
        </p>
      )}
      <p className="mt-3 text-sm opacity-90">
        {done
          ? "Objectif atteint, votre série continue. Revenez demain !"
          : validated === 0
            ? "Validez-les pour faire grandir votre série."
            : `Encore ${remaining} ${remaining > 1 ? "faits" : "fait"} pour garder votre série.`}
      </p>
      {done ? (
        <p className="mt-4 inline-flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-5 w-5 text-gold" /> Journée validée
        </p>
      ) : (
        <Button variant="hero" className="mt-4 w-full" onClick={onOpen}>
          {validated === 0 ? "Commencer" : "Continuer"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </Card>
  );
};

export default HomePage;
