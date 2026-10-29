import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailSchema, passwordSchema } from "@/lib/validation";

/**
 * The e-mail way in, one screen per step like in a native app:
 * signup / signin, reset (ask for a link), update (new password, opened from
 * that link) and sent (check your inbox).
 */
type Mode = "signup" | "signin" | "reset" | "update" | "sent";

const TITLES: Record<Mode, string> = {
  signup: "Créez votre compte",
  signin: "Bon retour !",
  reset: "Mot de passe oublié",
  update: "Nouveau mot de passe",
  sent: "Vérifiez vos e-mails",
};

/** Supabase's English errors, in the app's words. */
function explain(message: string) {
  if (/invalid login credentials/i.test(message)) return "E-mail ou mot de passe incorrect.";
  if (/email not confirmed/i.test(message)) return "Confirmez d'abord votre adresse avec le lien reçu par e-mail.";
  if (/already registered/i.test(message)) return "Un compte existe déjà avec cet e-mail. Connectez-vous.";
  if (/rate limit|security purposes/i.test(message)) return "Trop de tentatives. Patientez une minute puis réessayez.";
  if (/same.*password|different from the old/i.test(message)) return "Choisissez un mot de passe différent de l'ancien.";
  return message;
}

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initial = searchParams.get("mode");
  const [mode, setMode] = useState<Mode>(
    initial === "signin" || initial === "reset" || initial === "update" ? initial : "signup"
  );
  // What the "sent" screen is about: a new account or a reset link.
  const [sentFor, setSentFor] = useState<"signup" | "reset">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { user, loading, signIn, signUp, sendPasswordReset } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // The reset link signs the user in: let them choose the new password first.
    if (!loading && user && mode !== "update") navigate("/app", { replace: true });
  }, [user, loading, mode, navigate]);

  useEffect(() => {
    if (!loading && !user && mode === "update") {
      setMode("reset");
      setError("Ce lien a expiré ou a déjà servi. Demandez-en un nouveau.");
    }
  }, [user, loading, mode]);

  const go = (next: Mode) => {
    setError(null);
    setPassword("");
    setMode(next);
  };

  const back = () => {
    if (mode === "reset") go("signin");
    else if (mode === "update") navigate("/app");
    else navigate("/");
  };

  const checkEmail = () => {
    const result = emailSchema.safeParse(email.trim());
    if (!result.success) setError(result.error.issues[0].message);
    return result.success;
  };

  const checkNewPassword = () => {
    const result = passwordSchema.safeParse(password);
    if (!result.success) setError(result.error.issues[0].message);
    return result.success;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup") {
      if (!checkEmail() || !checkNewPassword()) return;
      setBusy(true);
      const { error, session } = await signUp(email.trim(), password);
      setBusy(false);
      if (error) return setError(explain(error.message));
      // With e-mail confirmation on, the account opens from the link.
      if (!session) {
        setSentFor("signup");
        go("sent");
      }
      return;
    }

    if (mode === "signin") {
      if (!checkEmail()) return;
      if (!password) return setError("Entrez votre mot de passe.");
      setBusy(true);
      const { error } = await signIn(email.trim(), password);
      setBusy(false);
      if (error) setError(explain(error.message));
      return;
    }

    if (mode === "reset") {
      if (!checkEmail()) return;
      setBusy(true);
      const { error } = await sendPasswordReset(email.trim());
      setBusy(false);
      if (error) return setError(explain(error.message));
      setSentFor("reset");
      go("sent");
      return;
    }

    if (mode === "update") {
      if (!checkNewPassword()) return;
      setBusy(true);
      const { error } = await supabase.auth.updateUser({ password });
      setBusy(false);
      if (error) return setError(explain(error.message));
      toast.success("Mot de passe modifié");
      navigate("/app", { replace: true });
    }
  };

  const resend = async () => {
    setBusy(true);
    const { error } =
      sentFor === "signup"
        ? await supabase.auth.resend({
            type: "signup",
            email: email.trim(),
            options: { emailRedirectTo: `${window.location.origin}/app` },
          })
        : await sendPasswordReset(email.trim());
    setBusy(false);
    if (error) toast.error(explain(error.message));
    else toast.success("E-mail renvoyé");
  };

  if (loading) return null;

  return (
    <div className="min-h-[100dvh] subtle-gradient">
      <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <header className="-ml-2 flex h-12 items-center">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={back} aria-label="Retour">
            <ChevronLeft className="!size-6" />
          </Button>
        </header>

        {mode === "sent" ? (
          <section className="flex flex-1 flex-col animate-fade-in">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">{TITLES.sent}</h1>
              <p className="mt-3 text-muted-foreground">
                {sentFor === "signup"
                  ? "Nous avons envoyé un lien de confirmation à "
                  : "Nous avons envoyé un lien pour choisir un nouveau mot de passe à "}
                <span className="font-semibold text-foreground">{email.trim()}</span>.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {sentFor === "signup"
                  ? "Ouvrez-le pour activer votre compte : vous arriverez directement dans l'app."
                  : "Ouvrez-le sur cet appareil pour continuer."}
              </p>
            </div>
            <div className="space-y-3">
              <Button variant="outline" size="lg" className="h-12 w-full rounded-xl bg-card" disabled={busy} onClick={resend}>
                {busy && <Loader2 className="animate-spin" />}
                Renvoyer l'e-mail
              </Button>
              <Button variant="ghost" size="lg" className="h-12 w-full rounded-xl" onClick={() => go("signin")}>
                {sentFor === "signup" ? "J'ai confirmé, me connecter" : "Retour à la connexion"}
              </Button>
            </div>
          </section>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-1 flex-col animate-fade-in">
            <div className="space-y-6 pt-4">
              <div>
                <h1 className="text-3xl font-bold">{TITLES[mode]}</h1>
                <p className="mt-2 text-muted-foreground">
                  {mode === "signup" && "Quelques secondes et votre première leçon d'histoire commence."}
                  {mode === "signin" && "Retrouvez votre série et vos compagnons."}
                  {mode === "reset" && "Entrez votre e-mail : nous vous enverrons un lien pour en choisir un nouveau."}
                  {mode === "update" && "Choisissez le mot de passe de votre compte."}
                </p>
              </div>

              <div className="space-y-4">
                {mode !== "update" && (
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl bg-card text-base"
                      autoFocus
                    />
                  </div>
                )}

                {mode !== "reset" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">{mode === "update" ? "Nouveau mot de passe" : "Mot de passe"}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={mode === "signin" ? "current-password" : "new-password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 rounded-xl bg-card pr-12 text-base"
                        autoFocus={mode === "update"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground"
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {mode !== "signin" && (
                      <p className="text-xs text-muted-foreground">8 caractères minimum, dont une majuscule et un chiffre.</p>
                    )}
                    {mode === "signin" && (
                      <button type="button" onClick={() => go("reset")} className="text-sm font-semibold text-primary">
                        Mot de passe oublié ?
                      </button>
                    )}
                  </div>
                )}

                {error && (
                  <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-auto space-y-3 pt-8">
              <Button type="submit" variant="hero" size="lg" className="h-12 w-full rounded-xl" disabled={busy}>
                {busy && <Loader2 className="animate-spin" />}
                {mode === "signup" && "Créer mon compte"}
                {mode === "signin" && "Se connecter"}
                {mode === "reset" && "Envoyer le lien"}
                {mode === "update" && "Enregistrer"}
              </Button>
              {(mode === "signup" || mode === "signin") && (
                <p className="text-center text-sm text-muted-foreground">
                  {mode === "signup" ? "Déjà un compte ? " : "Pas encore de compte ? "}
                  <button type="button" onClick={() => go(mode === "signup" ? "signin" : "signup")} className="font-semibold text-primary">
                    {mode === "signup" ? "Se connecter" : "En créer un"}
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
};

export default Auth;
