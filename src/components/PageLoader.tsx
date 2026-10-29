import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import CompanionBubble from "@/components/companions/CompanionBubble";
import { companionById } from "@/lib/companions";

interface PageLoaderProps {
  /** Set when the page's data could not be loaded: then a message instead of the spinner. */
  error?: unknown;
  onRetry?: () => void;
}

const describe = (error: unknown) =>
  error instanceof Error ? error.message : typeof error === "object" && error && "message" in error ? String(error.message) : String(error);

/**
 * A page's full-screen wait. If loading fails, it says so and offers to try
 * again, so a page never spins forever.
 */
const PageLoader = ({ error, onRetry }: PageLoaderProps) => {
  if (!error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-label="Chargement">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen subtle-gradient">
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <CompanionBubble
          companion={companionById("napoleon")}
          mood="sad"
          text="Une bataille perdue n'est pas la guerre perdue : cette page n'a pas pu se charger."
        />
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-xs text-destructive">
          {describe(error)}
        </p>
        <div className="space-y-2">
          {onRetry && (
            <Button variant="hero" size="lg" className="h-12 w-full rounded-xl" onClick={onRetry}>
              <RotateCcw />
              Réessayer
            </Button>
          )}
          <Button asChild variant="ghost" size="lg" className="h-12 w-full rounded-xl">
            <Link to="/app">Retour à l'accueil</Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PageLoader;
