import { useState } from "react";
import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface FactImageProps {
  src?: string | null;
  alt: string;
  /** Author and license, shown under the image (e.g. "Jean-Pierre Houël, domaine public"). */
  credit?: string | null;
  /** Page stating the image's author and license, linked from the credit. */
  sourceUrl?: string | null;
  /** Shown on the placeholder, e.g. "Europe · Moyen Âge". */
  label?: string;
  /** Sizing classes for the frame, e.g. "h-48 md:h-64". */
  className?: string;
}

/**
 * A fact's illustration: a real photo, painting or illustration with its credit,
 * or a neutral placeholder when the fact has none yet. Never an AI-generated image.
 */
export const FactImage = ({ src, alt, credit, sourceUrl, label, className }: FactImageProps) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-primary/15 bg-gradient-to-br from-primary/10 via-muted to-secondary/15",
          className
        )}
        aria-hidden="true"
      >
        <Landmark className="h-10 w-10 text-primary/50" />
        {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
      </div>
    );
  }

  return (
    <figure className="space-y-1.5">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={cn("w-full rounded-lg bg-muted object-cover", className)}
      />
      {credit && (
        <figcaption className="text-xs text-muted-foreground">
          {sourceUrl ? (
            <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              {credit}
            </a>
          ) : (
            credit
          )}
        </figcaption>
      )}
    </figure>
  );
};
