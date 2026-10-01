/** Difficulty levels shared by facts, quizzes and preferences. */
export const DIFFICULTIES = [
  { value: "easy", label: "Facile", stars: 1 },
  { value: "medium", label: "Moyen", stars: 2 },
  { value: "hard", label: "Difficile", stars: 3 },
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number]["value"];

export const MAX_STARS = 3;

export function getDifficulty(value: string | null | undefined) {
  return DIFFICULTIES.find((d) => d.value === value);
}
