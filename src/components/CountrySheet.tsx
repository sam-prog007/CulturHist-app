import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, Lock, MapPin } from "lucide-react";
import BottomSheet from "@/components/BottomSheet";
import { FactDetails } from "@/components/FactSheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { REGION_LABELS } from "@/lib/dailyFacts";
import type { MapCountry } from "@/components/WorldMap";
import type { MapFact } from "@/lib/progress";

interface CountrySheetProps {
  country: MapCountry | null;
  facts: MapFact[];
  learnedIds: Set<string>;
  eraName: (periodId: string | null) => string | null;
  regionSelected: boolean;
  onToggleRegion: (region: string) => void;
  onClose: () => void;
}

/** A tapped country: its facts, learned ones to read and the others to discover, and its region. */
const CountrySheet = ({ country, facts, learnedIds, eraName, regionSelected, onToggleRegion, onClose }: CountrySheetProps) => {
  const [shown, setShown] = useState(country);
  const [openFact, setOpenFact] = useState<MapFact | null>(null);

  useEffect(() => {
    if (country) setShown(country);
    setOpenFact(null);
  }, [country]);

  const inCountry = shown
    ? facts.filter((f) => f.countries.includes(shown.code)).sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
    : [];
  const learned = inCountry.filter((f) => learnedIds.has(f.id));
  const region = shown ? REGION_LABELS[shown.region] : "";

  return (
    <BottomSheet
      open={!!country}
      onOpenChange={(open) => !open && onClose()}
      title={
        <>
          <MapPin className="h-5 w-5 text-primary" />
          {shown?.name}
        </>
      }
      description={
        inCountry.length
          ? `${region} · ${learned.length}/${inCountry.length} ${inCountry.length > 1 ? "faits découverts" : "fait découvert"}`
          : `${region} · pas encore de faits ici`
      }
    >
      {openFact ? (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" className="-ml-2" onClick={() => setOpenFact(null)}>
            <ArrowLeft className="h-4 w-4" /> {shown?.name}
          </Button>
          <FactDetails fact={openFact} learned={learnedIds.has(openFact.id)} eraName={eraName(openFact.periodId)} />
        </div>
      ) : (
        <div className="space-y-4">
          {inCountry.length > 0 && (
            <ul className="space-y-2">
              {inCountry.map((fact) => {
                const isLearned = learnedIds.has(fact.id);
                return (
                  <li key={fact.id}>
                    <button
                      type="button"
                      onClick={() => setOpenFact(fact)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left smooth-transition hover:border-primary/50",
                        isLearned ? "bg-card" : "border-dashed bg-muted/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          isLearned ? "bg-gold/20 text-primary" : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isLearned ? <span className="h-3 w-3 rounded-full bg-gold" /> : <Lock className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cn("block font-medium leading-snug", !isLearned && "text-muted-foreground")}>{fact.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {[fact.dateText, eraName(fact.periodId)].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {shown && (
            <Button
              variant={regionSelected ? "outline" : "default"}
              className="w-full"
              onClick={() => onToggleRegion(shown.region)}
            >
              {regionSelected ? `Retirer ${region} de mes régions` : `Ajouter ${region} à mes régions`}
            </Button>
          )}
        </div>
      )}
    </BottomSheet>
  );
};

export default CountrySheet;
