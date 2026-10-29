import { useState } from "react";
import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { wikimediaAtWidth, wikimediaSrcSet } from "@/lib/images";

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
  /** How wide the image is drawn, for picking the thumbnail; full width of the app by default. */
  sizes?: string;
}

/**
 * A fact's illustration: a real photo, painting or illustration with its credit,
 * or a neutral placeholder when the fact has none yet. Never an AI-generated image.
 */
// Keyed on the image, so a fallback never carries over to the next fact shown in the same place.
export const FactImage = (props: FactImageProps) => <Illustration key={props.src ?? ""} {...props} />;

const Illustration = ({ src, alt, credit, sourceUrl, label, className, sizes = "(min-width: 672px) 672px, 100vw" }: FactImageProps) => {
  // A thumbnail can be refused (asked wider than the original): then the original, then the placeholder.
  const [attempt, setAttempt] = useState<"thumbnail" | "original" | "failed">("thumbnail");
  const srcSet = src && attempt === "thumbnail" ? wikimediaSrcSet(src) : undefined;

  if (!src || attempt === "failed") {
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
        src={srcSet ? (wikimediaAtWidth(src, 960) ?? src) : src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setAttempt(srcSet ? "original" : "failed")}
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
