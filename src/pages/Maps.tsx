import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Globe2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";

/** Placeholder for the world map and timeline (redesign step 5). */
const MapsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen subtle-gradient">
      <main className="mx-auto max-w-md space-y-5 px-4 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <h1 className="text-3xl font-bold">Cartes</h1>
        {[
          { icon: Globe2, title: "Carte du monde", text: "Choisissez vos régions et voyez votre territoire s'agrandir au fil de vos découvertes." },
          { icon: Clock, title: "Frise chronologique", text: "Remplissez la frise des époques au rythme de vos apprentissages." },
        ].map(({ icon: Icon, title, text }) => (
          <Card key={title} className="space-y-2 p-5 card-shadow">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">{title}</h2>
              <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">Bientôt</span>
            </div>
            <p className="text-sm text-muted-foreground">{text}</p>
          </Card>
        ))}
      </main>
      <BottomNav />
    </div>
  );
};

export default MapsPage;
