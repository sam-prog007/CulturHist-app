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
import PremiumButton from "@/components/PremiumButton";
import PreferencesDashboard from "@/components/PreferencesDashboard";

const AppPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dailyFact, setDailyFact] = useState<any>(null);
  const [loadingFact, setLoadingFact] = useState(true);
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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingFact(false);
      }
    };

    fetchData();
  }, [user]);

  const handleValidateFact = async () => {
    navigate('/facts');
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
                      <BookOpen className="w-5 h-5 mr-2" />
                      Explorer les faits
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

          {/* Preferences Dashboard */}
          <PreferencesDashboard />

          {/* Progress Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <PremiumButton variant="card" />
          </div>
        </div>
      </main>
    </div>;
};
export default AppPage;