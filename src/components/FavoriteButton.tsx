import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites, type FavoriteItem } from "@/lib/favorites";

interface FavoriteButtonProps {
  item: FavoriteItem;
  /** "light" for dark backgrounds such as the gradient cards. */
  tone?: "default" | "light";
  className?: string;
}

/** Heart that adds a fact or a quote to the favorites, with a little pop. */
export const FavoriteButton = ({ item, tone = "default", className }: FavoriteButtonProps) => {
  const { isFavorite, toggle } = useFavorites();
  const [popping, setPopping] = useState(false);
  const active = isFavorite(item);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={(e) => {
        e.stopPropagation();
        if (!active) setPopping(true);
        toggle(item);
      }}
      onAnimationEnd={() => setPopping(false)}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full smooth-transition active:scale-90",
        tone === "light" ? "hover:bg-white/15" : "hover:bg-secondary",
        className
      )}
    >
      <Heart
        className={cn(
          "h-5 w-5",
          popping && "animate-heart-pop",
          active
            ? "fill-red-500 text-red-500"
            : tone === "light"
              ? "text-white/80"
              : "text-muted-foreground"
        )}
      />
    </button>
  );
};
