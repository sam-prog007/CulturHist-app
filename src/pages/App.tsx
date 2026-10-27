import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, Flame, Quote, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { FactImage } from "@/components/FactImage";
import { FavoriteButton } from "@/components/FavoriteButton";
import { QuoteView } from "@/components/QuoteView";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { effectiveStreak, formatYear, todayKey } from "@/lib/dates";
import { getOnThisDay } from "@/lib/onThisDay";
import { getQuoteOfTheDay } from "@/lib/quoteOfTheDay";
import { applyPendingOnboarding } from "@/lib/pendingOnboarding";
import { homeLine, useGradeLevel } from "@/lib/mascot";
import MascotBubble from "@/components/mascot/MascotBubble";

const DAILY_FACTS_GOAL = 5;

const HomePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["home-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, points, current_streak, last_activity_date, onboarding_completed")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      // Answers given at sign-up, before the e-mail was confirmed.
      if (!data.onboarding_completed && (await applyPendingOnboarding(user!.id))) {
        return { ...data, onboarding_completed: true };
      }
      return data;
    },
  });

  useEffect(() => {
    if (profile && !profile.onboarding_completed) navigate("/onboarding");
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

  const grade = useGradeLevel();
  const streakNow = effectiveStreak(profile?.current_streak, profile?.last_activity_date);
  const doneToday = factsValidated >= DAILY_FACTS_GOAL;
  // Picked once per state, so the line does not change on every render.
  const line = useMemo(() => homeLine({ streak: streakNow, doneToday }), [streakNow, doneToday]);

  if (loading || !user) {
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

        {profile && <MascotBubble mood={line.mood} text={line.text} grade={grade} />}

        <DailyFactsCard validated={factsValidated} streak={streak} onOpen={() => navigate("/facts")} />
        <OnThisDayCard />
        <QuoteCard />
      </main>
      <BottomNav />
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

const OnThisDayCard = () => {
  const { data: event, isLoading } = useQuery({
    queryKey: ["on-this-day", new Date().toDateString()],
    queryFn: () => getOnThisDay(),
    staleTime: 6 * 60 * 60 * 1000,
  });
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  return (
    <Card className="space-y-4 p-5 card-shadow animate-fade-in-up">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Ce jour-là</h2>
        <span className="ml-auto text-sm text-muted-foreground">{date}</span>
        {event?.factId && <FavoriteButton item={{ factId: event.factId }} className="-my-2 -mr-1" />}
      </div>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : event ? (
        <>
          {event.imageUrl && (
            <FactImage src={event.imageUrl} alt="" credit={event.credit} sourceUrl={event.sourceUrl} className="h-44" />
          )}
          <div className="space-y-1">
            <p className="font-serif text-2xl font-bold text-primary">{formatYear(event.year)}</p>
            <p className="leading-relaxed">{event.text}</p>
            {!event.imageUrl && event.sourceUrl && (
              <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
                {event.credit}
              </a>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Aucun événement disponible pour aujourd'hui.</p>
      )}
    </Card>
  );
};

const QuoteCard = () => {
  const { data: quote, isLoading } = useQuery({
    queryKey: ["quote-of-the-day", new Date().toDateString()],
    queryFn: () => getQuoteOfTheDay(),
    staleTime: 6 * 60 * 60 * 1000,
  });

  if (!isLoading && !quote) return null;

  return (
    <Card className="space-y-3 p-5 card-shadow animate-fade-in-up">
      <div className="flex items-center gap-2">
        <Quote className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Citation du jour</h2>
        {quote && <FavoriteButton item={{ quoteId: quote.id }} className="-my-2 ml-auto" />}
      </div>
      {isLoading || !quote ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <QuoteView quote={quote} />
      )}
    </Card>
  );
};

export default HomePage;
