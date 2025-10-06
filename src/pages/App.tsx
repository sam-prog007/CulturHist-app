import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Calendar, TrendingUp, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-history.jpg";

const AppPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dailyFact, setDailyFact] = useState<any>(null);
  const [loadingFact, setLoadingFact] = useState(true);
  const [stats, setStats] = useState({
    factsLearned: 0,
    points: 0,
    streak: 0,
    level: 1
  });
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch daily fact
        const { data: factData, error: factError } = await supabase
          .from('historical_facts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (factError) throw factError;
        setDailyFact(factData);

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

        // Calculate level from exp
        const level = Math.floor(Math.sqrt((profileData?.exp || 0) / 100)) + 1;

        setStats({
          factsLearned: count || 0,
          points: profileData?.points || 0,
          streak: profileData?.current_streak || 0,
          level
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingFact(false);
      }
    };

    fetchData();
  }, [user]);

  const handleValidateFact = async () => {
    if (!user || !dailyFact) return;

    try {
      // Check if already validated
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('fact_id', dailyFact.id)
        .eq('completed', true)
        .maybeSingle();

      if (existingProgress) {
        toast({
          title: "Déjà validé",
          description: "Vous avez déjà validé ce fait !",
          variant: "destructive"
        });
        return;
      }

      // Insert progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          fact_id: dailyFact.id,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (progressError) throw progressError;

      // Get current profile data
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('points, current_streak, last_activity_date, exp')
        .eq('id', user.id)
        .single();

      if (profileFetchError) throw profileFetchError;

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = profile?.last_activity_date;
      
      // Calculate new streak
      let newStreak = profile?.current_streak || 0;
      if (!lastActivity) {
        newStreak = 1;
      } else {
        const daysDiff = Math.floor(
          (new Date(today).getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        }
      }

      // Calculate new points and exp
      const newPoints = (profile?.points || 0) + dailyFact.points_reward;
      const factsLearned = stats.factsLearned + 1;
      const newExp = (newPoints * 2) + (newStreak * 10) + (factsLearned * 5);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          points: newPoints,
          current_streak: newStreak,
          last_activity_date: today,
          exp: newExp
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local stats
      const newLevel = Math.floor(Math.sqrt(newExp / 100)) + 1;
      setStats({
        factsLearned,
        points: newPoints,
        streak: newStreak,
        level: newLevel
      });

      toast({
        title: "Fait validé !",
        description: `Vous avez gagné ${dailyFact.points_reward} points${newStreak > 1 ? ` • Série de ${newStreak} jours !` : ''}`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>;
  }
  if (!user) {
    return null;
  }
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="relative min-h-[40vh] flex items-center justify-center subtle-gradient overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Fond historique" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background"></div>
        </div>

        <div className="container mx-auto px-4 py-16 z-10 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Bienvenue dans votre espace d'apprentissage
            </h1>
            <p className="text-lg text-muted-foreground">
              Découvrez l'histoire à votre rythme
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 card-shadow hover-scale smooth-transition">
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

            <Card className="p-6 card-shadow hover-scale smooth-transition">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.level}</p>
                  <p className="text-sm text-muted-foreground">Niveau</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Daily Fact Card */}
          <Card className="p-8 card-shadow">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent-foreground">
                  Fait du jour
                </span>
              </div>
              
              {loadingFact ? (
                <div className="py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : dailyFact ? (
                <>
                  {dailyFact.image_url && (
                    <div className="w-full max-w-3xl mx-auto mb-6 rounded-lg overflow-hidden card-shadow">
                      <img 
                        src={dailyFact.image_url} 
                        alt={dailyFact.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    {dailyFact.title}
                  </h2>
                  
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {dailyFact.description}
                  </p>

                  {dailyFact.date_text && (
                    <p className="text-sm font-medium text-accent">
                      📅 {dailyFact.date_text}
                    </p>
                  )}

                  <div className="flex gap-3 justify-center mt-4">
                    <Button size="lg" variant="default" onClick={handleValidateFact}>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Valider (+{dailyFact.points_reward} pts)
                    </Button>
                    <Button size="lg" variant="outline">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Explorer plus de faits
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                    Aucun fait disponible
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Revenez bientôt pour découvrir de nouveaux faits historiques !
                  </p>
                </>
              )}
            </div>
          </Card>

          {/* Progress Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 card-shadow">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-accent" />
                Vos succès récents
              </h3>
              <div className="text-center py-8 text-muted-foreground">
                Aucun succès pour le moment. Commencez à apprendre pour débloquer des récompenses !
              </div>
            </Card>

            <Card className="p-6 card-shadow">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Votre progression
              </h3>
              <div className="text-center py-8 text-muted-foreground">
                Commencez votre parcours d'apprentissage pour suivre votre progression.
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>;
};
export default AppPage;