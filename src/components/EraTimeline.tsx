import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatYear } from "@/lib/dates";
import type { Era } from "@/lib/progress";

interface EraTimelineProps {
  eras: Era[];
  isSelected: (era: Era) => boolean;
  onToggle: (era: Era) => void;
}

const span = (era: Era) =>
  era.startYear === null
    ? ""
    : era.endYear === null
      ? `Depuis ${formatYear(era.startYear)}`
      : `${formatYear(era.startYear)} – ${formatYear(era.endYear)}`;

/** Vertical timeline of eras: each fills with the facts learned in it. */
const EraTimeline = ({ eras, isSelected, onToggle }: EraTimelineProps) => (
  <ol className="relative space-y-4 pl-8">
    <span className="absolute bottom-3 left-3 top-3 w-0.5 rounded-full bg-border" aria-hidden="true" />
    {eras.map((era) => {
      const ratio = era.total ? era.learned / era.total : 0;
      const selected = isSelected(era);
      return (
        <li key={era.id} className="relative">
          <span
            className={cn(
              "absolute -left-[25px] top-4 h-4 w-4 rounded-full border-2 border-card",
              ratio > 0 ? "bg-gold" : "bg-muted-foreground/30"
            )}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => onToggle(era)}
            aria-pressed={selected}
            className={cn(
              "w-full space-y-2 rounded-xl border-2 bg-card p-4 text-left smooth-transition",
              selected ? "border-primary" : "border-transparent card-shadow"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-serif text-lg font-bold">{era.name}</p>
                <p className="text-xs text-muted-foreground">{span(era)}</p>
              </div>
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                )}
              >
                {selected && <Check className="h-4 w-4" />}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${ratio * 100}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">
              {era.total === 0
                ? "Pas encore de faits pour cette époque"
                : `${era.learned}/${era.total} ${era.total > 1 ? "faits découverts" : "fait découvert"}`}
            </p>
          </button>
        </li>
      );
    })}
  </ol>
);

export default EraTimeline;
