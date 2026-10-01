import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trophy, Sparkles, Zap, Target } from "lucide-react";
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
        const fourDaysAgo = new Date();
        fourDaysAgo.setDate(fourDaysAgo.getDate() - 3);

        const recentProgressResult = await supabase
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
          .gte('completed_at', fourDaysAgo.toISOString());

        if (!mounted) return;

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
          const fact = randomFact.historical_facts;

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
              .map((p) => (p.historical_facts?.date_text_fr || p.historical_facts?.date_text))
              .filter((d) => d && d !== displayDate)
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
              .map((p) => p.historical_facts)
              .filter((f) => f && f.id !== fact.id && (f.title_fr || f.title))
              .slice(0, 3);

            if (otherFacts.length >= 2) {
              const options = [displayTitle, ...otherFacts.map((f) => f.title_fr || f.title)].sort(() => Math.random() - 0.5);
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
              .map((p) => (p.historical_facts?.region_fr || p.historical_facts?.region))
              .filter((r) => r && r !== displayRegion))]
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

    // If wrong answer and not yet answered correctly, add to end.
    // Use the updated list below: `questions` state only changes on next render.
    let nextQuestions = questions;
    if (!isCorrect && !answeredQuestions.has(currentQuestion.id)) {
      nextQuestions = [...questions, currentQuestion];
      setQuestions(nextQuestions);
    }

    if (currentQuestionIndex + 1 >= nextQuestions.length) {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-muted-foreground">Chargement du quiz...</p>
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
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Navbar />
        <main className="container mx-auto px-4 py-24">
          <Card className="max-w-2xl mx-auto p-8 md:p-12 elegant-shadow border-2 overflow-hidden relative animate-scale-in">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative text-center space-y-8">
              {/* Trophy icon with glow */}
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent-light glow-shadow animate-glow">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Quiz terminé !
                </h1>
                {isPerfect && (
                  <div className="flex items-center justify-center gap-2 text-accent">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">Score parfait !</span>
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="text-5xl font-bold text-primary mb-2">
                    {score}/{questions.length}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Réponses correctes</p>
                </div>
                
                <div className="p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                  <div className="text-5xl font-bold text-accent mb-2">
                    {percentage}%
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Score</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Zap className="w-6 h-6 text-primary" />
                  <span className="text-3xl font-bold text-primary">+{pointsEarned}</span>
                </div>
                <p className="text-sm text-muted-foreground font-medium">Points gagnés</p>
              </div>
              
              {/* Ad Space */}
              <AdSense slot="4234567890" format="rectangle" />
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/app')}
                  className="hover-lift"
                >
                  Retour à l'accueil
                </Button>
                <Button 
                  size="lg"
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover-lift"
                >
                  <Target className="w-5 h-5 mr-2" />
                  Refaire un quiz
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((answeredQuestions.size) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navbar />
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
          {/* Ad Space */}
          <AdSense slot="4234567891" format="horizontal" />
          
          {/* Progress Card */}
          <Card className="p-6 card-shadow border-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <span className="text-lg font-bold text-primary">{currentQuestionIndex + 1}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Question</p>
                    <p className="font-semibold">{currentQuestionIndex + 1}/{questions.length}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-2xl font-bold text-accent">{score}/{answeredQuestions.size}</p>
                </div>
              </div>
              
              <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full smooth-transition"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-in"></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Question Card */}
          <Card className="p-8 md:p-10 card-shadow hover:shadow-hover border-2 smooth-transition animate-scale-in">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Question {currentQuestionIndex + 1}</span>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="space-y-4">
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
                      className={`quiz-option w-full p-5 md:p-6 rounded-xl text-left font-medium smooth-transition border-2 ${
                        showCorrect
                          ? 'border-success bg-success-light dark:bg-success-dark shadow-lg scale-[1.02]'
                          : showWrong
                          ? 'border-error bg-error-light dark:bg-error-dark shadow-lg scale-[0.98]'
                          : isSelected
                          ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-md scale-[1.02]'
                          : 'border-border hover:border-primary/50 hover:bg-primary/5 hover-lift'
                      } ${showAnswer ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold ${
                            showCorrect
                              ? 'border-success bg-success text-white'
                              : showWrong
                              ? 'border-error bg-error text-white'
                              : isSelected
                              ? 'border-primary bg-primary text-white'
                              : 'border-muted-foreground/30 text-muted-foreground'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className={`text-base md:text-lg ${
                            showCorrect ? 'text-success' : showWrong ? 'text-error' : ''
                          }`}>
                            {option}
                          </span>
                        </div>
                        {showCorrect && <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />}
                        {showWrong && <XCircle className="w-6 h-6 text-error flex-shrink-0" />}
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
                    className="bg-gradient-to-r from-primary to-primary-light hover:shadow-lg hover-lift text-lg px-8"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Valider
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNextQuestion} 
                    size="lg"
                    className="bg-gradient-to-r from-accent to-accent-light hover:shadow-lg hover-lift text-lg px-8"
                  >
                    {currentQuestionIndex + 1 >= questions.length && selectedAnswer === currentQuestion.correctAnswer
                      ? 'Voir les résultats'
                      : 'Question suivante'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Quiz;
