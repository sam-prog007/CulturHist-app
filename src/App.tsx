import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense, useEffect } from "react";
import Index from "./pages/Index";

// The welcome screen stays in the main bundle; the rest is loaded on demand.
// The screens of the bottom bar are fetched ahead, once signed in (see PrefetchTabs).
const loadHome = () => import("./pages/App");
const loadFacts = () => import("./pages/FactsList");
const loadQuiz = () => import("./pages/Quiz");
const loadMaps = () => import("./pages/Maps");
const loadProfile = () => import("./pages/Profile");

const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AppPage = lazy(loadHome);
const Quiz = lazy(loadQuiz);
const FactsList = lazy(loadFacts);
const Profile = lazy(loadProfile);
const LearnedFacts = lazy(() => import("./pages/LearnedFacts"));
const Maps = lazy(loadMaps);
const Settings = lazy(() => import("./pages/Settings"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Discover = lazy(() => import("./pages/Discover"));
const FactPage = lazy(() => import("./pages/FactPage"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const LegalNotice = lazy(() => import("./pages/legal/LegalNotice"));
const NotFound = lazy(() => import("./pages/NotFound"));

const DAY = 24 * 60 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      // Kept as long as the copy saved on the device, so it can be restored.
      gcTime: DAY,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * The data of the last visit is saved on the device and shown at once when
 * the app opens, then refreshed in the background, like a native app. Each
 * deploy starts afresh (buster), and signing out clears it (AuthContext).
 */
const persister = createSyncStoragePersister({
  storage: (() => {
    try {
      return window.localStorage;
    } catch {
      return undefined; // Storage blocked: the app simply loads everything each time.
    }
  })(),
  key: "culturhist-cache",
  // Some queries hold Sets (favorites, learned facts): JSON alone would turn them into {}.
  serialize: (data) =>
    JSON.stringify(data, (_key, value) =>
      value instanceof Set ? { __set: [...value] } : value instanceof Map ? { __map: [...value] } : value
    ),
  deserialize: (text) =>
    JSON.parse(text, (_key, value) =>
      value?.__set ? new Set(value.__set) : value?.__map ? new Map(value.__map) : value
    ),
});

/** Fetches the code of the bottom bar's screens while the user reads the current one. */
const PrefetchTabs = () => {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    const prefetch = () => [loadHome, loadFacts, loadQuiz, loadMaps, loadProfile].forEach((load) => load().catch(() => {}));
    // After the current screen's own requests, and when the browser is idle (Safari has no requestIdleCallback).
    let idle = 0;
    const timer = window.setTimeout(() => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(prefetch, { timeout: 3000 });
      else prefetch();
    }, 2000);
    return () => {
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, [user]);
  return null;
};

const App = () => (
  <ErrorBoundary>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: DAY, buster: __APP_VERSION__ }}
    >
      <AuthProvider>
        <Sonner />
        <PrefetchTabs />
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/app" element={<AppPage />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/facts" element={<FactsList />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/learned-facts" element={<LearnedFacts />} />
              <Route path="/cartes" element={<Maps />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/favoris" element={<Favorites />} />
              {/* Readable without an account */}
              <Route path="/decouvrir" element={<Discover />} />
              <Route path="/faits/:slug" element={<FactPage />} />
              <Route path="/confidentialite" element={<Privacy />} />
              <Route path="/conditions" element={<Terms />} />
              <Route path="/mentions-legales" element={<LegalNotice />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </PersistQueryClientProvider>
  </ErrorBoundary>
);

export default App;
