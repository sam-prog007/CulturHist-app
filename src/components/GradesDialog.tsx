import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import BottomSheet from "@/components/BottomSheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
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

/** The highest grade has no ceiling: its max_points is a placeholder. */
const UNBOUNDED_POINTS = 999999;

const GradesDialog = ({ open, onOpenChange, currentPoints }: GradesDialogProps) => {
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    if (!open) return;
    supabase
      .from("grades")
      .select("*")
      .order("level", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setGrades(data);
      });
  }, [open]);

  const currentGrade = grades.find((g) => currentPoints >= g.min_points && currentPoints < g.max_points);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        <>
          <Crown className="h-5 w-5 text-gold" />
          Les grades historiques
        </>
      }
      description={`Vous avez ${currentPoints} points. Chaque grade porte le nom d'un personnage de l'histoire.`}
    >
      <ol className="space-y-3">
        {grades.map((grade) => {
          const isUnlocked = currentPoints >= grade.min_points;
          const isCurrent = currentGrade?.level === grade.level;
          const unbounded = grade.max_points >= UNBOUNDED_POINTS;

          return (
            <li
              key={grade.id}
              className={cn(
                "flex items-start gap-3 rounded-2xl border p-4",
                isCurrent ? "border-2 border-gold bg-gold/5" : isUnlocked ? "border-primary/30 bg-card" : "bg-muted/40 opacity-70"
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-serif text-lg font-bold",
                  isUnlocked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {isUnlocked ? grade.level : <Lock className="h-4 w-4" />}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="font-serif text-lg font-bold leading-tight">{grade.name}</h3>
                  {isCurrent && <Badge className="bg-accent">Votre grade</Badge>}
                  {isUnlocked && !isCurrent && <Badge variant="outline">Débloqué</Badge>}
                </div>
                <p className="text-sm font-semibold text-muted-foreground">{grade.historical_figure}</p>
                {grade.description && <p className="text-sm leading-snug">{grade.description}</p>}
                <p className="text-xs font-medium text-muted-foreground">
                  {grade.min_points === 0 ? "Dès le départ" : `Dès ${grade.min_points} points`}
                </p>

                {isCurrent && !unbounded && (
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between gap-2 text-xs">
                      <span>Progression</span>
                      <span className="font-medium">
                        {currentPoints - grade.min_points} / {grade.max_points - grade.min_points} points
                      </span>
                    </div>
                    <Progress
                      value={((currentPoints - grade.min_points) / (grade.max_points - grade.min_points)) * 100}
                      className="h-2 [&>div]:bg-gold"
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </BottomSheet>
  );
};

export default GradesDialog;
