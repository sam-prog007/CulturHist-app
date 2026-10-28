/** The companions, in unlocking order (see src/lib/companions.ts). */
export const COMPANION_IDS = [
  "napoleon",
  "imhotep",
  "marco-polo",
  "leonard",
  "cesar",
  "socrate",
  "ramses",
  "cleopatre",
  "confucius",
  "alexandre",
] as const;

export type CompanionId = (typeof COMPANION_IDS)[number];
