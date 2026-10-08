import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { Difficulty } from "@/lib/difficulty";
import { todayKey } from "@/lib/dates";
import { buildQuestions } from "@/lib/quizQuestions";

export type QuizFact = Pick<
  Tables<"historical_facts">,
  "id" | "title" | "title_fr" | "description" | "description_fr" | "date_text" | "date_text_fr" | "region" | "difficulty" | "period_id" | "year" | "countries"
>;
export type Period = Pick<Tables<"historical_periods">, "id" | "name" | "order_index">;

export interface QuizFilters {
  region: string | null;
  periodId: string | null;
  difficulty: Difficulty | null;
}

export interface Question {
  id: string;
  question: string;
  /** What the question is about, shown under it: an event, a date, a description. */
  context?: string;
  options: string[];
  correctAnswer: number;
  /** Shown once the player has answered. */
  explanation?: string;
}

export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 7;

export async function loadQuizData(): Promise<{ facts: QuizFact[]; periods: Period[] }> {
  const [facts, periods] = await Promise.all([
    supabase
      .from("historical_facts")
      .select("id, title, title_fr, description, description_fr, date_text, date_text_fr, region, difficulty, period_id, year, countries"),
    supabase.from("historical_periods").select("id, name, order_index").order("order_index"),
  ]);
  if (facts.error) throw facts.error;
  if (periods.error) throw periods.error;
  return { facts: facts.data ?? [], periods: periods.data ?? [] };
}

export function matchingFacts(facts: QuizFact[], { region, periodId, difficulty }: QuizFilters) {
  return facts.filter(
    (f) =>
      (!region || f.region === region) &&
      (!periodId || f.period_id === periodId) &&
      (!difficulty || f.difficulty === difficulty)
  );
}

/** One question per fact of the pool (up to MAX_QUESTIONS), see quizQuestions.ts. */
export const buildQuiz = (pool: QuizFact[], allFacts: QuizFact[]) => buildQuestions(pool, allFacts, MAX_QUESTIONS);

export async function completeQuiz(score: number, total: number, difficulty: Difficulty | null) {
  const { data, error } = await supabase.rpc("complete_quiz", {
    p_score: score,
    p_total: total,
    p_difficulty: difficulty ?? "all",
    p_date: todayKey(),
  });
  if (error) throw error;
  return data as unknown as { points_earned: number; points: number };
}
