import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bell, ChevronRight, KeyRound, LogOut, Mail, Map, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { DifficultyStars } from "@/components/DifficultyStars";
import NotificationSettings from "@/components/NotificationSettings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { DIFFICULTIES } from "@/lib/difficulty";
import { emailSchema, passwordSchema, usernameSchema } from "@/lib/validation";

const Section = ({ icon: Icon, title, children }: { icon: typeof User; title: string; children: React.ReactNode }) => (
  <Card className="space-y-4 p-5 card-shadow">
    <h2 className="flex items-center gap-2 text-lg font-bold">
      <Icon className="h-5 w-5 text-primary" /> {title}
    </h2>
    {children}
  </Card>
);

const SettingsPage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/");
  }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["settings-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, preferred_difficulty")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile?.username]);

  const run = async (key: string, action: () => Promise<void>) => {
    setBusy(key);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  };

  const saveUsername = () =>
    run("username", async () => {
      const check = usernameSchema.safeParse(username.trim());
      if (!check.success) return void toast.error(check.error.issues[0].message);
      const { error } = await supabase.from("profiles").update({ username: check.data }).eq("id", user!.id);
      if (error) return void toast.error(error.code === "23505" ? "Ce pseudo est déjà pris" : error.message);
      queryClient.invalidateQueries({ queryKey: ["home-profile"] });
      toast.success("Pseudo mis à jour");
    });

  const saveEmail = () =>
    run("email", async () => {
      const check = emailSchema.safeParse(email.trim());
      if (!check.success) return void toast.error(check.error.issues[0].message);
      const { error } = await supabase.auth.updateUser(
        { email: check.data },
        { emailRedirectTo: `${window.location.origin}/settings` }
      );
      if (error) return void toast.error(error.message);
      setEmail("");
      toast.success("Vérifiez vos e-mails : le changement sera effectif après confirmation.");
    });

  const savePassword = () =>
    run("password", async () => {
      const check = passwordSchema.safeParse(password);
      if (!check.success) return void toast.error(check.error.issues[0].message);
      if (password !== passwordConfirm) return void toast.error("Les deux mots de passe ne correspondent pas");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        return void toast.error(
          error.message.toLowerCase().includes("reauthentication")
            ? "Pour des raisons de sécurité, reconnectez-vous puis réessayez."
            : error.message
        );
      }
      setPassword("");
      setPasswordConfirm("");
      toast.success("Mot de passe mis à jour");
    });

  const toggleDifficulty = (value: string) =>
    run("difficulty", async () => {
      const current = profile?.preferred_difficulty ?? [];
      const next = current.includes(value) ? current.filter((d) => d !== value) : [...current, value];
      queryClient.setQueryData(["settings-profile", user?.id], { ...profile, preferred_difficulty: next });
      const { error } = await supabase.from("profiles").update({ preferred_difficulty: next }).eq("id", user!.id);
      if (error) {
        queryClient.invalidateQueries({ queryKey: ["settings-profile"] });
        toast.error("Préférence non enregistrée");
      }
    });

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const deleteAccount = () =>
    run("delete", async () => {
      const { error } = await supabase.rpc("delete_my_account");
      if (error) return void toast.error("La suppression a échoué : " + error.message);
      await signOut();
      toast.success("Votre compte a été supprimé");
      navigate("/");
    });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const difficulties = profile?.preferred_difficulty ?? [];

  return (
    <div className="min-h-screen subtle-gradient">
      <main className="mx-auto max-w-md space-y-5 px-4 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <header className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Retour au profil" onClick={() => navigate("/profile")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Réglages</h1>
        </header>

        <Section icon={User} title="Pseudo">
          <div className="flex gap-2">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} aria-label="Pseudo" maxLength={30} />
            <Button onClick={saveUsername} disabled={busy !== null || username.trim() === profile?.username}>
              Enregistrer
            </Button>
          </div>
        </Section>

        <Section icon={Mail} title="Adresse e-mail">
          <p className="text-sm text-muted-foreground">
            Actuelle : <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="new-email">Nouvelle adresse</Label>
            <div className="flex gap-2">
              <Input id="new-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button onClick={saveEmail} disabled={busy !== null || !email.trim()}>Changer</Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Un lien de confirmation vous sera envoyé par e-mail.</p>
        </Section>

        <Section icon={KeyRound} title="Mot de passe">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nouveau mot de passe</Label>
            <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirmer</Label>
            <Input id="confirm-password" type="password" autoComplete="new-password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">Au moins 8 caractères, une majuscule et un chiffre.</p>
          <Button className="w-full" onClick={savePassword} disabled={busy !== null || !password}>
            Changer le mot de passe
          </Button>
        </Section>

        <Section icon={Map} title="Préférences d'apprentissage">
          <div className="space-y-2">
            <p className="text-sm font-medium">Difficultés préférées</p>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => {
                const active = difficulties.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleDifficulty(d.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium smooth-transition",
                      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <DifficultyStars difficulty={d.value} tone={active ? "current" : "gold"} />
                    {d.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">Aucune choisie : toutes les difficultés.</p>
          </div>
          <Link
            to="/cartes"
            className="flex items-center justify-between rounded-xl border bg-card p-3 text-sm font-medium hover:border-primary/50 smooth-transition"
          >
            Régions et époques : choisir sur la carte
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </Section>

        <Section icon={Bell} title="Notifications">
          <NotificationSettings userId={user.id} />
        </Section>

        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Se déconnecter
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-4 w-4" /> Supprimer mon compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer votre compte ?</AlertDialogTitle>
              <AlertDialogDescription>
                Votre progression, vos points, votre série et vos succès seront définitivement effacés. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={deleteAccount}
              >
                Supprimer définitivement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      <BottomNav />
    </div>
  );
};

export default SettingsPage;
