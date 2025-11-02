import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CheckCircle, Lock } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  unlocked: boolean;
  progress?: number;
}

interface AchievementsListProps {
  userId: string;
}

const AchievementsList = ({ userId }: AchievementsListProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // Fetch all achievements
        const { data: allAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('*')
          .order('requirement_value', { ascending: true });

        if (achievementsError) throw achievementsError;

        // Fetch user's unlocked achievements
        const { data: unlockedAchievements, error: unlockedError } = await supabase
          .from('user_achievements')
          .select('achievement_id')
          .eq('user_id', userId);

        if (unlockedError) throw unlockedError;

        const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || []);

        // Fetch user stats for progress calculation
        const { data: profile } = await supabase
          .from('profiles')
          .select('points, current_streak')
          .eq('id', userId)
          .single();

        const { count: factsCount } = await supabase
          .from('user_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('completed', true);

        const { count: quizCount } = await supabase
          .from('quiz_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        const { data: allQuizSessions } = await supabase
          .from('quiz_sessions')
          .select('score, total_questions')
          .eq('user_id', userId);

        const perfectQuizCount = allQuizSessions?.filter(
          session => session.score === session.total_questions
        ).length || 0;

        // Calculate progress for each achievement
        const achievementsWithProgress = allAchievements?.map(achievement => {
          let currentValue = 0;
          
          switch (achievement.requirement_type) {
            case 'facts_learned':
              currentValue = factsCount || 0;
              break;
            case 'streak':
              currentValue = profile?.current_streak || 0;
              break;
            case 'points':
              currentValue = profile?.points || 0;
              break;
            case 'quiz_completed':
              currentValue = quizCount || 0;
              break;
            case 'perfect_quizzes':
              currentValue = perfectQuizCount || 0;
              break;
          }

          const progress = Math.min(100, (currentValue / achievement.requirement_value) * 100);

          return {
            ...achievement,
            unlocked: unlockedIds.has(achievement.id),
            progress
          };
        }) || [];

        // Check and unlock new achievements
        for (const achievement of achievementsWithProgress) {
          if (!achievement.unlocked && achievement.progress >= 100) {
            await supabase
              .from('user_achievements')
              .insert({
                user_id: userId,
                achievement_id: achievement.id
              });
            achievement.unlocked = true;
          }
        }

        setAchievements(achievementsWithProgress);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((achievement) => (
        <Card
          key={achievement.id}
          className={`p-4 smooth-transition ${
            achievement.unlocked
              ? 'bg-accent/5 border-accent/20'
              : 'bg-muted/30 opacity-70'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale'}`}>
              {achievement.icon}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {achievement.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
                {achievement.unlocked ? (
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </div>
              
              {!achievement.unlocked && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progression</span>
                    <span>{Math.floor(achievement.progress || 0)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full smooth-transition"
                      style={{ width: `${achievement.progress || 0}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="text-xs font-medium text-accent">
                +{achievement.points_reward} points
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AchievementsList;