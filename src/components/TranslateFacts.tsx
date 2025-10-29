import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Languages, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const TranslateFacts = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState("");
  const { toast } = useToast();

  const handleTranslate = async () => {
    setIsTranslating(true);
    setProgress("Lancement de la traduction...");

    try {
      const { data, error } = await supabase.functions.invoke('translate-facts');

      if (error) throw error;

      setProgress(data.message || "Traduction terminée !");
      toast({
        title: "Traduction réussie",
        description: data.message,
      });
    } catch (error: any) {
      console.error("Translation error:", error);
      toast({
        title: "Erreur de traduction",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
      setProgress("Erreur lors de la traduction");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">Traduction automatique</h3>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Traduire automatiquement tous les faits historiques non traduits de l'anglais vers le français.
        </p>

        {progress && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm">{progress}</p>
          </div>
        )}

        <Button
          onClick={handleTranslate}
          disabled={isTranslating}
          className="w-full"
        >
          {isTranslating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Traduction en cours...
            </>
          ) : (
            <>
              <Languages className="w-4 h-4 mr-2" />
              Lancer la traduction
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          ⚠️ Cette opération peut prendre plusieurs minutes selon le nombre de faits à traduire.
        </p>
      </div>
    </Card>
  );
};
