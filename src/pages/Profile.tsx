import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight, Crown, Flame, Heart, MessageSquare, Settings, Star, Trophy, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import GradesDialog from "@/components/GradesDialog";
import AchievementsList from "@/components/AchievementsList";
import StreakIndicator from "@/components/StreakIndicator";
import PremiumButton from "@/components/PremiumButton";
import Companion from "@/components/companions/Companion";
import CompanionsSheet from "@/components/companions/CompanionsSheet";
import FeedbackSheet from "@/components/FeedbackSheet";
import { useCompanion } from "@/lib/companions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PREMIUM_ENABLED } from "@/lib/pricing";
import { effectiveStreak } from "@/lib/dates";
import { Skeleton } from "@/components/ui/skeleton";
import PageLoader from "@/components/PageLoader";
import { toast } from "sonner";
import { appInvite, share } from "@/lib/share";

// The chart library is by far the heaviest part of this screen: it loads after the rest.
const ProgressChart = lazy(() => import("@/components/ProgressChart"));

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [gradesOpen, setGradesOpen] = useState(false);
  const [companionsOpen, setCompanionsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const companions = useCompanion();
  const { companion } = companions;

  useEffect(() => {
    if (!loading && !user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const { data, error, refetch, isFetching } = useQuery({
    queryKey: ["profile-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [profile, learned, grades] = await Promise.all([
        supabase
          .from("profiles")
          .select("username, points, current_streak, last_activity_date, longest_streak")
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
        longestStreak: profile.data.longest_streak ?? 0,
        factsLearned: learned.count ?? 0,
        grade,
        next,
      };
    },
  });

  if (loading || !user || !data) {
    return <PageLoader error={isFetching ? null : error} onRetry={() => refetch()} />;
  }

  const { grade, next } = data;
  const inviteFriends = async () => {
    try {
      if ((await share(appInvite)) === "copied") toast.success("Lien copié", { description: "Envoyez-le à vos amis." });
    } catch {
      toast.error("Impossible de partager le lien");
    }
  };
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
            {Math.max(data.longestStreak, data.streak) > 0 && (
              <p className="mt-0.5 text-[11px] font-medium text-accent">Record : {Math.max(data.longestStreak, data.streak)}</p>
            )}
          </Card>
          <button type="button" onClick={() => navigate("/learned-facts")} className="text-left">
            <Card className="h-full p-3 text-center card-shadow hover:border-primary/50 smooth-transition">
              <BookOpen className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-1 text-xl font-bold">{data.factsLearned}</p>
              <p className="text-xs text-muted-foreground">Faits appris</p>
            </Card>
          </button>
        </div>

        <button type="button" onClick={() => navigate("/favoris")} className="block w-full text-left">
          <Card className="flex items-center gap-3 p-4 card-shadow hover:border-primary/50 smooth-transition">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">Mes favoris</p>
              <p className="text-sm text-muted-foreground">Vos faits et citations préférés</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Card>
        </button>

        <button type="button" onClick={inviteFriends} className="block w-full text-left">
          <Card className="flex items-center gap-3 p-4 card-shadow hover:border-primary/50 smooth-transition">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">Inviter des amis</p>
              <p className="text-sm text-muted-foreground">Faites découvrir l'histoire à vos proches</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Card>
        </button>

        <button type="button" onClick={() => setFeedbackOpen(true)} className="block w-full text-left">
          <Card className="flex items-center gap-3 p-4 card-shadow hover:border-primary/50 smooth-transition">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <MessageSquare className="h-5 w-5 text-accent" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">Donner mon avis</p>
              <p className="text-sm text-muted-foreground">Un bug, une idée ? Nous lisons tout</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Card>
        </button>

        <button type="button" onClick={() => setCompanionsOpen(true)} className="block w-full text-left">
          <Card className="flex items-center gap-3 p-4 card-shadow hover:border-primary/50 smooth-transition">
            <Companion id={companion.id} mood="wave" className="h-20 w-[4.5rem] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Mon compagnon</p>
              <p className="font-serif text-lg font-bold leading-tight">{companion.name}</p>
              <p className="text-sm text-muted-foreground">
                {companions.next
                  ? `Prochain : ${companions.next.name} dans ${companions.missing} points`
                  : "Vous avez débloqué tous les compagnons !"}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Card>
        </button>

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

        <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
          <ProgressChart userId={user.id} />
        </Suspense>

        {PREMIUM_ENABLED && <PremiumButton variant="card" />}
      </main>

      <BottomNav />
      <GradesDialog open={gradesOpen} onOpenChange={setGradesOpen} currentPoints={data.points} />
      <CompanionsSheet
        open={companionsOpen}
        onOpenChange={setCompanionsOpen}
        points={companions.points}
        active={companion}
        onChoose={companions.choose}
      />
      <FeedbackSheet open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
};

export default ProfilePage;
