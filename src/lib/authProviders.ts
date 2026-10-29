import { useQuery } from "@tanstack/react-query";

export type OAuthProvider = "apple" | "google";

const ALL: OAuthProvider[] = ["apple", "google"];

/**
 * The social sign-ins switched on in the Supabase dashboard, so the welcome
 * screen never shows a button that would end on an "unsupported provider"
 * error. If the settings cannot be read, every button is shown.
 */
export function useOAuthProviders(): OAuthProvider[] | undefined {
  const { data, isError } = useQuery({
    queryKey: ["auth-providers"],
    staleTime: Infinity,
    queryFn: async (): Promise<OAuthProvider[]> => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      if (!response.ok) return ALL;
      const { external } = (await response.json()) as { external?: Record<string, boolean> };
      return ALL.filter((provider) => external?.[provider]);
    },
  });
  return isError ? ALL : data;
}
