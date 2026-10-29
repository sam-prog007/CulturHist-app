import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  Briefcase,
  Check,
  ChevronLeft,
  GraduationCap,
  Heart,
  Landmark,
  Lightbulb,
  Loader2,
  Newspaper,
  NotebookPen,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DifficultyStars } from "@/components/DifficultyStars";
import CompanionBubble from "@/components/companions/CompanionBubble";
import type { CompanionMood } from "@/components/companions/Companion";
import { companionById } from "@/lib/companions";
import { DIFFICULTIES } from "@/lib/difficulty";
import { enablePush, getPushStatus } from "@/lib/push";

type Step = "profile" | "goal" | "regions" | "eras" | "difficulty" | "reminders";

const NAPOLEON = companionById("napoleon");

/** What Napoléon asks at each step. */
const QUESTIONS: Record<Step, { text: string; mood: CompanionMood }> = {
  profile: { text: "Avant de partir en campagne, dites-moi : qui êtes-vous ?", mood: "wave" },
  goal: { text: "Et qu'est-ce qui vous mène vers l'histoire ?", mood: "think" },
  regions: { text: "Quels territoires voulez-vous conquérir ?", mood: "happy" },
  eras: { text: "Quelles époques vous passionnent ? Choisissez-en autant que vous voulez.", mood: "think" },
  difficulty: { text: "Quel niveau pour vos batailles quotidiennes ?", mood: "happy" },
  reminders: { text: "Un bon général n'oublie jamais ses troupes. Je vous rappelle vos 5 faits chaque jour ?", mood: "cheer" },
};

const PROFILE_TYPES = [
  { value: "student", label: "Étudiant·e", description: "J'étudie l'histoire", icon: GraduationCap },
  { value: "teacher", label: "Enseignant·e", description: "J'enseigne l'histoire", icon: Presentation },
  { value: "curious", label: "Curieux·se", description: "Je veux apprendre", icon: Lightbulb },
  { value: "professional", label: "Professionnel·le", description: "Je travaille dans le domaine", icon: Briefcase },
];

const GOALS = [
  { value: "culture", label: "Culture générale", description: "Enrichir mes connaissances", icon: BookOpen },
  { value: "exam", label: "Préparation d'examen", description: "Examens ou concours", icon: NotebookPen },
  { value: "understanding", label: "Comprendre le monde actuel", description: "Mieux saisir l'actualité", icon: Newspaper },
  { value: "passion", label: "Passion personnelle", description: "L'histoire me passionne", icon: Heart },
  { value: "professional", label: "Raisons professionnelles", description: "Pour mon travail", icon: Landmark },
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

const erasFor = (regions: string[]) =>
  regions.includes("worldwide")
    ? ERAS_BY_REGION.worldwide
    : Array.from(new Set(regions.flatMap((region) => ERAS_BY_REGION[region] ?? [])));

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/** A big tappable answer, as in a native app. */
const Choice = ({
  selected,
  onClick,
  icon: Icon,
  label,
  description,
  extra,
}: {
  selected: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  label: string;
  description?: string;
  extra?: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      "flex w-full items-center gap-3 rounded-2xl border-2 bg-card px-4 py-3.5 text-left transition-colors active:scale-[0.99]",
      selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
    )}
  >
    {Icon && (
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", selected ? "bg-primary text-primary-foreground" : "bg-secondary text-accent")}>
        <Icon className="h-5 w-5" />
      </span>
    )}
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-2 font-semibold">
        {label}
        {extra}
      </span>
      {description && <span className="block text-sm text-muted-foreground">{description}</span>}
    </span>
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
        selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
      )}
    >
      {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  </button>
);

/** A smaller answer for long lists, two per row. */
const Chip = ({ selected, onClick, label }: { selected: boolean; onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      "min-h-12 rounded-2xl border-2 bg-card px-3 py-2.5 text-sm font-semibold leading-tight transition-colors active:scale-[0.98]",
      selected ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"
    )}
  >
    {label}
  </button>
);

/**
 * The questions after sign-up, one full screen each with Napoléon asking,
 * like the first launch of a mobile app. Regions and eras are changed later
 * from the map, difficulty from Settings.
 */
const Onboarding = () => {
  const [askReminders, setAskReminders] = useState(false);
  const steps: Step[] = ["profile", "goal", "regions", "eras", "difficulty", ...(askReminders ? (["reminders"] as const) : [])];

  const [index, setIndex] = useState(0);
  const [profileType, setProfileType] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedEras, setSelectedEras] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const step = steps[index];

  useEffect(() => {
    if (!loading && !user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  // Offer reminders only where the browser can show them and nothing was decided yet.
  useEffect(() => {
    getPushStatus()
      .then((status) => setAskReminders(status === "off"))
      .catch(() => setAskReminders(false));
  }, []);

  const toggleRegion = (region: string) =>
    setSelectedRegions((prev) =>
      region === "worldwide" ? ["worldwide"] : toggle(prev.filter((r) => r !== "worldwide"), region)
    );

  const save = async () => {
    if (!user) return false;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        profile_type: profileType,
        learning_goal: learningGoal,
        preferred_regions: selectedRegions,
        preferred_eras: selectedEras,
        preferred_difficulty: selectedDifficulties,
        onboarding_completed: true,
      })
      .eq("id", user.id);
    setBusy(false);
    if (error) {
      toast.error(`Impossible d'enregistrer vos choix : ${error.message}`);
      return false;
    }
    queryClient.invalidateQueries({ queryKey: ["home-profile"] });
    return true;
  };

  const finish = () => navigate("/app", { replace: true });

  const next = async () => {
    if (step === "difficulty") {
      if (!(await save())) return;
      if (askReminders) return setIndex(index + 1);
      return finish();
    }
    setIndex(index + 1);
  };

  const turnOnReminders = async () => {
    setBusy(true);
    try {
      const status = await enablePush();
      if (status === "on") toast.success("Rappels activés");
    } catch {
      toast.error("Rappels non activés. Vous pourrez réessayer dans les Réglages.");
    }
    setBusy(false);
    finish();
  };


  const canContinue =
    (step === "profile" && !!profileType) ||
    (step === "goal" && !!learningGoal) ||
    (step === "regions" && selectedRegions.length > 0) ||
    step === "eras" ||
    step === "difficulty";

  // Eras and difficulty may stay empty: then everything is shown.
  const skipping =
    (step === "eras" && selectedEras.length === 0) || (step === "difficulty" && selectedDifficulties.length === 0);

  if (loading || !user) return null;

  const question = QUESTIONS[step];
  // Once the answers are saved, there is no going back to them here.
  const showBack = index > 0 && step !== "reminders";

  return (
    <div className="min-h-[100dvh] subtle-gradient">
      <main className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <header className="flex h-12 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className={cn("-ml-2 shrink-0 rounded-full", !showBack && "invisible")}
            onClick={() => setIndex(index - 1)}
            aria-label="Retour"
          >
            <ChevronLeft className="!size-6" />
          </Button>
          <Progress
            value={((index + 1) / steps.length) * 100}
            className="h-3 flex-1 bg-secondary"
            aria-label={`Étape ${index + 1} sur ${steps.length}`}
          />
        </header>

        <section key={step} className="flex-1 space-y-5 pb-6 pt-4 animate-fade-in">
          <CompanionBubble companion={NAPOLEON} mood={question.mood} text={question.text} />

          {step === "profile" && (
            <div className="space-y-3">
              {PROFILE_TYPES.map((type) => (
                <Choice key={type.value} {...type} selected={profileType === type.value} onClick={() => setProfileType(type.value)} />
              ))}
            </div>
          )}

          {step === "goal" && (
            <div className="space-y-3">
              {GOALS.map((goal) => (
                <Choice key={goal.value} {...goal} selected={learningGoal === goal.value} onClick={() => setLearningGoal(goal.value)} />
              ))}
            </div>
          )}

          {step === "regions" && (
            <div className="grid grid-cols-2 gap-3">
              {REGIONS.map((region) => (
                <Chip
                  key={region.value}
                  label={region.label}
                  selected={selectedRegions.includes(region.value)}
                  onClick={() => toggleRegion(region.value)}
                />
              ))}
            </div>
          )}

          {step === "eras" && (
            <div className="grid grid-cols-2 gap-3">
              {erasFor(selectedRegions).map((era) => (
                <Chip key={era} label={era} selected={selectedEras.includes(era)} onClick={() => setSelectedEras((prev) => toggle(prev, era))} />
              ))}
            </div>
          )}

          {step === "difficulty" && (
            <div className="space-y-3">
              {DIFFICULTIES.map((difficulty) => (
                <Choice
                  key={difficulty.value}
                  label={difficulty.label}
                  description={DIFFICULTY_DESCRIPTIONS[difficulty.value]}
                  extra={<DifficultyStars difficulty={difficulty.value} tone="gold" />}
                  selected={selectedDifficulties.includes(difficulty.value)}
                  onClick={() => setSelectedDifficulties((prev) => toggle(prev, difficulty.value))}
                />
              ))}
            </div>
          )}

          {step === "reminders" && (
            <div className="flex flex-col items-center gap-3 pt-6 text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-10 w-10 text-primary" />
              </span>
              <p className="max-w-xs text-sm text-muted-foreground">
                Un petit rappel par jour pour garder votre série. Vous choisirez les heures dans les Réglages.
              </p>
            </div>
          )}
        </section>

        <footer className="sticky bottom-0 -mx-5 space-y-2 bg-gradient-to-t from-background via-background to-transparent px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
          {step === "reminders" ? (
            <>
              <Button variant="hero" size="lg" className="h-12 w-full rounded-xl" disabled={busy} onClick={turnOnReminders}>
                {busy && <Loader2 className="animate-spin" />}
                Activer les rappels
              </Button>
              <Button variant="ghost" size="lg" className="h-12 w-full rounded-xl" disabled={busy} onClick={finish}>
                Plus tard
              </Button>
            </>
          ) : (
            <Button
              variant={skipping ? "outline" : "hero"}
              size="lg"
              className={cn("h-12 w-full rounded-xl", skipping && "bg-card")}
              disabled={!canContinue || busy}
              onClick={next}
            >
              {busy && <Loader2 className="animate-spin" />}
              {skipping
                ? step === "eras" ? "Toutes les époques" : "Tous les niveaux"
                : step === "difficulty" ? "C'est parti !" : "Continuer"}
            </Button>
          )}
        </footer>
      </main>
    </div>
  );
};

export default Onboarding;
