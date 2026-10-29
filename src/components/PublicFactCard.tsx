import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { FactImage } from "@/components/FactImage";
import Companion from "@/components/companions/Companion";
import type { PublicFact } from "@/lib/publicFacts";

/** A fact in a list of the public pages; the whole card opens its page. */
export const PublicFactCard = ({ fact }: { fact: PublicFact }) => (
  <article className="relative space-y-2 rounded-2xl bg-card p-3 card-shadow transition-transform hover:-translate-y-0.5">
    {/* The image credit stays a link of its own, above the card's link. */}
    <div className="[&_figcaption]:relative [&_figcaption]:z-10">
      <FactImage
        src={fact.imageUrl}
        alt=""
        credit={fact.imageCredit}
        sourceUrl={fact.imageSourceUrl}
        label={fact.region ?? undefined}
        className="h-36"
      />
    </div>
    <div className="px-1 pb-1">
      {fact.dateText && <p className="text-xs font-semibold uppercase tracking-wide text-primary">{fact.dateText}</p>}
      <h3 className="font-serif text-lg font-bold leading-snug">
        <Link to={`/faits/${fact.slug}`} className="after:absolute after:inset-0 after:rounded-2xl">
          {fact.title}
        </Link>
      </h3>
    </div>
  </article>
);

/** The invitation to sign up, between the public contents. */
export const JoinBanner = () => {
  const { user } = useAuth();
  return (
    <aside className="flex items-center gap-3 overflow-hidden rounded-2xl accent-gradient p-4 text-accent-foreground elegant-shadow">
      <Companion id="napoleon" mood="cheer" animated={false} className="h-24 w-20 shrink-0" title="" />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-serif text-lg font-bold leading-snug">Recevez 5 faits comme ceux-ci chaque jour</p>
        <p className="text-sm opacity-90">Des quiz, une série à tenir et dix figures historiques pour vous accompagner.</p>
        <Button asChild variant="hero" size="sm" className="rounded-full">
          <Link to={user ? "/app" : "/"}>{user ? "Ouvrir l'app" : "Commencer gratuitement"}</Link>
        </Button>
      </div>
    </aside>
  );
};
