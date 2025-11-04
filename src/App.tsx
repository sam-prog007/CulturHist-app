import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import AppPage from "./pages/App";
import Quiz from "./pages/Quiz";
import QuizLimit from "./pages/QuizLimit";
import FactsList from "./pages/FactsList";
import FactsLimit from "./pages/FactsLimit";
import Profile from "./pages/Profile";
import LearnedFacts from "./pages/LearnedFacts";
import RegenerateImages from "./pages/RegenerateImages";
import NotFound from "./pages/NotFound";

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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
