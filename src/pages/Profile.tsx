import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight, Crown, Flame, Settings, Star, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import GradesDialog from "@/components/GradesDialog";
import ProgressChart from "@/components/ProgressChart";
import AchievementsList from "@/components/AchievementsList";
import StreakIndicator from "@/components/StreakIndicator";
import PremiumButton from "@/components/PremiumButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PREMIUM_ENABLED } from "@/lib/pricing";
import { effectiveStreak } from "@/lib/dates";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [gradesOpen, setGradesOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const { data } = useQuery({
    queryKey: ["profile-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [profile, learned, grades] = await Promise.all([
        supabase
          .from("profiles")
          .select("username, points, current_streak, last_activity_date")
          .eq("id", user!.id)
          .single(),
        supabase
          .from("user_progress")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .eq("completed", true),
        supabase.from("grades").select("level, name, historical_figure, min_points, max_points").order("level"),
      ]);
      if (profile.error) throw profile.error;
      const points = profile.data.points ?? 0;
      const gradeList = grades.data ?? [];
      const grade = gradeList.find((g) => points >= g.min_points && points < g.max_points) ?? gradeList.at(-1) ?? null;
      const next = grade ? gradeList.find((g) => g.level === grade.level + 1) ?? null : null;
      return {
        username: profile.data.username,
        points,
        streak: effectiveStreak(profile.data.current_streak, profile.data.last_activity_date),
        factsLearned: learned.count ?? 0,
        grade,
        next,
      };
    },
  });

  if (loading || !user || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const { grade, next } = data;
  const gradeProgress = grade && next ? ((data.points - grade.min_points) / (grade.max_points - grade.min_points)) * 100 : 100;
  const initial = (data.username || user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen subtle-gradient">
      <main className="mx-auto max-w-md space-y-5 px-4 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <header className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full accent-gradient font-serif text-2xl font-bold text-gold elegant-shadow">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold">{data.username || "Mon profil"}</h1>
            {grade && (
              <p className="text-sm text-muted-foreground">
                {grade.name} · {grade.historical_figure}
              </p>
            )}
          </div>
          <Button variant="outline" size="icon" aria-label="Réglages" onClick={() => navigate("/settings")}>
            <Settings className="h-5 w-5" />
          </Button>
        </header>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center card-shadow">
            <Star className="mx-auto h-5 w-5 fill-gold text-gold" />
            <p className="mt-1 text-xl font-bold">{data.points}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </Card>
          <Card className="p-3 text-center card-shadow">
            <Flame className="mx-auto h-5 w-5 text-orange-500" />
            <p className="mt-1 text-xl font-bold">{data.streak}</p>
            <p className="text-xs text-muted-foreground">{data.streak > 1 ? "Jours de série" : "Jour de série"}</p>
          </Card>
          <button type="button" onClick={() => navigate("/learned-facts")} className="text-left">
            <Card className="h-full p-3 text-center card-shadow hover:border-primary/50 smooth-transition">
              <BookOpen className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-1 text-xl font-bold">{data.factsLearned}</p>
              <p className="text-xs text-muted-foreground">Faits appris</p>
            </Card>
          </button>
        </div>

        {grade && (
          <Card className="space-y-3 p-5 card-shadow">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-gold" />
              <h2 className="text-lg font-bold">Grade : {grade.name}</h2>
            </div>
            <Progress value={gradeProgress} className="h-2 [&>div]:bg-gold" />
            <p className="text-sm text-muted-foreground">
              {next
                ? `Encore ${next.min_points - data.points} points pour devenir ${next.name} (${next.historical_figure}).`
                : "Vous avez atteint le grade le plus élevé !"}
            </p>
            <Button variant="ghost" className="w-full justify-between" onClick={() => setGradesOpen(true)}>
              Voir tous les grades <ChevronRight className="h-4 w-4" />
            </Button>
          </Card>
        )}

        <StreakIndicator userId={user.id} />

        <Card className="space-y-4 p-5 card-shadow">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Trophy className="h-5 w-5 text-primary" /> Succès
          </h2>
          <AchievementsList userId={user.id} />
        </Card>

        <ProgressChart userId={user.id} />

        {PREMIUM_ENABLED && <PremiumButton variant="card" />}
      </main>

      <BottomNav />
      <GradesDialog open={gradesOpen} onOpenChange={setGradesOpen} currentPoints={data.points} />
    </div>
  );
};

export default ProfilePage;
