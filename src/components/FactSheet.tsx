import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BottomSheet from "@/components/BottomSheet";
import { DifficultyStars } from "@/components/DifficultyStars";
import { FactImage } from "@/components/FactImage";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapFact } from "@/lib/progress";

interface FactDetailsProps {
  fact: MapFact;
  learned: boolean;
  eraName?: string | null;
  /** Off inside a sheet whose title is already the fact's. */
  showTitle?: boolean;
}

/**
 * A fact as the map and the timeline show it: in full once learned (image,
 * text, favorite), as a locked teaser otherwise, to make the user curious.
 */
export const FactDetails = ({ fact, learned, eraName, showTitle = true }: FactDetailsProps) => {
  const { data: full, isLoading } = useQuery({
    queryKey: ["fact", fact.id],
    enabled: learned,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("historical_facts")
        .select("id, title, title_fr, description, description_fr, image_url, image_credit, image_source_url, difficulty, region_fr")
        .eq("id", fact.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const meta = [fact.dateText, eraName].filter(Boolean).join(" · ");

  if (!learned) {
    return (
      <div className="space-y-3">
        {showTitle && <h3 className="font-serif text-xl font-bold leading-tight">{fact.title}</h3>}
        {showTitle && meta && <p className="text-sm font-medium text-accent">{meta}</p>}
        <div className="flex gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Pas encore découvert. Choisissez cette région ou cette époque : il pourra arriver dans vos faits du jour.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading || !full ? (
        <>
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </>
      ) : (
        <>
          <FactImage
            src={full.image_url}
            alt={fact.title}
            credit={full.image_credit}
            sourceUrl={full.image_source_url}
            label={full.region_fr ?? undefined}
            className="h-44"
          />
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              {showTitle ? <h3 className="font-serif text-xl font-bold leading-tight">{fact.title}</h3> : <span />}
              <div className="flex shrink-0 items-center gap-1">
                <DifficultyStars difficulty={full.difficulty} />
                <FavoriteButton item={{ factId: fact.id }} className="-my-1.5 -mr-1.5" />
              </div>
            </div>
            {showTitle && meta && <p className="text-sm font-medium text-accent">{meta}</p>}
            <p className="text-sm leading-relaxed text-muted-foreground">{full.description_fr || full.description}</p>
          </div>
        </>
      )}
    </div>
  );
};

interface FactSheetProps {
  fact: MapFact | null;
  learned: boolean;
  eraName?: string | null;
  onClose: () => void;
}

/** One fact in a bottom sheet, opened from a dot of the timeline. */
export const FactSheet = ({ fact, learned, eraName, onClose }: FactSheetProps) => {
  // Keep showing the last fact while the sheet slides away.
  const [shown, setShown] = useState(fact);
  useEffect(() => {
    if (fact) setShown(fact);
  }, [fact]);

  return (
    <BottomSheet
      open={!!fact}
      onOpenChange={(open) => !open && onClose()}
      title={shown?.title ?? ""}
      description={[shown?.dateText, eraName].filter(Boolean).join(" · ") || "Fait historique"}
    >
      {shown && <FactDetails fact={shown} learned={learned} eraName={eraName} showTitle={false} />}
    </BottomSheet>
  );
};
