import type { Tables } from "@/integrations/supabase/types";
import { formatYear } from "@/lib/dates";

/** A quote with its original wording, author, context and year. */
export const QuoteView = ({ quote }: { quote: Tables<"quotes"> }) => (
  <figure className="space-y-3">
    <blockquote className="font-serif text-xl leading-snug">« {quote.text_fr} »</blockquote>
    {quote.original_text && <p className="text-sm italic text-muted-foreground">{quote.original_text}</p>}
    <figcaption className="text-sm">
      <span className="font-semibold text-accent">{quote.author}</span>
      {(quote.context_fr || quote.year) && (
        <span className="text-muted-foreground">
          {" — "}
          {[quote.context_fr, quote.year ? formatYear(quote.year) : null].filter(Boolean).join(", ")}
        </span>
      )}
    </figcaption>
  </figure>
);
