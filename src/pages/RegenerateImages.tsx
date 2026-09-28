import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import { Image, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface HistoricalFact {
  id: string;
  title: string;
  description: string;
  region: string;
  image_url: string | null;
}

const RegenerateImages = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [facts, setFacts] = useState<HistoricalFact[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFact, setCurrentFact] = useState<string>("");
  const [results, setResults] = useState<{ success: number; failed: number }>({ 
    success: 0, 
    failed: 0 
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    // Access is enforced server-side; this only avoids a useless fetch
    if (!isAdmin) return;

    fetchFacts();
  }, [user, authLoading, isAdmin, navigate]);

  const fetchFacts = async () => {
    try {
      const { data, error } = await supabase
        .from("historical_facts")
        .select("id, title, description, region, image_url")
        .order("title");

      if (error) throw error;
      setFacts(data || []);
    } catch (error) {
      console.error("Error fetching facts:", error);
      toast.error("Erreur lors du chargement des faits");
    } finally {
      setLoading(false);
    }
  };

  const regenerateAllImages = async () => {
    setRegenerating(true);
    setProgress(0);
    setResults({ success: 0, failed: 0 });

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < facts.length; i++) {
      const fact = facts[i];
      setCurrentFact(fact.title);
      setProgress(((i + 1) / facts.length) * 100);

      try {
        const { data, error } = await supabase.functions.invoke("generate-fact-images", {
          body: {
            factId: fact.id,
            title: fact.title,
            description: fact.description,
            region: fact.region,
          },
        });

        if (error) throw error;

        if (data?.success) {
          successCount++;
          toast.success(`✓ ${fact.title}`);
        } else {
          failedCount++;
          toast.error(`✗ ${fact.title}`);
        }
      } catch (error) {
        console.error(`Error regenerating image for ${fact.title}:`, error);
        failedCount++;
        toast.error(`✗ ${fact.title}: ${error instanceof Error ? error.message : String(error)}`);
      }

      setResults({ success: successCount, failed: failedCount });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setRegenerating(false);
    setCurrentFact("");
    toast.success(`Terminé ! ${successCount} réussies, ${failedCount} échouées`);
    
    // Refresh facts to show new images
    await fetchFacts();
  };

  if (!authLoading && user && !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-muted-foreground">Accès réservé aux administrateurs.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Image className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Régénération des Images</h1>
              </div>
              <p className="text-muted-foreground">
                Générez automatiquement des images appropriées pour tous les faits historiques
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{facts.length}</div>
                <div className="text-sm text-muted-foreground">Faits totaux</div>
              </Card>
              <Card className="p-4 text-center bg-green-500/10">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div className="text-2xl font-bold text-green-500">{results.success}</div>
                </div>
                <div className="text-sm text-muted-foreground">Réussies</div>
              </Card>
              <Card className="p-4 text-center bg-red-500/10">
                <div className="flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div className="text-2xl font-bold text-red-500">{results.failed}</div>
                </div>
                <div className="text-sm text-muted-foreground">Échouées</div>
              </Card>
            </div>

            {regenerating && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                {currentFact && (
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">{currentFact}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button
                onClick={regenerateAllImages}
                disabled={regenerating || facts.length === 0}
                size="lg"
                className="gap-2"
              >
                {regenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Image className="w-5 h-5" />
                    Régénérer toutes les images
                  </>
                )}
              </Button>
            </div>

            <div className="pt-6 border-t space-y-2">
              <h3 className="font-semibold text-sm">ℹ️ Information</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Ce processus peut prendre plusieurs minutes</li>
                <li>Chaque image sera générée par IA en fonction du titre et de la description</li>
                <li>Les images seront stockées et liées automatiquement aux faits</li>
                <li>Ne fermez pas cette page pendant le processus</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegenerateImages;
