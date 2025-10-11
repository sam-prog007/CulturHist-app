import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Crown } from "lucide-react";
import PremiumButton from "@/components/PremiumButton";

const FactsLimit = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="p-6 md:p-8 text-center space-y-6 card-shadow">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-destructive/10">
                <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Limite quotidienne atteinte
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                Vous avez déjà validé vos 5 faits du jour !
              </p>
            </div>

            <div className="py-4 space-y-3 text-left max-w-md mx-auto">
              <p className="text-muted-foreground text-sm md:text-base">
                Pour découvrir des faits illimités chaque jour, passez à CulturHist+ :
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>Faits historiques illimités chaque jour</span>
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>Quiz illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>Contenus exclusifs premium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>Statistiques avancées détaillées</span>
                </li>
                <li className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-accent flex-shrink-0" />
                  <span>Accès prioritaire aux nouveautés</span>
                </li>
              </ul>
            </div>

            <Button 
              variant="outline" 
              onClick={() => navigate('/app')}
              className="mt-4 w-full sm:w-auto"
            >
              Retour à l'accueil
            </Button>
          </Card>

          <PremiumButton variant="card" />
        </div>
      </main>
    </div>
  );
};

export default FactsLimit;
