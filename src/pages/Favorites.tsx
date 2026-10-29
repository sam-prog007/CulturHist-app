import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Quote } from "lucide-react";
import Companion from "@/components/companions/Companion";
import { useCompanion } from "@/lib/companions";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { FactImage } from "@/components/FactImage";
import { DifficultyStars } from "@/components/DifficultyStars";
import { FavoriteButton } from "@/components/FavoriteButton";
import { QuoteView } from "@/components/QuoteView";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLoader from "@/components/PageLoader";
import { FAVORITES_LIST_KEY, getFavorites } from "@/lib/favorites";

const EmptyState = ({ children }: { children: React.ReactNode }) => {
  const { companion } = useCompanion();
  return (
    <Card className="space-y-2 p-6 text-center card-shadow">
      <Companion id={companion.id} mood="think" className="mx-auto h-24 w-20" />
      <p className="text-sm text-muted-foreground">{children}</p>
    </Card>
  );
};

const FavoritesPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const { data: favorites, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: [FAVORITES_LIST_KEY, user?.id],
    enabled: !!user,
    queryFn: getFavorites,
  });

  if (loading || !user || isLoading || !favorites) {
    return <PageLoader error={isFetching ? null : error} onRetry={() => refetch()} />;
  }

  const facts = favorites.flatMap((f) => (f.historical_facts ? [f.historical_facts] : []));
  const quotes = favorites.flatMap((f) => (f.quotes ? [f.quotes] : []));

  return (
    <div className="min-h-screen subtle-gradient">
      <main className="mx-auto max-w-md space-y-5 px-4 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <header className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Retour au profil" onClick={() => navigate("/profile")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Mes favoris</h1>
        </header>

        <Tabs defaultValue={facts.length || !quotes.length ? "facts" : "quotes"} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="facts" className="gap-1.5">
              <BookOpen className="h-4 w-4" /> Faits ({facts.length})
            </TabsTrigger>
            <TabsTrigger value="quotes" className="gap-1.5">
              <Quote className="h-4 w-4" /> Citations ({quotes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="facts" className="space-y-4">
            {facts.length === 0 ? (
              <EmptyState>Touchez le cœur d'un fait pour le retrouver ici.</EmptyState>
            ) : (
              facts.map((fact) => (
                <Card key={fact.id} className="space-y-4 p-4 card-shadow">
                  <FactImage
                    src={fact.image_url}
                    alt={fact.title_fr || fact.title}
                    credit={fact.image_credit}
                    sourceUrl={fact.image_source_url}
                    label={fact.region_fr ?? undefined}
                    className="h-44"
                  />
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-bold">{fact.title_fr || fact.title}</h2>
                      <div className="flex shrink-0 items-center gap-1">
                        <DifficultyStars difficulty={fact.difficulty} />
                        <FavoriteButton item={{ factId: fact.id }} className="-my-1.5 -mr-1.5" />
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{fact.description_fr || fact.description}</p>
                    {(fact.date_text_fr || fact.date_text) && (
                      <p className="text-sm font-medium text-accent">{fact.date_text_fr || fact.date_text}</p>
                    )}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="quotes" className="space-y-4">
            {quotes.length === 0 ? (
              <EmptyState>Touchez le cœur de la citation du jour pour la garder ici.</EmptyState>
            ) : (
              quotes.map((quote) => (
                <Card key={quote.id} className="flex items-start gap-2 p-5 card-shadow">
                  <div className="min-w-0 flex-1">
                    <QuoteView quote={quote} />
                  </div>
                  <FavoriteButton item={{ quoteId: quote.id }} className="-mr-2 -mt-2" />
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
};

export default FavoritesPage;
