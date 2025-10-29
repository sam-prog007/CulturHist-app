import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getFactImage } from "@/assets/factsImages";
import { OptimizedImage } from "@/components/OptimizedImage";

const LearnedFacts = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [learnedFacts, setLearnedFacts] = useState<any[]>([]);
  const [loadingFacts, setLoadingFacts] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchLearnedFacts = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select(`
            completed_at,
            historical_facts (
              id,
              title,
              title_fr,
              description,
              description_fr,
              date_text,
              date_text_fr,
              region,
              region_fr,
              image_url,
              points_reward,
              tags,
              tags_fr
            )
          `)
          .eq('user_id', user.id)
          .eq('completed', true)
          .order('completed_at', { ascending: false });

        if (error) throw error;

        const facts = data?.map(item => ({
          ...item.historical_facts,
          completed_at: item.completed_at
        })) || [];

        setLearnedFacts(facts);
      } catch (error) {
        console.error('Error fetching learned facts:', error);
      } finally {
        setLoadingFacts(false);
      }
    };

    fetchLearnedFacts();
  }, [user]);

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
            onClick={() => navigate('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">Faits appris</h1>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              {learnedFacts.length} fait{learnedFacts.length > 1 ? 's' : ''} historique{learnedFacts.length > 1 ? 's' : ''} découvert{learnedFacts.length > 1 ? 's' : ''}
            </p>
          </div>

          {learnedFacts.length === 0 ? (
            <Card className="p-6 md:p-8 text-center space-y-4">
              <p className="text-base md:text-lg text-muted-foreground">
                Vous n'avez pas encore appris de faits historiques.
              </p>
              <Button onClick={() => navigate('/facts')}>
                Découvrir des faits
              </Button>
            </Card>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {learnedFacts.map((fact) => {
              const imageUrl = getFactImage(fact.image_url) || fact.image_url;
                return (
                  <Card key={fact.id} className="p-4 md:p-6 space-y-4">
                    {imageUrl && (
                      <div className="w-full rounded-lg overflow-hidden">
                        <OptimizedImage
                          src={imageUrl} 
                          alt={fact.title_fr || fact.title}
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
                      {(fact.region_fr || fact.region) && (
                        <p className="text-sm text-muted-foreground">
                          🌍 {fact.region_fr || fact.region}
                        </p>
                      )}
                      {((fact.tags_fr && fact.tags_fr.length > 0) || (fact.tags && fact.tags.length > 0)) && (
                        <div className="flex flex-wrap gap-2">
                          {(fact.tags_fr || fact.tags).map((tag: string) => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {fact.completed_at && (
                        <p className="text-xs text-muted-foreground">
                          Appris le {new Date(fact.completed_at).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
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

export default LearnedFacts;
