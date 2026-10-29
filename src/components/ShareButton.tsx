import { Share } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { share, type ShareContent } from "@/lib/share";

interface ShareButtonProps {
  content: ShareContent;
  /** "light" for dark backgrounds such as the gradient cards. */
  tone?: "default" | "light";
  /** Shown next to the icon, for a labelled button instead of an icon alone. */
  label?: string;
  className?: string;
}

/** Shares a fact or a quote, next to its favorite heart. */
export const ShareButton = ({ content, tone = "default", label, className }: ShareButtonProps) => (
  <button
    type="button"
    aria-label={label ? undefined : "Partager"}
    onClick={async (e) => {
      e.stopPropagation();
      try {
        if ((await share(content)) === "copied") toast.success("Lien copié", { description: "Collez-le où vous voulez pour le partager." });
      } catch {
        toast.error("Impossible de partager ce lien");
      }
    }}
    className={cn(
      "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full smooth-transition active:scale-95",
      label ? "border bg-card px-4 text-sm font-semibold hover:border-primary/50" : "w-9",
      !label && (tone === "light" ? "hover:bg-white/15" : "text-muted-foreground hover:bg-secondary hover:text-foreground"),
      className
    )}
  >
    <Share className={label ? "h-4 w-4" : "h-5 w-5"} />
    {label}
  </button>
);
