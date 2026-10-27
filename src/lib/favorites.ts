import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/** A favorite is either a fact or a quote. */
export type FavoriteItem = { factId: string } | { quoteId: string };

interface FavoriteIds {
  facts: Set<string>;
  quotes: Set<string>;
}

/** Query key of the full favorites list shown on /favoris, refreshed after each change. */
export const FAVORITES_LIST_KEY = "favorites-list";

const has = (ids: FavoriteIds | undefined, item: FavoriteItem) =>
  !!ids && ("factId" in item ? ids.facts.has(item.factId) : ids.quotes.has(item.quoteId));

/**
 * The user's favorites as sets of ids, and a toggle that updates the hearts
 * at once and rolls back with a message if the server refuses.
 */
export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKey = ["favorite-ids", user?.id];

  const { data } = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async (): Promise<FavoriteIds> => {
      const { data, error } = await supabase.from("favorites").select("fact_id, quote_id");
      if (error) throw error;
      return {
        facts: new Set((data ?? []).flatMap((f) => (f.fact_id ? [f.fact_id] : []))),
        quotes: new Set((data ?? []).flatMap((f) => (f.quote_id ? [f.quote_id] : []))),
      };
    },
  });

  const toggle = async (item: FavoriteItem) => {
    if (!user) return;
    const previous = queryClient.getQueryData<FavoriteIds>(queryKey);
    const adding = !has(previous, item);
    queryClient.setQueryData<FavoriteIds>(queryKey, (old) => {
      const next = { facts: new Set(old?.facts), quotes: new Set(old?.quotes) };
      const set = "factId" in item ? next.facts : next.quotes;
      const id = "factId" in item ? item.factId : item.quoteId;
      if (adding) set.add(id);
      else set.delete(id);
      return next;
    });

    const column = "factId" in item ? "fact_id" : "quote_id";
    const id = "factId" in item ? item.factId : item.quoteId;
    const { error } = adding
      ? await supabase.from("favorites").insert({ [column]: id })
      : await supabase.from("favorites").delete().eq("user_id", user.id).eq(column, id);

    // 23505: already a favorite (a double tap), which is what we wanted anyway.
    if (error && error.code !== "23505") {
      queryClient.setQueryData(queryKey, previous);
      toast({ title: "Erreur", description: "Vos favoris n'ont pas pu être enregistrés.", variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: [FAVORITES_LIST_KEY] });
  };

  return { isFavorite: (item: FavoriteItem) => has(data, item), toggle };
}

/** Favorites with their fact or quote, newest first. */
export async function getFavorites() {
  const { data, error } = await supabase
    .from("favorites")
    .select(
      `id, created_at,
       historical_facts (id, title, title_fr, description, description_fr, date_text, date_text_fr, region_fr,
         difficulty, image_url, image_credit, image_source_url),
       quotes (*)`
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type Favorite = Awaited<ReturnType<typeof getFavorites>>[number];
