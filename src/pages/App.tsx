import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, Calendar, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-history.jpg";

const AppPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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
      
      <section className="relative min-h-[40vh] flex items-center justify-center subtle-gradient overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Fond historique"
            className="w-full h-full object-cover opacity-10"
          />
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
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
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
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Jours de suite</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 card-shadow hover-scale smooth-transition">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1</p>
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
              
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Votre aventure historique commence ici
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Chaque jour, découvrez un nouveau fait historique fascinant adapté à vos préférences.
                Revenez demain pour commencer votre apprentissage !
              </p>

              <Button size="lg" className="mt-4">
                <BookOpen className="w-5 h-5 mr-2" />
                Explorer l'histoire
              </Button>
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
    </div>
  );
};

export default AppPage;
