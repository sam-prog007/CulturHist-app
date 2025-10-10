import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft, Sparkles, Globe, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-history.jpg";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [profileType, setProfileType] = useState("");
  const [learningGoal, setLearningGoal] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedEras, setSelectedEras] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const handleComplete = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        profile_type: profileType,
        learning_goal: learningGoal,
        preferred_regions: selectedRegions,
        preferred_eras: selectedEras,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos préférences",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Bienvenue !",
      description: "Votre profil a été configuré avec succès",
    });

    navigate("/app");
  };

  const nextStep = () => {
    if (step === 1 && !profileType) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner votre profil",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !learningGoal) {
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
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Fond historique"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 z-10 relative">
        <div className="max-w-2xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent-foreground">
                Configuration de votre profil
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Personnalisez votre expérience
            </h1>
            <p className="text-muted-foreground">
              Étape {step} sur 4
            </p>
          </div>

          {/* Form Card */}
          <Card className="p-6 md:p-8 card-shadow">
            {/* Step 1: Profile Type */}
            {step === 1 && (
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

            {/* Step 2: Learning Goal */}
            {step === 2 && (
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

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              {step < 4 ? (
                <Button onClick={nextStep}>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleComplete}>
                  Terminer
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
