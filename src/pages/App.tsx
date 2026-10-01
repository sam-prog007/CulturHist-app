import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Calendar, TrendingUp, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PremiumButton from "@/components/PremiumButton";
import PreferencesDashboard from "@/components/PreferencesDashboard";
import AchievementsList from "@/components/AchievementsList";
import ProgressChart from "@/components/ProgressChart";
import StreakIndicator from "@/components/StreakIndicator";
import DailyGoal from "@/components/DailyGoal";
import LearningPath from "@/components/LearningPath";
import { FactImage } from "@/components/FactImage";
import { DifficultyStars } from "@/components/DifficultyStars";
import { getDailyFactForUser } from "@/lib/dailyFact";
import { PREMIUM_ENABLED } from "@/lib/pricing";

const AppPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dailyFact, setDailyFact] = useState<Awaited<ReturnType<typeof getDailyFactForUser>>>(null);
  const [loadingFact, setLoadingFact] = useState(true);
  const [userStats, setUserStats] = useState({ points: 0, level: 1, factsLearned: 0 });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch data in parallel for better performance
        const [fact, profileResult, countResult] = await Promise.all([
          getDailyFactForUser(user.id),
          supabase.from("profiles").select("points, exp").eq("id", user.id).single(),
          supabase
            .from("user_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("completed", true)
        ]);

        if (!mounted) return;

        setDailyFact(fact);

        const level = profileResult.data ? Math.floor(Math.sqrt(profileResult.data.exp / 100)) + 1 : 1;

        setUserStats({
          points: profileResult.data?.points || 0,
          level,
          factsLearned: countResult.count || 0,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        if (mounted) {
          setLoadingFact(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [user]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return null;
  }
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Stats */}
      <section className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background border-b pt-20 pb-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
              <div className="text-center md:text-left animate-fade-in">
                <div className="inline-flex items-center gap-3 mb-3">
                  <div className="p-3 rounded-full bg-gradient-to-br from-primary to-accent glow-shadow">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Bonjour !
                  </h1>
                </div>
                <p className="text-xl text-muted-foreground font-medium">Continuons votre apprentissage</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="group text-center px-8 py-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border-2 border-primary/30 hover-lift card-shadow hover:shadow-elegant smooth-transition">
                  <p className="text-4xl font-bold bg-gradient-to-br from-primary to-primary-light bg-clip-text text-transparent">{userStats.level}</p>
                  <p className="text-sm text-muted-foreground font-semibold">Niveau</p>
                </div>
                <div className="group text-center px-8 py-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl border-2 border-accent/30 hover-lift card-shadow hover:shadow-elegant smooth-transition">
                  <p className="text-4xl font-bold bg-gradient-to-br from-accent to-accent-light bg-clip-text text-transparent">{userStats.points}</p>
                  <p className="text-sm text-muted-foreground font-semibold">Points</p>
                </div>
              </div>
            </div>

            {/* Streak and Daily Goal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              {user && <StreakIndicator userId={user.id} />}
              {user && <DailyGoal userId={user.id} />}
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Learning Path */}
          {user && (
            <div className="animate-fade-in-up">
              <LearningPath userId={user.id} />
            </div>
          )}

          {/* Daily Fact Card */}
          <Card className="p-8 md:p-10 card-shadow hover:shadow-hover border-2 hover-lift smooth-transition animate-fade-in-up overflow-hidden relative">
            {/* Background gradient */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl"></div>
            
            <div className="space-y-6 relative">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-accent-light">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Fait du jour</h2>
              </div>

              {loadingFact ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : dailyFact ? (
                <div className="space-y-8">
                  <FactImage
                    src={dailyFact.image_url}
                    alt={dailyFact.title_fr || dailyFact.title}
                    credit={dailyFact.image_credit}
                    sourceUrl={dailyFact.image_source_url}
                    label={[dailyFact.region_fr, dailyFact.historical_periods?.name].filter(Boolean).join(" · ")}
                    className="h-80 md:h-96 rounded-2xl"
                  />
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <DifficultyStars difficulty={dailyFact.difficulty} showLabel />
                      <h3 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                        {dailyFact.title_fr || dailyFact.title}
                      </h3>
                    </div>

                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                      {dailyFact.description_fr || dailyFact.description}
                    </p>

                    {(dailyFact.date_text_fr || dailyFact.date_text) && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                        <Calendar className="w-5 h-5 text-accent" />
                        <span className="font-semibold text-accent">{dailyFact.date_text_fr || dailyFact.date_text}</span>
                      </div>
                    )}

                    <Button 
                      size="lg" 
                      className="w-full md:w-auto group bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover-lift text-lg px-8"
                      onClick={() => navigate("/facts")}
                    >
                      <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 smooth-transition" />
                      Explorer les faits
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Aucun fait disponible</h3>
                    <p className="text-muted-foreground">Revenez bientôt pour découvrir de nouveaux faits !</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Preferences Dashboard */}
          <div className="animate-fade-in-up">
            <PreferencesDashboard />
          </div>

          {/* Progress and Premium */}
          <div className={`grid grid-cols-1 ${PREMIUM_ENABLED ? "md:grid-cols-2" : ""} gap-6 animate-fade-in-up`}>
            {user && <ProgressChart userId={user.id} />}
            {PREMIUM_ENABLED && <PremiumButton variant="card" />}
          </div>

          {/* Achievements Section */}
          <Card className="p-6 card-shadow animate-fade-in-up">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-accent" />
              Vos succès récents
            </h3>
            {user && <AchievementsList userId={user.id} />}
          </Card>
        </div>
      </main>
    </div>
  );
};
export default AppPage;
