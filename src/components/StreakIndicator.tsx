import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flame } from "lucide-react";
import { Card } from "./ui/card";

interface StreakIndicatorProps {
  userId: string;
}

const StreakIndicator = ({ userId }: StreakIndicatorProps) => {
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('current_streak')
          .eq('id', userId)
          .single();

        if (data) {
          setStreak(data.current_streak || 0);
        }
      } catch (error) {
        console.error('Error fetching streak:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreak();
  }, [userId]);

  if (isLoading) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
      <div className="relative z-10 flex items-center gap-3">
        <div className="relative">
          <Flame className="w-10 h-10 animate-glow" />
          {streak > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-orange-500">{streak}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold">{streak} jour{streak > 1 ? 's' : ''}</p>
          <p className="text-sm opacity-90">Série en cours</p>
        </div>
      </div>
      {streak > 0 && (
        <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
          />
        </div>
      )}
      <p className="text-xs opacity-75 mt-2">
        {streak === 0 ? "Commencez aujourd'hui !" : `Continuez comme ça ! 🔥`}
      </p>
    </Card>
  );
};

export default StreakIndicator;
