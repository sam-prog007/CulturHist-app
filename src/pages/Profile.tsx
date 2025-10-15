import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Calendar, TrendingUp, Crown, Library } from "lucide-react";
import PremiumButton from "@/components/PremiumButton";
import GradesDialog from "@/components/GradesDialog";
import ProgressChart from "@/components/ProgressChart";
import AchievementsList from "@/components/AchievementsList";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [gradesDialogOpen, setGradesDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    factsLearned: 0,
    points: 0,
    streak: 0,
    level: 1
  });
  const [currentGrade, setCurrentGrade] = useState<{ name: string; historical_figure: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Fetch user stats
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('points, current_streak, exp')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Fetch facts learned count
        const { count, error: countError } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true);

        if (countError) throw countError;

        // Fetch current grade
        const { data: gradeData } = await supabase
          .from('grades')
          .select('name, historical_figure, min_points, max_points')
          .lte('min_points', profileData?.points || 0)
          .gt('max_points', profileData?.points || 0)
          .single();

        if (gradeData) {
          setCurrentGrade(gradeData);
        }

        // Calculate level from exp
        const level = Math.floor(Math.sqrt((profileData?.exp || 0) / 100)) + 1;

        setStats({
          factsLearned: count || 0,
          points: profileData?.points || 0,
          streak: profileData?.current_streak || 0,
          level
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
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
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Mon Profil
            </h1>
            <p className="text-lg text-muted-foreground">
              Suivez votre progression et vos statistiques
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card 
              className="p-6 card-shadow hover-scale smooth-transition cursor-pointer"
              onClick={() => navigate('/learned-facts')}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.factsLearned}</p>
                  <p className="text-sm text-muted-foreground">Faits appris</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 card-shadow hover-scale smooth-transition">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.points}</p>
                  <p className="text-sm text-muted-foreground">Points</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 card-shadow hover-scale smooth-transition">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.streak}</p>
                  <p className="text-sm text-muted-foreground">Série</p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-6 card-shadow hover-scale smooth-transition cursor-pointer"
              onClick={() => setGradesDialogOpen(true)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  <Crown className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-bold">{currentGrade?.name || 'Débutant'}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentGrade?.historical_figure || 'Cliquez pour voir les grades'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Achievements Section */}
          <Card className="p-6 card-shadow">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              Vos succès
            </h3>
            {user && <AchievementsList userId={user.id} />}
          </Card>

          {/* Progress Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user && <ProgressChart userId={user.id} />}
            <PremiumButton variant="card" />
          </div>
        </div>
      </main>

      <GradesDialog 
        open={gradesDialogOpen}
        onOpenChange={setGradesDialogOpen}
        currentPoints={stats.points}
      />
    </div>
  );
};

export default ProfilePage;
