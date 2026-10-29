import { Check, Lock } from "lucide-react";
import BottomSheet from "@/components/BottomSheet";
import Companion from "@/components/companions/Companion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COMPANIONS, type CompanionInfo } from "@/lib/companions";
import type { CompanionId } from "@/components/companions/ids";

interface CompanionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  points: number;
  active: CompanionInfo;
  onChoose: (id: CompanionId) => void;
}

/** "Mes compagnons": the ten figures, unlocked ones to pick, the others as silhouettes. */
const CompanionsSheet = ({ open, onOpenChange, points, active, onChoose }: CompanionsSheetProps) => (
  <BottomSheet
    open={open}
    onOpenChange={onOpenChange}
    title="Mes compagnons"
    description="Ils vous accompagnent dans l'app. Gagnez des points pour en débloquer de nouveaux."
  >
    <ul className="space-y-3">
      {COMPANIONS.map((c) => {
        const unlocked = points >= c.unlockPoints;
        const isActive = c.id === active.id;
        return (
          <li
            key={c.id}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-3",
              isActive ? "border-2 border-gold bg-gold/5" : unlocked ? "bg-card" : "bg-muted/40"
            )}
          >
            <div className="relative h-20 w-[4.5rem] shrink-0">
              <Companion id={c.id} silhouette={!unlocked} animated={isActive} className="h-20 w-[4.5rem]" />
              {!unlocked && <Lock className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className={cn("font-serif text-lg font-bold leading-tight", !unlocked && "text-muted-foreground")}>
                {unlocked ? c.name : "???"}
              </p>
              <p className="text-xs leading-snug text-muted-foreground">
                {unlocked ? c.bio : `Débloqué à ${c.unlockPoints} points (encore ${c.unlockPoints - points}).`}
              </p>
              {unlocked &&
                (isActive ? (
                  <p className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                    <Check className="h-4 w-4" /> Votre compagnon
                  </p>
                ) : (
                  <Button size="sm" variant="outline" className="h-8" onClick={() => onChoose(c.id)}>
                    Choisir
                  </Button>
                ))}
            </div>
          </li>
        );
      })}
    </ul>
  </BottomSheet>
);

export default CompanionsSheet;
