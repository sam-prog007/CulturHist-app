/** Minerve's costume for each grade level, in the order of the grades table. */
export const COSTUMES = [
  "scribe",
  "marco-polo",
  "leonard",
  "cesar",
  "napoleon",
  "socrate",
  "ramses",
  "cleopatre",
  "confucius",
  "alexandre",
] as const;
export type Costume = (typeof COSTUMES)[number];

export const costumeForGrade = (level: number | null | undefined): Costume | null =>
  level ? COSTUMES[Math.min(Math.max(level, 1), COSTUMES.length) - 1] : null;
