import { memo } from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Target, CheckCircle2 } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

interface DailyGoalProps {
  userId: string;
}

const DailyGoalComponent = ({ userId }: DailyGoalProps) => {
  const [factsValidated, setFactsValidated] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const dailyGoal = 5;

  useEffect(() => {
    let mounted = true;

    const fetchProgress = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch both queries in parallel
        const [factsResult, quizResult] = await Promise.all([
          supabase
            .from('daily_facts_progress')
            .select('facts_validated')
            .eq('user_id', userId)
            .eq('date', today)
            .maybeSingle(),
          supabase
            .from('quiz_sessions')
            .select('id')
            .eq('user_id', userId)
            .gte('completed_at', `${today}T00:00:00`)
            .limit(1)
        ]);

        if (!mounted) return;

        if (factsResult.data) {
          setFactsValidated(factsResult.data.facts_validated || 0);
        }

        setQuizCompleted(quizResult.data && quizResult.data.length > 0);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const progressPercentage = (factsValidated / dailyGoal) * 100;
  const isGoalComplete = factsValidated >= dailyGoal;

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6" />
          <h3 className="text-lg font-bold">Objectif quotidien</h3>
        </div>
        {isGoalComplete && (
          <CheckCircle2 className="w-6 h-6 text-green-300 animate-scale-in" />
        )}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Faits appris</span>
            <span className="font-bold">{factsValidated}/{dailyGoal}</span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-white/20" />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            quizCompleted ? 'bg-white border-white' : 'border-white/50'
          }`}>
            {quizCompleted && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
          </div>
          <span className={quizCompleted ? 'line-through opacity-75' : ''}>
            Compléter un quiz
          </span>
        </div>
      </div>

      {isGoalComplete && quizCompleted && (
        <div className="mt-4 p-3 bg-white/10 rounded-lg text-center animate-fade-in">
          <p className="text-sm font-bold">🎉 Objectif accompli !</p>
          <p className="text-xs opacity-75">Continuez comme ça demain</p>
        </div>
      )}
    </Card>
  );
};

export default memo(DailyGoalComponent);
