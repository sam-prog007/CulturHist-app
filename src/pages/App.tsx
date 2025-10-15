import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Calendar, TrendingUp, CheckCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-history.jpg";
import PremiumButton from "@/components/PremiumButton";
import PreferencesDashboard from "@/components/PreferencesDashboard";
import AchievementsList from "@/components/AchievementsList";
import ProgressChart from "@/components/ProgressChart";
import StreakIndicator from "@/components/StreakIndicator";
import DailyGoal from "@/components/DailyGoal";
import LearningPath from "@/components/LearningPath";
import { getFactImage } from "@/assets/factsImages";
import { getDailyFactForUser } from "@/lib/dailyFact";

const AppPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dailyFact, setDailyFact] = useState<any>(null);
  const [loadingFact, setLoadingFact] = useState(true);
  const [userStats, setUserStats] = useState({ points: 0, level: 1, factsLearned: 0 });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch daily fact for this user
        const fact = await getDailyFactForUser(user.id);
        setDailyFact(fact);

        // Fetch user stats
        const { data: profile } = await supabase
          .from('profiles')
          .select('points, exp')
          .eq('id', user.id)
          .single();

        const { count } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true);

        const level = profile ? Math.floor(Math.sqrt(profile.exp / 100)) + 1 : 1;
        
        setUserStats({
          points: profile?.points || 0,
          level,
          factsLearned: count || 0,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingFact(false);
      }
    };

    fetchData();
  }, [user]);
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
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section with Stats */}
      <section className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-background border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
              <div className="text-center md:text-left animate-fade-in">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2 justify-center md:justify-start">
                  <Sparkles className="w-8 h-8 text-accent" />
                  Bonjour !
                </h1>
                <p className="text-lg text-muted-foreground">
                  Continuons votre apprentissage
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center px-6 py-3 bg-primary/10 rounded-2xl border border-primary/20">
                  <p className="text-3xl font-bold text-primary">{userStats.level}</p>
                  <p className="text-xs text-muted-foreground">Niveau</p>
                </div>
                <div className="text-center px-6 py-3 bg-accent/10 rounded-2xl border border-accent/20">
                  <p className="text-3xl font-bold text-accent">{userStats.points}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>
            </div>

            {/* Streak and Daily Goal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
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
          <Card className="p-8 card-shadow hover:shadow-lg transition-shadow animate-fade-in-up">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-accent/10">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">Fait du jour</h2>
              </div>
              
              {loadingFact ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : dailyFact ? (
                <div className="space-y-6">
                  {dailyFact.image_url && (
                    <div className="w-full rounded-xl overflow-hidden card-shadow">
                      <img 
                        src={getFactImage(dailyFact.image_url) || heroImage} 
                        alt={dailyFact.title}
                        className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                      {dailyFact.title}
                    </h3>
                    
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {dailyFact.description}
                    </p>

                    {dailyFact.date_text && (
                      <div className="flex items-center gap-2 text-accent">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{dailyFact.date_text}</span>
                      </div>
                    )}

                    <Button 
                      size="lg" 
                      className="w-full md:w-auto group"
                      onClick={() => navigate('/facts')}
                    >
                      <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
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
                    <p className="text-muted-foreground">
                      Revenez bientôt pour découvrir de nouveaux faits !
                    </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
            {user && <ProgressChart userId={user.id} />}
            <PremiumButton variant="card" />
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