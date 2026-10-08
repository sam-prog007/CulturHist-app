import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailSchema } from "@/lib/validation";
import logo from "@/assets/culturhist-logo.png";

const signInErrorMessage = (message: string) => {
  if (message.includes("Invalid login credentials")) return "E-mail ou mot de passe incorrect.";
  if (message.includes("Email not confirmed")) return "Confirmez d'abord votre adresse avec le lien reçu par e-mail.";
  return message;
};

/** Sign-in for existing accounts. New accounts are created at the end of the onboarding. */
export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/app", { replace: true });
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailCheck = emailSchema.safeParse(email.trim());
    if (!emailCheck.success) return void toast.error(emailCheck.error.issues[0].message);
    if (!password) return void toast.error("Veuillez entrer votre mot de passe");

    setSubmitting(true);
    const { error } = await signIn(emailCheck.data, password);
    setSubmitting(false);
    if (error) return void toast.error(signInErrorMessage(error.message));
    navigate("/app", { replace: true });
  };

  return (
    <div className="min-h-[100dvh] subtle-gradient">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <header>
          <Button variant="ghost" size="icon" aria-label="Retour" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex flex-1 flex-col justify-center px-1 py-6 motion-safe:animate-fade-in-up">
          <img src={logo} alt="" className="mb-6 h-16 w-16 rounded-2xl card-shadow" />
          <h1 className="text-[1.75rem] font-bold leading-tight">Bon retour parmi nous</h1>
          <p className="mt-1 text-sm text-muted-foreground">Connectez-vous pour retrouver vos faits du jour.</p>

          <form onSubmit={handleSignIn} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="signin-email">E-mail</Label>
              <Input id="signin-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signin-password">Mot de passe</Label>
              <Input id="signin-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" size="xl" className="w-full rounded-2xl" disabled={submitting}>
              {submitting ? "Connexion…" : "Se connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/onboarding" className="font-semibold text-primary">
              Commencer
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
