import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, CheckCircle2, Flame, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { FactImage } from "@/components/FactImage";
import { DifficultyStars } from "@/components/DifficultyStars";
import AdSense from "@/components/AdSense";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { todayKey } from "@/lib/dates";
import { REGION_LABELS, getDailyFacts, validateDailyFact, type DailyFacts } from "@/lib/dailyFacts";

const DailyFactsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [validating, setValidating] = useState<string | null>(null);
  const [streak, setStreak] = useState<number | null>(null);
  const date = todayKey();
  const queryKey = ["daily-facts", user?.id, date];

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: () => getDailyFacts(user!.id, date),
  });

  const handleValidate = async (factId: string, reward: number | null) => {
    setValidating(factId);
    try {
      const result = await validateDailyFact(factId, date);
      queryClient.setQueryData<DailyFacts>(queryKey, (old) =>
        old && {
          ...old,
          validated: result.facts_validated,
          facts: old.facts.map((f) => (f.id === factId ? { ...f, validated: true } : f)),
        }
      );
      queryClient.invalidateQueries({ queryKey: ["home-profile"] });
      queryClient.invalidateQueries({ queryKey: ["home-daily-progress"] });
      if (result.day_completed && !result.already_validated) {
        setStreak(result.current_streak);
      } else if (!result.already_validated) {
        toast({
          title: "Fait validé !",
          description: `+${reward ?? 10} points • ${result.facts_validated}/${result.goal}`,
        });
      }
    } catch (e) {
      toast({ title: "Erreur", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setValidating(null);
    }
  };

  if (loading || !user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const facts = data?.facts ?? [];
  const goal = facts.length;
  const validated = data?.validated ?? 0;
  const done = goal > 0 && validated >= goal;
  const theme = [data?.region ? REGION_LABELS[data.region] ?? data.region : null, data?.era].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen subtle-gradient">
      <main className="mx-auto max-w-md space-y-5 px-4 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold">Vos faits du jour</h1>
          {theme && (
            <p className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-sm font-semibold text-accent card-shadow">
              <Sparkles className="h-4 w-4 text-gold" /> Thème : {theme}
            </p>
          )}
          {goal > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{done ? "Journée validée" : "Validez-les tous pour garder votre série"}</span>
                <span className="font-semibold text-foreground">{validated}/{goal}</span>
              </div>
              <Progress value={(validated / goal) * 100} className="h-2 [&>div]:bg-gold" />
            </div>
          )}
        </header>

        {done && (
          <Card className="border-0 accent-gradient p-5 text-center text-accent-foreground elegant-shadow animate-scale-in">
            <Flame className="mx-auto h-10 w-10 text-gold" />
            <p className="mt-2 text-xl font-bold">Journée validée !</p>
            <p className="opacity-90">
              {streak !== null ? `Série : ${streak} ${streak > 1 ? "jours" : "jour"}. ` : ""}
              Revenez demain pour la prolonger.
            </p>
          </Card>
        )}

        {error ? (
          <Card className="p-6 text-center text-muted-foreground">Impossible de charger vos faits du jour.</Card>
        ) : goal === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            Vous avez découvert tous les faits disponibles. De nouveaux arrivent bientôt !
          </Card>
        ) : (
          facts.map((fact, i) => (
            <Card key={fact.id} className={`space-y-4 p-4 card-shadow ${fact.validated ? "opacity-80" : ""}`}>
              <FactImage
                src={fact.image_url}
                alt={fact.title_fr || fact.title}
                credit={fact.image_credit}
                sourceUrl={fact.image_source_url}
                label={[fact.region_fr, fact.historical_periods?.name].filter(Boolean).join(" · ")}
                className="h-44"
              />
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold">
                    <span className="mr-1 text-muted-foreground">{i + 1}.</span>
                    {fact.title_fr || fact.title}
                  </h2>
                  <DifficultyStars difficulty={fact.difficulty} className="shrink-0 pt-1" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{fact.description_fr || fact.description}</p>
                {(fact.date_text_fr || fact.date_text) && (
                  <p className="text-sm font-medium text-accent">{fact.date_text_fr || fact.date_text}</p>
                )}
              </div>
              {fact.validated ? (
                <p className="flex items-center justify-center gap-2 py-2 font-semibold text-accent">
                  <CheckCircle2 className="h-5 w-5 text-gold" /> Validé
                </p>
              ) : (
                <Button
                  className="w-full"
                  disabled={validating !== null}
                  onClick={() => handleValidate(fact.id, fact.points_reward)}
                >
                  <CheckCircle className="h-4 w-4" />
                  {validating === fact.id ? "Validation..." : `Valider (+${fact.points_reward ?? 10} pts)`}
                </Button>
              )}
            </Card>
          ))
        )}

        <AdSense slot="3234567890" format="auto" />
      </main>
      <BottomNav />
    </div>
  );
};

export default DailyFactsPage;
