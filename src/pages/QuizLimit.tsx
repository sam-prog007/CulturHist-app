import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Crown } from "lucide-react";
import PremiumButton from "@/components/PremiumButton";

const QuizLimit = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="p-8 text-center space-y-6 card-shadow">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-destructive/10">
                <AlertCircle className="w-12 h-12 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Limite quotidienne atteinte
              </h1>
              <p className="text-lg text-muted-foreground">
                Vous avez déjà effectué votre quiz du jour !
              </p>
            </div>

            <div className="py-4 space-y-3 text-left max-w-md mx-auto">
              <p className="text-muted-foreground">
                Pour continuer à tester vos connaissances sans limite, passez à CulturHist+ :
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent" />
                  <span>Quiz illimités chaque jour</span>
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent" />
                  <span>Contenus exclusifs premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent" />
                  <span>Statistiques avancées détaillées</span>
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent" />
                  <span>Accès prioritaire aux nouveautés</span>
                </li>
              </ul>
            </div>

            <Button 
              variant="outline" 
              onClick={() => navigate('/app')}
              className="mt-4"
            >
              Retour à l'accueil
            </Button>
          </Card>

          {/* Premium Offer Card */}
          <PremiumButton variant="card" />
        </div>
      </main>
    </div>
  );
};

export default QuizLimit;
