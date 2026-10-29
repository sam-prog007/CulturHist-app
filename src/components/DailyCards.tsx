import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FactImage } from "@/components/FactImage";
import { FavoriteButton } from "@/components/FavoriteButton";
import { QuoteView } from "@/components/QuoteView";
import { formatYear } from "@/lib/dates";
import { getOnThisDay } from "@/lib/onThisDay";
import { getQuoteOfTheDay } from "@/lib/quoteOfTheDay";

/** An event that happened on today's date. The heart needs an account. */
export const OnThisDayCard = ({ favorites = true }: { favorites?: boolean }) => {
  const { data: event, isLoading } = useQuery({
    queryKey: ["on-this-day", new Date().toDateString()],
    queryFn: () => getOnThisDay(),
    staleTime: 6 * 60 * 60 * 1000,
  });
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  return (
    <Card className="space-y-4 p-5 card-shadow animate-fade-in-up">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Ce jour-là</h2>
        <span className="ml-auto text-sm text-muted-foreground">{date}</span>
        {favorites && event?.factId && <FavoriteButton item={{ factId: event.factId }} className="-my-2 -mr-1" />}
      </div>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ) : event ? (
        <>
          {event.imageUrl && (
            <FactImage src={event.imageUrl} alt="" credit={event.credit} sourceUrl={event.sourceUrl} className="h-44" />
          )}
          <div className="space-y-1">
            <p className="font-serif text-2xl font-bold text-primary">{formatYear(event.year)}</p>
            <p className="leading-relaxed">{event.text}</p>
            {!event.imageUrl && event.sourceUrl && (
              <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground underline-offset-2 hover:underline">
                {event.credit}
              </a>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Aucun événement disponible pour aujourd'hui.</p>
      )}
    </Card>
  );
};

/** The quote of the day, the same for everyone. */
export const QuoteCard = ({ favorites = true }: { favorites?: boolean }) => {
  const { data: quote, isLoading } = useQuery({
    queryKey: ["quote-of-the-day", new Date().toDateString()],
    queryFn: () => getQuoteOfTheDay(),
    staleTime: 6 * 60 * 60 * 1000,
  });

  if (!isLoading && !quote) return null;

  return (
    <Card className="space-y-3 p-5 card-shadow animate-fade-in-up">
      <div className="flex items-center gap-2">
        <Quote className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Citation du jour</h2>
        {favorites && quote && <FavoriteButton item={{ quoteId: quote.id }} className="-my-2 ml-auto" />}
      </div>
      {isLoading || !quote ? (
        <Skeleton className="h-16 w-full" />
      ) : (
        <QuoteView quote={quote} />
      )}
    </Card>
  );
};
