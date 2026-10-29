import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { AppleIcon, GoogleIcon } from "@/components/brand/ProviderIcons";
import Companion from "@/components/companions/Companion";
import { useOAuthProviders, type OAuthProvider } from "@/lib/authProviders";
import type { CompanionId } from "@/components/companions/ids";

const TEASED: CompanionId[] = ["cleopatre", "cesar", "leonard", "confucius"];

/**
 * The first screen, as in a store app: who we are in one line, then straight
 * to creating an account with Apple, Google or an e-mail.
 */
const Welcome = () => {
  const { user, loading, signInWithProvider } = useAuth();
  const navigate = useNavigate();
  const providers = useOAuthProviders();
  const [leaving, setLeaving] = useState<OAuthProvider | null>(null);

  useEffect(() => {
    if (!loading && user) navigate("/app", { replace: true });
  }, [user, loading, navigate]);

  if (loading || user) return null;

  const continueWith = async (provider: OAuthProvider) => {
    setLeaving(provider);
    const { error } = await signInWithProvider(provider);
    // On success the browser is already on its way to the provider.
    if (error) {
      setLeaving(null);
      toast.error("Connexion impossible pour le moment. Réessayez ou utilisez votre e-mail.");
    }
  };

  const shows = (provider: OAuthProvider) => providers?.includes(provider);

  return (
    <div className="min-h-[100dvh] subtle-gradient">
      <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
        <header className="relative flex items-center justify-center gap-2">
          <LogoMark className="h-9 w-9" title="" />
          <Wordmark className="text-2xl" />
          <Link to="/decouvrir" className="absolute right-0 text-sm font-semibold text-primary">
            Découvrir
          </Link>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-4 text-center animate-fade-in">
          <div className="relative mb-1 hidden max-w-[17rem] rounded-2xl bg-card px-4 py-2.5 text-sm font-medium leading-snug card-shadow tall:block">
            Je suis Napoléon. Ensemble, conquérons l'histoire, une date à la fois !
            <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-card" aria-hidden="true" />
          </div>
          <Companion id="napoleon" mood="wave" className="h-36 w-32 tall:h-48 tall:w-40" title="Napoléon" />
          <h1 className="mt-2 text-3xl font-bold leading-tight">Votre dose quotidienne d'histoire</h1>
          <p className="mt-2 text-muted-foreground">
            5 faits par jour, des quiz et une série à tenir, avec les grandes figures de l'histoire.
          </p>
          <div className="mt-4 hidden items-center gap-2 text-xs font-medium text-muted-foreground tall:flex">
            <div className="flex -space-x-3">
              {TEASED.map((id) => (
                <span key={id} className="h-9 w-9 overflow-hidden rounded-full border-2 border-background bg-secondary">
                  <Companion id={id} framing="head" animated={false} className="h-full w-full" title="" />
                </span>
              ))}
            </div>
            et d'autres figures à débloquer
          </div>
        </section>

        <div className="space-y-2.5">
          {shows("apple") && (
            <Button
              size="lg"
              className="h-12 w-full rounded-xl [&_svg]:size-5 bg-black text-base font-semibold text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/85"
              disabled={!!leaving}
              onClick={() => continueWith("apple")}
            >
              {leaving === "apple" ? <Loader2 className="animate-spin" /> : <AppleIcon />}
              Continuer avec Apple
            </Button>
          )}
          {shows("google") && (
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-xl [&_svg]:size-5 bg-card text-base font-semibold"
              disabled={!!leaving}
              onClick={() => continueWith("google")}
            >
              {leaving === "google" ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
              Continuer avec Google
            </Button>
          )}
          <Button
            size="lg"
            variant={providers?.length ? "ghost" : "hero"}
            className="h-12 w-full rounded-xl [&_svg]:size-5 text-base font-semibold"
            disabled={!!leaving}
            onClick={() => navigate("/auth")}
          >
            <Mail />
            Continuer avec un e-mail
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/auth?mode=signin" className="font-semibold text-primary">
              Se connecter
            </Link>
          </p>
          <p className="text-center text-xs leading-snug text-muted-foreground">
            En continuant, vous acceptez les{" "}
            <Link to="/conditions" className="underline underline-offset-2">
              conditions d'utilisation
            </Link>{" "}
            et la{" "}
            <Link to="/confidentialite" className="underline underline-offset-2">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

export default Welcome;
