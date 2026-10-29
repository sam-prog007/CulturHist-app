import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import AdSense from "@/components/AdSense";
import PublicPage from "@/components/PublicPage";
import { usePageMeta } from "@/hooks/use-page-meta";
import { JoinBanner, PublicFactCard } from "@/components/PublicFactCard";
import { OnThisDayCard, QuoteCard } from "@/components/DailyCards";
import { factsByPeriod, factsOfTheDay, usePublicFacts } from "@/lib/publicFacts";

const DAILY_COUNT = 6;

/** What anyone can read without an account: today's selection and every fact by era. */
const Discover = () => {
  usePageMeta(
    "Découvrir l'histoire",
    "Ce jour-là dans l'histoire, la citation du jour et des faits historiques illustrés, de l'Antiquité à nos jours."
  );
  const { data: facts, isLoading } = usePublicFacts();
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <PublicPage>
      <div className="space-y-6">
        <header className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground first-letter:uppercase">{today}</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Découvrir l'histoire</h1>
          <p className="text-muted-foreground">Chaque jour, de nouveaux faits à lire librement.</p>
        </header>

        <OnThisDayCard favorites={false} />

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">Les faits du jour</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {isLoading || !facts
              ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)
              : factsOfTheDay(facts, DAILY_COUNT).map((fact) => <PublicFactCard key={fact.slug} fact={fact} />)}
          </div>
        </section>

        <JoinBanner />
        <QuoteCard favorites={false} />
        <AdSense slot="3234567891" format="auto" />

        {facts && facts.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold">Toutes les époques</h2>
            {factsByPeriod(facts).map((period) => (
              <div key={period.name} className="space-y-2 rounded-2xl bg-card p-4 card-shadow">
                <h3 className="font-serif text-lg font-bold text-accent">{period.name}</h3>
                <ul className="divide-y">
                  {period.facts.map((fact) => (
                    <li key={fact.slug}>
                      <Link to={`/faits/${fact.slug}`} className="flex items-baseline justify-between gap-3 py-2 hover:text-primary">
                        <span className="min-w-0 font-medium leading-snug">{fact.title}</span>
                        {fact.dateText && (
                          <span className="max-w-[40%] shrink-0 text-right text-xs text-muted-foreground">{fact.dateText}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
      </div>
    </PublicPage>
  );
};

export default Discover;
