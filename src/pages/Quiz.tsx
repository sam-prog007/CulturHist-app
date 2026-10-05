import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Play, RotateCcw, Sparkles, Trophy, XCircle, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { DifficultyStars } from "@/components/DifficultyStars";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DIFFICULTIES } from "@/lib/difficulty";
import { REGION_LABELS } from "@/lib/dailyFacts";
import {
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  buildQuiz,
  completeQuiz,
  loadQuizData,
  matchingFacts,
  type Question,
  type QuizFilters,
} from "@/lib/quiz";

type Phase = "setup" | "play" | "done";

const Chip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium smooth-transition",
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"
    )}
  >
    {children}
  </button>
);

const QuizPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>("setup");
  const [filters, setFilters] = useState<QuizFilters>({ region: null, periodId: null, difficulty: null });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  const { data, isLoading } = useQuery({ queryKey: ["quiz-data"], enabled: !!user, queryFn: loadQuizData });
  const pool = useMemo(() => (data ? matchingFacts(data.facts, filters) : []), [data, filters]);
  const questionCount = Math.min(pool.length, MAX_QUESTIONS);

  const start = () => {
    if (!data) return;
    const quiz = buildQuiz(pool, data.facts, data.periods);
    if (quiz.length < MIN_QUESTIONS) {
      toast({ title: "Pas assez de questions", description: "Élargissez votre sélection.", variant: "destructive" });
      return;
    }
    setQuestions(quiz);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setPointsEarned(null);
    setPhase("play");
  };

  const answer = (option: number) => {
    if (selected !== null) return;
    setSelected(option);
    if (option === questions[index].correctAnswer) setScore((s) => s + 1);
  };

  const next = async () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
      return;
    }
    setPhase("done");
    try {
      const result = await completeQuiz(score, questions.length, filters.difficulty);
      setPointsEarned(result.points_earned);
      queryClient.invalidateQueries({ queryKey: ["home-profile"] });
    } catch (e) {
      toast({ title: "Erreur", description: "Les points n'ont pas pu être enregistrés.", variant: "destructive" });
      console.error(e);
    }
  };

  if (loading || !user || isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen subtle-gradient">
      <main className="mx-auto max-w-md space-y-5 px-4 pb-32 pt-[max(1.5rem,env(safe-area-inset-top))]">
        {phase === "setup" && (
          <>
            <header className="space-y-1">
              <h1 className="text-3xl font-bold">Quiz</h1>
              <p className="text-muted-foreground">Choisissez votre sujet et gagnez des points.</p>
            </header>

            <Card className="space-y-5 p-5 card-shadow">
              <section className="space-y-2">
                <h2 className="font-semibold">Région</h2>
                <div className="flex flex-wrap gap-2">
                  <Chip active={!filters.region} onClick={() => setFilters({ ...filters, region: null })}>Toutes</Chip>
                  {Object.entries(REGION_LABELS).map(([value, label]) => (
                    <Chip key={value} active={filters.region === value} onClick={() => setFilters({ ...filters, region: value })}>
                      {label}
                    </Chip>
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="font-semibold">Époque</h2>
                <div className="flex flex-wrap gap-2">
                  <Chip active={!filters.periodId} onClick={() => setFilters({ ...filters, periodId: null })}>Toutes</Chip>
                  {data.periods.map((p) => (
                    <Chip key={p.id} active={filters.periodId === p.id} onClick={() => setFilters({ ...filters, periodId: p.id })}>
                      {p.name}
                    </Chip>
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="font-semibold">Difficulté</h2>
                <div className="flex flex-wrap gap-2">
                  <Chip active={!filters.difficulty} onClick={() => setFilters({ ...filters, difficulty: null })}>Toutes</Chip>
                  {DIFFICULTIES.map((d) => {
                    const active = filters.difficulty === d.value;
                    return (
                      <Chip key={d.value} active={active} onClick={() => setFilters({ ...filters, difficulty: d.value })}>
                        <DifficultyStars difficulty={d.value} tone={active ? "current" : "gold"} />
                        {d.label}
                      </Chip>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">Plus c'est difficile, plus le quiz rapporte de points.</p>
              </section>
            </Card>

            <Button variant="hero" size="lg" className="w-full" disabled={questionCount < MIN_QUESTIONS} onClick={start}>
              <Play className="h-5 w-5" />
              {questionCount < MIN_QUESTIONS ? "Pas encore assez de faits pour ce choix" : `Lancer le quiz (${questionCount} questions)`}
            </Button>
          </>
        )}

        {phase === "play" && questions[index] && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {index + 1}/{questions.length}</span>
                <span className="font-semibold text-foreground">Score : {score}</span>
              </div>
              <Progress value={((index + (selected !== null ? 1 : 0)) / questions.length) * 100} className="h-2 [&>div]:bg-gold" />
            </div>

            <Card className="space-y-5 p-5 card-shadow animate-fade-in">
              <h2 className="text-xl font-bold leading-snug">{questions[index].question}</h2>
              <div className="space-y-3">
                {questions[index].options.map((option, i) => {
                  const answered = selected !== null;
                  const correct = i === questions[index].correctAnswer;
                  const wrong = answered && i === selected && !correct;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={answered}
                      onClick={() => answer(i)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl border-2 p-4 text-left font-medium smooth-transition",
                        answered && correct && "border-success bg-success-light text-success-dark",
                        wrong && "border-error bg-error-light text-error-dark",
                        !answered && "border-border hover:border-primary/50 hover:bg-primary/5",
                        answered && !correct && !wrong && "border-border opacity-60"
                      )}
                    >
                      <span>{option}</span>
                      {answered && correct && <CheckCircle className="h-5 w-5 shrink-0 text-success" />}
                      {wrong && <XCircle className="h-5 w-5 shrink-0 text-error" />}
                    </button>
                  );
                })}
              </div>
              {selected !== null && (
                <Button className="w-full" onClick={next}>
                  {index + 1 < questions.length ? "Question suivante" : "Voir le résultat"}
                </Button>
              )}
            </Card>
          </>
        )}

        {phase === "done" && (
          <Card className="space-y-6 p-6 text-center card-shadow animate-scale-in">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full accent-gradient">
              <Trophy className="h-10 w-10 text-gold" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Quiz terminé !</h1>
              {score === questions.length && (
                <p className="inline-flex items-center gap-1.5 font-semibold text-accent">
                  <Sparkles className="h-4 w-4 text-gold" /> Sans faute, +10 points de bonus
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary p-4">
                <p className="text-3xl font-bold text-primary">{score}/{questions.length}</p>
                <p className="text-sm text-muted-foreground">Bonnes réponses</p>
              </div>
              <div className="rounded-xl bg-secondary p-4">
                <p className="inline-flex items-center gap-1 text-3xl font-bold text-primary">
                  <Zap className="h-6 w-6" />+{pointsEarned ?? "…"}
                </p>
                <p className="text-sm text-muted-foreground">Points gagnés</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button variant="hero" className="w-full" onClick={start}>
                <RotateCcw className="h-4 w-4" /> Rejouer ce quiz
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setPhase("setup")}>
                Changer de sujet
              </Button>
            </div>
          </Card>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default QuizPage;
