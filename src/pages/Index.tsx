import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import logo from "@/assets/culturhist-logo.png";

/** First screen for signed-out visitors: a single screen, no scrolling. */
const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate("/app", { replace: true });
  }, [user, loading, navigate]);

  if (loading || user) return <div className="h-[100dvh] subtle-gradient" />;

  return (
    <main className="relative flex h-[100dvh] flex-col overflow-hidden subtle-gradient px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[18%] h-80 w-80 -translate-x-1/2 rounded-full bg-gold/25 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-sm flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center motion-safe:animate-fade-in">
          <img src={logo} alt="CulturHist" className="h-36 w-36 rounded-[2rem] elegant-shadow" />
          <h1 className="text-[2.6rem] font-bold leading-[1.1]">
            Envie d'apprendre <span className="text-primary">toujours plus</span>&nbsp;?
          </h1>
        </div>

        <div className="space-y-3 motion-safe:animate-fade-in-up">
          <Button size="xl" className="w-full rounded-2xl" onClick={() => navigate("/onboarding")}>
            Commencer
          </Button>
          <Button size="xl" variant="outline" className="w-full rounded-2xl bg-card" onClick={() => navigate("/auth")}>
            Se connecter
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Index;
