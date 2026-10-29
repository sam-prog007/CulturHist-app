import type { CompanionId } from "@/components/companions/ids";
import type { Figure } from "./types";
import { alexandre } from "./alexandre";
import { cesar } from "./cesar";
import { cleopatre } from "./cleopatre";
import { confucius } from "./confucius";
import { imhotep } from "./imhotep";
import { leonard } from "./leonard";
import { marcoPolo } from "./marcoPolo";
import { napoleon } from "./napoleon";
import { ramses } from "./ramses";
import { socrate } from "./socrate";

export const FIGURES: Record<CompanionId, Figure> = {
  napoleon,
  imhotep,
  "marco-polo": marcoPolo,
  leonard,
  cesar,
  socrate,
  ramses,
  cleopatre,
  confucius,
  alexandre,
};
