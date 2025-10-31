import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFactImage } from "@/assets/factsImages";
import { OptimizedImage } from "@/components/OptimizedImage";
import AdSense from "@/components/AdSense";

const FactsList = () => {
  const { user, loading, isPremium } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [facts, setFacts] = useState<any[]>([]);
  const [dailyProgress, setDailyProgress] = useState<any>(null);
  const [loadingFacts, setLoadingFacts] = useState(true);
  const [stats, setStats] = useState({
    factsLearned: 0,
    points: 0,
    streak: 0,
    level: 1
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchFacts = async () => {
      if (!user) return;

      try {
        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        // Check daily progress
        let { data: progressData, error: progressError } = await supabase
          .from('daily_facts_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        if (progressError && progressError.code !== 'PGRST116') throw progressError;

        // If no progress for today, create it
        if (!progressData) {
          const { data: newProgress, error: insertError } = await supabase
            .from('daily_facts_progress')
            .insert({
              user_id: user.id,
              date: today,
              facts_validated: 0
            })
            .select()
            .single();

          if (insertError) throw insertError;
          progressData = newProgress;
        }

        setDailyProgress(progressData);

        // If already validated 5 facts today and not premium, redirect to limit page
        if (progressData.facts_validated >= 5 && !isPremium) {
          navigate('/facts-limit');
          return;
        }

        // Fetch user preferences including new tags
        const { data: profileData } = await supabase
          .from('profiles')
          .select('preferred_regions, preferred_eras, preferred_tags')
          .eq('id', user.id)
          .single();

        const preferredRegions = profileData?.preferred_regions || [];
        const preferredEras = profileData?.preferred_eras || [];
        const preferredTags = profileData?.preferred_tags || [];

        // Fetch validated facts
        const { data: validatedFactIds } = await supabase
          .from('user_progress')
          .select('fact_id')
          .eq('user_id', user.id)
          .eq('completed', true);

        const validatedIds = validatedFactIds?.map(v => v.fact_id) || [];

        // Get all facts the user has seen (including previously assigned daily facts)
        const { data: previouslyAssigned } = await supabase
          .from('daily_fact_assignments')
          .select('fact_id')
          .eq('user_id', user.id);

        const allSeenIds = [
          ...validatedIds,
          ...(previouslyAssigned?.map(f => f.fact_id) || [])
        ];

        // Fetch all available facts that haven't been seen
        let query = supabase
          .from('historical_facts')
          .select('*, historical_periods(name)');

        if (allSeenIds.length > 0) {
          query = query.not('id', 'in', `(${allSeenIds.join(',')})`);
        }

        const { data: allFacts, error: factsError } = await query;

        if (factsError) throw factsError;

        // Filter facts by user preferences (flexible: match at least one category)
        const filteredFacts = (allFacts || []).filter((fact) => {
          // If no preferences set, show all facts
          if (preferredRegions.length === 0 && preferredEras.length === 0 && preferredTags.length === 0) {
            return true;
          }

          // Case-insensitive region match
          const matchesRegion = preferredRegions.length === 0 || 
            (fact.region && preferredRegions.some((region: string) => 
              region.toLowerCase() === String(fact.region).toLowerCase()
            ));

          // Era match (case-insensitive, handles empty period names)
          const periodName = (fact.historical_periods?.name || '').toLowerCase();
          const matchesEra = preferredEras.length === 0 ||
            preferredEras.some((era: string) => 
              periodName.includes(era.toLowerCase())
            );

          // Tags match (case-insensitive, substring)
          const factTags = (fact.tags || []).map((t: string) => t.toLowerCase());
          const matchesTags = preferredTags.length === 0 ||
            preferredTags.some((tag: string) => 
              factTags.some((ft: string) => ft.includes(tag.toLowerCase()))
            );

          // Match if at least one category fits
          return matchesRegion || matchesEra || matchesTags;
        });

        // Sort filtered facts by preference match strength (case-insensitive)
        const sortedFacts = filteredFacts.sort((a, b) => {
          const aMatchesRegion = a.region && preferredRegions.some((r: string) => r.toLowerCase() === String(a.region).toLowerCase());
          const bMatchesRegion = b.region && preferredRegions.some((r: string) => r.toLowerCase() === String(b.region).toLowerCase());
          
          const aPeriodName = (a.historical_periods?.name || '').toLowerCase();
          const bPeriodName = (b.historical_periods?.name || '').toLowerCase();
          
          const aMatchesEra = preferredEras.some((era: string) => aPeriodName.includes(era.toLowerCase()));
          const bMatchesEra = preferredEras.some((era: string) => bPeriodName.includes(era.toLowerCase()));

          const aFactTags = (a.tags || []).map((t: string) => t.toLowerCase());
          const bFactTags = (b.tags || []).map((t: string) => t.toLowerCase());
          const aMatchesTags = preferredTags.some((tag: string) => aFactTags.some((ft: string) => ft.includes(tag.toLowerCase())));
          const bMatchesTags = preferredTags.some((tag: string) => bFactTags.some((ft: string) => ft.includes(tag.toLowerCase())));

          // Calculate match score (higher is better)
          const aScore = (aMatchesRegion ? 3 : 0) + (aMatchesEra ? 2 : 0) + (aMatchesTags ? 1 : 0);
          const bScore = (bMatchesRegion ? 3 : 0) + (bMatchesEra ? 2 : 0) + (bMatchesTags ? 1 : 0);
          
          return bScore - aScore;
        });

        // Take top 5 facts
        setFacts(sortedFacts.slice(0, 5));

        // Fetch user stats
        const { data: statsData } = await supabase
          .from('profiles')
          .select('points, current_streak, exp')
          .eq('id', user.id)
          .single();

        const { count } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true);

        const level = Math.floor(Math.sqrt((statsData?.exp || 0) / 100)) + 1;

        setStats({
          factsLearned: count || 0,
          points: statsData?.points || 0,
          streak: statsData?.current_streak || 0,
          level
        });
      } catch (error) {
        console.error('Error fetching facts:', error);
      } finally {
        setLoadingFacts(false);
      }
    };

    fetchFacts();
  }, [user, navigate, toast, isPremium]);

  const handleValidateFact = async (fact: any) => {
    if (!user || !dailyProgress) return;

    try {
      // Check if already validated
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('fact_id', fact.id)
        .eq('completed', true)
        .maybeSingle();

      if (existingProgress) {
        toast({
          title: "Déjà validé",
          description: "Vous avez déjà validé ce fait !",
          variant: "destructive"
        });
        return;
      }

      // Insert progress
      await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          fact_id: fact.id,
          completed: true,
          completed_at: new Date().toISOString()
        });

      // Get current profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('points, current_streak, last_activity_date, exp')
        .eq('id', user.id)
        .single();

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = profile?.last_activity_date;
      
      // Calculate new streak
      let newStreak = profile?.current_streak || 0;
      if (!lastActivity) {
        newStreak = 1;
      } else {
        const daysDiff = Math.floor(
          (new Date(today).getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff === 1) {
          newStreak += 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        }
      }

      // Calculate new points and exp
      const newPoints = (profile?.points || 0) + fact.points_reward;
      const factsLearned = stats.factsLearned + 1;
      const newExp = (newPoints * 2) + (newStreak * 10) + (factsLearned * 5);

      // Update profile
      await supabase
        .from('profiles')
        .update({
          points: newPoints,
          current_streak: newStreak,
          last_activity_date: today,
          exp: newExp
        })
        .eq('id', user.id);

      // Update daily progress
      const newFactsValidated = dailyProgress.facts_validated + 1;
      await supabase
        .from('daily_facts_progress')
        .update({ facts_validated: newFactsValidated })
        .eq('id', dailyProgress.id);

      // Update local state
      setDailyProgress({ ...dailyProgress, facts_validated: newFactsValidated });
      setFacts(facts.filter(f => f.id !== fact.id));

      const newLevel = Math.floor(Math.sqrt(newExp / 100)) + 1;
      setStats({
        factsLearned,
        points: newPoints,
        streak: newStreak,
        level: newLevel
      });

      toast({
        title: "Fait validé !",
        description: `+${fact.points_reward} points${isPremium ? '' : ` • ${5 - newFactsValidated} faits restants aujourd'hui`}`,
      });

      // If reached daily limit and not premium
      if (newFactsValidated >= 5 && !isPremium) {
        toast({
          title: "Limite atteinte !",
          description: "Vous avez validé vos 5 faits du jour. À demain !",
        });
        setTimeout(() => navigate('/facts-limit'), 2000);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading || loadingFacts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-20 md:py-24">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/app')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">Explorer les faits</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {isPremium ? (
                "Accès illimité aux faits historiques ✨"
              ) : (
                dailyProgress && `${dailyProgress.facts_validated}/5 faits validés aujourd'hui`
              )}
            </p>
          </div>

          {/* Ad Space */}
          <AdSense slot="3234567890" format="auto" />

          {facts.length === 0 ? (
            <Card className="p-6 md:p-8 text-center">
              <p className="text-base md:text-lg text-muted-foreground">
                Aucun fait disponible correspondant à vos préférences. Essayez d'ajuster vos préférences dans les paramètres.
              </p>
            </Card>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {facts.map((fact) => {
                const imageUrl = getFactImage(fact.image_url) || fact.image_url;
                return (
                  <Card key={fact.id} className="p-4 md:p-6 space-y-4">
                    {imageUrl && (
                      <div className="w-full rounded-lg overflow-hidden">
                        <OptimizedImage
                          src={imageUrl} 
                          alt={fact.title}
                          className="w-full h-48 md:h-64 object-cover"
                        />
                      </div>
                    )}
                  
                    <div className="space-y-2">
                      <h3 className="text-lg md:text-xl font-bold">{fact.title_fr || fact.title}</h3>
                      <p className="text-sm md:text-base text-muted-foreground">{fact.description_fr || fact.description}</p>
                      {(fact.date_text_fr || fact.date_text) && (
                        <p className="text-sm font-medium text-accent">
                          📅 {fact.date_text_fr || fact.date_text}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={() => handleValidateFact(fact)}
                      className="w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Valider (+{fact.points_reward} pts)
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default FactsList;