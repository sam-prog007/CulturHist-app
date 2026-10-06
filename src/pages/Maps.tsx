import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Globe2, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import WorldMap, { type MapCountry } from "@/components/WorldMap";
import EraTimeline from "@/components/EraTimeline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { REGION_LABELS } from "@/lib/dailyFacts";
import { COUNTRY_REGIONS } from "@/lib/countryRegions";
import { getLearningProgress, savePreferences, type Era, type LearningProgress } from "@/lib/progress";

/** Era preferences may hold onboarding labels ("Antiquité grecque et romaine"): match both ways, like the server. */
const matchesEra = (pref: string, era: Era) =>
  pref.toLowerCase().includes(era.name.toLowerCase()) || era.name.toLowerCase().includes(pref.toLowerCase());

const MapsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [country, setCountry] = useState<MapCountry | null>(null);
  const queryKey = ["learning-progress", user?.id];

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const { data } = useQuery({ queryKey, enabled: !!user, queryFn: () => getLearningProgress(user!.id) });

  const save = async (prefs: { regions?: string[]; eras?: string[] }) => {
    const previous = queryClient.getQueryData<LearningProgress>(queryKey);
    queryClient.setQueryData<LearningProgress>(queryKey, (old) =>
      old && {
        ...old,
        ...(prefs.regions && { preferredRegions: prefs.regions }),
        ...(prefs.eras && { preferredEras: prefs.eras }),
      }
    );
    try {
      await savePreferences(user!.id, prefs);
    } catch {
      queryClient.setQueryData(queryKey, previous);
      toast({ title: "Erreur", description: "Vos préférences n'ont pas pu être enregistrées.", variant: "destructive" });
    }
  };

  if (loading || !user || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const toggleRegion = (region: string) => {
    const regions = data.preferredRegions.includes(region)
      ? data.preferredRegions.filter((r) => r !== region)
      : [...data.preferredRegions, region];
    save({ regions });
  };

  const eraSelected = (era: Era) => data.preferredEras.some((p) => matchesEra(p, era));
  const toggleEra = (era: Era) => {
    const eras = eraSelected(era)
      ? data.preferredEras.filter((p) => !matchesEra(p, era))
      : [...data.preferredEras, era.name];
    save({ eras });
  };

  const discovered = Object.keys(data.byCountry).filter((c) => COUNTRY_REGIONS[c]).length;
  const totalCountries = Object.keys(COUNTRY_REGIONS).length;
  const noRegion = data.preferredRegions.length === 0;
  const noEra = data.preferredEras.length === 0;

  return (
    <div className="min-h-screen subtle-gradient">
      <main className="mx-auto max-w-md space-y-5 px-4 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold">Cartes</h1>
          <p className="text-muted-foreground">Choisissez où et quand voyager. Vos faits du jour suivront dès demain.</p>
        </header>

        <Tabs defaultValue="map" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map" className="gap-1.5"><Globe2 className="h-4 w-4" /> Carte du monde</TabsTrigger>
            <TabsTrigger value="timeline" className="gap-1.5"><Clock className="h-4 w-4" /> Frise</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <Card className="space-y-3 overflow-hidden p-3 card-shadow">
              <WorldMap
                learnedByCountry={data.byCountry}
                selectedRegions={data.preferredRegions}
                selectedCountry={country?.code ?? null}
                onSelectCountry={setCountry}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-gold" /> Découvert
                  <span className="ml-2 h-3 w-3 rounded-sm bg-primary/25" /> Région choisie
                </span>
                <span className="font-semibold text-foreground">{discovered}/{totalCountries} pays découverts</span>
              </div>
            </Card>

            {country && (
              <Card className="space-y-3 p-4 card-shadow animate-fade-in">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-bold">{country.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {REGION_LABELS[country.region]} · {data.byCountry[country.code] ?? 0}{" "}
                      {(data.byCountry[country.code] ?? 0) > 1 ? "faits découverts" : "fait découvert"}
                    </p>
                  </div>
                </div>
                <Button
                  variant={data.preferredRegions.includes(country.region) ? "outline" : "default"}
                  className="w-full"
                  onClick={() => toggleRegion(country.region)}
                >
                  {data.preferredRegions.includes(country.region)
                    ? `Retirer ${REGION_LABELS[country.region]} de mes régions`
                    : `Ajouter ${REGION_LABELS[country.region]} à mes régions`}
                </Button>
              </Card>
            )}

            <Card className="space-y-3 p-4 card-shadow">
              <h2 className="font-semibold">Mes régions</h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(REGION_LABELS).map(([value, label]) => {
                  const active = data.preferredRegions.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleRegion(value)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium smooth-transition",
                        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      {active && <Check className="h-3.5 w-3.5" />}
                      {label}
                    </button>
                  );
                })}
              </div>
              {noRegion && <p className="text-xs text-muted-foreground">Aucune région choisie : vos faits viennent du monde entier.</p>}
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Touchez une époque pour la choisir.{noEra && " Aucune époque choisie : toutes sont possibles."}
            </p>
            <EraTimeline eras={data.eras} isSelected={eraSelected} onToggle={toggleEra} />
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
};

export default MapsPage;
