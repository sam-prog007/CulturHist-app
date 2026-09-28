import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";

// Landing page stays in the main bundle; the rest is loaded on demand
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AppPage = lazy(() => import("./pages/App"));
const Quiz = lazy(() => import("./pages/Quiz"));
const QuizLimit = lazy(() => import("./pages/QuizLimit"));
const FactsList = lazy(() => import("./pages/FactsList"));
const FactsLimit = lazy(() => import("./pages/FactsLimit"));
const Profile = lazy(() => import("./pages/Profile"));
const LearnedFacts = lazy(() => import("./pages/LearnedFacts"));
const RegenerateImages = lazy(() => import("./pages/RegenerateImages"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/app" element={<AppPage />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/quiz-limit" element={<QuizLimit />} />
                <Route path="/facts" element={<FactsList />} />
                <Route path="/facts-limit" element={<FactsLimit />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/learned-facts" element={<LearnedFacts />} />
                <Route path="/regenerate-images" element={<RegenerateImages />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
