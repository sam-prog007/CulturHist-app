import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AdSense from "@/components/AdSense";
import { FactImage } from "@/components/FactImage";
import PublicPage from "@/components/PublicPage";
import { usePageMeta } from "@/hooks/use-page-meta";
import { JoinBanner, PublicFactCard } from "@/components/PublicFactCard";
import { relatedFacts, usePublicFacts } from "@/lib/publicFacts";
import { factShare } from "@/lib/share";
import { ShareButton } from "@/components/ShareButton";

const shorten = (text: string, max = 155) => (text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`);

/** One fact, readable by anyone at /faits/<slug>, with others of its era. */
const FactPage = () => {
  const { slug } = useParams();
  const { data: facts, isLoading } = usePublicFacts();
  const fact = facts?.find((f) => f.slug === slug);
  // Opening a related fact starts at the top of its page.
  useEffect(() => window.scrollTo(0, 0), [slug]);
  usePageMeta(fact?.title ?? (isLoading ? "Fait historique" : "Fait introuvable"), fact ? shorten(fact.text) : undefined);

  return (
    <PublicPage>
      <Link to="/decouvrir" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        <ChevronLeft className="h-4 w-4" />
        Découvrir
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-60 w-full rounded-2xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : !fact ? (
        <div className="space-y-3 rounded-2xl bg-card p-6 text-center card-shadow">
          <h1 className="text-2xl font-bold">Fait introuvable</h1>
          <p className="text-muted-foreground">Ce fait n'existe pas ou a changé d'adresse.</p>
          <Link to="/decouvrir" className="font-semibold text-primary">
            Voir les faits du jour
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <article className="space-y-4 rounded-2xl bg-card p-4 card-shadow sm:p-6">
            <FactImage
              src={fact.imageUrl}
              alt={fact.title}
              credit={fact.imageCredit}
              sourceUrl={fact.imageSourceUrl}
              label={fact.region ?? undefined}
              className="h-56 sm:h-72"
            />
            <header className="space-y-1">
              <p className="text-sm font-semibold text-accent">
                {[fact.dateText, fact.periodName, fact.region].filter(Boolean).join(" · ")}
              </p>
              <h1 className="text-3xl font-bold leading-tight">{fact.title}</h1>
            </header>
            <p className="text-lg leading-relaxed">{fact.text}</p>
            <ShareButton content={factShare(fact)} label="Partager ce fait" />
            {fact.sourceUrl && (
              <a
                href={fact.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
              >
                <ExternalLink className="h-4 w-4" />
                Source : Wikipédia
              </a>
            )}
          </article>

          <JoinBanner />
          <AdSense slot="3234567892" format="auto" />

          {facts && relatedFacts(facts, fact).length > 0 && (
            <section className="space-y-3">
              <h2 className="text-2xl font-bold">À la même époque</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedFacts(facts, fact).map((related) => (
                  <PublicFactCard key={related.slug} fact={related} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PublicPage>
  );
};

export default FactPage;
