import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { Difficulty } from "@/lib/difficulty";
import { REGION_LABELS } from "@/lib/dailyFacts";
import { todayKey } from "@/lib/dates";

export type QuizFact = Pick<
  Tables<"historical_facts">,
  "id" | "title" | "title_fr" | "description" | "description_fr" | "date_text" | "date_text_fr" | "region" | "difficulty" | "period_id"
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
  options: string[];
  correctAnswer: number;
}

export const MIN_QUESTIONS = 3;
export const MAX_QUESTIONS = 7;

export async function loadQuizData(): Promise<{ facts: QuizFact[]; periods: Period[] }> {
  const [facts, periods] = await Promise.all([
    supabase
      .from("historical_facts")
      .select("id, title, title_fr, description, description_fr, date_text, date_text_fr, region, difficulty, period_id"),
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

const shuffle = <T,>(items: T[]) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Up to three wrong answers drawn from `candidates`, never equal to the right one. */
const distractors = (correct: string, candidates: (string | null | undefined)[]) =>
  shuffle([...new Set(candidates.filter((c): c is string => !!c && c !== correct))]).slice(0, 3);

function makeQuestion(id: string, question: string, correct: string, wrong: string[]): Question | null {
  if (wrong.length < 2) return null;
  const options = shuffle([correct, ...wrong]);
  return { id, question, options, correctAnswer: options.indexOf(correct) };
}

/**
 * One question per fact of the pool (up to MAX_QUESTIONS). Wrong answers come
 * from every fact, so a small selection still gets plausible options.
 */
export function buildQuiz(pool: QuizFact[], allFacts: QuizFact[], periods: Period[]): Question[] {
  const periodName = new Map(periods.map((p) => [p.id, p.name]));
  const questions: Question[] = [];

  for (const fact of shuffle(pool)) {
    if (questions.length >= MAX_QUESTIONS) break;
    const title = fact.title_fr || fact.title;
    const date = fact.date_text_fr || fact.date_text;
    const description = fact.description_fr || fact.description;
    const region = fact.region ? REGION_LABELS[fact.region] : null;
    const era = fact.period_id ? periodName.get(fact.period_id) : null;

    const candidates = shuffle([
      date &&
        makeQuestion(`${fact.id}-date`, `Quand cela s'est-il passé : « ${title} » ?`, date,
          distractors(date, allFacts.map((f) => f.date_text_fr || f.date_text))),
      makeQuestion(`${fact.id}-title`, `Quel événement correspond à : « ${description} »`, title,
        distractors(title, allFacts.map((f) => f.title_fr || f.title))),
      region &&
        makeQuestion(`${fact.id}-region`, `Dans quelle région du monde : « ${title} » ?`, region,
          distractors(region, Object.values(REGION_LABELS))),
      era &&
        makeQuestion(`${fact.id}-era`, `À quelle époque : « ${title} » ?`, era,
          distractors(era, periods.map((p) => p.name))),
    ]).filter((q): q is Question => !!q);

    if (candidates.length) questions.push(candidates[0]);
  }
  return questions;
}

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
