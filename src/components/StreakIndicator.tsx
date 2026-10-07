import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Trophy, Target } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { StreakCalendar } from "./StreakCalendar";
import { Progress } from "./ui/progress";
import { effectiveStreak } from '@/lib/dates';

interface StreakIndicatorProps {
  userId: string;
}

interface StreakMilestone {
  id: string;
  days: number;
  name: string;
  description: string;
  points_reward: number;
  icon: string;
}

const StreakIndicator = ({ userId }: StreakIndicatorProps) => {
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [milestones, setMilestones] = useState<StreakMilestone[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const [profileResult, milestonesResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('current_streak, last_activity_date')
            .eq('id', userId)
            .single(),
          supabase
            .from('streak_milestones')
            .select('*')
            .order('days', { ascending: true })
        ]);

        if (profileResult.data) {
          setStreak(effectiveStreak(profileResult.data.current_streak, profileResult.data.last_activity_date));
        }

        if (milestonesResult.data) {
          setMilestones(milestonesResult.data);
        }
      } catch (error) {
        console.error('Error fetching streak data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreakData();
  }, [userId]);

  if (isLoading) return null;

  const nextMilestone = milestones.find(m => m.days > streak);
  const currentMilestone = milestones.find(m => m.days === streak);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 overflow-hidden relative cursor-pointer hover:scale-105 transition-transform">
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
          {streak > 0 && nextMilestone && (
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min((streak / nextMilestone.days) * 100, 100)}%` }}
              />
            </div>
          )}
          <p className="text-xs opacity-75 mt-2">
            {streak === 0 ? "Commencez aujourd'hui !" : `Cliquez pour voir vos objectifs 🎯`}
          </p>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Flame className="w-6 h-6 text-orange-500" />
            Suivi de votre série
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Streak Status */}
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Série actuelle</p>
                <p className="text-4xl font-bold text-orange-600">{streak} jours</p>
                {currentMilestone && (
                  <p className="text-sm text-muted-foreground mt-1">
                    🎉 {currentMilestone.icon} {currentMilestone.name} atteint !
                  </p>
                )}
              </div>
              <Flame className="w-16 h-16 text-orange-500 opacity-50" />
            </div>
          </Card>

          {/* Calendar */}
          <StreakCalendar userId={userId} />

          {/* Milestones */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">Objectifs de série</h3>
            </div>
            
            <div className="grid gap-4">
              {milestones.map((milestone) => {
                const isCompleted = streak >= milestone.days;
                const isCurrent = nextMilestone?.id === milestone.id;
                const progress = isCompleted ? 100 : Math.min((streak / milestone.days) * 100, 100);

                return (
                  <Card 
                    key={milestone.id}
                    className={`p-4 ${
                      isCompleted 
                        ? 'bg-accent/10 border-accent' 
                        : isCurrent 
                        ? 'bg-primary/5 border-primary/30' 
                        : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl flex-shrink-0">
                        {isCompleted ? <Trophy className="w-10 h-10 text-accent" /> : milestone.icon}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-lg">{milestone.name}</h4>
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-accent">
                              +{milestone.points_reward} pts
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {milestone.days} jours
                            </p>
                          </div>
                        </div>
                        
                        {!isCompleted && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Progression</span>
                              <span>{streak}/{milestone.days} jours</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}

                        {isCompleted && (
                          <div className="flex items-center gap-2 text-sm text-accent font-medium">
                            <Trophy className="w-4 h-4" />
                            <span>Objectif atteint !</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <Card className="p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Astuce :</strong> Revenez chaque jour pour apprendre un nouveau fait historique 
              et maintenir votre série. Plus votre série est longue, plus vous gagnez de points !
            </p>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StreakIndicator;
