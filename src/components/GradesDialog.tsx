import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Lock } from "lucide-react";

interface Grade {
  id: string;
  level: number;
  name: string;
  historical_figure: string;
  min_points: number;
  max_points: number;
  description: string;
}

interface GradesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPoints: number;
}

const GradesDialog = ({ open, onOpenChange, currentPoints }: GradesDialogProps) => {
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    const fetchGrades = async () => {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .order('level', { ascending: true });

      if (!error && data) {
        setGrades(data);
      }
    };

    if (open) {
      fetchGrades();
    }
  }, [open]);

  const getCurrentGrade = () => {
    return grades.find(grade => 
      currentPoints >= grade.min_points && currentPoints < grade.max_points
    );
  };

  const currentGrade = getCurrentGrade();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-accent" />
            Les Grades Historiques
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {grades.map((grade) => {
            const isUnlocked = currentPoints >= grade.min_points;
            const isCurrent = currentGrade?.level === grade.level;

            return (
              <Card 
                key={grade.id}
                className={`p-4 relative ${
                  isCurrent 
                    ? 'border-2 border-accent shadow-lg' 
                    : isUnlocked 
                    ? 'border-primary/30' 
                    : 'opacity-60 border-muted'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                    isUnlocked ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isUnlocked ? grade.level : <Lock className="w-6 h-6" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{grade.name}</h3>
                      {isCurrent && (
                        <Badge variant="default" className="bg-accent">
                          Grade Actuel
                        </Badge>
                      )}
                      {isUnlocked && !isCurrent && (
                        <Badge variant="outline">Débloqué</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground font-semibold mb-2">
                      {grade.historical_figure}
                    </p>
                    
                    <p className="text-sm mb-2">{grade.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {grade.min_points} - {grade.max_points === 999999 ? '∞' : grade.max_points} points
                      </span>
                    </div>

                    {isCurrent && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progression</span>
                          <span className="font-medium">
                            {currentPoints - grade.min_points} / {grade.max_points - grade.min_points} points
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-accent h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min(100, ((currentPoints - grade.min_points) / (grade.max_points - grade.min_points)) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradesDialog;
