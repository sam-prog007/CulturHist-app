import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_STARS, getDifficulty } from "@/lib/difficulty";

interface DifficultyStarsProps {
  difficulty: string | null | undefined;
  /** Also show the level name next to the stars ("Moyen"). */
  showLabel?: boolean;
  /** "current" uses the text color, for stars on a colored background. */
  tone?: "gold" | "current";
  className?: string;
}

/** Difficulty as 1 to 3 gold stars. Renders nothing for an unknown difficulty. */
export const DifficultyStars = ({ difficulty, showLabel = false, tone = "gold", className }: DifficultyStarsProps) => {
  const level = getDifficulty(difficulty);
  if (!level) return null;

  return (
    <span
      className={cn("inline-flex items-center gap-1", className)}
      role="img"
      aria-label={`Difficulté : ${level.label} (${level.stars} sur ${MAX_STARS})`}
      title={`Difficulté : ${level.label}`}
    >
      <span className="inline-flex gap-0.5" aria-hidden="true">
        {Array.from({ length: MAX_STARS }, (_, i) => (
          <Star
            key={i}
            className={cn(
              "h-4 w-4",
              i < level.stars
                ? tone === "gold" ? "fill-gold text-gold" : "fill-current"
                : tone === "gold" ? "text-muted-foreground/40" : "opacity-40"
            )}
          />
        ))}
      </span>
      {showLabel && (
        <span className={cn("text-xs font-medium", tone === "gold" && "text-muted-foreground")} aria-hidden="true">
          {level.label}
        </span>
      )}
    </span>
  );
};
