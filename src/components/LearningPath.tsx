import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { BookOpen, Brain, Trophy, Lock, CheckCircle2 } from "lucide-react";

interface LearningPathProps {
  userId: string;
}

const LearningPath = ({ userId }: LearningPathProps) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    factsLearned: 0,
    quizCompleted: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0];

      const { count: factsCount } = await supabase
        .from('user_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true)
        .gte('completed_at', `${today}T00:00:00`);

      const { count: quizCount } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('completed_at', `${today}T00:00:00`);

      setStats({
        factsLearned: factsCount || 0,
        quizCompleted: quizCount || 0,
      });
    };

    fetchStats();
  }, [userId]);

  const activities = [
    {
      id: 'facts',
      title: 'Apprendre',
      description: 'Découvrir de nouveaux faits',
      icon: BookOpen,
      color: 'from-primary to-primary-light',
      completed: stats.factsLearned > 0,
      locked: false,
      action: () => navigate('/facts'),
    },
    {
      id: 'quiz',
      title: 'Réviser',
      description: 'Tester vos connaissances',
      icon: Brain,
      color: 'from-accent to-accent-light',
      completed: stats.quizCompleted > 0,
      locked: stats.factsLearned === 0,
      action: () => navigate('/quiz'),
    },
    {
      id: 'achievements',
      title: 'Succès',
      description: 'Voir vos accomplissements',
      icon: Trophy,
      color: 'from-primary-light to-gold',
      completed: false,
      locked: false,
      action: () => navigate('/profile'),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Votre parcours</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <Card
              key={activity.id}
              className={`p-6 relative overflow-hidden cursor-pointer transition-all hover:scale-105 ${
                activity.locked ? 'opacity-60' : ''
              }`}
              onClick={!activity.locked ? activity.action : undefined}
            >
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${activity.color}`} />
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${activity.color} text-white`}>
                    {activity.locked ? (
                      <Lock className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  {activity.completed && (
                    <CheckCircle2 className="w-6 h-6 text-success animate-scale-in" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-1">{activity.title}</h3>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>

                {activity.locked && (
                  <p className="text-xs text-destructive">
                    Complétez l'étape précédente
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPath;
