import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Clock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PreferencesData {
  preferred_regions: string[];
  preferred_eras: string[];
  preferred_difficulty: string[];
  preferred_tags: string[];
}

interface ProgressData {
  [key: string]: number;
}

const PreferencesDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<PreferencesData>({
    preferred_regions: [],
    preferred_eras: [],
    preferred_difficulty: [],
    preferred_tags: []
  });
  const [regionProgress, setRegionProgress] = useState<ProgressData>({});
  const [eraProgress, setEraProgress] = useState<ProgressData>({});
  const [tagProgress, setTagProgress] = useState<ProgressData>({});
  const [loading, setLoading] = useState(true);

  const regionLabels: Record<string, string> = {
    worldwide: "Monde entier",
    europe: "Europe",
    asia: "Asie",
    africa: "Afrique",
    americas: "Amériques",
    oceania: "Océanie",
    "middle-east": "Moyen-Orient"
  };

  const difficultyLabels: Record<string, string> = {
    easy: "Facile",
    medium: "Moyen",
    hard: "Difficile"
  };

  useEffect(() => {
    const fetchPreferencesAndProgress = async () => {
      if (!user) return;

      try {
        // Fetch user preferences
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('preferred_regions, preferred_eras, preferred_difficulty, preferred_tags')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setPreferences({
          preferred_regions: profileData?.preferred_regions || [],
          preferred_eras: profileData?.preferred_eras || [],
          preferred_difficulty: profileData?.preferred_difficulty || [],
          preferred_tags: profileData?.preferred_tags || []
        });

        // Calculate real progress based on facts learned
        const tempRegionProgress: ProgressData = {};
        const tempEraProgress: ProgressData = {};
        const tempTagProgress: ProgressData = {};

        // Get all completed fact IDs once
        const { data: completedFacts } = await supabase
          .from('user_progress')
          .select('fact_id')
          .eq('user_id', user.id)
          .eq('completed', true);

        const completedFactIds = completedFacts?.map(f => f.fact_id) || [];

        // Calculate learned count for each preferred region
        for (const region of (profileData?.preferred_regions || [])) {
          const { data: allRegionFacts } = await supabase
            .from('historical_facts')
            .select('id')
            .eq('region', region);

          const completedCount = allRegionFacts?.filter(fact =>
            completedFactIds.includes(fact.id)
          ).length || 0;

          tempRegionProgress[region] = completedCount;
        }

        // Calculate learned count for each preferred era
        for (const era of (profileData?.preferred_eras || [])) {
          const { data: periods } = await supabase
            .from('historical_periods')
            .select('id, name')
            .ilike('name', `%${era}%`);

          const periodIds = periods?.map(p => p.id) || [];

          if (periodIds.length > 0) {
            const { data: allEraFacts } = await supabase
              .from('historical_facts')
              .select('id')
              .in('period_id', periodIds);

            const completedCount = allEraFacts?.filter(fact =>
              completedFactIds.includes(fact.id)
            ).length || 0;

            tempEraProgress[era] = completedCount;
          } else {
            tempEraProgress[era] = 0;
          }
        }

        // Calculate learned count for each preferred tag
        for (const tag of (profileData?.preferred_tags || [])) {
          const { data: allTagFacts } = await supabase
            .from('historical_facts')
            .select('id, tags')
            .contains('tags', [tag]);

          const completedCount = allTagFacts?.filter(fact =>
            completedFactIds.includes(fact.id)
          ).length || 0;

          tempTagProgress[tag] = completedCount;
        }

        setRegionProgress(tempRegionProgress);
        setEraProgress(tempEraProgress);
        setTagProgress(tempTagProgress);

      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferencesAndProgress();
  }, [user]);
  
  const levelFromCount = (count: number) => {
    if (count < 10) return 'Débutant';
    if (count <= 25) return 'Intermédiaire';
    return 'Expert';
  };
  
  if (loading) {
    return (
      <Card className="p-6 card-shadow">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </Card>
    );
  }

  if (preferences.preferred_regions.length === 0 && preferences.preferred_eras.length === 0 && preferences.preferred_difficulty.length === 0 && preferences.preferred_tags.length === 0) {
    return (
      <Card className="p-6 card-shadow">
        <div className="text-center py-8 space-y-4">
          <p className="text-muted-foreground">
            Vous n'avez pas encore configuré vos préférences d'apprentissage.
          </p>
          <Button onClick={() => navigate('/onboarding')}>
            <Settings className="w-4 h-4 mr-2" />
            Configurer mes préférences
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8 card-shadow">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Vos Préférences d'Apprentissage
          </h2>
          <p className="text-muted-foreground">
            Suivez votre progression par région et par période
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Geographic Preferences */}
          {preferences.preferred_regions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Globe className="w-5 h-5 text-primary" />
                <h3>Régions géographiques</h3>
              </div>
              <div className="space-y-4">
                {preferences.preferred_regions.map((region) => (
                  <div key={region} className="py-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {regionLabels[region] || region}
                      </span>
                      <Badge variant="secondary">
                        {levelFromCount(regionProgress[region] || 0)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chronological Preferences */}
          {preferences.preferred_eras.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="w-5 h-5 text-accent" />
                <h3>Périodes chronologiques</h3>
              </div>
              <div className="space-y-4">
                {preferences.preferred_eras.map((era) => (
                  <div key={era} className="py-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{era}</span>
                      <Badge variant="secondary">
                        {levelFromCount(eraProgress[era] || 0)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags Preferences */}
        {preferences.preferred_tags.length > 0 && (
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Settings className="w-5 h-5 text-secondary" />
              <h3>Thématiques</h3>
            </div>
            <div className="space-y-4">
              {preferences.preferred_tags.map((tag) => (
                <div key={tag} className="py-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{tag}</span>
                    <Badge variant="secondary">
                      {levelFromCount(tagProgress[tag] || 0)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Preferences */}
        {preferences.preferred_difficulty.length > 0 && (
          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Settings className="w-5 h-5 text-primary" />
              <h3>Niveaux de difficulté</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferences.preferred_difficulty.map((difficulty) => (
                <div
                  key={difficulty}
                  className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium"
                >
                  {difficultyLabels[difficulty] || difficulty}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modify Preferences Button */}
        <div className="flex justify-center pt-4 border-t">
          <Button variant="outline" onClick={() => navigate('/onboarding?edit=true')}>
            <Settings className="w-4 h-4 mr-2" />
            Modifier mes préférences
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PreferencesDashboard;
