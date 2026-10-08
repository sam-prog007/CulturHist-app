import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft, Sparkles, Globe, Clock } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DifficultyStars } from "@/components/DifficultyStars";
import { DIFFICULTIES } from "@/lib/difficulty";
import { clearPendingOnboarding, savePendingOnboarding } from "@/lib/pendingOnboarding";

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  
  const [step, setStep] = useState(isEditMode ? 3 : 1);
  const [profileType, setProfileType] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedEras, setSelectedEras] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const profileTypes = [
    { value: "student", label: "Étudiant·e", description: "J'étudie l'histoire" },
    { value: "teacher", label: "Enseignant·e", description: "J'enseigne l'histoire" },
    { value: "curious", label: "Curieux·se", description: "Je veux apprendre" },
    { value: "professional", label: "Professionnel·le", description: "Je travaille dans le domaine" },
  ];

  const regions = [
    { value: "worldwide", label: "Monde entier", icon: Globe },
    { value: "europe", label: "Europe" },
    { value: "asia", label: "Asie" },
    { value: "africa", label: "Afrique" },
    { value: "americas", label: "Amériques" },
    { value: "oceania", label: "Océanie" },
    { value: "middle-east", label: "Moyen-Orient" },
  ];

  const erasByRegion: Record<string, string[]> = {
    worldwide: ["Préhistoire", "Antiquité", "Moyen Âge", "Renaissance", "Époque moderne", "Époque contemporaine"],
    europe: ["Antiquité grecque et romaine", "Moyen Âge médiéval", "Renaissance", "Révolutions", "Guerres mondiales", "Union européenne"],
    asia: ["Dynasties chinoises", "Empire mongol", "Période Edo", "Colonialisme", "Indépendances", "Asie moderne"],
    africa: ["Égypte ancienne", "Royaumes africains", "Colonisation", "Indépendances", "Afrique contemporaine"],
    americas: ["Civilisations précolombiennes", "Colonisation", "Indépendances", "Révolutions", "XXe siècle", "Amériques modernes"],
    oceania: ["Peuples autochtones", "Exploration", "Colonisation", "Indépendances", "Océanie moderne"],
    "middle-east": ["Mésopotamie ancienne", "Empires perses", "Califats islamiques", "Empire ottoman", "Décolonisation", "Moyen-Orient moderne"],
  };

  const getErasForSelectedRegions = () => {
    if (selectedRegions.includes("worldwide")) {
      return erasByRegion.worldwide;
    }
    const eras = new Set<string>();
    selectedRegions.forEach(region => {
      erasByRegion[region]?.forEach(era => eras.add(era));
    });
    return Array.from(eras);
  };

  const toggleRegion = (region: string) => {
    if (region === "worldwide") {
      setSelectedRegions(["worldwide"]);
    } else {
      const newRegions = selectedRegions.includes(region)
        ? selectedRegions.filter(r => r !== region)
        : [...selectedRegions.filter(r => r !== "worldwide"), region];
      setSelectedRegions(newRegions);
    }
  };

  const toggleEra = (era: string) => {
    setSelectedEras(prev =>
      prev.includes(era) ? prev.filter(e => e !== era) : [...prev, era]
    );
  };

  const toggleDifficulty = (difficulty: string) => {
    setSelectedDifficulties(prev =>
      prev.includes(difficulty) ? prev.filter(d => d !== difficulty) : [...prev, difficulty]
    );
  };

  const difficultyDescriptions: Record<string, string> = {
    easy: "Faits accessibles et simples",
    medium: "Faits avec détails modérés",
    hard: "Faits complexes et détaillés",
  };
  const difficulties = DIFFICULTIES.map((d) => ({ ...d, description: difficultyDescriptions[d.value] }));

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user || !isEditMode) return;

      const { data } = await supabase
        .from('profiles')
        .select('preferred_regions, preferred_eras, preferred_difficulty')
        .eq('id', user.id)
        .single();

      if (data) {
        setSelectedRegions(data.preferred_regions || []);
        setSelectedEras(data.preferred_eras || []);
        setSelectedDifficulties(data.preferred_difficulty || []);
      }
    };

    fetchUserPreferences();
  }, [user, isEditMode]);

  const handleComplete = async () => {
    if (loading || saving) return;

    const preferences = {
      preferred_regions: selectedRegions,
      preferred_eras: selectedEras,
      preferred_difficulty: selectedDifficulties,
    };
    const answers = { profile_type: profileType, learning_goal: learningGoal, ...preferences };

    // Just signed up: the account waits for e-mail confirmation, so there is
    // no session yet. Keep the answers here; they are saved after sign-in.
    if (!user) {
      savePendingOnboarding(answers);
      toast({
        title: "Plus qu'une étape !",
        description: "Confirmez votre e-mail avec le lien reçu, puis connectez-vous : vos choix seront enregistrés automatiquement.",
      });
      navigate("/auth");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(isEditMode ? preferences : { ...answers, onboarding_completed: true })
      .eq("id", user.id);
    setSaving(false);

    if (error) {
      toast({
        title: "Erreur",
        description: `Impossible de sauvegarder vos préférences : ${error.message}`,
        variant: "destructive",
      });
      return;
    }

    clearPendingOnboarding();
    queryClient.invalidateQueries({ queryKey: ["home-profile"] });
    toast({
      title: isEditMode ? "Préférences mises à jour" : "Bienvenue !",
      description: isEditMode 
        ? "Vos préférences ont été modifiées avec succès"
        : "Votre profil a été configuré avec succès",
    });

    navigate("/app");
  };

  const nextStep = () => {
    if (step === 1 && !profileType && !isEditMode) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner votre profil",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !learningGoal && !isEditMode) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner vos motivations",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && selectedRegions.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins une région",
        variant: "destructive",
      });
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <section className="relative min-h-screen flex items-center justify-center subtle-gradient overflow-hidden">
      {/* Content */}
      <div className="container mx-auto px-4 py-16 z-10 relative">
        <div className="max-w-2xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">
                Configuration de votre profil
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {isEditMode ? "Modifiez vos préférences" : "Personnalisez votre expérience"}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Modifiez vos régions, périodes et niveau de difficulté" : `Étape ${step} sur 5`}
            </p>
          </div>

          {/* Form Card */}
          <Card className="p-6 md:p-8 card-shadow">
            {/* Step 1: Profile Type - Hidden in edit mode */}
            {!isEditMode && step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Qui êtes-vous ?</h2>
                  <p className="text-sm text-muted-foreground">
                    Cela nous aide à personnaliser votre expérience
                  </p>
                </div>
                <RadioGroup value={profileType} onValueChange={setProfileType}>
                  <div className="space-y-3">
                    {profileTypes.map((type) => (
                      <Label
                        key={type.value}
                        htmlFor={type.value}
                        className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 smooth-transition"
                      >
                        <RadioGroupItem value={type.value} id={type.value} />
                        <div className="flex-1">
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {type.description}
                          </div>
                        </div>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Learning Goal - Hidden in edit mode */}
            {!isEditMode && step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Pourquoi souhaitez-vous apprendre l'histoire ?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez vos motivations principales
                  </p>
                </div>
                <RadioGroup value={learningGoal} onValueChange={setLearningGoal}>
                  <div className="space-y-3">
                    <Label
                      htmlFor="culture"
                      className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 smooth-transition"
                    >
                      <RadioGroupItem value="culture" id="culture" />
                      <div className="flex-1">
                        <div className="font-medium">Culture générale</div>
                        <div className="text-sm text-muted-foreground">
                          Enrichir mes connaissances et ma culture personnelle
                        </div>
                      </div>
                    </Label>
                    <Label
                      htmlFor="exam"
                      className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 smooth-transition"
                    >
                      <RadioGroupItem value="exam" id="exam" />
                      <div className="flex-1">
                        <div className="font-medium">Préparation d'examen</div>
                        <div className="text-sm text-muted-foreground">
                          Me préparer pour des examens ou concours
                        </div>
                      </div>
                    </Label>
                    <Label
                      htmlFor="understanding"
                      className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 smooth-transition"
                    >
                      <RadioGroupItem value="understanding" id="understanding" />
                      <div className="flex-1">
                        <div className="font-medium">Comprendre le monde actuel</div>
                        <div className="text-sm text-muted-foreground">
                          Mieux comprendre les enjeux contemporains
                        </div>
                      </div>
                    </Label>
                    <Label
                      htmlFor="passion"
                      className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 smooth-transition"
                    >
                      <RadioGroupItem value="passion" id="passion" />
                      <div className="flex-1">
                        <div className="font-medium">Passion personnelle</div>
                        <div className="text-sm text-muted-foreground">
                          L'histoire me passionne profondément
                        </div>
                      </div>
                    </Label>
                    <Label
                      htmlFor="professional"
                      className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-secondary/50 smooth-transition"
                    >
                      <RadioGroupItem value="professional" id="professional" />
                      <div className="flex-1">
                        <div className="font-medium">Raisons professionnelles</div>
                        <div className="text-sm text-muted-foreground">
                          Pour mon travail ou mes études
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 3: Regions */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Quelles régions vous intéressent ?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez une ou plusieurs régions
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {regions.map((region) => (
                    <Button
                      key={region.value}
                      variant={selectedRegions.includes(region.value) ? "default" : "outline"}
                      className="justify-start h-auto py-3"
                      onClick={() => toggleRegion(region.value)}
                    >
                      {region.icon && <region.icon className="w-4 h-4 mr-2" />}
                      {region.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Eras */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Quelles périodes vous passionnent ?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Basé sur vos régions sélectionnées
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {getErasForSelectedRegions().map((era) => (
                    <Button
                      key={era}
                      variant={selectedEras.includes(era) ? "default" : "outline"}
                      className="justify-start h-auto py-3"
                      onClick={() => toggleEra(era)}
                    >
                      {era}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Difficulty */}
            {step === 5 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Quel niveau de difficulté préférez-vous ?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choisissez un ou plusieurs niveaux
                  </p>
                </div>
                <div className="space-y-3">
                  {difficulties.map((difficulty) => {
                    const selected = selectedDifficulties.includes(difficulty.value);
                    return (
                      <Button
                        key={difficulty.value}
                        variant={selected ? "default" : "outline"}
                        className="w-full justify-start h-auto py-4"
                        onClick={() => toggleDifficulty(difficulty.value)}
                      >
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2 font-medium">
                            {difficulty.label}
                            <DifficultyStars difficulty={difficulty.value} tone={selected ? "current" : "gold"} />
                          </div>
                          <div className={`text-sm ${selected ? "opacity-80" : "text-muted-foreground"}`}>
                            {difficulty.description}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {!isEditMode && (
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>
              )}
              {isEditMode && step === 3 && (
                <Button variant="outline" onClick={() => navigate('/app')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              )}
              {step < 5 ? (
                <Button onClick={nextStep}>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading || saving}>
                  {saving ? "Enregistrement…" : "Terminer"}
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Onboarding;
