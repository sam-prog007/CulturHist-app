import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { DifficultyStars } from "@/components/DifficultyStars";
import { cn } from "@/lib/utils";
import { DIFFICULTIES } from "@/lib/difficulty";
import { emailSchema, passwordSchema, usernameSchema } from "@/lib/validation";
import { saveOnboardingAnswers, savePendingOnboarding, type OnboardingAnswers } from "@/lib/pendingOnboarding";

const PROFILE_TYPES = [
  { value: "student", label: "Étudiant·e", description: "J'étudie l'histoire" },
  { value: "teacher", label: "Enseignant·e", description: "J'enseigne l'histoire" },
  { value: "curious", label: "Curieux·se", description: "Je veux apprendre" },
  { value: "professional", label: "Professionnel·le", description: "Je travaille dans le domaine" },
];

const LEARNING_GOALS = [
  { value: "culture", label: "Culture générale", description: "Enrichir mes connaissances et ma culture personnelle" },
  { value: "exam", label: "Préparation d'examen", description: "Me préparer pour des examens ou concours" },
  { value: "understanding", label: "Comprendre le monde actuel", description: "Mieux comprendre les enjeux contemporains" },
  { value: "passion", label: "Passion personnelle", description: "L'histoire me passionne profondément" },
  { value: "professional", label: "Raisons professionnelles", description: "Pour mon travail ou mes études" },
];

const REGIONS = [
  { value: "worldwide", label: "Monde entier" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asie" },
  { value: "africa", label: "Afrique" },
  { value: "americas", label: "Amériques" },
  { value: "oceania", label: "Océanie" },
  { value: "middle-east", label: "Moyen-Orient" },
];

const ERAS_BY_REGION: Record<string, string[]> = {
  worldwide: ["Préhistoire", "Antiquité", "Moyen Âge", "Renaissance", "Époque moderne", "Époque contemporaine"],
  europe: ["Antiquité grecque et romaine", "Moyen Âge médiéval", "Renaissance", "Révolutions", "Guerres mondiales", "Union européenne"],
  asia: ["Dynasties chinoises", "Empire mongol", "Période Edo", "Colonialisme", "Indépendances", "Asie moderne"],
  africa: ["Égypte ancienne", "Royaumes africains", "Colonisation", "Indépendances", "Afrique contemporaine"],
  americas: ["Civilisations précolombiennes", "Colonisation", "Indépendances", "Révolutions", "XXe siècle", "Amériques modernes"],
  oceania: ["Peuples autochtones", "Exploration", "Colonisation", "Indépendances", "Océanie moderne"],
  "middle-east": ["Mésopotamie ancienne", "Empires perses", "Califats islamiques", "Empire ottoman", "Décolonisation", "Moyen-Orient moderne"],
};

const DIFFICULTY_DESCRIPTIONS: Record<string, string> = {
  easy: "Faits accessibles et simples",
  medium: "Faits avec détails modérés",
  hard: "Faits complexes et détaillés",
};

const STEPS = ["profile", "goal", "regions", "eras", "difficulty", "account"] as const;
type Step = (typeof STEPS)[number];

const TITLES: Record<Step, { title: string; hint: string }> = {
  profile: { title: "Qui êtes-vous ?", hint: "Cela nous aide à personnaliser votre expérience." },
  goal: { title: "Pourquoi apprendre l'histoire ?", hint: "Choisissez votre motivation principale." },
  regions: { title: "Quelles régions vous intéressent ?", hint: "Une ou plusieurs : vos faits du jour en viendront." },
  eras: { title: "Quelles époques vous passionnent ?", hint: "Facultatif : sans choix, toutes les époques." },
  difficulty: { title: "Quel niveau préférez-vous ?", hint: "Facultatif : sans choix, tous les niveaux." },
  account: { title: "Créez votre compte", hint: "Pour garder vos préférences et votre progression." },
};

const signUpErrorMessage = (message: string) => {
  if (message.includes("already registered")) return "Cet e-mail a déjà un compte : connectez-vous.";
  if (message.includes("Database error saving new user")) return "Ce pseudo est déjà pris : choisissez-en un autre.";
  if (message.toLowerCase().includes("rate limit")) return "Trop de tentatives : réessayez dans quelques minutes.";
  return message;
};

const Option = ({
  selected,
  onClick,
  label,
  description,
  compact = false,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  description?: string;
  /** Tighter, for the two-column grids. */
  compact?: boolean;
  children?: React.ReactNode;
}) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cn(
      "flex w-full items-center rounded-2xl border bg-card text-left smooth-transition",
      compact ? "gap-2 p-3" : "gap-3 p-4",
      selected ? "border-primary ring-2 ring-primary/25" : "border-border hover:border-primary/50"
    )}
  >
    <div className="min-w-0 flex-1">
      <p className={cn("flex items-center gap-2 break-words font-medium hyphens-auto", compact && "text-[0.9375rem]")}>
        {label}
        {children}
      </p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border smooth-transition",
        compact ? "h-5 w-5" : "h-6 w-6",
        selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
      )}
    >
      {selected && <Check className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />}
    </span>
  </button>
);

/** Sign-up: the preference questions, then the account. Shown once, never to signed-in users. */
const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading, signUp } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [profileType, setProfileType] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [eras, setEras] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);
  // Set while this page creates the account, so the redirect below waits for the answers to be saved.
  const signingUp = useRef(false);

  useEffect(() => {
    if (!loading && user && !signingUp.current) navigate("/app", { replace: true });
  }, [user, loading, navigate]);

  const step = STEPS[stepIndex];
  const availableEras = regions.includes("worldwide")
    ? ERAS_BY_REGION.worldwide
    : [...new Set(regions.flatMap((region) => ERAS_BY_REGION[region] ?? []))];

  const toggleIn = (setter: React.Dispatch<React.SetStateAction<string[]>>, value: string) =>
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const toggleRegion = (region: string) =>
    setRegions((prev) =>
      region === "worldwide"
        ? ["worldwide"]
        : prev.includes(region)
          ? prev.filter((r) => r !== region)
          : [...prev.filter((r) => r !== "worldwide"), region]
    );

  const missingChoice =
    (step === "profile" && !profileType && "Choisissez votre profil") ||
    (step === "goal" && !learningGoal && "Choisissez votre motivation") ||
    (step === "regions" && regions.length === 0 && "Choisissez au moins une région") ||
    null;

  const next = () => {
    if (missingChoice) return void toast.error(missingChoice);
    setStepIndex((i) => i + 1);
  };

  const back = () => (stepIndex === 0 ? navigate("/") : setStepIndex((i) => i - 1));

  const answers = (): OnboardingAnswers => ({
    profile_type: profileType,
    learning_goal: learningGoal,
    preferred_regions: regions,
    // Eras picked for a region that was unselected afterwards no longer apply.
    preferred_eras: eras.filter((era) => availableEras.includes(era)),
    preferred_difficulty: difficulties,
  });

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    for (const check of [
      usernameSchema.safeParse(username.trim()),
      emailSchema.safeParse(email.trim()),
      passwordSchema.safeParse(password),
    ]) {
      if (!check.success) return void toast.error(check.error.issues[0].message);
    }

    setSaving(true);
    signingUp.current = true;
    const address = email.trim();
    const { error, session } = await signUp(address, password, username.trim());
    if (error) {
      signingUp.current = false;
      setSaving(false);
      return void toast.error(signUpErrorMessage(error.message));
    }

    if (!session) {
      // The account must first be confirmed by e-mail: the answers wait for the first sign-in.
      savePendingOnboarding(address, answers());
      setSaving(false);
      setConfirmationSentTo(address);
      return;
    }

    if (!(await saveOnboardingAnswers(session.user.id, answers()))) {
      // Retried from the home screen.
      savePendingOnboarding(address, answers());
    }
    navigate("/app", { replace: true });
  };

  if (loading || (user && !signingUp.current)) return <div className="h-[100dvh] subtle-gradient" />;

  if (confirmationSentTo) {
    return (
      <main className="flex h-[100dvh] flex-col items-center justify-center gap-6 subtle-gradient px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-10 w-10 text-primary" />
        </div>
        <div className="max-w-sm space-y-2">
          <h1 className="text-3xl font-bold">Vérifiez votre boîte mail</h1>
          <p className="text-muted-foreground">
            Nous avons envoyé un lien à <span className="font-medium text-foreground">{confirmationSentTo}</span>. Ouvrez-le
            pour activer votre compte : vos préférences seront enregistrées à votre première connexion.
          </p>
        </div>
        <Button size="xl" className="w-full max-w-sm rounded-2xl" onClick={() => navigate("/auth")}>
          Se connecter
        </Button>
      </main>
    );
  }

  const { title, hint } = TITLES[step];

  return (
    <div className="flex h-[100dvh] flex-col subtle-gradient">
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <header className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Retour" onClick={back} disabled={saving}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Progress
            value={((stepIndex + 1) / STEPS.length) * 100}
            aria-label={`Étape ${stepIndex + 1} sur ${STEPS.length}`}
            className="h-2 flex-1"
          />
        </header>

        <main key={step} className="min-h-0 flex-1 overflow-y-auto px-1 py-6 motion-safe:animate-fade-in-up">
          <h1 className="text-[1.75rem] font-bold leading-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>

          <div className="mt-6">
            {step === "profile" && (
              <div className="space-y-3">
                {PROFILE_TYPES.map((t) => (
                  <Option key={t.value} label={t.label} description={t.description} selected={profileType === t.value} onClick={() => setProfileType(t.value)} />
                ))}
              </div>
            )}

            {step === "goal" && (
              <div className="space-y-3">
                {LEARNING_GOALS.map((g) => (
                  <Option key={g.value} label={g.label} description={g.description} selected={learningGoal === g.value} onClick={() => setLearningGoal(g.value)} />
                ))}
              </div>
            )}

            {step === "regions" && (
              <div className="grid grid-cols-2 gap-3">
                {REGIONS.map((r) => (
                  <Option key={r.value} compact label={r.label} selected={regions.includes(r.value)} onClick={() => toggleRegion(r.value)} />
                ))}
              </div>
            )}

            {step === "eras" && (
              <div className="grid grid-cols-2 gap-3">
                {availableEras.map((era) => (
                  <Option key={era} compact label={era} selected={eras.includes(era)} onClick={() => toggleIn(setEras, era)} />
                ))}
              </div>
            )}

            {step === "difficulty" && (
              <div className="space-y-3">
                {DIFFICULTIES.map((d) => (
                  <Option
                    key={d.value}
                    label={d.label}
                    description={DIFFICULTY_DESCRIPTIONS[d.value]}
                    selected={difficulties.includes(d.value)}
                    onClick={() => toggleIn(setDifficulties, d.value)}
                  >
                    <DifficultyStars difficulty={d.value} />
                  </Option>
                ))}
              </div>
            )}

            {step === "account" && (
              <form id="signup-form" onSubmit={createAccount} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-username">Pseudo</Label>
                  <Input id="signup-username" autoComplete="nickname" maxLength={30} value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email">E-mail</Label>
                  <Input id="signup-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input id="signup-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Au moins 8 caractères, une majuscule et un chiffre.</p>
                </div>
                <p className="pt-2 text-center text-sm text-muted-foreground">
                  Déjà un compte ?{" "}
                  <Link to="/auth" className="font-semibold text-primary">
                    Se connecter
                  </Link>
                </p>
              </form>
            )}
          </div>
        </main>

        <footer className="pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          {/* Distinct keys: reusing the clicked "Continuer" element as the submit
              button would submit the still-empty form on the same tap. */}
          {step === "account" ? (
            <Button key="submit" type="submit" form="signup-form" size="xl" className="w-full rounded-2xl" disabled={saving}>
              {saving ? "Création du compte…" : "Créer mon compte"}
            </Button>
          ) : (
            <Button key="next" type="button" size="xl" className="w-full rounded-2xl" onClick={next}>
              Continuer
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Onboarding;
