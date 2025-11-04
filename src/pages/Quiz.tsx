import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AdSense from "@/components/AdSense";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  factId: string;
};

const Quiz = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [wrongAnswers, setWrongAnswers] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    let mounted = true;

    const generateQuiz = async () => {
      if (!user) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        const fourDaysAgo = new Date();
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 3);

        // Fetch all required data in parallel
        const [todayQuizzesResult, profileResult, recentProgressResult] = await Promise.all([
          supabase
            .from('quiz_sessions')
            .select('id')
            .eq('user_id', user.id)
            .gte('completed_at', `${today}T00:00:00`)
            .limit(1),
          supabase
            .from('profiles')
            .select('is_premium')
            .eq('id', user.id)
            .single(),
          supabase
            .from('user_progress')
            .select(`
              fact_id,
              historical_facts (
                id,
                title,
                title_fr,
                description,
                description_fr,
                date_text,
                date_text_fr,
                region,
                region_fr,
                tags,
                tags_fr
              )
            `)
            .eq('user_id', user.id)
            .eq('completed', true)
            .gte('completed_at', fourDaysAgo.toISOString())
        ]);

        if (!mounted) return;

        const todayQuizzes = todayQuizzesResult.data;
        const profile = profileResult.data;

        // Redirect to limit page if not premium and already did quiz today
        if (todayQuizzes && todayQuizzes.length > 0 && !profile?.is_premium) {
          navigate('/quiz-limit');
          return;
        }

        const recentProgress = recentProgressResult.data;

        if (recentProgressResult.error) throw recentProgressResult.error;

        if (!recentProgress || recentProgress.length === 0) {
          toast({
            title: "Pas de quiz disponible",
            description: "Apprenez d'abord quelques faits pour débloquer le quiz !",
            variant: "destructive"
          });
          navigate('/app');
          return;
        }

        // Generate 4-7 questions from these facts
        const numQuestions = Math.min(
          Math.max(4, Math.floor(recentProgress.length * 1.5)),
          7
        );

        const generatedQuestions: Question[] = [];
        const usedFacts = new Set<string>();

        for (let i = 0; i < numQuestions && generatedQuestions.length < numQuestions; i++) {
          const randomFact = recentProgress[Math.floor(Math.random() * recentProgress.length)];
          const fact = randomFact.historical_facts as any;

          if (!fact || usedFacts.has(fact.id)) continue;
          usedFacts.add(fact.id);

          // Prepare French/English display values
          const displayTitle = fact.title_fr || fact.title;
          const displayDate = fact.date_text_fr || fact.date_text;
          const displayDesc = fact.description_fr || fact.description;
          const displayRegion = fact.region_fr || fact.region;

          // Generate different types of questions (3 types)
          const questionType = Math.floor(Math.random() * 3);

          if (questionType === 0 && displayDate) {
            // Question: Given fact, find date
            const otherDates = recentProgress
              .map((p: any) => (p.historical_facts?.date_text_fr || p.historical_facts?.date_text))
              .filter((d: string) => d && d !== displayDate)
              .slice(0, 3);

            if (otherDates.length >= 2) {
              const options = [displayDate, ...otherDates].sort(() => Math.random() - 0.5);
              generatedQuestions.push({
                id: `${fact.id}-date`,
                question: `Quand s'est produit l'événement suivant : "${displayTitle}" ?`,
                options,
                correctAnswer: options.indexOf(displayDate),
                factId: fact.id
              });
            }
          } else if (questionType === 1) {
            // Question: Given date, find fact
            const otherFacts = recentProgress
              .map((p: any) => p.historical_facts)
              .filter((f: any) => f && f.id !== fact.id && (f.title_fr || f.title))
              .slice(0, 3);

            if (otherFacts.length >= 2) {
              const options = [displayTitle, ...otherFacts.map((f: any) => f.title_fr || f.title)].sort(() => Math.random() - 0.5);
              const questionText = displayDate
                ? `Quel événement s'est produit en ${displayDate} ?`
                : `Parmi ces événements, lequel correspond à : "${displayDesc.substring(0, 60)}..." ?`;
              
              generatedQuestions.push({
                id: `${fact.id}-fact`,
                question: questionText,
                options,
                correctAnswer: options.indexOf(displayTitle),
                factId: fact.id
              });
            }
          } else if (displayRegion) {
            // Question: Given fact, find region
            const otherRegions = [...new Set(recentProgress
              .map((p: any) => (p.historical_facts?.region_fr || p.historical_facts?.region))
              .filter((r: string) => r && r !== displayRegion))]
              .slice(0, 3);

            if (otherRegions.length >= 2) {
              const options = [displayRegion, ...otherRegions].sort(() => Math.random() - 0.5);
              generatedQuestions.push({
                id: `${fact.id}-region`,
                question: `Dans quelle région du monde se situe l'événement : "${displayTitle}" ?`,
                options,
                correctAnswer: options.indexOf(displayRegion),
                factId: fact.id
              });
            }
          }
        }

        if (generatedQuestions.length < 4) {
          toast({
            title: "Pas assez de faits",
            description: "Apprenez plus de faits pour générer un quiz complet !",
            variant: "destructive"
          });
          navigate('/app');
          return;
        }

        if (mounted) {
          setQuestions(generatedQuestions);
        }
      } catch (error) {
        console.error('Error generating quiz:', error);
        if (mounted) {
          toast({
            title: "Erreur",
            description: "Impossible de générer le quiz",
            variant: "destructive"
          });
        }
      } finally {
        if (mounted) {
          setLoadingQuiz(false);
        }
      }
    };

    generateQuiz();

    return () => {
      mounted = false;
    };
  }, [user, toast, navigate]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showAnswer) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setShowAnswer(true);

    if (isCorrect) {
      setScore(score + 1);
      setAnsweredQuestions(new Set([...answeredQuestions, currentQuestion.id]));
      
      toast({
        title: "Correct !",
        description: "Bonne réponse",
      });
    } else {
      if (!wrongAnswers.has(currentQuestion.id)) {
        setWrongAnswers(new Set([...wrongAnswers, currentQuestion.id]));
      }
      
      toast({
        title: "Incorrect",
        description: "Réessayez plus tard",
        variant: "destructive"
      });
    }
  };

  const handleNextQuestion = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    // If wrong answer and not yet answered correctly, add to end
    if (!isCorrect && !answeredQuestions.has(currentQuestion.id)) {
      const remainingQuestions = questions.slice(currentQuestionIndex + 1);
      const newQuestions = [...remainingQuestions, currentQuestion];
      setQuestions([...questions.slice(0, currentQuestionIndex + 1), ...newQuestions]);
    }

    if (currentQuestionIndex + 1 >= questions.length || answeredQuestions.size === questions.length) {
      // Quiz complete - Calculate points based on performance
      const isPerfect = score === questions.length;
      const pointsEarned = isPerfect ? 30 : Math.round((score / questions.length) * 30);
      
      try {
        // Save quiz session (no more exp_earned)
        await supabase.from('quiz_sessions').insert({
          user_id: user!.id,
          score,
          total_questions: questions.length,
          exp_earned: 0 // No more EXP from quizzes
        });

        // Update user points only (this will trigger streak update)
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user!.id)
          .single();

        if (profile) {
          const newPoints = profile.points + pointsEarned;
          await supabase
            .from('profiles')
            .update({ 
              points: newPoints
            })
            .eq('id', user!.id);

          // Update or insert daily points
          const today = new Date().toISOString().split('T')[0];
          const { data: existingDailyPoints } = await supabase
            .from('daily_points')
            .select('points_earned')
            .eq('user_id', user!.id)
            .eq('date', today)
            .maybeSingle();

          if (existingDailyPoints) {
            await supabase
              .from('daily_points')
              .update({ 
                points_earned: existingDailyPoints.points_earned + pointsEarned 
              })
              .eq('user_id', user!.id)
              .eq('date', today);
          } else {
            await supabase
              .from('daily_points')
              .insert({
                user_id: user!.id,
                date: today,
                points_earned: pointsEarned
              });
          }
        }
      } catch (error) {
        console.error('Error saving quiz:', error);
      }

      setIsQuizComplete(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  if (loading || loadingQuiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement du quiz...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isQuizComplete) {
    const isPerfect = score === questions.length;
    const pointsEarned = isPerfect ? 30 : Math.round((score / questions.length) * 30);
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <Card className="max-w-2xl mx-auto p-8 text-center space-y-6">
            <Trophy className="w-16 h-16 mx-auto text-accent" />
            <h1 className="text-3xl font-bold">Quiz terminé !</h1>
            <div className="space-y-4">
              <div className="text-4xl font-bold text-primary">
                {score}/{questions.length}
              </div>
              <p className="text-xl text-muted-foreground">
                Score : {percentage}%
              </p>
              <p className="text-lg text-accent">
                +{pointsEarned} points gagnés {isPerfect && "🏆"}
              </p>
            </div>
            
            {/* Ad Space */}
            <AdSense slot="4234567890" format="rectangle" />
            
            <div className="flex gap-4 justify-center pt-4">
              <Button variant="outline" onClick={() => navigate('/app')}>
                Retour à l'accueil
              </Button>
              <Button onClick={() => window.location.reload()}>
                Refaire un quiz
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((answeredQuestions.size) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Ad Space */}
          <AdSense slot="4234567891" format="horizontal" />
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
              <span>Score: {score}/{answeredQuestions.size}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full smooth-transition"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <Card className="p-8 space-y-6">
            <h2 className="text-2xl font-bold text-foreground">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showCorrect = showAnswer && isCorrect;
                const showWrong = showAnswer && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showAnswer}
                    className={`w-full p-4 rounded-lg border-2 text-left smooth-transition ${
                      showCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : showWrong
                        ? 'border-red-500 bg-red-50 dark:bg-red-950'
                        : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {showCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {showWrong && <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              {!showAnswer ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  size="lg"
                >
                  Valider
                </Button>
              ) : (
                <Button onClick={handleNextQuestion} size="lg">
                  {currentQuestionIndex + 1 >= questions.length || answeredQuestions.size === questions.length
                    ? 'Voir les résultats'
                    : 'Question suivante'}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Quiz;
