import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Globe, Clock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PreferencesData {
  preferred_regions: string[];
  preferred_eras: string[];
}

interface ProgressData {
  [key: string]: number;
}

const PreferencesDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<PreferencesData>({
    preferred_regions: [],
    preferred_eras: []
  });
  const [regionProgress, setRegionProgress] = useState<ProgressData>({});
  const [eraProgress, setEraProgress] = useState<ProgressData>({});
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

  useEffect(() => {
    const fetchPreferencesAndProgress = async () => {
      if (!user) return;

      try {
        // Fetch user preferences
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('preferred_regions, preferred_eras')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setPreferences({
          preferred_regions: profileData?.preferred_regions || [],
          preferred_eras: profileData?.preferred_eras || []
        });

        // Calculate real progress based on facts learned
        const tempRegionProgress: ProgressData = {};
        const tempEraProgress: ProgressData = {};

        // Calculate progress for each preferred region
        for (const region of (profileData?.preferred_regions || [])) {
          // Count total facts in this region
          const { count: totalCount } = await supabase
            .from('historical_facts')
            .select('*', { count: 'exact', head: true })
            .eq('region', region);

          // Count completed facts in this region
          const { data: completedFacts } = await supabase
            .from('user_progress')
            .select('fact_id')
            .eq('user_id', user.id)
            .eq('completed', true);

          const completedFactIds = completedFacts?.map(f => f.fact_id) || [];

          if (completedFactIds.length > 0) {
            const { count: completedCount } = await supabase
              .from('historical_facts')
              .select('*', { count: 'exact', head: true })
              .eq('region', region)
              .in('id', completedFactIds);

            const progress = totalCount && totalCount > 0 
              ? Math.round((completedCount || 0) / totalCount * 100)
              : 0;
            tempRegionProgress[region] = progress;
          } else {
            tempRegionProgress[region] = 0;
          }
        }

        // Calculate progress for each preferred era
        for (const era of (profileData?.preferred_eras || [])) {
          // Get all periods that match this era
          const { data: periods } = await supabase
            .from('historical_periods')
            .select('id, name')
            .ilike('name', `%${era}%`);

          const periodIds = periods?.map(p => p.id) || [];

          if (periodIds.length > 0) {
            // Count total facts in these periods
            const { count: totalCount } = await supabase
              .from('historical_facts')
              .select('*', { count: 'exact', head: true })
              .in('period_id', periodIds);

            // Count completed facts in these periods
            const { data: completedFacts } = await supabase
              .from('user_progress')
              .select('fact_id')
              .eq('user_id', user.id)
              .eq('completed', true);

            const completedFactIds = completedFacts?.map(f => f.fact_id) || [];

            if (completedFactIds.length > 0) {
              const { count: completedCount } = await supabase
                .from('historical_facts')
                .select('*', { count: 'exact', head: true })
                .in('period_id', periodIds)
                .in('id', completedFactIds);

              const progress = totalCount && totalCount > 0 
                ? Math.round((completedCount || 0) / totalCount * 100)
                : 0;
              tempEraProgress[era] = progress;
            } else {
              tempEraProgress[era] = 0;
            }
          } else {
            tempEraProgress[era] = 0;
          }
        }

        setRegionProgress(tempRegionProgress);
        setEraProgress(tempEraProgress);

      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferencesAndProgress();
  }, [user]);

  if (loading) {
    return (
      <Card className="p-6 card-shadow">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </Card>
    );
  }

  if (preferences.preferred_regions.length === 0 && preferences.preferred_eras.length === 0) {
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
                  <div key={region} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {regionLabels[region] || region}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {regionProgress[region] || 0}%
                      </span>
                    </div>
                    <Progress value={regionProgress[region] || 0} className="h-2" />
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
                  <div key={era} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{era}</span>
                      <span className="text-sm text-muted-foreground">
                        {eraProgress[era] || 0}%
                      </span>
                    </div>
                    <Progress value={eraProgress[era] || 0} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modify Preferences Button */}
        <div className="flex justify-center pt-4 border-t">
          <Button variant="outline" onClick={() => navigate('/onboarding')}>
            <Settings className="w-4 h-4 mr-2" />
            Modifier mes préférences
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PreferencesDashboard;
